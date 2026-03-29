import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import {
  createShipment,
  getShipment,
  searchShipments,
  cancelShipment,
} from '../controllers/shipments.controller';

const router = Router();

// All shipment routes require authentication
router.use(authMiddleware as any);

// POST /shipments/create
router.post('/create', createShipment);

// GET /shipments/search — must come before /:shipment_id
router.get('/search', searchShipments);

// GET /shipments/:shipment_id
router.get('/:shipment_id', getShipment);

// POST /shipments/:shipment_id/cancel
router.post('/:shipment_id/cancel', cancelShipment);

export default router;
