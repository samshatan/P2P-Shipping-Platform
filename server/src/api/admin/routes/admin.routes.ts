import { Router } from 'express';
import { 
    getRevenueDashboard, 
    listCouriers, 
    updateCourier, 
    listUsers, 
    listAllShipments,
    getUserMetrics,
    getShipmentMetrics
} from '../controllers/admin.controller';
import { authMiddleware, roleMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

// All admin routes are protected by JWT and Role checks
router.use(authMiddleware as any);
router.use(roleMiddleware(['ADMIN']) as any);

// Dashboard & Stats
router.get('/revenue/dashboard', getRevenueDashboard);
router.get('/users/metrics', getUserMetrics);
router.get('/shipments/metrics', getShipmentMetrics);

// Courier Management
router.get('/couriers', listCouriers);
router.patch('/couriers/:id', updateCourier);

// User Management
router.get('/users', listUsers);

// Global Monitoring
router.get('/shipments', listAllShipments);

export default router;
