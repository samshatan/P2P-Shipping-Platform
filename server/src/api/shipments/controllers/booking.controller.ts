import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import redis from '../../../Database/redis';
import { emitEvent, TOPICS } from '../../../lib/kafka';
import { enqueueNotification, enqueueTrackingPoll } from '../../../lib/queues';
import crypto from 'crypto';

// ── Delivery OTP Redis key ────────────────────────────────────
const DELIVERY_OTP_KEY = (shipmentId: string) => `delivery_otp:${shipmentId}`;

// ── Mock courier booking (real API calls added when credentials available) ───
async function callCourierBookingApi(
    courierSlug: string,
    shipmentData: Record<string, unknown>
): Promise<{ success: boolean; awb?: string; label_url?: string }> {
    // In dev/mock mode — simulate a successful booking response
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[BookingEngine] 🔵 MOCK booking courier: ${courierSlug}`, shipmentData);
        return {
            success: true,
            awb: `${courierSlug.toUpperCase()}-AWB-${Date.now()}`,
            label_url: `https://labels.swiftroute.in/mock/${Date.now()}.pdf`,
        };
    }

    // Real courier API switch — to be filled per courier
    throw new Error(`Courier ${courierSlug} real API not integrated yet`);
}

// ─────────────────────────────────────────────────────────────
// DAY 11: POST /shipments/:id/book
// Booking Engine — transitions DRAFT → BOOKED
// ─────────────────────────────────────────────────────────────
export const bookShipment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const id     = req.params.id as string;  // params always a single string in /:id routes


    // ── 1. Fetch shipment — must be DRAFT and owned by user ───
    const shipResult = await pool.query(
        `SELECT s.*, cp.slug AS courier_slug, cp.name AS courier_name
         FROM shipments s
         LEFT JOIN courier_partners cp ON cp.id = s.courier_id
         WHERE s.id = $1 AND s.user_id = $2`,
        [id, userId]
    );

    if (shipResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'BOOK_001', message: 'Shipment not found' },
        });
    }

    const shipment = shipResult.rows[0];

    if (shipment.status !== 'DRAFT') {
        return res.status(409).json({
            success: false,
            error: { code: 'BOOK_002', message: `Only DRAFT shipments can be booked. Current: ${shipment.status}` },
        });
    }

    // ── 2. Call courier API to book pickup ────────────────────
    const bookingResult = await callCourierBookingApi(
        shipment.courier_slug || 'delhivery',
        {
            awb: shipment.awb_number,
            pickup_address:   JSON.parse(shipment.pickup_address),
            delivery_address: JSON.parse(shipment.delivery_address),
            weight:     shipment.weight,
            dimensions: shipment.dimensions,
            parcel_type: shipment.parcel_type,
            is_cod:      shipment.is_cod,
            cod_amount:  shipment.cod_amount,
        }
    );

    if (!bookingResult.success) {
        return res.status(502).json({
            success: false,
            error: { code: 'BOOK_003', message: 'Courier booking failed. Please try again.' },
        });
    }

    // ── 3. Generate Delivery OTP (6-digit, stored in Redis 10 days) ──
    const deliveryOtp = crypto.randomInt(100000, 999999).toString();
    await redis.set(DELIVERY_OTP_KEY(id), deliveryOtp, 'EX', 10 * 24 * 60 * 60); // 10 days

    // ── 4. Update shipment: DRAFT → BOOKED + save real AWB + label ───
    await pool.query(
        `UPDATE shipments
         SET status = 'BOOKED',
             awb_number = $1,
             label_url = $2,
             delivery_otp = $3,
             booked_at = NOW()
         WHERE id = $4`,
        [bookingResult.awb, bookingResult.label_url ?? null, deliveryOtp, id]
    );

    // ── 5. Enqueue tracking poll (for couriers without webhooks) ─
    await enqueueTrackingPoll({
        shipment_id: id,
        awb: bookingResult.awb!,
        courier: (shipment.courier_slug || 'delhivery') as 'delhivery' | 'dtdc' | 'xpressbees',
    });

    // ── 6. Emit Kafka booking_confirmed notification event ────
    await emitEvent(TOPICS.NOTIFICATION_DISPATCH, {
        event_type: 'BOOKING_CONFIRMED',
        user_id: userId,
        shipment_id: id,
        awb: bookingResult.awb,
        timestamp: new Date().toISOString(),
    });

    await enqueueNotification({
        user_id: userId,
        shipment_id: id,
        event_type: 'BOOKING_CONFIRMED',
        channels: ['SMS', 'WHATSAPP', 'PUSH'],
        payload: { awb: bookingResult.awb!, courier: shipment.courier_name },
    });

    return res.status(200).json({
        success: true,
        data: {
            shipment_id: id,
            awb: bookingResult.awb,
            status: 'BOOKED',
            label_url: bookingResult.label_url,
            delivery_otp: deliveryOtp,       // courier hands this to recipient
            message: 'Shipment booked successfully. Pickup will be arranged shortly.',
        },
    });
});

