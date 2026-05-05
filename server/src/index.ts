import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { redis } from './lib/redis';
import authRouter from './api/auth/routes/auth.routes';
import usersRouter from './api/users/routes/users.routes';
import shipmentsRouter from './api/shipments/routes/shipments.routes';
import trackingRouter from './api/tracking/routes/tracking.routes';
import couriersRouter from './api/couriers/routes/couriers.routes';
import adminRouter from './api/admin/routes/admin.routes';
import paymentRouter from './api/payments/routes/payment.routes';
import { startWorkers, stopWorkers } from './lib/workers';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

import { connectMongoDB } from './lib/mongo';
import { checkPincode } from './api/users/controllers/pincode.controller';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/shipments', shipmentsRouter);
app.use('/tracking', trackingRouter);
app.use('/couriers', couriersRouter);
app.use('/admin', adminRouter);
app.use('/payments', paymentRouter);
app.get('/pincodes/check', checkPincode);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.get('/health', async (req, res) => {
  try {
    await redis.ping();

    const mongoose = (await import('mongoose')).default;
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    let queueHealth = {};
    if (process.env.ENABLE_WORKERS === 'true') {
      const { getQueueHealth } = await import('./lib/queues');
      queueHealth = await getQueueHealth();
    }

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: dbStatus,
        redis: 'connected',
      },
      integrations: {
        workers: process.env.ENABLE_WORKERS === 'true' ? 'running' : 'disabled',
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

const server = app.listen(PORT, async () => {

  await connectMongoDB();
  startWorkers();
});

process.on('SIGTERM', async () => {
  await stopWorkers();
  server.close(() => {
    process.exit(0);
  });
});
