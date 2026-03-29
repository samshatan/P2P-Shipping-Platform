import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import redis from '../../../Database/redis';
import pool from '../../../Database/db';

const OTP_KEY = (phone: string) => `otp:${phone}`;

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function signTokens(userId: string, phone: string, role: string) {
    const secret = process.env.JWT_SECRET!;

    const accessToken = jwt.sign(
        { userId, phone, role },
        secret,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
        { userId },
        secret,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
}

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { phone, otp } = req.body;

    //Validate input
    if (!phone || typeof phone !== 'string' || !/^\d{10}$/.test(phone)) {
        res.status(400).json({
            success: false,
            error: { code: 'AUTH_001', message: 'Invalid phone number' },
        });
        return;
    }

    if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
        res.status(400).json({
            success: false,
            error: { code: 'AUTH_002', message: 'OTP must be 6 digits' },
        });
        return;
    }

    // ── Look up OTP from Redis
    const storedOtp = await redis.get(OTP_KEY(phone));

    if (!storedOtp || storedOtp !== otp) {
        res.status(401).json({
            success: false,
            error: { code: 'AUTH_003', message: 'Invalid or expired OTP' },
        });
        return;
    }

    // ── Delete OTP immediately — one-time use
    await redis.del(OTP_KEY(phone));

    // ── Find or create user in DB (raw pg)
    let isNewUser = false;

    const findResult = await pool.query(
        'SELECT id, phone, role FROM users WHERE phone = $1',
        [phone]
    );
    let user = findResult.rows[0];

    if (!user) {
        isNewUser = true;
        const insertResult = await pool.query(
            `INSERT INTO users (phone, role, kyc_status, wallet_balance, created_at)
             VALUES ($1, 'USER', 'PENDING', 0, NOW())
             RETURNING id, phone, role`,
            [phone]
        );
        user = insertResult.rows[0];
    }

    // ── Sign JWT tokens
    const { accessToken, refreshToken } = signTokens(user.id, user.phone, user.role);

    // ── Success response
    res.status(200).json({
        success: true,
        data: {
            user_id: user.id,
            is_new_user: isNewUser,
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 900,
        },
    });
};
