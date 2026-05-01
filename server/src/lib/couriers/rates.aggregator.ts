import { CourierRateRequest, CourierRateResponse, AggregatedRatesResult } from './types';
import { getDelhiveryRates } from './delhivery';
import { getDtdcRates } from './dtdc';
import { getXpressBeesRates } from './xpressbees';
import { getShiprocketRates } from './shiprocket';

export async function aggregateRates(req: CourierRateRequest): Promise<AggregatedRatesResult> {
  // 1. Fetch all rates in parallel
  const results = await Promise.allSettled([
    getDelhiveryRates(req),
    getDtdcRates(req),
    getXpressBeesRates(req),
    getShiprocketRates(req),
  ]);

  // 2. Filter out failures and nulls
  let couriers: CourierRateResponse[] = [];
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value !== null) {
      if (Array.isArray(result.value)) {
        couriers.push(...result.value);
      } else {
        couriers.push(result.value);
      }
    }
  });


  // 4. Filter by COD if requested
  if (req.is_cod) {
    couriers = couriers.filter(c => c.cod_available);
  }

  // 5. Sort by Price (Cheapest first)
  couriers.sort((a, b) => a.price_paise - b.price_paise);

  // 6. Construct expiration time (15 mins from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  return {
    pickup_pincode: req.pickup_pincode,
    delivery_pincode: req.delivery_pincode,
    weight_grams: req.weight_grams,
    cached: false,
    couriers,
    expires_at: expiresAt.toISOString(),
  };
}
