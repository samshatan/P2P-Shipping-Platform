import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { Shipment } from '../../../models/Shipment';
import { Dispute } from '../../../models/Dispute';
import { enqueueNotification } from '../../../lib/queues';

// ── POST /disputes ──────────────────────────────────────────
export const openDispute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { shipment_id, type, description, evidence_urls } = req.body;

    // 1. Verify shipment
    const shipment = await Shipment.findOne({ _id: shipment_id, user_id: userId });
    if (!shipment) {
        return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    // 2. Check existing
    const existing = await Dispute.findOne({ shipment_id, status: 'OPEN' });
    if (existing) {
        return res.status(409).json({ success: false, message: 'Open dispute already exists' });
    }

    // 3. Create
    const dispute = await Dispute.create({
        user_id: userId,
        shipment_id,
        type,
        description,
        evidence_urls: evidence_urls || []
    });

    // 4. Notify
    await enqueueNotification({
        user_id: userId,
        shipment_id: shipment_id,
        event_type: 'BOOKING_CONFIRMED' as any, // HACK: casting until queue types updated for DISPUTE
        channels: ['EMAIL'],
        payload: { dispute_id: dispute._id.toString(), awb: shipment.awb || 'UNKNOWN' }
    });

    return res.status(201).json({
        success: true,
        data: { dispute_id: dispute._id, status: 'OPEN' }
    });
});

// ── GET /disputes ───────────────────────────────────────────
export const listDisputes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { status } = req.query;

    const query: any = { user_id: userId };
    if (status) query.status = status;

    const disputes = await Dispute.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        data: { disputes }
    });
});

// ─────────────────────────────────────────────────────────────
// STUBS FOR MISSING ROUTES
// ─────────────────────────────────────────────────────────────
export const getDispute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});
