import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import {
    createShipment,
    getShipmentById,
    getUserShipments,
} from '../controllers/shipment.controller';
import {
    bookShipment,
    getShipmentLabel,
    getUnifiedTracking,
    cancelShipment,
} from '../controllers/booking.controller';
import { confirmDelivery } from '../../tracking/controllers/tracking.controller';

const router = Router();

// ── ⚠️  Static paths MUST come before /:id ───────────────────
// router.get('/search', authMiddleware, searchShipments); // TODO: implement searchShipments

// ── Create ────────────────────────────────────────────────────
router.post('/create', authMiddleware, createShipment);

// ── Day 11: Booking Engine ────────────────────────────────────
router.post('/:id/book', authMiddleware, bookShipment);

// ── Day 12: Label Data ────────────────────────────────────────
router.get('/:id/label', authMiddleware, getShipmentLabel);

// ── Day 13: Unified Tracking ──────────────────────────────────
router.get('/:id/tracking', authMiddleware, getUnifiedTracking);

// ── Day 14: Cancel Shipment ───────────────────────────────────
router.post('/:id/cancel', authMiddleware, cancelShipment);

// ── Day 15: Confirm Delivery (OTP) ───────────────────────────
router.post('/:id/confirm-delivery', authMiddleware, confirmDelivery);

// ── Get by ID — keep last among /:id routes ──────────────────
router.get('/:id', authMiddleware, getShipmentById);

export default router;

