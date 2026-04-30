import axios from 'axios';
import redis from '../../Database/redis';
import { CourierRateRequest, CourierRateResponse } from './types';

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';
const TOKEN_KEY = 'shiprocket:token';

/**
 * Shiprocket Courier Integration
 * Handles authentication and rate calculation
 */

async function getShiprocketToken(): Promise<string | null> {
    // 1. Try Cache
    const cached = await redis.get(TOKEN_KEY);
    if (cached) return cached;

    // 2. Auth with Shiprocket
    try {
        const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD
        });

        if (response.data.token) {
            // Cache for 9 days (Shiprocket tokens usually last 10 days)
            await redis.set(TOKEN_KEY, response.data.token, 'EX', 9 * 24 * 3600);
            return response.data.token;
        }
    } catch (err) {
        console.error('❌ Shiprocket Auth Failed:', err);
    }
    return null;
}

export async function getShiprocketRates(req: CourierRateRequest): Promise<CourierRateResponse | null> {
    const token = await getShiprocketToken();
    if (!token) return null;

    try {
        const weightKg = req.weight_grams / 1000;
        const response = await axios.get(`${SHIPROCKET_API_URL}/courier/serviceability/`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                pickup_postcode: req.pickup_pincode,
                delivery_postcode: req.delivery_pincode,
                weight: weightKg,
                cod: req.is_cod ? 1 : 0
            }
        });

        const data = response.data.data;
        if (!data || !data.available_courier_companies || data.available_courier_companies.length === 0) {
            return null;
        }

        // Shiprocket returns multiple couriers. We take the recommended one (first one)
        // or we could map all of them. For the aggregator, we usually want the cheapest/best.
        const best = data.available_courier_companies[0];

        return {
            courier_id: `shiprocket_${best.courier_company_id}`,
            courier_name: `Shiprocket (${best.courier_name})`,
            logo_url: '/logos/shiprocket.png',
            price_paise: Math.round(parseFloat(best.rate) * 100),
            official_eta_days: parseInt(best.etd_hours, 10) / 24 || 3,
            ai_eta_days: parseInt(best.etd_hours, 10) / 24 || 3,
            ai_confidence: 0.95,
            cod_available: best.cod === 1,
            cod_fee_paise: best.cod_charges ? Math.round(parseFloat(best.cod_charges) * 100) : 0,
            pickup_sla_hours: best.pickup_scheduled_date ? 12 : 24,
            rating: 4.5,
            is_sponsored: false,
            tags: ['Reliable', 'Express']
        };
    } catch (err) {
        console.error('❌ Shiprocket Rate Fetch Failed:', err);
        return null;
    }
}
