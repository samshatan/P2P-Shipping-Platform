import { Response, Request } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import crypto from 'crypto';

// ─────────────────────────────────────────────────────────────
// DAY 18: POST /payments/cod/confirm
// Marks COD collected by courier + enqueues 7-day payout delay
// Called by courier partner or internal webhook
// ─────────────────────────────────────────────────────────────
export const confirmCodCollection = async (req: Request, res: Response): Promise<void> => {
    const { awb, cod_amount_paise } = req.body;

    if (!awb || !cod_amount_paise) {
        res.status(400).json({
            success: false,
            error: { code: 'COD_001', message: 'awb and cod_amount_paise are required' },
        });
        return;
    }

    // ── 1. Find shipment by AWB ───────────────────────────────
    const result = await pool.query(
        `SELECT id, user_id, awb_number FROM shipments WHERE awb_number = $1 AND is_cod = true`,
        [awb]
    );

    if (result.rows.length === 0) {
        res.status(404).json({
            success: false,
            error: { code: 'COD_002', message: 'COD shipment not found for this AWB' },
        });
        return;
    }

    const shipment = result.rows[0];

    // ── 2. Record COD collection ──────────────────────────────
    await pool.query(
        `INSERT INTO cod_collections (shipment_id, user_id, awb_number, amount_paise, status, collected_at)
         VALUES ($1, $2, $3, $4, 'COLLECTED', NOW())
         ON CONFLICT (shipment_id) DO UPDATE SET status = 'COLLECTED', collected_at = NOW()`,
        [shipment.id, shipment.user_id, awb, cod_amount_paise]
    );

    // ── 3. Update shipment status ─────────────────────────────
    await pool.query(
        `UPDATE shipments SET status = 'DELIVERED', delivered_at = NOW() WHERE id = $1`,
        [shipment.id]
    );

    // ── 4. Enqueue 7-day payout via BullMQ ───────────────────
    const { enqueueCodPayout } = await import('../../../lib/queues');
    await enqueueCodPayout({
        shipment_id: shipment.id,
        user_id: shipment.user_id,
        amount_paise: cod_amount_paise,
        awb,
    });

    console.log(`✅ COD collected for AWB ${awb} — payout queued in 7 days`);

    res.status(200).json({
        success: true,
        data: { message: 'COD collection recorded. Payout will be initiated in 7 days.' },
    });
};

// ─────────────────────────────────────────────────────────────
// DAY 20: POST /coupons/validate
// Validate a coupon code and return discount details
// ─────────────────────────────────────────────────────────────
export const validateCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { code, amount_paise } = req.body;

    if (!code || !amount_paise) {
        return res.status(400).json({
            success: false,
            error: { code: 'CPN_001', message: 'code and amount_paise are required' },
        });
    }

    // ── 1. Look up coupon ─────────────────────────────────────
    const result = await pool.query(
        `SELECT * FROM coupons
         WHERE code = $1
           AND is_active = true
           AND (expires_at IS NULL OR expires_at > NOW())`,
        [code.toUpperCase().trim()]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'CPN_002', message: 'Invalid or expired coupon code' },
        });
    }

    const coupon = result.rows[0];

    // ── 2. Check usage limit ──────────────────────────────────
    if (coupon.max_uses !== null && coupon.total_used >= coupon.max_uses) {
        return res.status(409).json({
            success: false,
            error: { code: 'CPN_003', message: 'Coupon usage limit reached' },
        });
    }

    // ── 3. Check user-specific usage ─────────────────────────
    const userUsage = await pool.query(
        `SELECT COUNT(*) FROM coupon_usages WHERE coupon_id = $1 AND user_id = $2`,
        [coupon.id, userId]
    );

    if (parseInt(userUsage.rows[0].count, 10) >= (coupon.max_uses_per_user ?? 1)) {
        return res.status(409).json({
            success: false,
            error: { code: 'CPN_004', message: 'You have already used this coupon' },
        });
    }

    // ── 4. Calculate discount ─────────────────────────────────
    let discountPaise = 0;

    if (coupon.discount_type === 'PERCENT') {
        discountPaise = Math.round((amount_paise * coupon.discount_value) / 100);
        if (coupon.max_discount_paise) {
            discountPaise = Math.min(discountPaise, coupon.max_discount_paise);
        }
    } else {
        // FLAT discount
        discountPaise = coupon.discount_value;
    }

    discountPaise = Math.min(discountPaise, amount_paise); // Cannot exceed order amount
    const finalAmountPaise = amount_paise - discountPaise;

    return res.status(200).json({
        success: true,
        data: {
            coupon_id:          coupon.id,
            code:               coupon.code,
            discount_type:      coupon.discount_type,
            discount_paise:     discountPaise,
            original_paise:     amount_paise,
            final_amount_paise: finalAmountPaise,
            message:            `Coupon applied! You save ₹${(discountPaise / 100).toFixed(2)}`,
        },
    });
});

// ─────────────────────────────────────────────────────────────
// DAY 20: POST /referrals/apply
// Apply a referral code — credits both referrer and referee
// ─────────────────────────────────────────────────────────────
export const applyReferral = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { referral_code } = req.body;

    if (!referral_code) {
        return res.status(400).json({
            success: false,
            error: { code: 'REF_001', message: 'referral_code is required' },
        });
    }

    // ── 1. Find the referrer ──────────────────────────────────
    const referrerResult = await pool.query(
        `SELECT id FROM users WHERE referral_code = $1 AND id != $2`,
        [referral_code.toUpperCase(), userId]
    );

    if (referrerResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'REF_002', message: 'Invalid referral code' },
        });
    }

    const referrerId = referrerResult.rows[0].id;

    // ── 2. Check if referral already used ────────────────────
    const alreadyUsed = await pool.query(
        `SELECT id FROM referral_usages WHERE referee_id = $1`,
        [userId]
    );

    if (alreadyUsed.rows.length > 0) {
        return res.status(409).json({
            success: false,
            error: { code: 'REF_003', message: 'You have already used a referral code' },
        });
    }

    const REFERRER_CREDIT_PAISE = 5000;  // ₹50
    const REFEREE_CREDIT_PAISE  = 2500;  // ₹25

    // ── 3. Atomic wallet credits ──────────────────────────────
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Credit referrer
        await client.query(
            `UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2`,
            [REFERRER_CREDIT_PAISE, referrerId]
        );
        await client.query(
            `INSERT INTO wallet_transactions (user_id, type, amount_paise, description, created_at)
             VALUES ($1, 'CREDIT', $2, 'Referral bonus — friend joined', NOW())`,
            [referrerId, REFERRER_CREDIT_PAISE]
        );

        // Credit referee
        await client.query(
            `UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2`,
            [REFEREE_CREDIT_PAISE, userId]
        );
        await client.query(
            `INSERT INTO wallet_transactions (user_id, type, amount_paise, description, created_at)
             VALUES ($1, 'CREDIT', $2, 'Welcome referral bonus', NOW())`,
            [userId, REFEREE_CREDIT_PAISE]
        );

        // Record referral usage
        await client.query(
            `INSERT INTO referral_usages (referrer_id, referee_id, created_at) VALUES ($1, $2, NOW())`,
            [referrerId, userId]
        );

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

    return res.status(200).json({
        success: true,
        data: {
            referee_credit_paise:  REFEREE_CREDIT_PAISE,
            referrer_credit_paise: REFERRER_CREDIT_PAISE,
            message: `₹${(REFEREE_CREDIT_PAISE / 100).toFixed(0)} added to your wallet! Your friend got ₹${(REFERRER_CREDIT_PAISE / 100).toFixed(0)} too.`,
        },
    });
});
