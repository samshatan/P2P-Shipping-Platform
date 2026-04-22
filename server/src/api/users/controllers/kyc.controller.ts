import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { initiateKyc, checkKycStatus } from '../../../lib/digio';
import pool from '../../../Database/db';

// ─────────────────────────────────────────────────────────────
// POST /users/kyc/initiate
// Starts Aadhaar eKYC via Digio — returns redirect URL
// ─────────────────────────────────────────────────────────────
export const initiateKycController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;

    // ── 1. Get user's name and phone from DB ──────────────────
    const userResult = await pool.query(
        `SELECT name, phone, email, kyc_status FROM users WHERE id = $1`,
        [userId]
    );

    if (userResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'KYC_001', message: 'User not found' },
        });
    }

    const user = userResult.rows[0];

    if (user.kyc_status === 'VERIFIED') {
        return res.status(409).json({
            success: false,
            error: { code: 'KYC_002', message: 'KYC is already verified for this account' },
        });
    }

    // ── 2. Initiate KYC with Digio ────────────────────────────
    const identifier = user.email || user.phone;
    const result = await initiateKyc(user.name || 'User', identifier);

    if (!result.success) {
        return res.status(502).json({
            success: false,
            error: { code: 'KYC_003', message: 'Failed to initiate KYC with provider' },
        });
    }

    // ── 3. Save KYC request ID to DB — status → PENDING ──────
    await pool.query(
        `UPDATE users SET kyc_status = 'PENDING', kyc_request_id = $1 WHERE id = $2`,
        [result.id, userId]
    );

    return res.status(200).json({
        success: true,
        data: {
            kyc_request_id: result.id,
            redirect_url: result.redirectUrl,
            message: 'Complete KYC verification via the redirect URL',
        },
    });
});

// ─────────────────────────────────────────────────────────────
// POST /users/kyc/verify
// Checks KYC status from Digio and updates user record
// Called after user completes the Digio flow
// ─────────────────────────────────────────────────────────────
export const verifyKycController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;

    // ── 1. Get stored KYC request ID ─────────────────────────
    const userResult = await pool.query(
        `SELECT kyc_request_id, kyc_status FROM users WHERE id = $1`,
        [userId]
    );

    if (userResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'KYC_001', message: 'User not found' },
        });
    }

    const { kyc_request_id, kyc_status } = userResult.rows[0];

    if (!kyc_request_id) {
        return res.status(400).json({
            success: false,
            error: { code: 'KYC_004', message: 'No KYC request found. Please initiate KYC first.' },
        });
    }

    if (kyc_status === 'VERIFIED') {
        return res.status(200).json({
            success: true,
            data: { kyc_status: 'VERIFIED', message: 'KYC already verified' },
        });
    }

    // ── 2. Check status with Digio ────────────────────────────
    const result = await checkKycStatus(kyc_request_id);

    if (!result.success) {
        return res.status(502).json({
            success: false,
            error: { code: 'KYC_005', message: 'Failed to check KYC status with provider' },
        });
    }

    // ── 3. Map Digio status → our status ──────────────────────
    const digioStatus: string = result.status || '';
    let newKycStatus = 'PENDING';

    if (['approved', 'COMPLETED', 'success'].includes(digioStatus)) {
        newKycStatus = 'VERIFIED';
    } else if (['rejected', 'FAILED', 'failed'].includes(digioStatus)) {
        newKycStatus = 'REJECTED';
    }

    // ── 4. Update user KYC status ─────────────────────────────
    await pool.query(
        `UPDATE users SET kyc_status = $1 WHERE id = $2`,
        [newKycStatus, userId]
    );

    return res.status(200).json({
        success: true,
        data: {
            kyc_status: newKycStatus,
            message:
                newKycStatus === 'VERIFIED'
                    ? 'KYC successfully verified!'
                    : newKycStatus === 'REJECTED'
                    ? 'KYC was rejected. Please re-initiate.'
                    : 'KYC is still being processed.',
        },
    });
});
