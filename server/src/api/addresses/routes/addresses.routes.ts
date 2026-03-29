import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { searchAddresses, checkPincodes } from '../controllers/addresses.controller';

const router = Router();

// POST /address/search  (protected)
router.post('/search', authMiddleware as any, searchAddresses);

export default router;

// Pincode router is separate — exported for mounting at /pincodes
export const pincodeRouter = Router();
pincodeRouter.get('/check', authMiddleware as any, checkPincodes);
