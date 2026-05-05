import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { Shipment } from '../../../models/Shipment';
import { enqueueNotification, enqueueTrackingPoll } from '../../../lib/queues';
import crypto from 'crypto';

// ── Mock courier booking logic ────────────────────────────────
async function callCourierBookingApi(
    courierId: string,
    shipment: any
): Promise<{ success: boolean; awb?: string; label_url?: string }> {
    // Simulate real booking
    return {
        success: true,
        awb: `PCL-${courierId.toUpperCase()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        label_url: `https://labels.parcel.in/mock/${shipment._id}.pdf`,
    };
}

// ─────────────────────────────────────────────────────────────
// POST /shipments/:id/book
// transitions DRAFT → BOOKED
// ─────────────────────────────────────────────────────────────
export const bookShipment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const id = req.params.id;

    // 1. Fetch shipment
    const shipment = await Shipment.findOne({ _id: id, user_id: userId });

    if (!shipment) {
        return res.status(404).json({
            success: false,
            error: { code: 'BOOK_001', message: 'Shipment not found' },
        });
    }

    if (!['DRAFT', 'PAID'].includes(shipment.status)) {
        return res.status(409).json({
            success: false,
            error: { code: 'BOOK_002', message: `Only DRAFT or PAID shipments can be booked. Current: ${shipment.status}` },
        });
    }

    // 2. Call courier API
    const bookingResult = await callCourierBookingApi(shipment.courier_id, shipment);

    if (!bookingResult.success) {
        return res.status(502).json({
            success: false,
            error: { code: 'BOOK_003', message: 'Courier booking failed.' },
        });
    }

    // 3. Generate Delivery OTP
    const deliveryOtp = crypto.randomInt(100000, 999999).toString();

    // 4. Update shipment
    shipment.status = 'BOOKED';
    shipment.awb = bookingResult.awb;
    shipment.label_url = bookingResult.label_url;
    shipment.delivery_otp = deliveryOtp;
    shipment.booked_at = new Date();
    await shipment.save();

    // 5. Enqueue tracking poll
    await enqueueTrackingPoll({
        shipment_id: shipment._id.toString(),
        awb: shipment.awb!,
        courier: (shipment.courier_id as any) || 'delhivery',
    });

    // 6. Enqueue notification
    await enqueueNotification({
        user_id: userId,
        shipment_id: shipment._id.toString(),
        event_type: 'BOOKING_CONFIRMED',
        channels: ['EMAIL', 'SMS'],
        payload: { 
            awb: shipment.awb!, 
            courier: shipment.courier_name || shipment.courier_id,
            email: req.user!.email,
            name: req.user!.name
        },
    });

    return res.status(200).json({
        success: true,
        data: {
            shipment_id: shipment._id,
            awb: shipment.awb,
            status: 'BOOKED',
            label_url: shipment.label_url,
            delivery_otp: deliveryOtp,
            message: 'Shipment booked successfully!',
        },
    });
});

// ─────────────────────────────────────────────────────────────
// POST /shipments/:id/cancel
// ─────────────────────────────────────────────────────────────
export const cancelShipment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const shipment = await Shipment.findOne({ _id: id, user_id: userId });

    if (!shipment) {
        return res.status(404).json({
            success: false,
            error: { code: 'CANCEL_001', message: 'Shipment not found' },
        });
    }

    if (!['DRAFT', 'BOOKED', 'PICKUP_PENDING'].includes(shipment.status)) {
        return res.status(409).json({
            success: false,
            error: { code: 'CANCEL_002', message: `Cannot cancel shipment in status: ${shipment.status}` },
        });
    }

    shipment.status = 'CANCELLED';
    shipment.cancel_reason = reason || 'Cancelled by user';
    shipment.cancelled_at = new Date();
    await shipment.save();

    return res.status(200).json({
        success: true,
        data: { message: 'Shipment cancelled successfully' },
    });
});

// ─────────────────────────────────────────────────────────────
// STUBS FOR MISSING ROUTES
// ─────────────────────────────────────────────────────────────
export const getShipmentLabel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});

export const getUnifiedTracking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});
