import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { TrackingEvent } from '../../../lib/mongo';
import pool from '../../../Database/db';
import redis from '../../../Database/redis';
import { handleDelhiveryWebhook } from '../../../lib/tracking-webhooks';

// ── Top-level interface for Mongoose lean() result ────────────
interface ITrackingEvent {
    status: string;
    location?: string;
    description?: string;
    timestamp: Date;
}

// ─────────────────────────────────────────────────────────────
// GET /tracking/:awb
// Returns all tracking events for a shipment from MongoDB
// ─────────────────────────────────────────────────────────────
export const getTrackingByAwb = asyncHandler(async (req: Request, res: Response) => {
    const awb = req.params.awb as string;

    if (!awb || awb.trim().length < 5) {
        return res.status(400).json({
            success: false,
            error: { code: 'TRK_001', message: 'Invalid AWB number' },
        });
    }

    // ── 1. Get shipment meta from PostgreSQL ──────────────────
    const shipResult = await pool.query(
        `SELECT s.id, s.status, s.awb_number, s.created_at,
                cp.name AS courier_name
         FROM shipments s
         LEFT JOIN courier_partners cp ON cp.id = s.courier_id
         WHERE s.awb_number = $1`,
        [awb.toUpperCase()]
    );

    if (shipResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'TRK_002', message: 'Shipment not found for this AWB' },
        });
    }

    const shipment = shipResult.rows[0];

    // ── 2. Get all tracking events from MongoDB (newest first) ─
    const events = await TrackingEvent
        .find({ awb_number: awb.toUpperCase() })
        .sort({ timestamp: -1 })
        .lean() as ITrackingEvent[];

    const currentStatus   = events.length > 0 ? events[0].status              : shipment.status;
    const currentLocation = events.length > 0 ? (events[0].location ?? 'Unknown') : 'Not yet updated';

    return res.status(200).json({
        success: true,
        data: {
            awb: shipment.awb_number,
            courier: shipment.courier_name,
            current_status: currentStatus,
            current_location: currentLocation,
            events: events.map((e) => ({
                status: e.status,
                location: e.location ?? 'Unknown',
                description: e.description ?? '',
                timestamp: e.timestamp,
            })),
        },
    });
});

// ─────────────────────────────────────────────────────────────
// POST /tracking/webhooks/delhivery
// Delegated to BE3's tracking-webhooks.ts handler
// ─────────────────────────────────────────────────────────────
export const delhiveryWebhook = handleDelhiveryWebhook;

// ─────────────────────────────────────────────────────────────
// POST /shipments/:id/confirm-delivery
// Verifies 6-digit OTP for high-security deliveries
// ─────────────────────────────────────────────────────────────
const DELIVERY_OTP_KEY = (shipmentId: string) => `delivery_otp:${shipmentId}`;

export const confirmDelivery = asyncHandler(async (req, res) => {
    // Cast req to AuthenticatedRequest inside the body — avoids asyncHandler type mismatch
    const authReq = req as AuthenticatedRequest;
    const userId  = authReq.user!.userId;
    const id      = req.params.id as string;
    const { otp } = req.body;

    if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
        return res.status(400).json({
            success: false,
            error: { code: 'DEL_001', message: 'A valid 6-digit delivery OTP is required' },
        });
    }

    // ── 1. Confirm shipment belongs to user ───────────────────
    const shipResult = await pool.query(
        `SELECT id, status FROM shipments WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );

    if (shipResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'DEL_002', message: 'Shipment not found' },
        });
    }

    const shipment = shipResult.rows[0];

    if (shipment.status !== 'OUT_FOR_DELIVERY') {
        return res.status(409).json({
            success: false,
            error: {
                code: 'DEL_003',
                message: `OTP only valid when status is OUT_FOR_DELIVERY. Current: ${shipment.status}`,
            },
        });
    }

    // ── 2. Verify OTP from Redis ──────────────────────────────
    const storedOtp = await redis.get(DELIVERY_OTP_KEY(id));

    if (!storedOtp || storedOtp !== otp) {
        return res.status(401).json({
            success: false,
            error: { code: 'DEL_004', message: 'Invalid or expired delivery OTP' },
        });
    }

    // ── 3. Delete OTP — one-time use ──────────────────────────
    await redis.del(DELIVERY_OTP_KEY(id));

    // ── 4. Mark shipment DELIVERED ────────────────────────────
    await pool.query(
        `UPDATE shipments SET status = 'DELIVERED', delivered_at = NOW() WHERE id = $1`,
        [id]
    );

    return res.status(200).json({
        success: true,
        data: { message: 'Delivery confirmed successfully', shipment_id: id },
    });
});
