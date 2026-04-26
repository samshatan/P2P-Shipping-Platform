import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import redis from './Database/redis';
import authRouter from './api/auth/routes/auth.routes';
import usersRouter, { addressRouter } from './api/users/routes/users.routes';
import shipmentsRouter from './api/shipments/routes/shipments.routes';
import trackingRouter from './api/tracking/routes/tracking.routes';
import couriersRouter from './api/couriers/routes/couriers.routes';
import disputesRouter from './api/disputes/routes/disputes.routes';
import adminRouter from './api/admin/routes/admin.routes';
import { startWorkers, stopWorkers } from './lib/workers';
import { startNotificationConsumer } from './lib/notification-consumer';
import { connectMongoDB } from './lib/mongo';
import { checkPincode } from './api/users/controllers/pincode.controller';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Base Middlewares ─────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/address', addressRouter);
app.use('/shipments', shipmentsRouter);
app.use('/tracking', trackingRouter);
app.use('/couriers', couriersRouter);
app.use('/disputes', disputesRouter);
app.use('/admin', adminRouter);
app.get('/pincodes/check', checkPincode);

// ── Health Check ─────────────────────────────────────────────
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

// ── Start Server ─────────────────────────────────────────────
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  await connectMongoDB();
  startWorkers();
  if (process.env.KAFKA_BROKERS) {
    await startNotificationConsumer();
  } else {
    console.log('ℹ️  Kafka consumer skipped (Using BullMQ fallback for notifications)');
  }
});

// ── Graceful Shutdown ────────────────────────────────────────
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received — shutting down gracefully...');
  await stopWorkers();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
