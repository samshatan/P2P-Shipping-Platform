import { Router } from 'express';
import { getTrackingByAwb } from '../controllers/tracking.controller';
import { handleDelhiveryWebhook } from '../../../lib/tracking-webhooks';

const router = Router();

// GET /tracking/:awb  — public (anyone with AWB can track)
router.get('/:awb', getTrackingByAwb);

// POST /tracking/webhooks/delhivery — called by Delhivery servers
router.post('/webhooks/delhivery', handleDelhiveryWebhook);

export default router;
