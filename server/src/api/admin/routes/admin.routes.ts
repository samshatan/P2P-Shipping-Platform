import { Router } from 'express';
import { 
    getRevenueDashboard, 
    listCouriers, 
    updateCourier, 
    listUsers, 
    listAllShipments,
    getUserMetrics,
    getShipmentMetrics,
    getAdminStats,
    getPartnerRequests,
    approvePartner
} from '../controllers/admin.controller';

import { authMiddleware, roleMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

// All admin routes are protected by JWT checks
router.use(authMiddleware as any);

// Publicly accessible platform stats
router.get('/stats', getAdminStats);

// Restricted admin-only routes
router.use(roleMiddleware(['ADMIN']) as any);

// Dashboard & Stats
router.get('/revenue/dashboard', getRevenueDashboard);
router.get('/users/metrics', getUserMetrics);
router.get('/shipments/metrics', getShipmentMetrics);


// Partner Management
router.get('/partners', getPartnerRequests);
router.post('/partners/:id/approve', approvePartner);


// Courier Management
router.get('/couriers', listCouriers);
router.patch('/couriers/:id', updateCourier);

// User Management
router.get('/users', listUsers);

// Global Monitoring
router.get('/shipments', listAllShipments);

export default router;
