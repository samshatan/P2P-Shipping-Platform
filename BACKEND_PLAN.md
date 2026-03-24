# 🛠️ Backend Developer Plan — Week 1 & Week 2

This document is for the 3 backend developers building the server for the PARCEL shipping platform.
Read the full API contract at: `server/contracts/api-contracts.md`

---

## 👥 Developer Assignments (Quick Reference)

| Developer | Module | Endpoints |
|---|---|---|
| **Dev 1** | Auth + Users + KYC | `/auth/*`, `/users/*` |
| **Dev 2** | Couriers + Shipments + Tracking | `/couriers/*`, `/shipments/*`, `/tracking/*` |
| **Dev 3** | Payments + Wallet | `/payments/*`, `/users/wallet/*` |

---

# 📅 WEEK 1 — Foundation & Core Auth

**Goal by end of week:** Server is running, database is connected, OTP login works end-to-end, and the frontend can log in against the real backend.

---

## Day 1 — Project Setup (ALL 3 DEVS together, ~3 hours)

Everyone does this together on one machine first, then pulls the code.

### Step 1: Initialize the server
```bash
cd server
npm init -y
npm install express cors dotenv helmet morgan
npm install prisma @prisma/client
npm install redis ioredis
npm install jsonwebtoken bcryptjs
npm install multer uuid
npm install -D typescript ts-node-dev @types/express @types/node @types/jsonwebtoken @types/bcryptjs @types/multer @types/cors
npx tsc --init
```

### Step 2: Create `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Step 3: Create `package.json` scripts
```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

### Step 4: Create `src/index.ts`
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
```

### Step 5: Start Docker and run Prisma migrations
```bash
docker compose up -d
npx prisma migrate dev --name init
npx prisma generate
```

### Step 6: Create `src/lib/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Step 7: Create `src/lib/redis.ts`
```typescript
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err));
```

**✅ Day 1 Checkpoint:** `npm run dev` → server starts → `GET http://localhost:3001/health` returns `{ "status": "ok" }`

---

## Day 2 — Auth: Send OTP (DEV 1)

Build `POST /auth/send-otp`.

### Create `src/api/auth/auth.router.ts`
```typescript
import { Router } from 'express';
import { sendOtp, verifyOtp } from './auth.controller';

const router = Router();
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;
```

### Create `src/api/auth/auth.controller.ts`
```typescript
import { Request, Response } from 'express';
import { redis } from '../../lib/redis';
import { prisma } from '../../lib/prisma';

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length !== 10) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Phone must be 10 digits' }
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis with 5 minute expiry
    await redis.set(`otp:${phone}`, otp, 'EX', 300);

    // TODO Week 2: Replace this with real MSG91 API call
    console.log(`📱 OTP for ${phone}: ${otp}`);

    return res.json({
      success: true,
      data: { message: 'OTP sent successfully', expires_in: 300 }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
};
```

### Register router in `src/index.ts`
```typescript
import authRouter from './api/auth/auth.router';
app.use('/auth', authRouter);
```

**✅ Day 2 Checkpoint:** `POST /auth/send-otp` with `{ "phone": "9876543210" }` → OTP printed in terminal → Redis stores it

---

## Day 3 — Auth: Verify OTP + JWT (DEV 1)

Build `POST /auth/verify-otp` and the shared `authMiddleware`.

### Add `verifyOtp` to `auth.controller.ts`
```typescript
import jwt from 'jsonwebtoken';

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    // Check OTP from Redis
    const storedOtp = await redis.get(`otp:${phone}`);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP' }
      });
    }

    // Delete OTP after successful verification (one-time use)
    await redis.del(`otp:${phone}`);

    // Find or create user in DB
    let user = await prisma.user.findUnique({ where: { phone } });
    const isNewUser = !user;

    if (!user) {
      user = await prisma.user.create({
        data: { phone, role: 'USER', kycStatus: 'PENDING' }
      });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user_id: user.id,
        is_new_user: isNewUser
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
};
```

### Create `src/middleware/auth.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: string; phone: string; role: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'No token provided' }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_EXPIRED', message: 'Token is invalid or expired' }
    });
  }
};
```

**✅ Day 3 Checkpoint:** Full auth flow works in Postman: send OTP → verify → receive JWT → use JWT on protected test route

---

## Day 4 — Courier Rates (DEV 2) + Razorpay Order (DEV 3)

### DEV 2: Build `GET /couriers/rates` with fake data

```typescript
// src/api/couriers/couriers.controller.ts
import { Request, Response } from 'express';

