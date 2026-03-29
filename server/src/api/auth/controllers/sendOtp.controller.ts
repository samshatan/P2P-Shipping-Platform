import { Request, Response } from 'express';
import  redis  from '../../../Database/redis';

// Keys used in Redis
const OTP_KEY = (phone: string) => `otp:${phone}`;
const RATE_KEY = (phone: string) => `otp_attempts:${phone}`;
const MAX_ATTEMPTS = 5;         // per hour
const OTP_TTL = 300;            // 5 minutes in seconds
const RATE_TTL = 3600;          // 1 hour in seconds

// Generate a random 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Mask phone: 9876543210 → 98XXXXX210
function maskPhone(phone: string): string {
  return phone.slice(0, 2) + 'XXXXX' + phone.slice(7);
}

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body;

  //Validate phone
  if (!phone || typeof phone !== 'string' || !/^\d{10}$/.test(phone)) {
    res.status(400).json({
      success: false,
      error: { code: 'AUTH_001', message: 'Invalid phone number' },
    });
    return;
  }

  // ── Rate limiting: max 5 attempts per phone per hour ─────────
  const attemptsRaw = await redis.get(RATE_KEY(phone));
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
  await redis.set(OTP_KEY(phone), otp, 'EX', OTP_TTL);

  // Increment attempt counter; set TTL only on first attempt
  if (attempts === 0) {
    await redis.set(RATE_KEY(phone), '1', 'EX', RATE_TTL);
  } else {
    await redis.incr(RATE_KEY(phone));
  }

  // ── Send OTP ─────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    // TODO Week 2: call MSG91 here via src/lib/msg91.ts
    console.log(`[PROD] Would send SMS to ${phone}`);
  } else {
    // Development: print OTP to console only (never log in production)
    console.log(`\n📱 DEV OTP for ${phone}: ${otp}\n`);
  }

  // ── Success response ─────────────────────────────────────────
  res.status(200).json({
    success: true,
    data: {
      message: 'OTP sent successfully',
      expires_in: OTP_TTL,
      masked_phone: maskPhone(phone),
    },
  });
};
