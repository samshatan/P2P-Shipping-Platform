import { Router } from 'express';
import { getProfile, updateProfile, updateSettings, deactivateAccount } from '../controllers/profile.controller';
import { getAddresses, addAddress, deleteAddress } from '../controllers/userAddress.controller';
import { getUserShipments } from '../../shipments/controllers/shipment.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

// ── Profile ───────────────────────────────────────────────────
router.get('/profile', authMiddleware, getProfile);
router.patch('/profile', authMiddleware, updateProfile);
router.patch('/settings', authMiddleware, updateSettings);
router.delete('/profile', authMiddleware, deactivateAccount);

// ── Saved Addresses (CRUD) ────────────────────────────────────
router.get('/addresses', authMiddleware, getAddresses);
router.post('/addresses', authMiddleware, addAddress);
router.delete('/addresses/:id', authMiddleware, deleteAddress);

// ── User Shipments list ───────────────────────────────────────
router.get('/shipments', authMiddleware, getUserShipments);

export default router;