export const getRates = async (req: Request, res: Response) => {
  const { pickup, delivery, weight } = req.query;

  // Validate inputs
  if (!pickup || !delivery || !weight) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'pickup, delivery, and weight are required' }
    });
  }

  // TODO Week 2: Replace with real Delhivery API call
  const fakeCouriers = [
    {
      courier_id: 'delhivery',
      courier_name: 'Delhivery',
      price_paise: 8900,
      official_eta_days: 3,
      ai_eta_days: 4,
      cod_available: true,
      rating: 4.2,
      is_sponsored: true,
      tags: ['fastest']
    },
    {
      courier_id: 'dtdc',
      courier_name: 'DTDC',
      price_paise: 7500,
      official_eta_days: 4,
      ai_eta_days: 5,
      cod_available: true,
      rating: 3.8,
      is_sponsored: false,
      tags: ['cheapest']
    }
  ];

  return res.json({ success: true, data: { couriers: fakeCouriers } });
};
```

### DEV 3: Install Razorpay and create test order

```bash
npm install razorpay
npm install -D @types/razorpay
```

```typescript
// src/lib/razorpay.ts
import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

```typescript
// src/api/payments/payments.controller.ts
import { Request, Response } from 'express';
import { razorpay } from '../../lib/razorpay';
import { AuthRequest } from '../../middleware/auth';

export const initiatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { amount_paise, shipment_id } = req.body;

    const order = await razorpay.orders.create({
      amount: amount_paise,  // Must be in PAISE
      currency: 'INR',
      receipt: `receipt_${shipment_id}`,
      notes: { shipment_id, user_id: req.user!.userId }
    });

    return res.json({
      success: true,
      data: {
        order_id: order.id,
        amount_paise: order.amount,
        razorpay_key: process.env.RAZORPAY_KEY_ID,
        currency: 'INR'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Payment initiation failed' } });
  }
};
```

**✅ Day 4 Checkpoint:** `GET /couriers/rates?pickup=110001&delivery=400001&weight=1500` returns fake rates. `POST /payments/initiate` returns a real Razorpay test order ID.

---

## Day 5 — Integration Test with Frontend (ALL 3 DEVS)

- Update `client/.env.local`: `VITE_API_URL=http://localhost:3001`
- Open the frontend and go through login flow — should hit the real server
- Fix CORS issues if any
- Verify auth token is being sent in the Network tab in DevTools
- Verify courier rates page shows real (fake) data from the server

**✅ Week 1 Final Checklist:**
```
[ ] Server runs on port 3001
[ ] All DB tables created (prisma migrate ran successfully)
[ ] POST /auth/send-otp → stores OTP in Redis, prints to console
[ ] POST /auth/verify-otp → returns valid JWT
[ ] authMiddleware blocks requests without Authorization header
[ ] GET /couriers/rates → returns fake data in correct format
[ ] POST /payments/initiate → creates real Razorpay test order
[ ] Frontend login works against real backend
[ ] No CORS errors in browser DevTools
```

---

# 📅 WEEK 2 — Core Business Logic

**Goal by end of week:** A user can log in, select a courier, create a shipment, complete a payment, and see their tracking events — all with real data.

---

## Day 6 — User Profile + MSG91 Real OTP (DEV 1)

### Build `GET /users/profile` and `PUT /users/profile`

```typescript
// src/api/users/users.controller.ts
import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    return res.json({
      success: true,
      data: {
        user_id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        kyc_status: user.kycStatus,
        wallet_balance: user.walletBalance,
        referral_code: user.referralCode,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, email }
    });

    return res.json({ success: true, data: { message: 'Profile updated successfully' } });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
};
```

### Replace console.log OTP with real MSG91 call

