import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import { successResponse, errorResponse } from '../../shared/types';

const GST_RATE = 0.18;                   // 18% GST
const BASE_RATE_PAISE_PER_KG = 6500;    // Rs 65/kg stub rate — will come from courier API

export const createShipment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  const {
    pickup_address,
    delivery_address,
    courier_id,
    weight_grams,
    length_cm,
    width_cm,
    height_cm,
    parcel_type,
    is_cod,
    cod_amount_paise,
  } = req.body;

  // Validate required fields
  if (!pickup_address || !delivery_address || !courier_id || !weight_grams) {
    res.status(400).json(
      errorResponse('VALIDATION_001', 'pickup_address, delivery_address, courier_id, and weight_grams are required')
    );
    return;
  }

  if (weight_grams < 1 || weight_grams > 50000) {
    res.status(400).json(errorResponse('SHIPMENT_006', 'Invalid weight — must be between 1 gram and 50000 grams'));
    return;
  }

  if (is_cod && (!cod_amount_paise || cod_amount_paise <= 0)) {
    res.status(400).json(errorResponse('VALIDATION_001', 'cod_amount_paise is required when is_cod is true'));
    return;
  }

  try {
    // Validate courier exists and is active
    const courierCheck = await pool.query(
      'SELECT id, name FROM couriers WHERE code = $1 AND is_active = true',
      [courier_id]
    );

    let courierDbId: string | null = null;
    if (courierCheck.rows.length > 0) {
      courierDbId = courierCheck.rows[0].id;
    }

    // Store addresses inline in the shipment metadata (or create address records)
    let pickupAddressId: string | null = null;
    let deliveryAddressId: string | null = null;

    // Save pickup address
    const pickupInsert = await pool.query(
      `INSERT INTO addresses (user_id, label, name, phone, pincode, city, state, area, is_default)
       VALUES ($1, 'pickup', $2, $3, $4, $5, $6, $7, false)
       RETURNING id`,
      [
        userId,
        pickup_address.name || '',
        pickup_address.phone || '',
        pickup_address.pincode || '',
        pickup_address.city || '',
        pickup_address.state || '',
        pickup_address.full_address || '',
      ]
    );
    pickupAddressId = pickupInsert.rows[0].id;

    // Save delivery address
    const deliveryInsert = await pool.query(
      `INSERT INTO addresses (user_id, label, name, phone, pincode, city, state, area, is_default)
       VALUES ($1, 'delivery', $2, $3, $4, $5, $6, $7, false)
       RETURNING id`,
      [
        userId,
        delivery_address.name || '',
        delivery_address.phone || '',
        delivery_address.pincode || '',
        delivery_address.city || '',
        delivery_address.state || '',
        delivery_address.full_address || '',
      ]
    );
    deliveryAddressId = deliveryInsert.rows[0].id;

    // Calculate base charge (simple weight-based — real pricing comes from courier API)
    const baseWeightKg = Math.max(weight_grams / 1000, 0.5);
    const basePricePaise = Math.round(BASE_RATE_PAISE_PER_KG * baseWeightKg);
    const gstPaise = Math.round(basePricePaise * GST_RATE);
    const totalPaise = basePricePaise + gstPaise;
    // Store base price only; GST is always computed on read
    const baseRupees = basePricePaise / 100;

    const dimensions = (length_cm && width_cm && height_cm)
      ? { l: length_cm, w: width_cm, h: height_cm }
      : null;

    // Insert shipment
    const shipmentResult = await pool.query(
      `INSERT INTO shipments
         (user_id, pickup_address_id, delivery_address_id, courier_id,
          weight_grams, dimensions_cm, cod_amount, parcel_type, charge, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'DRAFT', 'PENDING')
       RETURNING id, status, charge, created_at`,
      [
        userId,
        pickupAddressId,
        deliveryAddressId,
        courierDbId,
        weight_grams,
        dimensions ? JSON.stringify(dimensions) : null,
        is_cod ? (cod_amount_paise || 0) / 100 : 0,
        parcel_type || 'parcel',
        baseRupees,
      ]
    );

    const shipment = shipmentResult.rows[0];

    res.status(201).json(
      successResponse({
        shipment_id: shipment.id,
        status: shipment.status.toLowerCase(),
        amount_paise: basePricePaise,
        gst_paise: gstPaise,
        total_paise: totalPaise,
        created_at: shipment.created_at,
      })
    );
  } catch (err) {
    console.error('❌ createShipment failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Could not create shipment'));
  }
};

