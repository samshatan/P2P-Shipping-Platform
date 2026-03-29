import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import { createRazorpayOrder, verifyRazorpaySignature } from '../../../lib/razorpay';
import { successResponse, errorResponse } from '../../shared/types';

const GST_RATE = 0.18;

// ── POST /payments/initiate ──────────────────
export const initiatePayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  const { shipment_id, use_wallet, promo_code } = req.body;

  if (!shipment_id) {
    res.status(400).json(errorResponse('VALIDATION_001', 'shipment_id is required'));
    return;
  }

  try {
    // Fetch shipment
    const shipmentResult = await pool.query(
      'SELECT id, charge, payment_status, status FROM shipments WHERE id = $1 AND user_id = $2',
      [shipment_id, userId]
    );

    if (shipmentResult.rows.length === 0) {
      res.status(404).json(errorResponse('SHIPMENT_004', 'Shipment not found'));
      return;
    }

    const shipment = shipmentResult.rows[0];

    if (shipment.payment_status === 'PAID') {
      res.status(400).json(errorResponse('PAYMENT_003', 'Payment already processed for this shipment'));
      return;
    }

    const chargeRupees = parseFloat(shipment.charge) || 0;
    const gstRupees = chargeRupees * GST_RATE;
    let totalPaise = Math.round((chargeRupees + gstRupees) * 100);

    // Apply promo if provided
    let discountPaise = 0;
    if (promo_code) {
      const promoResult = await pool.query(
        `SELECT * FROM promo_codes WHERE code = $1 AND is_active = true
         AND (expiry_date IS NULL OR expiry_date > NOW())`,
        [promo_code.toUpperCase()]
      );

      if (promoResult.rows.length === 0) {
        res.status(400).json(errorResponse('PAYMENT_005', 'Promo code not found or expired'));
        return;
      }

      const promo = promoResult.rows[0];
      const minOrderPaise = Math.round(parseFloat(promo.min_order_value) * 100);

      if (totalPaise < minOrderPaise) {
        res.status(400).json(errorResponse('PAYMENT_008', 'Minimum order amount not met for this promo code'));
        return;
      }

      if (promo.discount_type === 'FLAT') {
        discountPaise = Math.round(parseFloat(promo.discount_value) * 100);
      } else if (promo.discount_type === 'PERCENTAGE') {
        discountPaise = Math.round(totalPaise * (parseFloat(promo.discount_value) / 100));
        if (promo.max_discount) {
          discountPaise = Math.min(discountPaise, Math.round(parseFloat(promo.max_discount) * 100));
        }
      }
    }

    // Apply wallet balance if requested
    let walletUsedPaise = 0;
    if (use_wallet) {
      const userResult = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);
      const walletBalance = parseFloat(userResult.rows[0]?.wallet_balance || '0');
      const walletBalancePaise = Math.round(walletBalance * 100);
      const remaining = totalPaise - discountPaise;

      if (walletBalancePaise >= remaining) {
        walletUsedPaise = remaining;
      } else {
        walletUsedPaise = walletBalancePaise;
      }
    }

    const finalAmountPaise = Math.max(0, totalPaise - discountPaise - walletUsedPaise);

    // If fully covered by wallet/promo, update and return
    if (finalAmountPaise === 0) {
      await pool.query('BEGIN');
      if (walletUsedPaise > 0) {
        await pool.query(
          'UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2',
          [walletUsedPaise / 100, userId]
        );
        await pool.query(
          `INSERT INTO wallet_transactions (user_id, shipment_id, type, amount, description, status)
           VALUES ($1, $2, 'DEBIT', $3, 'Shipment payment', 'SUCCESS')`,
          [userId, shipment_id, walletUsedPaise / 100]
        );
      }
      await pool.query(
        `UPDATE shipments SET payment_status = 'PAID', status = 'BOOKED', updated_at = NOW() WHERE id = $1`,
        [shipment_id]
      );
      await pool.query('COMMIT');

      res.status(200).json(
        successResponse({
          order_id: null,
          amount_paise: totalPaise,
          wallet_used_paise: walletUsedPaise,
          final_amount_paise: 0,
          razorpay_key: process.env.RAZORPAY_KEY_ID || '',
          discount_paise: discountPaise,
          currency: 'INR',
          paid_fully_by_wallet: true,
        })
      );
      return;
    }

    // Create Razorpay order (amount in rupees — createRazorpayOrder converts to paise internally)
    const order = await createRazorpayOrder(finalAmountPaise / 100, 'INR', shipment_id);

    res.status(200).json(
      successResponse({
        order_id: order.id,
        amount_paise: totalPaise,
        wallet_used_paise: walletUsedPaise,
        final_amount_paise: finalAmountPaise,
        razorpay_key: process.env.RAZORPAY_KEY_ID || '',
        discount_paise: discountPaise,
        currency: 'INR',
      })
    );
  } catch (err) {
    console.error('❌ initiatePayment failed:', err);
    res.status(500).json(errorResponse('PAYMENT_001', 'Payment order creation failed'));
  }
};

// ── POST /payments/webhook ────────────────────
// Raw body is needed for signature verification — configured in index.ts
export const paymentWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const rawBody: string = (req as any).rawBody || JSON.stringify(req.body);

  // Always return 200 to Razorpay (they retry on non-200)
  if (!signature || !verifyRazorpaySignature(rawBody, signature)) {
    console.warn('⚠️  Razorpay webhook: invalid signature');
    res.status(200).json({ received: true });
    return;
  }

  const event = req.body;

  try {
    if (event?.event === 'payment.captured') {
      const paymentEntity = event?.payload?.payment?.entity;
      const shipmentId = paymentEntity?.order_id;

      if (shipmentId) {
        await pool.query('BEGIN');
        // Update shipment to PAID/BOOKED using Razorpay order_id stored as shipment receipt
        await pool.query(
          `UPDATE shipments
           SET payment_status = 'PAID', status = 'BOOKED', payment_id = $1, updated_at = NOW()
           WHERE id = $2 AND payment_status = 'PENDING'`,
          [paymentEntity.id, shipmentId]
        );
        await pool.query('COMMIT');
        console.log(`✅ Payment captured for shipment: ${shipmentId}`);
      }
    }

    if (event?.event === 'payment.failed') {
      const shipmentId = event?.payload?.payment?.entity?.order_id;
      if (shipmentId) {
        await pool.query(
          `UPDATE shipments SET payment_status = 'FAILED', updated_at = NOW() WHERE id = $1`,
          [shipmentId]
        );
      }
    }
  } catch (err) {
    console.error('❌ Webhook processing error:', err);
    // Still return 200 so Razorpay doesn't retry
  }

  res.status(200).json({ received: true });
};
