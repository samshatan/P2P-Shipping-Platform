import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import redis from '../../../Database/redis';
import pool from '../../../Database/db';
import { successResponse, errorResponse } from '../../shared/types';

const RATES_CACHE_TTL = 900; // 15 minutes
const ratesCacheKey = (pickup: string, delivery: string, weight: number) =>
  `rates:${pickup}:${delivery}:${weight}`;

// Base rate per kg in paise — will be replaced with live courier API responses
const DELHIVERY_BASE_RATE = 6500;
const DTDC_BASE_RATE = 5800;
const XPRESSBEES_BASE_RATE = 6200;

// Mock rate calculator (to be replaced with real courier API calls)
function calculateMockRates(
  pickup: string,
  delivery: string,
  weightGrams: number,
  isCod: boolean
) {
  const baseWeight = Math.max(weightGrams / 1000, 0.5); // kg, min 0.5kg

  // Simple zone-based pricing stub
  const sameStateMultiplier = pickup.slice(0, 2) === delivery.slice(0, 2) ? 0.7 : 1.0;

  const couriers = [
    {
      courier_id: 'delhivery',
      courier_name: 'Delhivery',
      logo_url: 'https://cdn.delhivery.com/logo.png',
      price_paise: Math.round(DELHIVERY_BASE_RATE * baseWeight * sameStateMultiplier),
      official_eta_days: 3,
      ai_eta_days: 4,
      ai_confidence: 0.82,
      cod_available: true,
      cod_fee_paise: isCod ? 2500 : 0,
      pickup_sla_hours: 2,
      rating: 4.2,
      is_sponsored: true,
      tags: ['fastest', 'cod_available'],
    },
    {
      courier_id: 'dtdc',
      courier_name: 'DTDC',
      logo_url: 'https://cdn.dtdc.com/logo.png',
      price_paise: Math.round(DTDC_BASE_RATE * baseWeight * sameStateMultiplier),
      official_eta_days: 4,
      ai_eta_days: 5,
      ai_confidence: 0.75,
      cod_available: true,
      cod_fee_paise: isCod ? 3000 : 0,
      pickup_sla_hours: 4,
      rating: 3.9,
      is_sponsored: false,
      tags: ['value_pick', 'cod_available'],
    },
    {
      courier_id: 'xpressbees',
      courier_name: 'XpressBees',
      logo_url: 'https://cdn.xpressbees.com/logo.png',
      price_paise: Math.round(XPRESSBEES_BASE_RATE * baseWeight * sameStateMultiplier),
      official_eta_days: 3,
      ai_eta_days: 4,
      ai_confidence: 0.78,
      cod_available: false,
      cod_fee_paise: 0,
      pickup_sla_hours: 3,
      rating: 4.0,
      is_sponsored: false,
      tags: ['tier2_coverage'],
    },
  ];

  // Filter COD-only if requested
  return isCod ? couriers.filter((c) => c.cod_available) : couriers;
}

export const getCourierRates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { pickup, delivery, weight, length, width, height, is_cod } = req.query as Record<string, string>;

  if (!pickup || !delivery || !weight) {
    res.status(400).json(
      errorResponse('VALIDATION_001', 'pickup, delivery, and weight query params are required')
    );
    return;
  }

  if (!/^\d{6}$/.test(pickup) || !/^\d{6}$/.test(delivery)) {
    res.status(400).json(errorResponse('VALIDATION_002', 'Pincodes must be 6 digits'));
    return;
  }

  const weightGrams = parseInt(weight, 10);
  if (isNaN(weightGrams) || weightGrams < 1 || weightGrams > 50000) {
    res.status(400).json(
      errorResponse('VALIDATION_003', 'Weight must be between 1 and 50000 grams')
    );
    return;
  }

  const isCod = is_cod === 'true';
  const cacheKey = ratesCacheKey(pickup, delivery, weightGrams);

  try {
    // 1. Try Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.status(200).json(
        successResponse({ ...JSON.parse(cached), cached: true })
      );
      return;
    }

    // 2. Check pincode serviceability
    const [pickupResult, deliveryResult] = await Promise.all([
      pool.query('SELECT city, state, is_serviceable FROM pincodes WHERE pincode = $1', [pickup]),
      pool.query('SELECT city, state, is_serviceable FROM pincodes WHERE pincode = $1', [delivery]),
    ]);

    const pickupData = pickupResult.rows[0];
    const deliveryData = deliveryResult.rows[0];

    if (pickupData && !pickupData.is_serviceable) {
      res.status(400).json(errorResponse('SHIPMENT_001', `Pickup pincode ${pickup} is not serviceable`));
      return;
    }

    if (deliveryData && !deliveryData.is_serviceable) {
      res.status(400).json(errorResponse('SHIPMENT_002', `Delivery pincode ${delivery} is not serviceable`));
      return;
    }

    // 3. Get rates (mock — replace with real courier API calls via Promise.allSettled)
    const couriers = calculateMockRates(pickup, delivery, weightGrams, isCod);

    // Sort by price ascending
    couriers.sort((a, b) => a.price_paise - b.price_paise);

    const responseData = {
      pickup_pincode: pickup,
      delivery_pincode: delivery,
      weight_grams: weightGrams,
      cached: false,
      couriers,
    };

    // 4. Cache the result
    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', RATES_CACHE_TTL);

    res.status(200).json(successResponse(responseData));
  } catch (err) {
    console.error('❌ getCourierRates failed:', err);
    res.status(500).json(errorResponse('SERVER_003', 'Could not fetch courier rates'));
  }
};