export const getShipment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { shipment_id } = req.params;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  try {
    const result = await pool.query(
      `SELECT
         s.id, s.awb, s.status, s.payment_status, s.weight_grams,
         s.dimensions_cm, s.cod_amount, s.charge, s.parcel_type,
         s.created_at, s.updated_at,
         c.code AS courier_id, c.name AS courier_name,
         pa.area AS pickup_full_address, pa.pincode AS pickup_pincode,
         pa.city AS pickup_city, pa.state AS pickup_state,
         pa.name AS pickup_name, pa.phone AS pickup_phone,
         da.area AS delivery_full_address, da.pincode AS delivery_pincode,
         da.city AS delivery_city, da.state AS delivery_state,
         da.name AS delivery_name, da.phone AS delivery_phone
       FROM shipments s
       LEFT JOIN couriers c ON c.id = s.courier_id
       LEFT JOIN addresses pa ON pa.id = s.pickup_address_id
       LEFT JOIN addresses da ON da.id = s.delivery_address_id
       WHERE s.id = $1 AND s.user_id = $2`,
      [shipment_id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json(errorResponse('SHIPMENT_004', 'Shipment not found'));
      return;
    }

    const s = result.rows[0];
    const charge = s.charge ? Math.round(parseFloat(s.charge) * 100) : 0;
    const gst = Math.round(charge * GST_RATE);

    res.status(200).json(
      successResponse({
        shipment_id: s.id,
        status: s.status.toLowerCase(),
        awb_number: s.awb,
        courier_id: s.courier_id,
        courier_name: s.courier_name,
        pickup_address: {
          full_address: s.pickup_full_address,
          pincode: s.pickup_pincode,
          city: s.pickup_city,
          state: s.pickup_state,
          name: s.pickup_name,
          phone: s.pickup_phone,
        },
        delivery_address: {
          full_address: s.delivery_full_address,
          pincode: s.delivery_pincode,
          city: s.delivery_city,
          state: s.delivery_state,
          name: s.delivery_name,
          phone: s.delivery_phone,
        },
        weight_grams: s.weight_grams,
        dimensions_cm: s.dimensions_cm,
        amount_paise: charge,
        gst_paise: gst,
        total_paise: charge + gst,
        is_cod: parseFloat(s.cod_amount) > 0,
        cod_amount_paise: Math.round(parseFloat(s.cod_amount) * 100),
        payment_status: s.payment_status.toLowerCase(),
        parcel_type: s.parcel_type,
        created_at: s.created_at,
        updated_at: s.updated_at,
      })
    );
  } catch (err) {
    console.error('❌ getShipment failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Could not fetch shipment'));
  }
};

export const listUserShipments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
  const status = req.query.status as string | undefined;
  const offset = (page - 1) * limit;

  try {
    const conditions: string[] = ['s.user_id = $1'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (status) {
      conditions.push(`s.status = $${idx++}`);
      values.push(status.toUpperCase());
    }

    const whereClause = conditions.join(' AND ');

    const [shipmentRows, countRow] = await Promise.all([
      pool.query(
        `SELECT
           s.id, s.awb, s.status, s.payment_status, s.weight_grams,
           s.charge, s.parcel_type, s.created_at,
           c.name AS courier_name,
           da.city AS delivery_city
         FROM shipments s
         LEFT JOIN couriers c ON c.id = s.courier_id
         LEFT JOIN addresses da ON da.id = s.delivery_address_id
         WHERE ${whereClause}
         ORDER BY s.created_at DESC
         LIMIT $${idx++} OFFSET $${idx}`,
        [...values, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM shipments s WHERE ${whereClause}`, values),
    ]);

    const total = parseInt(countRow.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
      successResponse({
        shipments: shipmentRows.rows.map((s) => ({
          shipment_id: s.id,
          awb_number: s.awb,
          status: s.status.toLowerCase(),
          payment_status: s.payment_status.toLowerCase(),
          courier_name: s.courier_name,
          delivery_city: s.delivery_city,
          weight_grams: s.weight_grams,
          total_paise: s.charge ? Math.round(parseFloat(s.charge) * 100 * (1 + GST_RATE)) : 0,
          parcel_type: s.parcel_type,
          created_at: s.created_at,
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      })
    );
  } catch (err) {
    console.error('❌ listUserShipments failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Could not fetch shipments'));
  }
};

export const searchShipments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  const q = (req.query.q as string || '').trim();

  if (!q || q.length < 2) {
    res.status(400).json(errorResponse('VALIDATION_001', 'Search query must be at least 2 characters'));
    return;
  }

  try {
    const result = await pool.query(
      `SELECT
         s.id, s.awb, s.status, s.payment_status, s.weight_grams, s.charge,
         s.created_at,
         c.name AS courier_name,
         da.city AS delivery_city
       FROM shipments s
       LEFT JOIN couriers c ON c.id = s.courier_id
       LEFT JOIN addresses da ON da.id = s.delivery_address_id
       WHERE s.user_id = $1
         AND (
           s.awb ILIKE $2
           OR c.name ILIKE $2
           OR da.city ILIKE $2
         )
       ORDER BY s.created_at DESC
       LIMIT 50`,
      [userId, `%${q}%`]
    );

    res.status(200).json(
      successResponse({
        shipments: result.rows.map((s) => ({
          shipment_id: s.id,
          awb_number: s.awb,
          status: s.status.toLowerCase(),
          courier_name: s.courier_name,
          delivery_city: s.delivery_city,
          weight_grams: s.weight_grams,
          total_paise: s.charge ? Math.round(parseFloat(s.charge) * 100 * (1 + GST_RATE)) : 0,
          created_at: s.created_at,
        })),
        total: result.rows.length,
      })
    );
  } catch (err) {
    console.error('❌ searchShipments failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Search failed'));
  }
};

export const cancelShipment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { shipment_id } = req.params;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  try {
    const result = await pool.query(
      'SELECT id, status, charge FROM shipments WHERE id = $1 AND user_id = $2',
      [shipment_id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json(errorResponse('SHIPMENT_004', 'Shipment not found'));
      return;
    }

    const shipment = result.rows[0];
    const nonCancellableStatuses = ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

    if (nonCancellableStatuses.includes(shipment.status)) {
      res.status(400).json(errorResponse('SHIPMENT_005', 'Shipment cannot be cancelled — already picked up'));
      return;
    }

    await pool.query(
      `UPDATE shipments SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1`,
      [shipment_id]
    );

    const refundPaise = shipment.charge ? Math.round(parseFloat(shipment.charge) * 100 * (1 + GST_RATE)) : 0;

    res.status(200).json(
      successResponse({
        shipment_id,
        status: 'cancelled',
        refund_amount_paise: refundPaise,
        refund_to: 'wallet',
        refund_eta: 'Instant to wallet | 3-5 days to bank',
      })
    );
  } catch (err) {
    console.error('❌ cancelShipment failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Could not cancel shipment'));
  }
};
