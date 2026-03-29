import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import { successResponse, errorResponse } from '../../shared/types';

// ── POST /address/search ─────────────────────
// Stub: searches pincodes table by city/state keyword
// Production: will call Python embedder + Pinecone vector search
export const searchAddresses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { query, limit } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    res.status(400).json(errorResponse('VALIDATION_001', 'query must be at least 2 characters'));
    return;
  }

  const maxResults = Math.min(10, Math.max(1, parseInt(limit ?? '5', 10)));

  try {
    const result = await pool.query(
      `SELECT pincode, city, state
       FROM pincodes
       WHERE city ILIKE $1 OR state ILIKE $1
       ORDER BY city
       LIMIT $2`,
      [`%${query.trim()}%`, maxResults]
    );

    const addresses = result.rows.map((row) => ({
      address: `${row.city}, ${row.state}`,
      pincode: row.pincode,
      city: row.city,
      state: row.state,
      score: 0.9, // placeholder — real score comes from vector similarity
    }));

    res.status(200).json(successResponse({ results: addresses }));
  } catch (err) {
    console.error('❌ searchAddresses failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Address search failed'));
  }
};

// ── GET /pincodes/check ──────────────────────
export const checkPincodes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { pickup, delivery } = req.query as { pickup: string; delivery: string };

  if (!pickup || !delivery) {
    res.status(400).json(errorResponse('VALIDATION_001', 'pickup and delivery query params are required'));
    return;
  }

  if (!/^\d{6}$/.test(pickup) || !/^\d{6}$/.test(delivery)) {
    res.status(400).json(errorResponse('VALIDATION_002', 'Pincodes must be 6 digits'));
    return;
  }

  try {
    const [pickupResult, deliveryResult] = await Promise.all([
      pool.query('SELECT pincode, city, state, is_serviceable FROM pincodes WHERE pincode = $1', [pickup]),
      pool.query('SELECT pincode, city, state, is_serviceable FROM pincodes WHERE pincode = $1', [delivery]),
    ]);

    const pickupData = pickupResult.rows[0];
    const deliveryData = deliveryResult.rows[0];

    const pickupServiceable = pickupData ? pickupData.is_serviceable : true; // default serviceable if not in table
    const deliveryServiceable = deliveryData ? deliveryData.is_serviceable : true;

    const response: Record<string, unknown> = {
      pickup: {
        pincode: pickup,
        city: pickupData?.city || null,
        serviceable: pickupServiceable,
      },
      delivery: {
        pincode: delivery,
        city: deliveryData?.city || null,
        serviceable: deliveryServiceable,
      },
      both_serviceable: pickupServiceable && deliveryServiceable,
    };

    if (!pickupServiceable) {
      response.message = `Pickup pincode ${pickup} is not serviceable yet`;
    } else if (!deliveryServiceable) {
      response.message = `Delivery pincode ${delivery} is not serviceable yet`;
    }

    res.status(200).json(successResponse(response));
  } catch (err) {
    console.error('❌ checkPincodes failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Pincode check failed'));
  }
};
