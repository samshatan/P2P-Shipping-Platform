import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import { emitEvent, TOPICS } from '../../../lib/kafka';

// ─────────────────────────────────────────────────────────────
// DAY 19: POST /disputes
// Opens a dispute for a delivered shipment (weight/damage claim)
// ─────────────────────────────────────────────────────────────
export const openDispute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { shipment_id, type, description, evidence_urls } = req.body;

    const VALID_TYPES = ['WEIGHT_MISMATCH', 'DAMAGE', 'MISSING_ITEM', 'LATE_DELIVERY', 'OTHER'];

    if (!shipment_id || !type || !description) {
        return res.status(400).json({
            success: false,
            error: { code: 'DIS_001', message: 'shipment_id, type, and description are required' },
        });
    }

    if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({
            success: false,
            error: { code: 'DIS_002', message: `Invalid type. Valid: ${VALID_TYPES.join(', ')}` },
        });
    }

    // ── 1. Verify shipment belongs to user ────────────────────
    const shipResult = await pool.query(
        `SELECT id, status FROM shipments WHERE id = $1 AND user_id = $2`,
        [shipment_id, userId]
    );

    if (shipResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'DIS_003', message: 'Shipment not found' },
        });
    }

    // ── 2. Check for existing open dispute ────────────────────
    const existing = await pool.query(
        `SELECT id FROM disputes WHERE shipment_id = $1 AND status = 'OPEN'`,
        [shipment_id]
    );

    if (existing.rows.length > 0) {
        return res.status(409).json({
            success: false,
            error: { code: 'DIS_004', message: 'An open dispute already exists for this shipment' },
        });
    }

    // ── 3. Create dispute record ──────────────────────────────
    const result = await pool.query(
        `INSERT INTO disputes (user_id, shipment_id, type, description, evidence_urls, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'OPEN', NOW())
         RETURNING id, status, created_at`,
        [userId, shipment_id, type, description, JSON.stringify(evidence_urls ?? [])]
    );

    await emitEvent(TOPICS.NOTIFICATION_DISPATCH, {
        event_type: 'DISPUTE_OPENED',
        user_id: userId,
        shipment_id,
        dispute_id: result.rows[0].id,
    });

    return res.status(201).json({
        success: true,
        data: {
            dispute_id: result.rows[0].id,
            status: 'OPEN',
            message: 'Dispute raised. Our team will review within 48 hours.',
        },
    });
});

// ─────────────────────────────────────────────────────────────
// GET /disputes/:id
// Get a single dispute (must belong to user)
// ─────────────────────────────────────────────────────────────
export const getDispute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const id     = req.params.id as string;

    const result = await pool.query(
        `SELECT d.*, s.awb_number
         FROM disputes d
         LEFT JOIN shipments s ON s.id = d.shipment_id
         WHERE d.id = $1 AND d.user_id = $2`,
        [id, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'DIS_005', message: 'Dispute not found' },
        });
    }

    return res.status(200).json({ success: true, data: { dispute: result.rows[0] } });
});

// ─────────────────────────────────────────────────────────────
// GET /disputes
// List all disputes for the logged-in user
// ─────────────────────────────────────────────────────────────
export const listDisputes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const status = req.query.status as string | undefined;

    const conditions = ['d.user_id = $1'];
    const params: (string | number)[] = [userId];

    if (status) {
        params.push(status.toUpperCase());
        conditions.push(`d.status = $${params.length}`);
    }

    const result = await pool.query(
        `SELECT d.id, d.type, d.status, d.description, d.created_at, s.awb_number
         FROM disputes d
         LEFT JOIN shipments s ON s.id = d.shipment_id
         WHERE ${conditions.join(' AND ')}
         ORDER BY d.created_at DESC`,
        params
    );

    return res.status(200).json({ success: true, data: { disputes: result.rows } });
});
