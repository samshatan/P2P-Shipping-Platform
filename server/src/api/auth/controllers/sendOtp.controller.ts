import { Request, Response } from 'express';
import { redis } from '../../../lib/redis';
import { sendOtpEmail } from '../../../lib/sendgrid';

const OTP_KEY = (email: string) => `otp:${email}`;
const RATE_KEY = (email: string) => `otp_attempts:${email}`;
const MAX_ATTEMPTS = 5;
const OTP_TTL = 300;
const RATE_TTL = 3600;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({
      success: false,
      error: { code: 'AUTH_001', message: 'Invalid email address' },
    });
    return;
  }

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

    const otp = generateOtp();

    await redis.set(OTP_KEY(email), otp, 'EX', OTP_TTL);

    if (attempts === 0) {
      await redis.set(RATE_KEY(email), '1', 'EX', RATE_TTL);
    } else {
      await redis.incr(RATE_KEY(email));
    }
    const result = await sendOtpEmail(email, otp);
    if (!result.success) throw new Error(result.error || 'SendGrid failed');

    res.status(200).json({
      success: true,
      data: {
        message: 'OTP sent to email successfully',
        expires_in: OTP_TTL,
        email: email,
      },
    });
  } catch (err: any) {

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
