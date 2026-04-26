import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import pool from '../../../Database/db';
import { signTokens } from '../../../lib/jwt';
import redis from '../../../Database/redis';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const REFRESH_TOKEN_KEY = (userId: string) => `refresh_token:${userId}`;
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * POST /auth/google
 * Verifies Google ID Token and logs user in (or registers them)
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    const { idToken } = req.body;

    if (!idToken) {
        res.status(400).json({
            success: false,
            error: { code: 'AUTH_001', message: 'Google ID Token is required' }
        });
        return;
    }

    try {
        // 1. Verify Token with Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error('Invalid Google payload');
        }

        const { email, name, picture, sub: googleId } = payload;

        // 2. Find or Create User in DB
        let isNewUser = false;
        const findResult = await pool.query(
            'SELECT id, email, role FROM users WHERE email = $1',
            [email]
        );

        let user = findResult.rows[0];

        if (!user) {
            isNewUser = true;
            // Create user shell
            const insertResult = await pool.query(
                `INSERT INTO users (email, name, role, kyc_status, created_at)
                 VALUES ($1, $2, 'USER', 'PENDING', NOW())
                 RETURNING id, email, role`,
                [email, name || '']
            );
            user = insertResult.rows[0];

            // ── Emit Kafka Welcome Event
            const { emitEvent, TOPICS } = await import('../../../lib/kafka');
            await emitEvent(TOPICS.NOTIFICATION_DISPATCH, {
                user_id: user.id,
                event_type: 'WELCOME_USER',
                channels: ['EMAIL'],
                payload: {
                    name: name || 'User',
                    email: user.email
                }
            });
        }

        // 3. Sign JWT tokens
        const { accessToken, refreshToken } = signTokens(user.id, user.email, user.role);

        // 4. Store Refresh Token in Redis
        await redis.set(REFRESH_TOKEN_KEY(user.id), refreshToken, 'EX', REFRESH_TOKEN_EXPIRY_SECONDS);

        // 5. Success Response
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: name,
                    picture: picture,
                    role: user.role
                },
                is_new_user: isNewUser,
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: 900 // 15 mins
            }
        });

    } catch (err) {
        console.error('❌ Google Auth Error:', err);
        res.status(401).json({
            success: false,
            error: { code: 'AUTH_INVALID_GOOGLE', message: 'Failed to verify Google token' }
        });
    }
};
