import { Request, Response } from 'express';
import { asyncHandler } from "../../../middleware/asyncHandler";
import { User } from "../../../models/User";
import { enqueueNotification } from "../../../lib/queues";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// ── Helper: Generate Token ────────────────────────────────────
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// ─────────────────────────────────────────────────────────────
// POST /auth/register
// Traditional or Google OAuth registration
// ─────────────────────────────────────────────────────────────
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: { code: "AUTH_001", message: "Name and email are required" }
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: { code: "USER_002", message: "User with this email already exists" }
    });
  }

  // Create new user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password, // Mongoose pre-save hook hashes this
    phone
  });

  const token = generateToken(user._id.toString());

  // Enqueue welcome notification (BullMQ)
  await enqueueNotification({
    user_id: user._id.toString(),
    event_type: "WELCOME_USER",
    channels: ["EMAIL"],
    payload: { name: user.name || "User", email: user.email }
  });

  return res.status(201).json({
    success: true,
    data: {
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: "AUTH_003", message: "Email and password are required" }
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user || !(await (user as any).comparePassword(password))) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_004", message: "Invalid email or password" }
    });
  }

  const token = generateToken(user._id.toString());
  user.last_login = new Date();
  await user.save();

  return res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});
