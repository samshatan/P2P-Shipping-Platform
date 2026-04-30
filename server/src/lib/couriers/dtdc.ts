import { CourierRateRequest, CourierRateResponse } from './types';

const TIMEOUT_MS = 3000;

export async function getDtdcRates(req: CourierRateRequest): Promise<CourierRateResponse | null> {
  try {
    const apiKey = process.env.DTDC_API_KEY;

    // 1. Check for API Key
    if (!apiKey) {
      return null;
    }

    // Real API Implementation (Future)
    return null;

  } catch (error) {
    console.error(`[DTDC API Error]`, error);
    return null;
  }
}
