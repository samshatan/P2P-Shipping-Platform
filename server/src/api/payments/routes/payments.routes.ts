import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { initiatePayment, handlePaymentWebhook } from '../controllers/payment.controller';
import { initiateRefund, payWithWallet, getWalletBalance, getWalletTransactions } from '../controllers/refund.controller';
import { openDispute, getDispute, listDisputes } from '../controllers/dispute.controller';
import { confirmCodCollection, validateCoupon, applyReferral } from '../controllers/cod.controller';

const router = Router();

// ── ⚠️  Webhook MUST be first (raw body, no auth) ─────────────
router.post('/webhook', handlePaymentWebhook);

// ── Day 9: Razorpay order creation ────────────────────────────
router.post('/initiate', authMiddleware, initiatePayment);

// ── Day 16: Refund ────────────────────────────────────────────
router.post('/refund', authMiddleware, initiateRefund);

// ── Day 17: Wallet ────────────────────────────────────────────
router.post('/wallet', authMiddleware, payWithWallet);
router.get('/wallet/balance', authMiddleware, getWalletBalance);
router.get('/wallet/transactions', authMiddleware, getWalletTransactions);

// ── Day 18: COD collection (internal/courier-facing) ──────────
router.post('/cod/confirm', confirmCodCollection);

// ── Day 19: Disputes ──────────────────────────────────────────
router.get('/disputes', authMiddleware, listDisputes);
router.post('/disputes', authMiddleware, openDispute);
router.get('/disputes/:id', authMiddleware, getDispute);

// ── Day 20: Coupons & Referrals ───────────────────────────────
router.post('/coupons/validate', authMiddleware, validateCoupon);
router.post('/referrals/apply', authMiddleware, applyReferral);

export default router;
