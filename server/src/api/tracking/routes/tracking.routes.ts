import { Router } from 'express';
import { getTrackingByAwb, delhiveryWebhook } from '../controllers/tracking.controller';

const router = Router();

// GET /tracking/:awb  — public (anyone with AWB can track)
router.get('/:awb', getTrackingByAwb);

// POST /tracking/webhooks/delhivery — called by Delhivery servers
router.post('/webhooks/delhivery', delhiveryWebhook);

export default router;
