import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { getTracking, delhiveryWebhook, dtdcWebhook } from '../controllers/tracking.controller';

const router = Router();

// GET /tracking/:awb  (protected)
router.get('/:awb', authMiddleware as any, getTracking);

// POST /tracking/webhooks/delhivery  (public — called by Delhivery)
router.post('/webhooks/delhivery', delhiveryWebhook);

// POST /tracking/webhooks/dtdc  (public — called by DTDC)
router.post('/webhooks/dtdc', dtdcWebhook);

export default router;
