import { asyncHandler } from "../../../middleware/asyncHandler";
import pool from "../../../Database/db";
import { emitEvent, TOPICS } from "../../../lib/kafka";

// ─────────────────────────────────────────────────────────────
// POST /auth/register
// Google OAuth first-time registration — creates user record
// ─────────────────────────────────────────────────────────────
export const registerUser = asyncHandler(async (req, res) => {

    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            success: false,
            error: { code: "AUTH_001", message: "name and email are required" }
        });
    }

    // Check if user already exists
    const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
    );

    if (existingUser.rows.length > 0) {
        return res.status(409).json({
            success: false,
            error: { code: "USER_002", message: "User with this email already exists" }
        });
    }

    const result = await pool.query(
        `INSERT INTO users (name, email, phone, role, kyc_status, created_at)
         VALUES ($1, $2, $3, 'USER', 'PENDING', NOW())
         RETURNING id, name, email, phone, role`,
        [name, email, phone ?? null]
    );

    const newUser = result.rows[0];

    // Emit welcome notification
    await emitEvent(TOPICS.NOTIFICATION_DISPATCH, {
        user_id: newUser.id,
        event_type: "WELCOME_USER",
        channels: ["EMAIL"],
        payload: { name: newUser.name || "User" }
    });

    return res.status(201).json({
        success: true,
        data: {
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
            }
        }
    });
});

export { registerUser as default };
