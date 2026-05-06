import { Request, Response } from 'express';
import { asyncHandler } from "../../../middleware/asyncHandler";
import { User } from "../../../models/User";
import { enqueueNotification } from "../../../lib/queues";
import jwt from 'jsonwebtoken';
import { redis } from '../../../lib/redis';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, otp } = req.body;

  if (!name || !email || !otp) {
    return res.status(400).json({
      success: false,
      error: { code: "AUTH_001", message: "Name, email, and OTP are required" }
    });
  }

  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_005", message: "Invalid or expired OTP" }
    });
  }

  await redis.del(`otp:${email}`);

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: { code: "USER_002", message: "User with this email already exists" }
    });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone
  });

  const token = generateToken(user._id.toString());

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

export const changePassword = asyncHandler(async (req: any, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user || !(await (user as any).comparePassword(currentPassword))) {
        return res.status(401).json({ success: false, message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
        success: true,
        message: 'Password updated successfully'
    });
});
