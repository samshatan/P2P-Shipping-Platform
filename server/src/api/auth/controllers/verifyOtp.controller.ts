import { Request, Response } from 'express';
import { redis } from '../../../lib/redis';
import { User } from '../../../models/User';
import { enqueueNotification } from '../../../lib/queues';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const OTP_KEY = (email: string) => `otp:${email}`;

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        res.status(400).json({ success: false, message: 'Email and OTP are required' });
        return;
    }

    // 1. Verify OTP in Redis
    const storedOtp = await redis.get(OTP_KEY(email));
    if (!storedOtp || storedOtp !== otp) {
        res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        return;
    }

    await redis.del(OTP_KEY(email));

    // 2. Find or Create User in MongoDB
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (!user) {
        isNewUser = true;
        user = await User.create({
            email: email.toLowerCase(),
            role: 'USER',
            is_active: true
        });

        // Enqueue welcome notification
        await enqueueNotification({
            user_id: user._id.toString(),
            event_type: 'WELCOME_USER',
            channels: ['EMAIL'],
            payload: { name: 'New User', email: user.email }
        });
    }

    // 3. Generate JWT
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
        success: true,
        data: {
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            is_new_user: isNewUser
        }
    });
};