import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { Shipment } from '../../../models/Shipment';
import crypto from 'crypto';

// ── Helper: Generate unique AWB number ───────────────────────
function generateAwb(): string {
    return `SE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

// ─────────────────────────────────────────────────────────────
// POST /shipments/create
// Creates a DRAFT shipment record in MongoDB
// ─────────────────────────────────────────────────────────────
export const createShipment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;

    const {
        pickup_address,
        delivery_address,
        courier_id,
        courier_name,
        weight_grams,
        dimensions,
        parcel_type,
        is_cod,
        cod_amount,
        price_paise,
    } = req.body;

    // Validate minimum required for a draft
    if (!pickup_address || !delivery_address || !courier_id || !weight_grams || !price_paise) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'SHIP_001',
                message: 'Required fields: pickup_address, delivery_address, courier_id, weight_grams, price_paise',
            },
        });
    }

    // In MongoDB, we can store the addresses directly in the shipment
    const shipment = await Shipment.create({
        user_id: userId,
        pickup_address,
        delivery_address,
        courier_id,
        courier_name,
        weight_grams,
        dimensions: dimensions || { length: 10, width: 10, height: 10 },
        parcel_type: parcel_type || 'PARCEL',
        is_cod: is_cod || false,
        cod_amount: cod_amount || 0,
        price_paise,
        status: 'DRAFT',
    });

    return res.status(201).json({
        success: true,
        data: {
            shipment_id: shipment._id,
            status: shipment.status,
            price_paise: shipment.price_paise,
            created_at: shipment.createdAt,
        },
    });
});

// ─────────────────────────────────────────────────────────────
// GET /users/shipments
// List all shipments for logged-in user
// ─────────────────────────────────────────────────────────────
export const getUserShipments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { user_id: userId };
    if (status) query.status = status;

    const shipments = await Shipment.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

    const total = await Shipment.countDocuments(query);

    return res.status(200).json({
        success: true,
        data: {
            shipments,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        },
    });
});

// ─────────────────────────────────────────────────────────────
// GET /shipments/:id
// ─────────────────────────────────────────────────────────────
export const getShipmentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const shipment = await Shipment.findOne({ _id: id, user_id: userId });

    if (!shipment) {
        return res.status(404).json({
            success: false,
            error: { code: 'SHIP_003', message: 'Shipment not found' },
        });
    }

    return res.status(200).json({
        success: true,
        data: { shipment },
    });
});
