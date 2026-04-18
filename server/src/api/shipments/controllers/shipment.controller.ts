import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';

// ── Helper: Generate unique AWB number ───────────────────────
// Format: AWB + timestamp + IN  e.g. AWB1712345678IN
function generateAwb(): string {
    return `AWB${Date.now()}IN`;
}

// ─────────────────────────────────────────────────────────────
// POST /shipments/create
// Creates a DRAFT shipment record in PostgreSQL
// ─────────────────────────────────────────────────────────────
export const createShipment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;

    const {
        pickup_address,
        delivery_address,
        courier_id,
        weight,           // in grams
        dimensions,       // optional string e.g. "30x20x10"
        parcel_type,      // DOCUMENT | PARCEL | FRAGILE
        is_cod,
        cod_amount,
        amount_paise,     // total shipment cost in paise
    } = req.body;

    // ── 1. Validate required fields ───────────────────────────
    if (!pickup_address || !delivery_address || !courier_id || !weight || !amount_paise) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'SHIP_001',
                message: 'Required fields: pickup_address, delivery_address, courier_id, weight, amount_paise',
            },
        });
    }

    // ── 2. Verify courier exists ──────────────────────────────
    const courierCheck = await pool.query(
        'SELECT id FROM courier_partners WHERE id = $1 AND is_active = true',
        [courier_id]
    );

    if (courierCheck.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'SHIP_002', message: 'Courier not found or inactive' },
        });
    }

    // ── 3. Generate AWB number ────────────────────────────────
    const awb = generateAwb();

    // ── 4. Save DRAFT shipment to PostgreSQL ──────────────────
    const result = await pool.query(
        `INSERT INTO shipments (
            user_id, awb_number, pickup_address, delivery_address,
            courier_id, weight, dimensions, parcel_type,
            is_cod, cod_amount, total_amount, status, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'DRAFT',NOW())
        RETURNING id, awb_number, status, total_amount, created_at`,
        [
            userId,
            awb,
            JSON.stringify(pickup_address),
            JSON.stringify(delivery_address),
            courier_id,
            weight,
            dimensions ?? null,
            parcel_type ?? 'PARCEL',
            is_cod ?? false,
            cod_amount ?? 0,
            amount_paise,
        ]
    );

    const shipment = result.rows[0];

    return res.status(201).json({
        success: true,
        data: {
            shipment_id: shipment.id,
            awb: shipment.awb_number,
            status: shipment.status,        // "DRAFT"
            amount_paise: shipment.total_amount,
            created_at: shipment.created_at,
        },
    });
});

// ─────────────────────────────────────────────────────────────
// GET /shipments/:id
// Fetch a single shipment by ID (must belong to logged-in user)
// ─────────────────────────────────────────────────────────────
export const getShipmentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await pool.query(
        `SELECT
            s.id, s.awb_number, s.status, s.pickup_address, s.delivery_address,
            s.weight, s.dimensions, s.parcel_type, s.is_cod, s.cod_amount,
            s.total_amount, s.created_at,
            cp.name AS courier_name, cp.logo AS courier_logo
         FROM shipments s
         LEFT JOIN courier_partners cp ON cp.id = s.courier_id
         WHERE s.id = $1 AND s.user_id = $2`,
        [id, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'SHIP_003', message: 'Shipment not found' },
        });
    }

    return res.status(200).json({
        success: true,
        data: { shipment: result.rows[0] },
    });
});

// ─────────────────────────────────────────────────────────────
// GET /users/shipments
// List all shipments for logged-in user — paginated + status filter
// Query: ?page=1&limit=10&status=DRAFT
// ─────────────────────────────────────────────────────────────
export const getUserShipments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;

    // Pagination
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    // Optional status filter
    const status = req.query.status as string | undefined;

    const VALID_STATUSES = ['DRAFT', 'BOOKED', 'PICKUP_PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION', 'RETURNED'];

    if (status && !VALID_STATUSES.includes(status.toUpperCase())) {
        return res.status(400).json({
            success: false,
            error: { code: 'SHIP_004', message: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` },
        });
    }

    // Build query dynamically
    const conditions: string[] = ['s.user_id = $1'];
    const params: (string | number)[] = [userId];

    if (status) {
        params.push(status.toUpperCase());
        conditions.push(`s.status = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countResult = await pool.query(
        `SELECT COUNT(*) FROM shipments s WHERE ${whereClause}`,
        params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Add pagination params
    params.push(limit, offset);

    const result = await pool.query(
        `SELECT
            s.id, s.awb_number, s.status, s.total_amount,
            s.parcel_type, s.is_cod, s.created_at,
            cp.name AS courier_name
         FROM shipments s
         LEFT JOIN courier_partners cp ON cp.id = s.courier_id
         WHERE ${whereClause}
         ORDER BY s.created_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
    );

    return res.status(200).json({
        success: true,
        data: {
            shipments: result.rows,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        },
    });
});

// ─────────────────────────────────────────────────────────────
// GET /shipments/search?q=AWB17123
// Search shipments by AWB number or delivery address
// ─────────────────────────────────────────────────────────────
export const searchShipments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const q = (req.query.q as string)?.trim();

    if (!q || q.length < 3) {
        return res.status(400).json({
            success: false,
            error: { code: 'SHIP_005', message: 'Search query must be at least 3 characters' },
        });
    }

    const result = await pool.query(
        `SELECT
            s.id, s.awb_number, s.status, s.total_amount,
            s.parcel_type, s.created_at,
            cp.name AS courier_name
         FROM shipments s
         LEFT JOIN courier_partners cp ON cp.id = s.courier_id
         WHERE s.user_id = $1
           AND (
             s.awb_number ILIKE $2
             OR s.delivery_address::text ILIKE $2
             OR s.pickup_address::text ILIKE $2
           )
         ORDER BY s.created_at DESC
         LIMIT 20`,
        [userId, `%${q}%`]
    );

    return res.status(200).json({
        success: true,
        data: {
            query: q,
            results: result.rows,
        },
    });
});