// ─────────────────────────────────────────────────────────────
// DAY 12: GET /shipments/:id/label
// Returns label data for printing (AWB + addresses + barcode data)
// ─────────────────────────────────────────────────────────────
export const getShipmentLabel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const result = await pool.query(
        `SELECT
            s.id, s.awb_number, s.label_url, s.status,
            s.pickup_address, s.delivery_address,
            s.weight, s.dimensions, s.parcel_type,
            s.is_cod, s.cod_amount, s.total_amount,
            cp.name AS courier_name, cp.logo AS courier_logo
         FROM shipments s
         LEFT JOIN courier_partners cp ON cp.id = s.courier_id
         WHERE s.id = $1 AND s.user_id = $2`,
        [id, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'LABEL_001', message: 'Shipment not found' },
        });
    }

    const s = result.rows[0];

    if (!['BOOKED', 'PICKUP_PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)) {
        return res.status(409).json({
            success: false,
            error: { code: 'LABEL_002', message: `Label only available after booking. Current status: ${s.status}` },
        });
    }

    const pickup   = typeof s.pickup_address   === 'string' ? JSON.parse(s.pickup_address)   : s.pickup_address;
    const delivery = typeof s.delivery_address === 'string' ? JSON.parse(s.delivery_address) : s.delivery_address;

    return res.status(200).json({
        success: true,
        data: {
            // If real PDF label available, return the URL
            label_url: s.label_url ?? null,

            // Structured label data for client-side rendering / custom printing
            label_data: {
                awb:        s.awb_number,
                courier:    s.courier_name,
                logo_url:   s.courier_logo,
                weight_kg:  (s.weight / 1000).toFixed(2),
                dimensions: s.dimensions ?? 'N/A',
                parcel_type: s.parcel_type,
                is_cod:      s.is_cod,
                cod_amount:  s.is_cod ? `₹${(s.cod_amount / 100).toFixed(2)}` : null,

                from: {
                    name:    pickup.name,
                    phone:   pickup.phone,
                    address: `${pickup.flat}, ${pickup.area}`,
                    city:    pickup.city,
                    state:   pickup.state,
                    pincode: pickup.pincode,
                },
                to: {
                    name:    delivery.name,
                    phone:   delivery.phone,
                    address: `${delivery.flat}, ${delivery.area}`,
                    city:    delivery.city,
                    state:   delivery.state,
                    pincode: delivery.pincode,
                },
            },
        },
    });
});

// ─────────────────────────────────────────────────────────────
// DAY 13: GET /shipments/:id/tracking
// Unified tracking status — combines PG (meta) + MongoDB (events)
// ─────────────────────────────────────────────────────────────
export const getUnifiedTracking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const id     = req.params.id as string;

    // Get shipment from PG (scoped to user)
    const result = await pool.query(
        `SELECT s.awb_number, s.status, s.booked_at, s.delivered_at,
                cp.name AS courier_name
         FROM shipments s
         LEFT JOIN courier_partners cp ON cp.id = s.courier_id
         WHERE s.id = $1 AND s.user_id = $2`,
        [id, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'TRK_003', message: 'Shipment not found' },
        });
    }

    const shipment = result.rows[0];

    // Pull tracking events from MongoDB via the AWB
    // Dynamically import to avoid circular dependency issues
    const { TrackingEvent } = await import('../../../lib/mongo');

    interface ITrackingEvent {
        status: string;
        location?: string;
        description?: string;
        timestamp: Date;
    }

    const events = await TrackingEvent
        .find({ awb_number: shipment.awb_number })
        .sort({ timestamp: -1 })
        .lean() as ITrackingEvent[];

    return res.status(200).json({
        success: true,
        data: {
            shipment_id: id,
            awb: shipment.awb_number,
            courier: shipment.courier_name,
            current_status: events.length > 0 ? events[0].status : shipment.status,
            current_location: events.length > 0 ? (events[0].location ?? 'Unknown') : 'Not yet updated',
            booked_at:    shipment.booked_at,
            delivered_at: shipment.delivered_at,
            events: events.map((e) => ({
                status:      e.status,
                location:    e.location ?? 'Unknown',
                description: e.description ?? '',
                timestamp:   e.timestamp,
            })),
        },
    });
});

// ─────────────────────────────────────────────────────────────
// DAY 14: POST /shipments/:id/cancel
// Cancel a shipment that is still DRAFT or BOOKED
// ─────────────────────────────────────────────────────────────
export const cancelShipment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const id     = req.params.id as string;
    const { reason } = req.body;

    const result = await pool.query(
        `SELECT id, status FROM shipments WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'CANCEL_001', message: 'Shipment not found' },
        });
    }

    const shipment = result.rows[0];

    if (!['DRAFT', 'BOOKED', 'PICKUP_PENDING'].includes(shipment.status)) {
        return res.status(409).json({
            success: false,
            error: {
                code: 'CANCEL_002',
                message: `Cannot cancel shipment in '${shipment.status}' status`,
            },
        });
    }

    await pool.query(
        `UPDATE shipments SET status = 'CANCELLED', cancel_reason = $1, cancelled_at = NOW() WHERE id = $2`,
        [reason ?? 'Cancelled by user', id]
    );

    // Clean up delivery OTP from Redis
    await redis.del(DELIVERY_OTP_KEY(id));

    // Emit cancellation event
    await emitEvent(TOPICS.SHIPMENT_UPDATED, {
        shipment_id: id,
        status: 'CANCELLED',
        user_id: userId,
        timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
        success: true,
        data: { message: 'Shipment cancelled successfully', shipment_id: id },
    });
});
