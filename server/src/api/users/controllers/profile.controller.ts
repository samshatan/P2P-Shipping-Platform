import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';

// ─────────────────────────────────────────────────────────────
// GET /users/profile
// Returns the logged-in user's profile
// ─────────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {

    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
        });
    }

    const result = await pool.query(
        `SELECT id, name, email, phone, role, kyc_status, created_at
        FROM users WHERE id = $1`,
        [userId]
    );

    const user = result.rows[0];

    if (!user) {
        return res.status(404).json({
            success: false,
            error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            user_id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            kyc_status: user.kyc_status,
            created_at: user.created_at,
        }
    });
});

// ─────────────────────────────────────────────────────────────
// PATCH /users/profile
// Update name and/or email for logged-in user
// ─────────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {

    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
        });
    }

    const { name, email } = req.body;

    if (!name && !email) {
        return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_001', message: 'At least one field (name or email) is required' }
        });
    }

    // Build dynamic SET clause
    const fields: string[] = [];
    const params: (string | number)[] = [];

    if (name) {
        params.push(name);
        fields.push(`name = $${params.length}`);
    }
    if (email) {
        // Check email uniqueness
        const emailCheck = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [email, userId]
        );
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: { code: 'USER_002', message: 'Email already in use by another account' }
            });
        }
        params.push(email);
        fields.push(`email = $${params.length}`);
    }

    params.push(userId);
    const result = await pool.query(
        `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
         WHERE id = $${params.length}
         RETURNING id, name, email, updated_at`,
        params
    );

    return res.status(200).json({
        success: true,
        data: {
            user_id: result.rows[0].id,
            name: result.rows[0].name,
            email: result.rows[0].email,
            updated_at: result.rows[0].updated_at,
        }
    });
});
