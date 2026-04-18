import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { initiatePayment, handlePaymentWebhook } from '../controllers/payment.controller';

const router = Router();

// ⚠️  WEBHOOK MUST come first — it needs raw body, not parsed JSON
// The raw body capture middleware is applied only to this route in index.ts
router.post('/webhook', handlePaymentWebhook);

// POST /payments/initiate — protected
router.post('/initiate', authMiddleware, initiatePayment);

export default router;
