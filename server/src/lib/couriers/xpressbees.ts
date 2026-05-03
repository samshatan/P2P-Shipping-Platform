import { CourierRateRequest, CourierRateResponse } from './types';

export async function getXpressBeesRates(req: CourierRateRequest): Promise<CourierRateResponse | null> {
  try {
    const apiKey = process.env.XPRESSBEES_API_KEY;

    if (!apiKey) {
      return null;
    }

    return null;

  } catch (error) {
    return null;
  }
}
