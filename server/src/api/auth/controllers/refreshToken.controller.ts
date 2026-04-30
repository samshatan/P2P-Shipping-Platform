import { Request, Response } from 'express';
import { redis } from '../../../lib/redis';
import { User } from '../../../models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const REFRESH_TOKEN_KEY = (userId: string) => `refresh_token:${userId}`;

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        res.status(400).json({ success: false, message: 'Refresh token is required' });
        return;
    }

    try {
        const decoded = jwt.verify(refresh_token, JWT_SECRET) as { userId: string };

        // Revocation check in Redis
        const storedToken = await redis.get(REFRESH_TOKEN_KEY(decoded.userId));
        if (!storedToken || storedToken !== refresh_token) {
            res.status(401).json({ success: false, message: 'Token revoked' });
            return;
        }

        const user = await User.findById(decoded.userId);
        if (!user || !user.is_active) {
            res.status(401).json({ success: false, message: 'User inactive' });
            return;
        }

        // Issue new token
        const newToken = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            data: {
                token: newToken,
                expires_in: '7d'
            }
        });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