```typescript
// src/lib/msg91.ts
export const sendOtpSms = async (phone: string, otp: string): Promise<void> => {
  const url = `https://api.msg91.com/api/v5/otp`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'authkey': process.env.MSG91_AUTH_KEY! },
    body: JSON.stringify({
      template_id: process.env.MSG91_TEMPLATE_ID,
      mobile: `91${phone}`,
      otp
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send OTP via MSG91');
  }
};
```

**✅ Day 6 Checkpoint:** Login → get JWT → `GET /users/profile` returns real user data. OTP is now delivered via real SMS.

---

## Day 7 — Address Book (DEV 1) + Shipment Creation (DEV 2)

### DEV 1: Build address endpoints (`GET`, `POST`, `PUT`, `DELETE /users/addresses`)

These are standard CRUD operations using Prisma.
Note: Address is stored as a JSON string in the `Shipment` model. Create a separate address utility to serialize/deserialize it.

### DEV 2: Build `POST /shipments/create`

```typescript
// src/api/shipments/shipments.controller.ts
export const createShipment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      pickup_pincode, delivery_pincode,
      courier_id, weight, dimensions,
      parcel_type, is_cod, cod_amount,
      pickup_address, delivery_address
    } = req.body;

    // Look up courier partner in DB
    const courier = await prisma.courierPartner.findUnique({ where: { id: courier_id } });
    if (!courier) {
      return res.status(404).json({ success: false, error: { message: 'Courier not found' } });
    }

    // Generate AWB number
    const awbNumber = `AWB${Date.now()}IN`;

    const shipment = await prisma.shipment.create({
      data: {
        awbNumber,
        userId: req.user!.userId,
        courierId: courier_id,
        pickupAddress: JSON.stringify(pickup_address),
        deliveryAddress: JSON.stringify(delivery_address),
        weight,
        dimensions: JSON.stringify(dimensions),
        parcelType: parcel_type || 'PARCEL',
        codAmount: cod_amount || 0,
        status: 'BOOKED',
        totalAmount: 0  // Will be updated after payment
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        shipment_id: shipment.id,
        awb: shipment.awbNumber,
        status: shipment.status
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to create shipment' } });
  }
};
```

**✅ Day 7 Checkpoint:** Can create a shipment record in the database and get back a real shipment ID and AWB number.

---

## Day 8 — Razorpay Webhook + Wallet (DEV 3)

### Build `POST /payments/webhook` — CRITICAL SECURITY STEP

```typescript
import crypto from 'crypto';
import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// ⚠️ This route must use express.raw() middleware, NOT express.json()
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)  // raw body
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === 'payment.captured') {
      const { order_id, amount } = event.payload.payment.entity;
      const shipmentId = event.payload.payment.entity.notes?.shipment_id;

      // Update shipment status
      if (shipmentId) {
        await prisma.shipment.update({
          where: { id: shipmentId },
          data: { status: 'BOOKED', totalAmount: amount / 100, paymentMethod: 'RAZORPAY' }
        });
      }
    }

    return res.json({ received: true });
  } catch (error) {
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};
```

### Register with raw body parser in `index.ts`

```typescript
// Webhook must use raw body — register BEFORE express.json()
app.post('/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);
app.use(express.json());
```

**✅ Day 8 Checkpoint:** Razorpay test webhook fires → payment is captured → shipment status updates to `BOOKED` in DB.

---

## Day 9 — Tracking Events (DEV 2) + Real Courier Rates (DEV 2)

### Build `GET /tracking/:awb`

```typescript
export const getTracking = async (req: Request, res: Response) => {
  try {
    const { awb } = req.params;

    const shipment = await prisma.shipment.findUnique({
      where: { awbNumber: awb },
      include: { trackingEvents: { orderBy: { timestamp: 'desc' } }, courier: true }
    });

    if (!shipment) {
      return res.status(404).json({ success: false, error: { message: 'AWB not found' } });
    }

    return res.json({
      success: true,
      data: {
        awb: shipment.awbNumber,
        courier: shipment.courier.name,
        current_status: shipment.status,
        current_location: shipment.trackingEvents[0]?.location || 'Pickup Pending',
        official_eta: new Date(Date.now() + 3 * 86400000).toISOString(),
        events: shipment.trackingEvents.map(e => ({
          status: e.status,
          location: e.location,
          description: e.description,
          timestamp: e.timestamp
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Tracking failed' } });
  }
};
```

**✅ Day 9 Checkpoint:** `GET /tracking/AWB123456789IN` returns real tracking events from the database.

---

## Day 10 — Full End-to-End Test (ALL 3 DEVS)

Test the complete user journey on the real frontend:
1. Open `http://localhost:5173`
2. Enter phone number → receive real OTP SMS → enter OTP → logged in
3. Enter pickup and delivery addresses → see real courier rates
4. Select a courier → go to payment → complete Razorpay test payment
5. Booking confirmed → see AWB number
6. Go to My Shipments → shipment appears in the list
7. Click Track → see tracking timeline

**✅ Week 2 Final Checklist:**
```
[ ] GET /users/profile returns real user data from DB
[ ] PUT /users/profile updates name/email in DB
[ ] Address book CRUD all working
[ ] POST /shipments/create creates real DB record + AWB
[ ] POST /payments/initiate creates Razorpay order
[ ] POST /payments/webhook verifies signature + updates shipment
[ ] GET /tracking/:awb returns tracking events
[ ] Complete booking flow works end-to-end on real frontend
[ ] OTP delivered via real MSG91 SMS
[ ] No hardcoded data remaining in any endpoint
```

---

## ⚠️ Common Mistakes to Avoid

1. **Never commit your `.env` file to Git** — Add it to `.gitignore` immediately
2. **Razorpay amounts must be in PAISE** — 1 rupee = 100 paise. Always multiply by 100
3. **Verify webhook signatures** — Never trust a webhook without checking the signature
4. **Use DB transactions for wallet operations** — Prevents double-spending bugs
5. **Rate limit your OTP endpoint** — Max 3 OTPs per phone per hour to prevent abuse
6. **Delete OTP from Redis after verification** — OTP should be one-time use only
7. **Do not log JWT tokens or OTPs** — Security risk in production logs
