import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import {
    getCourierRates,
    autoSelectCourier,
    listCourierPartners,
    updateCourierConfig,
} from '../controllers/couriers.controller';
import {
    getRevenueDashboard,
    getUserMetrics,
    getShipmentMetrics,
} from '../controllers/admin.controller';

const router = Router();

// ── Day 7: Rate comparison (public — no auth needed for price check) ──
router.get('/rates', getCourierRates);

// ── Day 23: Auto-select cheapest courie
router.post('/auto-select', authMiddleware, autoSelectCourier);

// ── Day 24: Admin courier configurator
router.get('/admin/couriers', authMiddleware, listCourierPartners);
router.patch('/admin/couriers/:id', authMiddleware, updateCourierConfig);

// ── Day 22: Admin revenue dashboards
router.get('/admin/dashboard/revenue',   authMiddleware, getRevenueDashboard);
router.get('/admin/dashboard/users',     authMiddleware, getUserMetrics);
router.get('/admin/dashboard/shipments', authMiddleware, getShipmentMetrics);

export default router;
