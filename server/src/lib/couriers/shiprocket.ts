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

export async function getShiprocketRates(req: CourierRateRequest): Promise<CourierRateResponse[]> {
    const token = await getShiprocketToken();
    if (!token) return [];

    try {
        const weightKg = req.weight_grams / 1000;
        const response = await axios.get(`${SHIPROCKET_API_URL}/courier/serviceability/`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                pickup_postcode: req.pickup_pincode,
                delivery_postcode: req.delivery_pincode,
                weight: weightKg,
                length: req.length_cm || 10,
                width: req.width_cm || 10,
                height: req.height_cm || 10,
                cod: req.is_cod ? 1 : 0
            }
        });

        const data = response.data.data;
        if (!data || !data.available_courier_companies) {
            return [];
        }

        const available = data.available_courier_companies;
        const lowestRate = Math.min(...available.map((c: any) => parseFloat(c.rate)));
        const fastestEtd = Math.min(...available.map((c: any) => parseInt(c.etd_hours, 10) || 1000));

        // Map all available couriers from Shiprocket
        return available.map((c: any) => {
            const rate = parseFloat(c.rate);
            const etd = parseInt(c.etd_hours, 10) || 1000;
            const tags = [];
            
            if (rate === lowestRate) tags.push('Cheapest');
            if (etd === fastestEtd && etd < 1000) tags.push('Express');

            return {
                courier_id: `shiprocket_${c.courier_company_id}`,
                courier_name: c.courier_name,
                logo_url: `/logos/shiprocket.png`,
                price_paise: Math.round(rate * 100),
                official_eta_days: etd / 24 || 3,
                cod_available: c.cod === 1,
                cod_fee_paise: c.cod_charges ? Math.round(parseFloat(c.cod_charges) * 100) : 0,
                pickup_sla_hours: c.pickup_scheduled_date ? 12 : 24,
                rating: parseFloat(c.rating) || 4.2,
                is_sponsored: false,
                tags: tags
            };
        });
    } catch (err: any) {
        console.error('❌ Shiprocket Rate Fetch Failed:', err.response?.data || err.message);
        return [];
    }
}
