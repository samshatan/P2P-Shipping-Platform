import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { User } from '../../../models/User';

// ─────────────────────────────────────────────────────────────
// GET /users/profile
// ─────────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            user_id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            saved_addresses: user.saved_addresses,
            settings: user.settings,
            created_at: user.createdAt,
        }
    });
});

// ─────────────────────────────────────────────────────────────
// PATCH /users/profile
// ─────────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const { name, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();

    return res.status(200).json({
        success: true,
        data: {
            user_id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            settings: user.settings,
            updated_at: user.updatedAt
        }
    });
});

// ─────────────────────────────────────────────────────────────
// PATCH /users/settings
// ─────────────────────────────────────────────────────────────
export const updateSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const { settings } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (settings) {
        user.settings = {
            ...user.settings,
            ...settings
        };
    }
    
    await user.save();

    return res.status(200).json({
        success: true,
        data: {
            settings: user.settings
        }
    });
});

// ─────────────────────────────────────────────────────────────
// DELETE /users/profile
// ─────────────────────────────────────────────────────────────
export const deactivateAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.is_active = false;
    await user.save();

    return res.status(200).json({
        success: true,
        message: 'Account deactivated successfully'
    });
});
