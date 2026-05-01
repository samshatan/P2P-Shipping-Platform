import { Request, Response } from 'express';
import { User } from '../../../models/User';
import { signTokens } from '../../../lib/jwt';
import redis from '../../../Database/redis';
import axios from 'axios';

const REFRESH_TOKEN_KEY = (userId: string) => `refresh_token:${userId}`;
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * POST /auth/google
 * Verifies Google Access Token and logs user in (or registers them)
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;

    if (!token) {
        res.status(400).json({
            success: false,
            error: { code: 'AUTH_001', message: 'Google Access Token is required' }
        });
        return;
    }

    try {
        // 1. Fetch user info from Google using the access token
        const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const payload = googleRes.data;
        if (!payload || !payload.email) {
            throw new Error('Invalid Google payload');
        }

        const { email, name, picture, sub: googleId } = payload;

        // 2. Find or Create User in DB
        let isNewUser = false;
        let user = await User.findOne({ email });

        if (!user) {
            isNewUser = true;
            // Create user shell
            user = await User.create({
                email,
                name: name || 'User',
                role: 'user',
                google_id: googleId,
                avatar: picture
            });
        }

        // 3. Sign JWT tokens
        const { accessToken, refreshToken } = signTokens(user.id, user.email, user.role);

        // 4. Store Refresh Token in Redis
        if (redis.status === 'ready') {
            await redis.set(REFRESH_TOKEN_KEY(user.id), refreshToken, 'EX', REFRESH_TOKEN_EXPIRY_SECONDS);
        }

        // 5. Success Response
        res.status(200).json({
            success: true,
            token: accessToken, // Frontend expects 'token' at top level based on my previous update
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                role: user.role
            },
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    picture: user.avatar,
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
