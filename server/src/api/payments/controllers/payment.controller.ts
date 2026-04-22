import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { createRazorpayOrder, verifyRazorpaySignature } from '../../../lib/razorpay';
import { emitEvent, TOPICS } from '../../../lib/kafka';
import pool from '../../../Database/db';
import { Request } from 'express';

// ─────────────────────────────────────────────────────────────
// POST /payments/initiate
// Creates a Razorpay order for a given shipment
// ─────────────────────────────────────────────────────────────
export const initiatePayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { shipment_id, amount_paise } = req.body;

    // ── 1. Validate inputs ────────────────────────────────────
    if (!shipment_id || !amount_paise || typeof amount_paise !== 'number') {
        return res.status(400).json({
            success: false,
            error: { code: 'PAY_001', message: 'shipment_id and amount_paise (number) are required' },
        });
    }

    // ── 2. Confirm shipment belongs to user and is DRAFT ──────
    const shipmentResult = await pool.query(
        `SELECT id, status, total_amount FROM shipments WHERE id = $1 AND user_id = $2`,
        [shipment_id, userId]
    );

    if (shipmentResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'PAY_002', message: 'Shipment not found' },
        });
    }

    const shipment = shipmentResult.rows[0];

    if (shipment.status !== 'DRAFT') {
        return res.status(409).json({
            success: false,
            error: { code: 'PAY_003', message: `Shipment is already in '${shipment.status}' state. Only DRAFT shipments can be paid.` },
        });
    }

    // ── 3. Create Razorpay Order ──────────────────────────────
    // NOTE: createRazorpayOrder expects amount in rupees, it converts to paise internally
    // We receive amount_paise from client, so divide by 100
    const amountInRupees = amount_paise / 100;
    const order = await createRazorpayOrder(amountInRupees, 'INR', `shipment_${shipment_id}`);

    // ── 4. Save the Razorpay order ID against the shipment ────
    await pool.query(
        `UPDATE shipments SET razorpay_order_id = $1 WHERE id = $2`,
        [order.id, shipment_id]
    );

    return res.status(200).json({
        success: true,
        data: {
            order_id: order.id,
            amount_paise: order.amount,
            currency: order.currency,
            razorpay_key: process.env.RAZORPAY_KEY_ID,
        },
    });
});

// ─────────────────────────────────────────────────────────────
// POST /payments/webhook
// ⚠️  CRITICAL: Uses raw body for signature verification
// This route MUST be registered BEFORE express.json() in index.ts
// ─────────────────────────────────────────────────────────────
export const handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature  = req.headers['x-razorpay-signature'] as string;
    const rawBody    = (req as any).rawBody as string;

    // ── 1. Always respond 200 fast to Razorpay ────────────────
    // Razorpay retries if it doesn't get a 200 quickly
    res.status(200).json({ received: true });

    // ── 2. Verify HMAC-SHA256 signature ──────────────────────
    if (!signature || !rawBody) {
        console.error('❌ Webhook: Missing signature or raw body');
        return;
    }

    const isValid = verifyRazorpaySignature(rawBody, signature);

    if (!isValid) {
        console.error('❌ Webhook: Invalid Razorpay signature — IGNORED');
        return;
    }

    // ── 3. Parse the event ────────────────────────────────────
    let event: any;
    try {
        event = JSON.parse(rawBody);
    } catch {
        console.error('❌ Webhook: Failed to parse body');
        return;
    }

    const eventType = event?.event;
    console.log(`📩 Razorpay Webhook received: ${eventType}`);

    // ── 4. Handle payment.captured ───────────────────────────
    if (eventType === 'payment.captured') {
        const payment    = event.payload?.payment?.entity;
        const razorOrderId = payment?.order_id;
        const amountPaid   = payment?.amount; // in paise

        if (!razorOrderId) {
            console.error('❌ Webhook: No order_id in payment.captured event');
            return;
        }

        try {
            // ── 4a. Find the shipment by Razorpay order ID ────
            const shipResult = await pool.query(
                `SELECT id, user_id, awb_number, courier_id FROM shipments WHERE razorpay_order_id = $1`,
                [razorOrderId]
            );

            if (shipResult.rows.length === 0) {
                console.error(`❌ Webhook: No shipment found for order ${razorOrderId}`);
                return;
            }

            const shipment = shipResult.rows[0];

            // ── 4b. Record payment in payments table ──────────
            await pool.query(
                `INSERT INTO payments (shipment_id, razorpay_order_id, razorpay_payment_id, amount_paise, status, created_at)
                 VALUES ($1, $2, $3, $4, 'CAPTURED', NOW())
                 ON CONFLICT (razorpay_payment_id) DO NOTHING`,
                [shipment.id, razorOrderId, payment.id, amountPaid]
            );

            // ── 4c. Transition shipment: DRAFT → BOOKED ───────
            await pool.query(
                `UPDATE shipments
                 SET status = 'BOOKED', payment_method = 'RAZORPAY', booked_at = NOW()
                 WHERE id = $1`,
                [shipment.id]
            );

            // ── 4d. Emit Kafka notification event ─────────────
            await emitEvent(TOPICS.NOTIFICATION_DISPATCH, {
                event_type: 'booking_confirmed',
                user_id: shipment.user_id,
                shipment_id: shipment.id,
                awb: shipment.awb_number,
                amount_paise: amountPaid,
                timestamp: new Date().toISOString(),
            });

            // ── 4e. Emit Kafka shipment event ─────────────────
            await emitEvent(TOPICS.SHIPMENT_UPDATED, {
                shipment_id: shipment.id,
                awb: shipment.awb_number,
                status: 'BOOKED',
                timestamp: new Date().toISOString(),
            });

            console.log(`✅ Webhook: Shipment ${shipment.id} → BOOKED. AWB: ${shipment.awb_number}`);

        } catch (err) {
            console.error('❌ Webhook processing error:', err);
            // Don't re-throw — we already responded 200 to Razorpay
        }
    }

    // ── 5. Handle payment.failed ──────────────────────────────
    if (eventType === 'payment.failed') {
        const payment      = event.payload?.payment?.entity;
        const razorOrderId = payment?.order_id;

        if (razorOrderId) {
            await pool.query(
                `UPDATE shipments SET status = 'PAYMENT_FAILED' WHERE razorpay_order_id = $1`,
                [razorOrderId]
            ).catch((err) => console.error('❌ Failed to update shipment on payment failure:', err));
        }
    }
};
