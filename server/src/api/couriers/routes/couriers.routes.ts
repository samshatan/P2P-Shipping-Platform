import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { getCourierRates } from '../controllers/rates.controller';

const router = Router();

// GET /couriers/rates
router.get('/rates', authMiddleware as any, getCourierRates);

export default router;
