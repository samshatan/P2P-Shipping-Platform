import { Router } from 'express';
import { getProfile } from '../controllers/profile.controller';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../controllers/userAddress.controller';
import { searchAddress } from '../controllers/address.controller';
import { getUserShipments } from '../../shipments/controllers/shipment.controller';
import { initiateKycController, verifyKycController } from '../controllers/kyc.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

// ── Profile ───────────────────────────────────────────────────
router.get('/profile', authMiddleware, getProfile);

// ── Saved Addresses (CRUD) ────────────────────────────────────
router.get('/addresses', authMiddleware, getAddresses);
router.post('/addresses', authMiddleware, addAddress);
router.put('/addresses/:id', authMiddleware, updateAddress);
router.delete('/addresses/:id', authMiddleware, deleteAddress);

// ── User Shipments list ───────────────────────────────────────
router.get('/shipments', authMiddleware, getUserShipments);

// ── KYC ───────────────────────────────────────────────────────
router.post('/kyc/initiate', authMiddleware, initiateKycController);
router.post('/kyc/verify', authMiddleware, verifyKycController);

export default router;


// ── Address Search (exported separately for /address router) ──
export const addressRouter = Router();
addressRouter.post('/search', authMiddleware, searchAddress);

