import { redis } from './redis';
import { RateCache } from '../models/RateCache';
import type { AggregatedRatesResult } from './couriers/types';

const RATE_CACHE_TTL_SECONDS = 900;

function buildCacheKey(
  pickupPincode: string,
  deliveryPincode: string,
  weightGrams: number,
  isCod: boolean = false
): string {
  return `rate:${pickupPincode}:${deliveryPincode}:${weightGrams}:${isCod ? 'cod' : 'prepaid'}`;
}

export async function getRate(
  pickupPincode: string,
  deliveryPincode: string,
  weightGrams: number,
  isCod: boolean = false
): Promise<AggregatedRatesResult | null> {
  const key = buildCacheKey(pickupPincode, deliveryPincode, weightGrams, isCod);

  try {
    const cached = await redis.get(key);
    if (cached) {
      return { ...JSON.parse(cached), cached: true };
    }
  } catch (err) {
  }

  try {
    const dbCached = await RateCache.findOne({
      pickup_pincode: pickupPincode,
      delivery_pincode: deliveryPincode,
      weight_grams: weightGrams,
      is_cod: isCod,
      expires_at: { $gt: new Date() }
    });

    if (dbCached) {
      await redis.set(key, JSON.stringify(dbCached.payload), 'EX', RATE_CACHE_TTL_SECONDS);
      return { ...dbCached.payload, cached: true };
    }
  } catch (err) {
  }

  return null;
}

export async function setRate(
  pickupPincode: string,
  deliveryPincode: string,
  weightGrams: number,
  isCod: boolean = false,
  result: AggregatedRatesResult
): Promise<void> {
  const key = buildCacheKey(pickupPincode, deliveryPincode, weightGrams, isCod);
  const expiresAt = new Date(Date.now() + RATE_CACHE_TTL_SECONDS * 1000);

  try {
    await Promise.all([
      redis.set(key, JSON.stringify(result), 'EX', RATE_CACHE_TTL_SECONDS),
      RateCache.findOneAndUpdate(
        { pickup_pincode: pickupPincode, delivery_pincode: deliveryPincode, weight_grams: weightGrams, is_cod: isCod },
        { payload: result, expires_at: expiresAt },
        { upsert: true }
      )
    ]);
  } catch (err) {
  }
}
