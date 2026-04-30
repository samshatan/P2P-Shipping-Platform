import { CourierRateRequest, CourierRateResponse } from './types';

// In milliseconds
const TIMEOUT_MS = 3000;

export async function getDelhiveryRates(req: CourierRateRequest): Promise<CourierRateResponse | null> {
  try {
    const apiKey = process.env.DELHIVERY_API_KEY;
    const baseUrl = process.env.DELHIVERY_BASE_URL || 'https://staging-express.delhivery.com';

    // 1. Check for API Key
    if (!apiKey) {
      return null;
    }

    // Real API Implementation (Future)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // const response = await fetch(`${baseUrl}/api/v1/packages/json/`, {
    //   headers: { 'Authorization': `Token ${apiKey}`, 'Content-Type': 'application/json' },
    //   signal: controller.signal
    // });
    
    clearTimeout(timeout);
    
    // For now, always return the mocked payload if we ever fall into real execution without full mapping
    return null;

  } catch (error) {
    console.error(`[Delhivery API Error]`, error);
    return null; // Suppress errors so aggregator doesn't crash
  }
}
