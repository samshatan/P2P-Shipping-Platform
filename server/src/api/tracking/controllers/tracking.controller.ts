import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { Shipment } from '../../../models/Shipment';
import { TrackingEvent } from '../../../lib/mongo';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { enqueueNotification } from '../../../lib/queues';

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
// POST /shipments/:id/confirm-delivery
// Confirms delivery using OTP
// ─────────────────────────────────────────────────────────────
export const confirmDelivery = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) {
        return res.status(400).json({
            success: false,
            error: { code: 'TRK_003', message: 'Delivery OTP is required' },
        });
    }

    // 1. Fetch shipment
    const shipment = await Shipment.findOne({ _id: id, user_id: userId });

    if (!shipment) {
        return res.status(404).json({
            success: false,
            error: { code: 'TRK_004', message: 'Shipment not found' },
        });
    }

    // 2. Validate state and OTP
    if (shipment.status === 'DELIVERED') {
        return res.status(400).json({
            success: false,
            error: { code: 'TRK_005', message: 'Shipment already marked as delivered' },
        });
    }

    if (!shipment.delivery_otp) {
        return res.status(400).json({
            success: false,
            error: { code: 'TRK_006', message: 'No delivery OTP generated for this shipment' },
        });
    }

    if (shipment.delivery_otp !== otp) {
        return res.status(400).json({
            success: false,
            error: { code: 'TRK_007', message: 'Invalid delivery OTP' },
        });
    }

    // 3. Update shipment status
    shipment.status = 'DELIVERED';
    shipment.delivered_at = new Date();
    await shipment.save();

    // 4. Record tracking event
    await TrackingEvent.create({
        awb_number: shipment.awb || 'N/A',
        shipment_id: shipment._id.toString(),
        status: 'DELIVERED',
        location: shipment.delivery_address?.city || 'Unknown',
        description: 'Package delivered and confirmed by recipient via OTP',
        timestamp: new Date(),
        meta: { source: 'USER_CONFIRMATION' },
    });

    // 5. Enqueue notification
    await enqueueNotification({
        user_id: userId,
        shipment_id: shipment._id.toString(),
        event_type: 'DELIVERED',
        channels: ['SMS', 'EMAIL'],
        payload: {
            awb: shipment.awb || 'N/A',
            name: req.user!.name,
            email: req.user!.email,
        },
    });

    return res.status(200).json({
        success: true,
        message: 'Delivery confirmed successfully',
        data: {
            status: 'DELIVERED',
            delivered_at: shipment.delivered_at,
        },
    });
});
