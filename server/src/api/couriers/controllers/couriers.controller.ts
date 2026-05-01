import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { aggregateRates } from '../../../lib/couriers/rates.aggregator';
import { getRate, setRate } from '../../../lib/rate-cache';
import { CourierPartner } from '../../../models/CourierPartner';

// ── GET /couriers/rates ──────────────────────────────────────
export const getCourierRates = asyncHandler(async (req: Request, res: Response) => {
    const { pickup_pincode, delivery_pincode, weight_grams, length, width, height, is_cod } = req.query;

    if (!pickup_pincode || !delivery_pincode || !weight_grams) {
        return res.status(400).json({
            success: false,
            error: { code: 'RATE_001', message: 'Required: pickup_pincode, delivery_pincode, weight_grams' },
        });
    }

    const pickupPin   = (pickup_pincode as string).trim();
    const deliveryPin = (delivery_pincode as string).trim();
    const weightGrams = parseInt(weight_grams as string, 10);
    const isCod       = (is_cod as string) === 'true';

    // 1. Layer 1: Check dual-layer cache
    const cached = await getRate(pickupPin, deliveryPin, weightGrams, isCod);
    if (cached) {
        return res.status(200).json({
            success: true,
            data: { ...cached, cached: true },
        });
    }

    // 2. Layer 2: Live fetch from all courier APIs
    const live = await aggregateRates({
        pickup_pincode: pickupPin,
        delivery_pincode: deliveryPin,
        weight_grams: weightGrams,
        length_cm: length ? parseInt(length as string, 10) : 10,
        width_cm: width ? parseInt(width as string, 10) : 10,
        height_cm: height ? parseInt(height as string, 10) : 10,
        is_cod: isCod,
    });

    if (live.couriers.length === 0) {
        return res.status(200).json({
            success: true,
            data: { couriers: [], message: 'No courier rates available for this route.' },
        });
    }

    // 3. Store result in Redis + DB
    setRate(pickupPin, deliveryPin, weightGrams, isCod, live).catch(() => {});

    return res.status(200).json({
        success: true,
        data: { ...live, cached: false },
    });
});

// ── GET /admin/couriers ──────────────────────────────────────
export const listCourierPartners = asyncHandler(async (_req: Request, res: Response) => {
    const couriers = await CourierPartner.find().sort({ name: 1 });
    return res.status(200).json({ success: true, data: { couriers } });
});

// ── PATCH /admin/couriers/:id ────────────────────────────────
export const updateCourierConfig = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { markup_percent, is_active } = req.body;

    const courier = await CourierPartner.findById(id);
    if (!courier) {
        return res.status(404).json({ success: false, message: 'Courier not found' });
    }

    if (markup_percent !== undefined) courier.markup_percent = Number(markup_percent);
    if (is_active !== undefined) courier.is_active = Boolean(is_active);

    await courier.save();

    return res.status(200).json({
        success: true,
        data: { courier, message: 'Courier config updated successfully.' },
    });
});

// ─────────────────────────────────────────────────────────────
// STUBS FOR MISSING ROUTES
// ─────────────────────────────────────────────────────────────
export const autoSelectCourier = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});
