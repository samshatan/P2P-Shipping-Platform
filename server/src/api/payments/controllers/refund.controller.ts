import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import { initiateRazorpayRefund } from '../../../lib/cashfree';
import { emitEvent, TOPICS } from '../../../lib/kafka';

// ─────────────────────────────────────────────────────────────
// DAY 16: POST /payments/refund
// Initiates a Razorpay refund for cancelled/failed shipments
// ─────────────────────────────────────────────────────────────
export const initiateRefund = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { shipment_id, reason } = req.body;

    if (!shipment_id) {
        return res.status(400).json({
            success: false,
            error: { code: 'REF_001', message: 'shipment_id is required' },
        });
    }

    // ── 1. Get shipment + payment details ─────────────────────
    const result = await pool.query(
        `SELECT s.id, s.status, s.user_id,
                p.razorpay_payment_id, p.amount_paise
         FROM shipments s
         LEFT JOIN payments p ON p.shipment_id = s.id AND p.status = 'CAPTURED'
         WHERE s.id = $1 AND s.user_id = $2`,
        [shipment_id, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'REF_002', message: 'Shipment not found' },
        });
    }

    const shipment = result.rows[0];

    const REFUNDABLE_STATUSES = ['CANCELLED', 'PAYMENT_FAILED', 'RETURNED'];
    if (!REFUNDABLE_STATUSES.includes(shipment.status)) {
        return res.status(409).json({
            success: false,
            error: {
                code: 'REF_003',
                message: `Refund only allowed for: ${REFUNDABLE_STATUSES.join(', ')}. Current: ${shipment.status}`,
            },
        });
    }

    if (!shipment.razorpay_payment_id) {
        return res.status(409).json({
            success: false,
            error: { code: 'REF_004', message: 'No captured payment found for this shipment' },
        });
    }

    // ── 2. Initiate refund via Razorpay ───────────────────────
    const refund = await initiateRazorpayRefund(
        shipment.razorpay_payment_id,
        shipment.amount_paise,
        reason ?? 'Shipment cancelled/returned'
    );

    if (!refund) {
        return res.status(502).json({
            success: false,
            error: { code: 'REF_005', message: 'Refund initiation failed. Please try again.' },
        });
    }

    // ── 3. Record refund in DB ─────────────────────────────────
    await pool.query(
        `INSERT INTO refunds (shipment_id, razorpay_payment_id, refund_id, amount_paise, reason, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'INITIATED', NOW())`,
        [shipment_id, shipment.razorpay_payment_id, refund.refund_id, shipment.amount_paise, reason ?? 'N/A']
    );

    return res.status(200).json({
        success: true,
        data: {
            refund_id: refund.refund_id,
            status: refund.status,
            amount_paise: shipment.amount_paise,
            message: 'Refund initiated. It will reflect in 5-7 business days.',
        },
    });
});

// ─────────────────────────────────────────────────────────────
// DAY 17: POST /payments/wallet  — Pay using wallet balance
// Deducts from wallet and transitions shipment DRAFT → BOOKED
// ─────────────────────────────────────────────────────────────
export const payWithWallet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { shipment_id } = req.body;

    if (!shipment_id) {
        return res.status(400).json({
            success: false,
            error: { code: 'WAL_001', message: 'shipment_id is required' },
        });
    }

    // ── 1. Get shipment + user wallet balance ─────────────────
    const [shipResult, userResult] = await Promise.all([
        pool.query(
            `SELECT id, status, total_amount FROM shipments WHERE id = $1 AND user_id = $2`,
            [shipment_id, userId]
        ),
        pool.query(
            `SELECT wallet_balance FROM users WHERE id = $1`,
            [userId]
        ),
    ]);

    if (shipResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'WAL_002', message: 'Shipment not found' },
        });
    }

    const shipment    = shipResult.rows[0];
    const walletBal   = userResult.rows[0]?.wallet_balance ?? 0;
    const amountPaise = shipment.total_amount;

    if (shipment.status !== 'DRAFT') {
        return res.status(409).json({
            success: false,
            error: { code: 'WAL_003', message: `Only DRAFT shipments can be paid. Current: ${shipment.status}` },
        });
    }

    if (walletBal < amountPaise) {
        return res.status(402).json({
            success: false,
            error: {
                code: 'WAL_004',
                message: `Insufficient wallet balance. Required: ₹${(amountPaise / 100).toFixed(2)}, Available: ₹${(walletBal / 100).toFixed(2)}`,
            },
        });
    }

    // ── 2. Atomic debit: BEGIN → UPDATE → INSERT → COMMIT ─────
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Debit wallet
        await client.query(
            `UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2`,
            [amountPaise, userId]
        );

        // Record ledger entry
        await client.query(
            `INSERT INTO wallet_transactions (user_id, shipment_id, type, amount_paise, description, created_at)
             VALUES ($1, $2, 'DEBIT', $3, 'Shipment payment via wallet', NOW())`,
            [userId, shipment_id, amountPaise]
        );

        // Mark shipment BOOKED via wallet
        await client.query(
            `UPDATE shipments SET status = 'BOOKED', payment_method = 'WALLET', booked_at = NOW() WHERE id = $1`,
            [shipment_id]
        );

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

    // ── 3. Emit Kafka event ───────────────────────────────────
    await emitEvent(TOPICS.NOTIFICATION_DISPATCH, {
        event_type: 'BOOKING_CONFIRMED',
        user_id: userId,
        shipment_id,
        payment_method: 'WALLET',
        timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
        success: true,
        data: {
            shipment_id,
            status: 'BOOKED',
            payment_method: 'WALLET',
            amount_deducted_paise: amountPaise,
            message: 'Payment successful via wallet. Shipment booked!',
        },
    });
});

// ─────────────────────────────────────────────────────────────
// DAY 17: GET /payments/wallet/balance
// Returns current wallet balance for logged-in user
// ─────────────────────────────────────────────────────────────
export const getWalletBalance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;

    const result = await pool.query(
        `SELECT wallet_balance FROM users WHERE id = $1`,
        [userId]
    );

    const balance = result.rows[0]?.wallet_balance ?? 0;

    return res.status(200).json({
        success: true,
        data: {
            balance_paise: balance,
            balance_rupees: (balance / 100).toFixed(2),
        },
    });
});

// ─────────────────────────────────────────────────────────────
// DAY 17: GET /payments/wallet/transactions
// Lists wallet transaction history for logged-in user
// ─────────────────────────────────────────────────────────────
export const getWalletTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const page   = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit  = Math.min(50, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const result = await pool.query(
        `SELECT id, type, amount_paise, description, shipment_id, created_at
         FROM wallet_transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );

    const countResult = await pool.query(
        `SELECT COUNT(*) FROM wallet_transactions WHERE user_id = $1`,
        [userId]
    );

    return res.status(200).json({
        success: true,
        data: {
            transactions: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].count, 10),
            },
        },
    });
});
