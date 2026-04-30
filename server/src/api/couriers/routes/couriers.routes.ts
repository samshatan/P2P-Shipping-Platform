import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import {
    getCourierRates,
    autoSelectCourier,
    listCourierPartners,
    updateCourierConfig,
} from '../controllers/couriers.controller';
const router = Router();

// ── Day 7: Rate comparison (public — no auth needed for price check) ──
router.get('/rates', getCourierRates);

export default router;
