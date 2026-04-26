import { Router } from 'express';
import { 
    getRevenueDashboard, 
    listCouriers, 
    updateCourier, 
    listUsers, 
    updateUserKyc,
    listAllShipments
} from '../controllers/admin.controller';
import { authMiddleware, roleMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

// All admin routes are protected by JWT and Role checks
router.use(authMiddleware as any);
router.use(roleMiddleware(['ADMIN']) as any);

// Dashboard & Stats
router.get('/revenue/dashboard', getRevenueDashboard);

// Courier Management
router.get('/couriers', listCouriers);
router.patch('/couriers/:id', updateCourier);

// User & KYC Management
router.get('/users', listUsers);
router.patch('/users/:id/kyc', updateUserKyc);

// Global Monitoring
router.get('/shipments', listAllShipments);

export default router;
