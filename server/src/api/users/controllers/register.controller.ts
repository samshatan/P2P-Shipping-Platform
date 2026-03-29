import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import crypto from 'crypto';
import { successResponse, errorResponse } from '../../shared/types';

// Generate a short referral code from name + cryptographically random suffix
function generateReferralCode(name: string): string {
  const prefix = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 5);
  // crypto.randomInt is unbiased and available in Node.js ≥ 14.10
  const suffix = crypto.randomInt(1000, 9999).toString();
  return `${prefix}${suffix}`;
}

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const phone = req.user?.phone;

  if (!userId) {
    res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    return;
  }

  const { name, email, referral_code } = req.body;

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    res.status(400).json(errorResponse('VALIDATION_001', 'Name must be between 2 and 100 characters'));
    return;
  }

  // Validate email if provided
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json(errorResponse('VALIDATION_002', 'Invalid email address'));
    return;
  }

  try {
    // Check if user already has a name registered (already registered)
    const existingUser = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );

    if (!existingUser.rows[0]) {
      res.status(404).json(errorResponse('AUTH_007', 'User not found'));
      return;
    }

    if (existingUser.rows[0].name) {
      res.status(409).json(errorResponse('USER_001', 'User already registered'));
      return;
    }

    // Check email uniqueness if provided
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

    // Handle referral: credit the referrer
    if (referral_code) {
      const referrer = await pool.query(
        'SELECT id FROM users WHERE referral_code = $1',
        [referral_code.toUpperCase()]
      );
      if (referrer.rows.length > 0) {
        // Credit Rs 50 (5000 paise) to referrer's wallet
        await pool.query('BEGIN');
        try {
          await pool.query(
            'UPDATE users SET wallet_balance = wallet_balance + 50 WHERE id = $1',
            [referrer.rows[0].id]
          );
          await pool.query(
            `INSERT INTO wallet_transactions (user_id, type, amount, description, status)
             VALUES ($1, 'CREDIT', 50, 'Referral bonus', 'SUCCESS')`,
            [referrer.rows[0].id]
          );
          await pool.query('COMMIT');
        } catch (innerErr) {
          await pool.query('ROLLBACK');
          // Non-fatal — continue registration even if referral credit fails
          console.error('Referral credit failed:', innerErr);
        }
      }
    }

    // Build unique referral code for new user
    let myReferralCode = generateReferralCode(name.trim());
    // Ensure uniqueness
    let attempts = 0;
    while (attempts < 5) {
      const conflict = await pool.query(
        'SELECT id FROM users WHERE referral_code = $1',
        [myReferralCode]
      );
      if (conflict.rows.length === 0) break;
      myReferralCode = generateReferralCode(name.trim());
      attempts++;
    }

    // Update user record
    const updateResult = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, referral_code = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, phone, name, email, kyc_status, wallet_balance, referral_code, created_at`,
      [name.trim(), email ? email.toLowerCase() : null, myReferralCode, userId]
    );

    const user = updateResult.rows[0];

    res.status(201).json(
      successResponse({
        user_id: user.id,
        name: user.name,
        phone: user.phone ?? phone,
        email: user.email,
        kyc_status: user.kyc_status.toLowerCase(),
        wallet_balance: Math.round(user.wallet_balance * 100), // return in paise
        referral_code: user.referral_code,
        created_at: user.created_at,
      })
    );
  } catch (err) {
    console.error('❌ Register failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Registration failed. Please try again.'));
  }
};
