import { CourierRateRequest, CourierRateResponse } from './types';

export async function getDelhiveryRates(req: CourierRateRequest): Promise<CourierRateResponse | null> {
  try {
    const apiKey = process.env.DELHIVERY_API_KEY;

    if (!apiKey) {
      return null;
    }

    return null;

  } catch (error) {
    return null;
  }
}
