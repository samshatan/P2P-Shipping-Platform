import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { Shipment } from '../../../models/Shipment';
import { TrackingEvent } from '../../../lib/mongo';

// ─────────────────────────────────────────────────────────────
// GET /tracking/:awb
// Returns all tracking events for a shipment
// ─────────────────────────────────────────────────────────────
export const getTrackingByAwb = asyncHandler(async (req: Request, res: Response) => {
    const awb = req.params.awb as string;

    if (!awb || awb.trim().length < 5) {
        return res.status(400).json({
            success: false,
            error: { code: 'TRK_001', message: 'Invalid AWB number' },
        });
    }

    // 1. Get shipment meta from MongoDB
    const shipment = await Shipment.findOne({ awb: awb.toUpperCase() });

    // 2. Get all tracking events from MongoDB (newest first)
    const events = await TrackingEvent
        .find({ awb_number: awb.toUpperCase() })
        .sort({ timestamp: -1 })
        .lean();

    if (!shipment && events.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'TRK_002', message: 'Shipment not found for this AWB' },
        });
    }

    const currentStatus   = events.length > 0 ? events[0].status              : (shipment?.status || 'UNKNOWN');
    const currentLocation = events.length > 0 ? (events[0].location ?? 'Unknown') : 'Processing at Hub';

    return res.status(200).json({
        success: true,
        data: {
            awb: awb.toUpperCase(),
            courier: shipment?.courier_name || 'Generic Partner',
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
// STUBS FOR MISSING ROUTES
// ─────────────────────────────────────────────────────────────
export const confirmDelivery = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});
