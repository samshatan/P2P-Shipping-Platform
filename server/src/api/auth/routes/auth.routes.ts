import { Router } from 'express';
import { sendOtp } from '../controllers/sendOtp.controller';
import { verifyOtp } from '../controllers/verifyOtp.controller';

const router = Router();

// POST /auth/send-otp
router.post('/send-otp', sendOtp);

// POST /auth/verify-otp
router.post('/verify-otp', verifyOtp);

export default router;
