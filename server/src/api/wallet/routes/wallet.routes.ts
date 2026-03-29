import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { getBalance, getTransactions, addWalletFunds } from '../controllers/wallet.controller';

const router = Router();

// All wallet routes require authentication
router.use(authMiddleware as any);

// GET /wallet/balance
router.get('/balance', getBalance);

// GET /wallet/transactions
router.get('/transactions', getTransactions);

// POST /wallet/add
router.post('/add', addWalletFunds);

export default router;
