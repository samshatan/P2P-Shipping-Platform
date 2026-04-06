import { CourierRateRequest, CourierRateResponse, AggregatedRatesResult } from './types';
import { getDelhiveryRates } from './delhivery';
import { getDtdcRates } from './dtdc';
import { getXpressBeesRates } from './xpressbees';

export async function aggregateRates(req: CourierRateRequest): Promise<AggregatedRatesResult> {
  // 1. Fetch all rates in parallel
  const results = await Promise.allSettled([
    getDelhiveryRates(req),
    getDtdcRates(req),
    getXpressBeesRates(req),
  ]);

  // 2. Filter out failures and nulls
  let couriers: CourierRateResponse[] = [];
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value !== null) {
      couriers.push(result.value);
    }
  });

  // 3. Filter by COD if requested
  if (req.is_cod) {
    couriers = couriers.filter(c => c.cod_available);
  }

  // 4. Sort by Price (Cheapest first)
  couriers.sort((a, b) => a.price_paise - b.price_paise);

  // 5. Construct expiration time (15 mins from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  return {
    pickup_pincode: req.pickup_pincode,
    delivery_pincode: req.delivery_pincode,
    weight_grams: req.weight_grams,
    cached: false, // For now, cache layer is not implemented, always false
    couriers,
    expires_at: expiresAt.toISOString(),
  };
}
