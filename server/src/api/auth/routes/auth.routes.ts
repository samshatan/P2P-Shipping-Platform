import { Router } from 'express';
import { sendOtp } from '../controllers/sendOtp.controller';
import { verifyOtp } from '../controllers/verifyOtp.controller';
import { refreshToken } from '../controllers/refreshToken.controller';
import { logout } from '../controllers/logout.controller';
import { registerUser, loginUser, changePassword } from '../controllers/auth.controller';
import { googleLogin } from '../controllers/googleLogin.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

// POST /auth/register
router.post('/register', registerUser);

// POST /auth/login
router.post('/login', loginUser);

// POST /auth/google
router.post('/google', googleLogin);

// POST /auth/send-otp
router.post('/send-otp', sendOtp);

// POST /auth/verify-otp
router.post('/verify-otp', verifyOtp);

// POST /auth/refresh
router.post('/refresh', refreshToken);

// POST /auth/logout (Protected)
router.post('/logout', authMiddleware as any, logout);

// POST /auth/change-password (Protected)
router.post('/change-password', authMiddleware as any, changePassword);

export default router;
