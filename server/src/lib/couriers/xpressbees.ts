import { CourierRateRequest, CourierRateResponse } from './types';

const TIMEOUT_MS = 3000;

export async function getXpressBeesRates(req: CourierRateRequest): Promise<CourierRateResponse | null> {
  try {
    const apiKey = process.env.XPRESSBEES_API_KEY;

    // 1. Check for API Key
    if (!apiKey) {
      return null;
    }

    // Real API Implementation (Future)
    return null;

  } catch (error) {
    console.error(`[XpressBees API Error]`, error);
    return null;
  }
}
