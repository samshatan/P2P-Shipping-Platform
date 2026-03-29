# 🚚 PARCEL — P2P Shipping Platform

A multi-sided shipping platform connecting users, courier partners, and admins. Users can compare courier rates, book shipments, track packages, and manage COD — all in one place.

---

## 📁 Project Structure

```
P2P-Shipping-Platform/
├── client/          # React + Vite frontend (TypeScript)
└── server/          # Node.js + Express backend (TypeScript) ← needs to be built
```

---

## 🖥️ Frontend (client/)

**Status: 25/25 MVP screens complete ✅**

### Tech Stack
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 8 | Build tool / dev server |
| TypeScript | 5 | Type safety |
| React Router | 7 | Client-side routing |
| TailwindCSS | 4 | Styling |
| Shadcn/UI + Base UI | latest | Component library |
| Framer Motion | 12 | Animations |
| Zod + React Hook Form | latest | Form validation |
| Recharts | 3 | Charts and analytics |

### Pages Built (21 total)
| Route | Screen | Status |
|---|---|---|
| `/` | Landing page | ✅ Done |
| `/pricing` | Pricing page | ✅ Done |
| `/login` | Login + OTP | ✅ Done |
| `/signup` | Sign up | ✅ Done |
| `/verify-otp` | OTP verification (Resend + Expired) | ✅ Done |
| `/book/address` | Address input (Pincode Error) | ✅ Done |
| `/book/courier` | Courier comparison | ✅ Done |
| `/book/evidence` | Evidence Vault | ✅ Done |
| `/book/review` | Review & Pay (Promo Codes) | ✅ Done |
| `/book/payment-failed` | Payment failed + retry | ✅ Done |
| `/book/confirmed` | Booking confirmed | ✅ Done |
| `/dashboard` | User dashboard | ✅ Done |
| `/shipments` | My Shipments | ✅ Done |
| `/track/:awb` | Tracking timeline | ✅ Done |
| `/track/:awb/failed` | Delivery attempt failed | ✅ Done |
| `/profile` | Profile + Wallet | ✅ Done |
| `/profile/kyc` | KYC — Aadhaar input + Upload | ✅ Done |
| `/profile/addresses` | Address book management | ✅ Done |
| `/notifications` | Notifications page | ✅ Done |
| `/cod-returns` | COD & Remittance | ✅ Done |
| `/international` | International booking | ✅ Done |
| `/admin` | Admin control panel (Manual KYC) | ✅ Done |
| `/partner` | Courier partner portal | ✅ Done |
| `/compare` | Public rate compare | ✅ Done |

### MVP Screens Still Missing (0)
- All frontend screens implemented successfully.

### Latest Improvements (v1.1)
- **Strict TypeScript Typing**: Added interfaces for `User` and `Rate` objects across the app, replacing `any` types for better reliability.
- **Dynamic Verification Flow**: Integrated `sessionStorage` to handle dynamic phone numbers in the OTP verification screen, replacing hardcoded placeholders.
- **Performance Optimization**: Implemented `useMemo` hooks for expensive calculations in the Dashboard and Savings Banner.
- **Security Audit Fixes**: Removed hardcoded secrets and implemented dynamic mock token generation for the development environment.
- **Progress bar Fix**: Corrected a visual bug in the `AnimatedTimeline` where the progress bar was incorrectly rendered as semi-filled at 0%.

### Running the Frontend
```bash
cd client
npm install
npm run dev
# Opens at http://localhost:5173
```

### Environment Variables (`client/.env.local`)
```
VITE_API_URL=http://localhost:3001
```

---

## ⚙️ Backend (server/)

**Status: 0% — needs to be built from scratch**

The API contract is fully defined in `server/contracts/api-contracts.md`. The database schema is in `server/prisma/schema.prisma` (moved from `client/prisma/`). The infrastructure is pre-configured via `docker-compose.yml`.

### Tech Stack
| Technology | Purpose |
|---|---|
| Node.js 20 + Express.js | API server framework |
| TypeScript | Type safety |
| Prisma ORM | Database access |
| PostgreSQL | Primary database (users, shipments, payments) |
| Redis | OTP storage, caching, session tokens |
| MinIO | Evidence Vault file storage (local S3-compatible) |
| BullMQ | Background job queue (webhooks, notifications) |
| JWT | Authentication (Access + Refresh tokens) |

### Infrastructure (Docker)
All services are pre-configured. Just run:
```bash
cd server
docker compose up -d
```
This starts: PostgreSQL (5432), Redis (6379), MongoDB (27017), Kafka (9092), MinIO (9000).

### Recommended Folder Structure
```
server/
├── src/
│   ├── api/
│   │   ├── auth/           # Dev 1
│   │   ├── users/          # Dev 1
│   │   ├── couriers/       # Dev 2
│   │   ├── shipments/      # Dev 2
│   │   ├── tracking/       # Dev 2
│   │   ├── payments/       # Dev 3
│   │   └── wallet/         # Dev 3
│   ├── middleware/
│   │   ├── auth.ts         # JWT verification (shared)
│   │   └── errorHandler.ts
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── redis.ts        # Redis client
│   │   └── razorpay.ts     # Razorpay client
│   └── index.ts            # Server entry point (port 3001)
├── prisma/
│   └── schema.prisma
└── .env
```

