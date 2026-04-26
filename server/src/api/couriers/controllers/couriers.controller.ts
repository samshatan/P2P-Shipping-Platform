import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { aggregateRates } from '../../../lib/couriers/rates.aggregator';
import { getRate, setRate } from '../../../lib/rate-cache';
import { predictEddBatch } from '../../../lib/edd';
import pool from '../../../Database/db';

// DAY 7: GET /couriers/rates
// Multi-courier rate aggregator with dual-layer cache
// Query: ?pickup_pincode=110001&delivery_pincode=400001&weight_grams=500&is_cod=false
export const getCourierRates = asyncHandler(async (req: Request, res: Response) => {
    const { pickup_pincode, delivery_pincode, weight_grams, is_cod } = req.query;

    // ── 1. Validate required query params ─────────────────────
    if (!pickup_pincode || !delivery_pincode || !weight_grams) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'RATE_001',
                message: 'Required: pickup_pincode, delivery_pincode, weight_grams',
            },
        });
    }

    const pickupPin   = (pickup_pincode as string).trim();
    const deliveryPin = (delivery_pincode as string).trim();
    const weightGrams = parseInt(weight_grams as string, 10);
    const isCod       = (is_cod as string) === 'true';

    if (!/^\d{6}$/.test(pickupPin) || !/^\d{6}$/.test(deliveryPin)) {
        return res.status(400).json({
            success: false,
            error: { code: 'RATE_002', message: 'Pincodes must be 6-digit numbers' },
        });
    }

    if (isNaN(weightGrams) || weightGrams <= 0 || weightGrams > 50000) {
        return res.status(400).json({
            success: false,
            error: { code: 'RATE_003', message: 'weight_grams must be between 1 and 50000' },
        });
    }

    // ── 2. Layer 1: Check dual-layer cache (Redis → DB) ───────
    const cached = await getRate(pickupPin, deliveryPin, weightGrams, isCod);
    if (cached) {
        return res.status(200).json({
            success: true,
            data: {
                ...cached,
                cached: true,
                cache_source: 'redis_or_db',
            },
        });
    }

    // ── 3. Layer 2: Live fetch from all courier APIs ───────────
    const live = await aggregateRates({
        pickup_pincode:   pickupPin,
        delivery_pincode: deliveryPin,
        weight_grams:     weightGrams,
        is_cod:           isCod,
    });

    if (live.couriers.length === 0) {
        return res.status(503).json({
            success: false,
            error: {
                code: 'RATE_004',
                message: 'No courier rates available for this route. Please try again.',
            },
        });
    }

    // ── 4. Store result in Redis + DB (fire-and-forget)
    setRate(pickupPin, deliveryPin, weightGrams, isCod, live).catch((err) =>
        console.error('⚠️ Rate cache write failed:', err)
    );

    // ── 5. Enrich each courier with AI EDD prediction ─────────
    try {
        const eddRequests = live.couriers.map((c) => ({
            pickup_pincode:   pickupPin,
            delivery_pincode: deliveryPin,
            courier_slug:     c.courier_id,
            weight_grams:     weightGrams,
        }));
        const eddResults = await predictEddBatch(eddRequests);
        live.couriers = live.couriers.map((c, i) => ({
            ...c,
            ai_eta_days:             eddResults[i]?.predicted_days ?? c.ai_eta_days,
            predicted_delivery_date: eddResults[i]?.predicted_delivery_date ?? null,
            edd_confidence:          eddResults[i]?.confidence ?? null,
        }));
    } catch {
        // Non-fatal — rates still returned without EDD enrichment
    }

    return res.status(200).json({
        success: true,
        data: {
            ...live,
            cached: false,
        },
    });
});


// DAY 23: POST /couriers/auto-select
// Bulk Courier Orchestration — auto-select cheapest serviceable courier
// Body: { pickup_pincode, delivery_pincode, weight_grams, is_cod? }
export const autoSelectCourier = asyncHandler(async (req: Request, res: Response) => {
    const { pickup_pincode, delivery_pincode, weight_grams, is_cod } = req.body;

    if (!pickup_pincode || !delivery_pincode || !weight_grams) {
        return res.status(400).json({
            success: false,
            error: { code: 'AUTO_001', message: 'pickup_pincode, delivery_pincode, weight_grams are required' },
        });
    }

    const pickupPin   = (pickup_pincode as string).trim();
    const deliveryPin = (delivery_pincode as string).trim();
    const weightGrams = parseInt(weight_grams as string, 10);
    const isCod       = Boolean(is_cod);

    // Get rates (from cache or live)
    let result = await getRate(pickupPin, deliveryPin, weightGrams, isCod);

    if (!result) {
        result = await aggregateRates({ pickup_pincode: pickupPin, delivery_pincode: deliveryPin, weight_grams: weightGrams, is_cod: isCod });
        // Cache for future requests
        setRate(pickupPin, deliveryPin, weightGrams, isCod, result).catch(() => {});
    }

    if (!result.couriers.length) {
        return res.status(503).json({
            success: false,
            error: { code: 'AUTO_002', message: 'No serviceable couriers found for this route' },
        });
    }

    // ── Auto-selection logic
    // Rule: Cheapest courier that is serviceable. Sponsored couriers are NOT auto-selected.
    const nonSponsored = result.couriers.filter((c) => !c.is_sponsored);
    const selected     = nonSponsored.length > 0 ? nonSponsored[0] : result.couriers[0];

    return res.status(200).json({
        success: true,
        data: {
            selected_courier: selected,
            all_couriers:     result.couriers,
            selection_reason: `Cheapest ${isCod ? 'COD-enabled ' : ''}courier for route ${pickupPin}→${deliveryPin}`,
            cached:           result.cached,
        },
    });
});

// DAY 24: GET /admin/couriers
// List all courier partners with their config
export const listCourierPartners = asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(
        `SELECT id, name, slug, logo, is_active, markup_percent, api_key_name, created_at
         FROM courier_partners
         ORDER BY name ASC`
    );
    return res.status(200).json({ success: true, data: { couriers: result.rows } });
});


// DAY 24: PATCH /admin/couriers/:id
// Admin: update markup_percent or toggle active status
// Body: { markup_percent?, is_active? }
export const updateCourierConfig = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { markup_percent, is_active } = req.body;

    if (markup_percent === undefined && is_active === undefined) {
        return res.status(400).json({
            success: false,
            error: { code: 'ADMIN_001', message: 'Provide at least one field: markup_percent or is_active' },
        });
    }

    // Build SET clause dynamically — only update what's provided
    const sets: string[]  = [];
    const params: unknown[] = [];

    if (markup_percent !== undefined) {
        params.push(Number(markup_percent));
        sets.push(`markup_percent = $${params.length}`);
    }
    if (is_active !== undefined) {
        params.push(Boolean(is_active));
        sets.push(`is_active = $${params.length}`);
    }

    params.push(id);
    const result = await pool.query(
        `UPDATE courier_partners SET ${sets.join(', ')}, updated_at = NOW()
         WHERE id = $${params.length}
         RETURNING id, name, slug, is_active, markup_percent`,
        params
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'ADMIN_002', message: 'Courier partner not found' },
        });
    }

    console.log(` Admin updated courier config: ${result.rows[0].name}`);

    return res.status(200).json({
        success: true,
        data: {
            courier: result.rows[0],
            message: 'Courier config updated. Changes are live immediately — no restart required.',
        },
    });
});
