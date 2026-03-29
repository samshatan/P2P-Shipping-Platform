import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { register } from '../controllers/register.controller';
import { getProfile, updateProfile } from '../controllers/profile.controller';
import { initiateKyc, verifyKyc } from '../controllers/kyc.controller';
import {
  createAddress,
  listAddresses,
  updateAddress,
  deleteAddress,
} from '../controllers/addresses.controller';
import { listUserShipments } from '../../shipments/controllers/shipments.controller';

const router = Router();

// All user routes require authentication
router.use(authMiddleware as any);

// POST /users/register
router.post('/register', register);

// GET /users/profile
router.get('/profile', getProfile);

// PATCH /users/profile
router.patch('/profile', updateProfile);

// POST /users/kyc/initiate
router.post('/kyc/initiate', initiateKyc);

// POST /users/kyc/verify
router.post('/kyc/verify', verifyKyc);

// GET /users/shipments
router.get('/shipments', listUserShipments);

// ── Address book ──────────────────────────────
// POST /users/addresses
router.post('/addresses', createAddress);

// GET /users/addresses
router.get('/addresses', listAddresses);

// PUT /users/addresses/:address_id
router.put('/addresses/:address_id', updateAddress);

// DELETE /users/addresses/:address_id
router.delete('/addresses/:address_id', deleteAddress);

export default router;
