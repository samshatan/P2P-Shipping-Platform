import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { User } from '../../../models/User';

// ─────────────────────────────────────────────────────────────
// GET /users/addresses
// ─────────────────────────────────────────────────────────────
export const getAddresses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
        success: true,
        data: { addresses: user.saved_addresses }
    });
});

// ─────────────────────────────────────────────────────────────
// POST /users/addresses
// ─────────────────────────────────────────────────────────────
export const addAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const addressData = req.body;

    if (!addressData.name || !addressData.phone || !addressData.pincode) {
        return res.status(400).json({
            success: false,
            message: 'name, phone, and pincode are required'
        });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // If new address is default, unset other defaults
    if (addressData.is_default) {
        user.saved_addresses.forEach(a => a.is_default = false);
    }

    user.saved_addresses.push(addressData);
    await user.save();

    return res.status(201).json({
        success: true,
        data: { address: user.saved_addresses[user.saved_addresses.length - 1] }
    });
});

// ─────────────────────────────────────────────────────────────
// DELETE /users/addresses/:id
// ─────────────────────────────────────────────────────────────
export const deleteAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.saved_addresses = (user.saved_addresses as any).filter((a: any) => a._id.toString() !== id);
    await user.save();

    return res.status(200).json({
        success: true,
        message: 'Address deleted successfully'
    });
});
