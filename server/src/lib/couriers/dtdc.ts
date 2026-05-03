import { CourierRateRequest, CourierRateResponse } from './types';

export async function getDtdcRates(req: CourierRateRequest): Promise<CourierRateResponse | null> {
  try {
    const apiKey = process.env.DTDC_API_KEY;

    if (!apiKey) {
      return null;
    }

    return null;

  } catch (error) {
    return null;
  }
}
