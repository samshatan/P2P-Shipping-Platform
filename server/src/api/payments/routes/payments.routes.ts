import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { initiatePayment, paymentWebhook } from '../controllers/payments.controller';

const router = Router();

// Capture raw body for webhook signature verification
const captureRawBody = (req: Request, res: Response, next: NextFunction): void => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', (chunk: string) => { data += chunk; });
  req.on('end', () => {
    (req as any).rawBody = data;
    next();
  });
};

// POST /payments/initiate  (protected)
router.post('/initiate', authMiddleware as any, initiatePayment);

// POST /payments/webhook  (public — called by Razorpay)
router.post('/webhook', captureRawBody, paymentWebhook);

export default router;
