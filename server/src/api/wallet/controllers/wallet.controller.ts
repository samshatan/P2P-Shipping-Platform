import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import { createRazorpayOrder } from '../../../lib/razorpay';
import { successResponse, errorResponse } from '../../shared/types';

// ── GET /wallet/balance ──────────────────────
export const getBalance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  try {
    const result = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      res.status(404).json(errorResponse('AUTH_007', 'User not found'));
      return;
    }

    const balancePaise = Math.round(parseFloat(result.rows[0].wallet_balance) * 100);
    const balanceRupees = balancePaise / 100;

    res.status(200).json(
      successResponse({
        balance_paise: balancePaise,
        balance_display: `₹${balanceRupees.toFixed(2)}`,
      })
    );
  } catch (err) {
    console.error('❌ getBalance failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Could not fetch wallet balance'));
  }
};

// ── GET /wallet/transactions ─────────────────
export const getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
  const offset = (page - 1) * limit;

  try {
    const [rows, countRow] = await Promise.all([
      pool.query(
        `SELECT id, type, amount, description, status, created_at
         FROM wallet_transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      ),
      pool.query('SELECT COUNT(*) FROM wallet_transactions WHERE user_id = $1', [userId]),
    ]);

    const total = parseInt(countRow.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
      successResponse({
        transactions: rows.rows.map((t) => ({
          transaction_id: t.id,
          type: t.type.toLowerCase(),
          amount_paise: Math.round(parseFloat(t.amount) * 100),
          description: t.description,
          status: t.status.toLowerCase(),
          created_at: t.created_at,
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      })
    );
  } catch (err) {
    console.error('❌ getTransactions failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Could not fetch transactions'));
  }
};

// ── POST /wallet/add ─────────────────────────
export const addWalletFunds = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  const { amount_paise } = req.body;

  if (!amount_paise || typeof amount_paise !== 'number') {
    res.status(400).json(errorResponse('VALIDATION_001', 'amount_paise is required'));
    return;
  }

  if (amount_paise < 1000 || amount_paise > 1000000) {
    res.status(400).json(
      errorResponse('VALIDATION_003', 'amount_paise must be between 1000 (Rs 10) and 1000000 (Rs 10000)')
    );
    return;
  }

  try {
    // Create Razorpay order for wallet top-up
    const order = await createRazorpayOrder(amount_paise / 100, 'INR', `wallet_topup_${userId}_${Date.now()}`);

    res.status(200).json(
      successResponse({
        order_id: order.id,
        amount_paise,
        razorpay_key: process.env.RAZORPAY_KEY_ID || '',
        currency: 'INR',
      })
    );
  } catch (err) {
    console.error('❌ addWalletFunds failed:', err);
    res.status(500).json(errorResponse('PAYMENT_001', 'Could not create wallet top-up order'));
  }
};
