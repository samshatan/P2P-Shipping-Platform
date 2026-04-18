import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import redis from './Database/redis';
import authRouter from './api/auth/routes/auth.routes';
import usersRouter, { addressRouter } from './api/users/routes/users.routes';
import shipmentsRouter from './api/shipments/routes/shipments.routes';
import paymentsRouter from './api/payments/routes/payments.routes';
import trackingRouter from './api/tracking/routes/tracking.routes';
import { startWorkers, stopWorkers } from './lib/workers';
import { startNotificationConsumer } from './lib/notification-consumer';
import { checkPincode } from './api/users/controllers/pincode.controller';


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
// ⚠️  Raw body capture for Razorpay webhook — MUST be before express.json()
// Razorpay signature verification requires the original raw bytes
app.use('/payments/webhook', express.raw({ type: 'application/json' }), (req: any, _res, next) => {
  req.rawBody = req.body.toString();
  next();
});

app.use(express.json());
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/address', addressRouter);
app.use('/shipments', shipmentsRouter);
app.use('/payments', paymentsRouter);
app.use('/tracking', trackingRouter);
app.get('/pincodes/check', checkPincode);

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    // 1. Check Redis
    await redis.ping();

    // 2. Check PostgreSQL
    const { default: pool } = await import('./Database/db');
    await pool.query('SELECT 1');

    // 3. Queue health (if workers are enabled)
    let queueHealth = {};
    if (process.env.ENABLE_WORKERS === 'true') {
      const { getQueueHealth } = await import('./lib/queues');
      queueHealth = await getQueueHealth();
    }

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
        workers: process.env.ENABLE_WORKERS === 'true' ? 'running' : 'disabled',
        kafka_consumer: process.env.ENABLE_KAFKA_CONSUMER === 'true' ? 'running' : 'disabled',
      },
      queues: queueHealth,
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
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  // Start BullMQ Workers (set ENABLE_WORKERS=true in .env to activate)
  startWorkers();

  // Start Kafka Notification Consumer (set ENABLE_KAFKA_CONSUMER=true in .env to activate)
  await startNotificationConsumer();
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received — shutting down gracefully...');
  await stopWorkers();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

