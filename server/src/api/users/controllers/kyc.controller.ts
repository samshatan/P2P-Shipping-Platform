import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import redis from '../../../Database/redis';
import { successResponse, errorResponse } from '../../shared/types';

// In production this would call Digio API — using a stub for now
const KYC_SESSION_TTL = 600; // 10 minutes
const kycSessionKey = (userId: string) => `kyc_session:${userId}`;

export const initiateKyc = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    return;
  }

  const { aadhaar_number } = req.body;

  if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number)) {
    res.status(400).json(errorResponse('VALIDATION_002', 'Aadhaar number must be 12 digits'));
    return;
  }

  try {
    // Check if already verified
    const user = await pool.query('SELECT kyc_status FROM users WHERE id = $1', [userId]);
    if (user.rows[0]?.kyc_status === 'VERIFIED') {
      res.status(400).json(errorResponse('USER_003', 'KYC is already verified'));
      return;
    }

    // Generate a stub session ID
    const sessionId = `digio_${userId}_${Date.now()}`;

    // Store session in Redis with TTL
    await redis.set(kycSessionKey(userId), JSON.stringify({ sessionId, aadhaar_number }), 'EX', KYC_SESSION_TTL);

    // Mark KYC as INITIATED in DB
    await pool.query(
      `UPDATE users SET kyc_status = 'INITIATED', updated_at = NOW() WHERE id = $1`,
      [userId]
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n🪪 DEV KYC session for user ${userId}: ${sessionId}\n`);
    }

    res.status(200).json(
      successResponse({
        session_id: sessionId,
        message: 'OTP sent to Aadhaar linked mobile number',
        expires_in: KYC_SESSION_TTL,
      })
    );
  } catch (err) {
    console.error('❌ initiateKyc failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'KYC initiation failed'));
  }
};

export const verifyKyc = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    return;
  }

  const { session_id, otp } = req.body;

  if (!session_id || !otp || !/^\d{6}$/.test(otp)) {
    res.status(400).json(errorResponse('VALIDATION_001', 'session_id and 6-digit OTP are required'));
    return;
  }

  try {
    const stored = await redis.get(kycSessionKey(userId));

    if (!stored) {
      res.status(400).json(errorResponse('USER_003', 'KYC session expired. Please initiate again.'));
      return;
    }

    const session = JSON.parse(stored);

    if (session.sessionId !== session_id) {
      res.status(400).json(errorResponse('USER_003', 'Invalid session ID'));
      return;
    }

    // In production: call Digio to verify OTP
    // Sandbox: accept test OTP 123456
    const isValidOtp =
      process.env.NODE_ENV !== 'production' ? otp === '123456' : false; // replace with Digio call

    if (!isValidOtp) {
      res.status(400).json(errorResponse('USER_003', 'KYC verification failed. Incorrect OTP.'));
      return;
    }

    // Mark as verified
    await pool.query(
      `UPDATE users SET kyc_status = 'VERIFIED', updated_at = NOW() WHERE id = $1`,
      [userId]
    );
    await redis.del(kycSessionKey(userId));

    res.status(200).json(
      successResponse({
        kyc_status: 'verified',
        message: 'KYC verified successfully. Your account is now fully activated.',
      })
    );
  } catch (err) {
    console.error('❌ verifyKyc failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'KYC verification failed'));
  }
};
