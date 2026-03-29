import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import { successResponse, errorResponse } from '../../shared/types';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    return;
  }

  try {
    const result = await pool.query(
      `SELECT
         u.id,
         u.phone,
         u.name,
         u.email,
         u.kyc_status,
         u.wallet_balance,
         u.referral_code,
         u.created_at,
         COUNT(s.id)::int AS total_shipments
       FROM users u
       LEFT JOIN shipments s ON s.user_id = u.id AND s.status != 'DRAFT'
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json(errorResponse('AUTH_007', 'User not found'));
      return;
    }

    const user = result.rows[0];

    res.status(200).json(
      successResponse({
        user_id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        kyc_status: user.kyc_status.toLowerCase(),
        wallet_balance: Math.round(user.wallet_balance * 100), // in paise
        referral_code: user.referral_code,
        total_shipments: user.total_shipments,
        created_at: user.created_at,
      })
    );
  } catch (err) {
    console.error('❌ getProfile failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Could not fetch profile'));
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    return;
  }

  const { name, email } = req.body;

  if (!name && !email) {
    res.status(400).json(errorResponse('VALIDATION_001', 'Provide at least one field to update (name or email)'));
    return;
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      res.status(400).json(errorResponse('VALIDATION_002', 'Name must be between 2 and 100 characters'));
      return;
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json(errorResponse('VALIDATION_002', 'Invalid email address'));
      return;
    }
  }

  try {
    // Check email uniqueness if changing it
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), userId]
      );
      if (emailCheck.rows.length > 0) {
        res.status(409).json(errorResponse('USER_002', 'Email already in use'));
        return;
      }
    }

    const setClauses: string[] = [];
    const values: (string | null)[] = [];
    let idx = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${idx++}`);
      values.push(name.trim());
    }
    if (email !== undefined) {
      setClauses.push(`email = $${idx++}`);
      values.push(email.toLowerCase());
    }
    setClauses.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING id, name, email, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json(errorResponse('AUTH_007', 'User not found'));
      return;
    }

    const updated = result.rows[0];

    res.status(200).json(
      successResponse({
        user_id: updated.id,
        name: updated.name,
        email: updated.email,
        updated_at: updated.updated_at,
      })
    );
  } catch (err) {
    console.error('❌ updateProfile failed:', err);
    res.status(500).json(errorResponse('USER_004', 'Profile update failed'));
  }
};