### Environment Variables (`server/.env`)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/parcel
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# MSG91 (OTP)
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=

# Razorpay (Payments)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Digio (KYC)
DIGIO_CLIENT_ID=
DIGIO_CLIENT_SECRET=

# SendGrid (Email)
SENDGRID_API_KEY=

# MinIO (File Storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

---

## 👥 Backend Developer Assignments

### Developer 1 — Auth + Users + KYC
**Estimated: 1 week**

**Endpoints:**
```
POST /auth/send-otp          Store OTP in Redis (5 min TTL), call MSG91
POST /auth/verify-otp        Verify OTP, return JWT access + refresh tokens
POST /auth/refresh-token     Issue new access token from refresh token
GET  /users/profile          Get logged-in user's profile
PUT  /users/profile          Update name, email
POST /users/kyc/initiate     Start Aadhaar KYC via Digio API
GET  /users/kyc/status       Check KYC status
GET  /users/addresses        List saved addresses
POST /users/addresses        Add new address
PUT  /users/addresses/:id    Edit address
DEL  /users/addresses/:id    Delete address
```

**Third-party APIs:** MSG91 (OTP SMS), Digio (eKYC)

**Key implementation notes:**
- OTPs stored in Redis with `EX 300` (5 min expiry)
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- All protected routes must use the shared `authMiddleware`

---

### Developer 2 — Couriers + Shipments + Tracking
**Estimated: 1.5 weeks**

**Endpoints:**
```
GET  /couriers/rates             Fetch & sort rates from all courier partners
POST /shipments/create           Create a draft shipment record
POST /shipments/:id/confirm      Confirm after payment succeeds
GET  /users/shipments            List user's shipments (paginated, filterable)
GET  /shipments/:id              Get single shipment detail
POST /shipments/:id/cancel       Cancel shipment
POST /shipments/:id/evidence     Upload Evidence Vault photo/video
GET  /tracking/:awb              Get tracking events for an AWB
```

**Third-party APIs:** Delhivery API (rates + shipment creation), MinIO (file upload)

**Key implementation notes:**
- Cache courier rates in Redis for 10 minutes to avoid excessive API calls
- The Rate Engine must call multiple couriers, normalize response format, sort by price and ETA
- Evidence Vault files uploaded to MinIO, store the URL + SHA-256 hash in DB
- Weight is always in **grams** (driver: 1.5kg → send `1500`)

---

### Developer 3 — Payments + Wallet + Notifications
**Estimated: 1.5 weeks**

**Endpoints:**
```
POST /payments/initiate          Create Razorpay order (amount in PAISE)
POST /payments/webhook           Handle Razorpay webhook (verify signature!)
GET  /users/wallet               Get wallet balance + transaction history
POST /users/wallet/topup         Add money to wallet via Razorpay
POST /users/wallet/withdraw      Initiate bank withdrawal
GET  /users/referrals            Referral stats and earnings
POST /couriers/rates/promo       Validate and apply promo/discount code
```

**Third-party APIs:** Razorpay (payments), SendGrid (email receipts)

**Key implementation notes:**
- ⚠️ All amounts to Razorpay must be in **PAISE** (`amount × 100`)
- ⚠️ **Verify Razorpay webhook signature** using `razorpay.webhookSignature.verify()` — do NOT skip this
- Wallet credit/debit must use DB transactions (prevent race conditions / double-spend)
- Send email receipt via SendGrid after successful booking

---

## 🗓️ 3-Week MVP Build Plan

| Week | Goal |
|---|---|
| **Week 1** | Initialize server, connect DB + Redis, implement Auth (OTP, JWT), set up shared middleware |
| **Week 2** | Rate Engine + Shipment creation + Evidence Vault. Razorpay order + webhook + Wallet. |
| **Week 3** | Integration testing, connect real APIs to frontend (remove MSW mocks), fix bugs, deploy |

---

## 🚀 Getting Started (Backend Setup)

```bash
cd server

# Install dependencies
npm init -y
npm install express typescript prisma @prisma/client redis jsonwebtoken dotenv multer

# Dev dependencies
npm install -D ts-node-dev @types/express @types/jsonwebtoken @types/node

# Start infrastructure
docker compose up -d

# Run Prisma migrations
npx prisma migrate dev --name init
npx prisma generate

# Start backend dev server
npm run dev
# Runs at http://localhost:3001
```

---

## 📜 API Contract

Full API specification (endpoints, request/response formats, error codes): [`server/contracts/api-contracts.md`](server/contracts/api-contracts.md)

## 🗄️ Database Schema

Full Prisma schema (all models): [`server/prisma/schema.prisma`](server/prisma/schema.prisma)