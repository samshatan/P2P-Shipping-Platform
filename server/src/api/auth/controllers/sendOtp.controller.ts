import { Request, Response } from 'express';
import redis from '../../../Database/redis';
import { sendOtpEmail } from '../../../lib/sendgrid';

// Keys used in Redis
const OTP_KEY = (email: string) => `otp:${email}`;
const RATE_KEY = (email: string) => `otp_attempts:${email}`;
const MAX_ATTEMPTS = 5;         // per hour
const OTP_TTL = 300;            // 5 minutes in seconds
const RATE_TTL = 3600;          // 1 hour in seconds

// Generate a random 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * BE3 — Day 11: Updated POST /auth/send-otp
 * Uses the specialized sendOtpEmail helper from SendGrid integration.
 */
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  // Validate email
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({
      success: false,
      error: { code: 'AUTH_001', message: 'Invalid email address' },
    });
    return;
  }

  // ── Rate limiting: max 5 attempts per email per hour ─────────
  try {
    const attemptsRaw = await redis.get(RATE_KEY(email));
    const attempts = attemptsRaw ? parseInt(attemptsRaw, 10) : 0;

    if (attempts >= MAX_ATTEMPTS) {
      res.status(429).json({
        success: false,
        error: { code: 'AUTH_004', message: 'Too many attempts. Try after 30 minutes.' },
      });
      return;
    }

    // ── Generate and store OTP in Redis ─────────────────────────
    const otp = generateOtp();

    // Store OTP with 5-minute TTL
    await redis.set(OTP_KEY(email), otp, 'EX', OTP_TTL);

    // Increment attempt counter; set TTL only on first attempt
    if (attempts === 0) {
      await redis.set(RATE_KEY(email), '1', 'EX', RATE_TTL);
    } else {
      await redis.incr(RATE_KEY(email));
    }

    // ── Send OTP via SendGrid ────────────────────────────────────
    const result = await sendOtpEmail(email, otp);
    if (!result.success) throw new Error(result.error || 'SendGrid failed');

    // ── Success response ─────────────────────────────────────────
    res.status(200).json({
      success: true,
      data: {
        message: 'OTP sent to email successfully',
        expires_in: OTP_TTL,
        email: email,
      },
    });
  } catch (err: any) {
    console.error('❌ Email OTP failed:', err);
    res.status(500).json({
      success: false,
      error: { 
        code: 'SERVER_001', 
        message: 'Failed to send verification email',
        details: err.response?.body || err.message || 'Unknown error'
      },
    });
  }
};
