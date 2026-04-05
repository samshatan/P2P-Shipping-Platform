import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import redis from './Database/redis';
import authRouter from './api/auth/routes/auth.routes';
import usersRouter from './api/users/routes/users.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Base Middlewares
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/users', usersRouter);

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    // 1. Check Redis
    await redis.ping();

    // 2. Check PostgreSQL
    const { default: pool } = await import('./Database/db');
    await pool.query('SELECT 1');

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
      },
      integrations: {
        razorpay: !!process.env.RAZORPAY_KEY_ID ? 'configured' : 'missing_keys',
        msg91: !!process.env.MSG91_API_KEY ? 'configured' : 'missing_keys',
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
