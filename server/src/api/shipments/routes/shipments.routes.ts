import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import {
    createShipment,
    getShipmentById,
    searchShipments,
} from '../controllers/shipment.controller';
import { confirmDelivery } from '../../tracking/controllers/tracking.controller';

const router = Router();

// ⚠️  /search MUST come before /:id — otherwise Express matches 'search' as an ID
router.get('/search', authMiddleware, searchShipments);

// POST /shipments/create
router.post('/create', authMiddleware, createShipment);

// POST /shipments/:id/confirm-delivery  — Delivery OTP verification
router.post('/:id/confirm-delivery', authMiddleware, confirmDelivery);

// GET /shipments/:id
router.get('/:id', authMiddleware, getShipmentById);

export default router;
