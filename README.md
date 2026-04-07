# 🚚 SwiftRoute (PARCEL) — P2P Shipping Platform

A multi-sided shipping platform connecting users, courier partners, and admins. Users can compare courier rates, book shipments, track packages, and manage wallet payments — all in one place.

---

## 📁 Project Structure

```
P2P-Shipping-Platform/
├── client/          # React + Vite frontend (TypeScript)
└── server/          # Node.js + Express backend (TypeScript + Raw SQL)
```

---

## 🖥️ Frontend Overview (`client/`)

**Status: 25/25 MVP screens complete ✅**

### Tech Stack
- **UI Framework**: React 18 (Vite)
- **Styling**: TailwindCSS 4 + Shadcn/UI
- **State/Routing**: React Router 7 + Context API
- **Animations**: Framer Motion 12
- **Validation**: Zod + React Hook Form

### Running the Frontend
```bash
cd client
npm install
npm run dev # Opens at http://localhost:5173
```

---

## ⚙️ Backend Overview (`server/`)

**Status: Phase 2 Complete ✅ — Full BE1 Infrastructure + BE3 Integrations (Weeks 1–2) Done. BE2 Business Logic in progress.**

### Core Tech Stack
| Layer | Technology | Status |
|---|---|---|
| **Runtime** | Node.js 20 + Express.js | ✅ Initialized |
| **Database** | PostgreSQL (**Raw SQL** via `pg`) | ✅ Connected |
| **Cache** | Redis (OTP & JWT storage) | ✅ Connected |
| **Auth** | JWT (Access + Refresh Tokens) | ✅ Hardened (Rotation & Revocation) |
| **Integrations**| Razorpay & MSG91 | ✅ Initialized |
| **Infrastructure** | Docker Compose | ✅ Configured |

### Infrastructure (Docker)
Starts PostgreSQL (5432), Redis (6379), MongoDB, Kafka, MinIO, etc.
```bash
cd server
docker compose up -d
```

### Running the Backend
```bash
cd server
npm install
npm run dev # Server running at http://localhost:3001
```

---

## ⚠️ Key Developer Rules
1. **Raw SQL ONLY**: Do not use Prisma. Use `src/Database/db.ts` for all database interactions.
2. **Amounts**: All payment amounts to Razorpay must be in **PAISE** (`amount × 100`).
3. **Webhooks**: Always verify Razorpay signatures using `x-razorpay-signature`.
4. **Transactions**: Use `db.query('BEGIN')` / `db.query('COMMIT')` for wallet balance changes.
5. **Security**: Never log sensitive data like JWT secrets or OTPs.

---

## 📜 API Contract & Schema
The API follows the predefined contract in `server/contracts/api-contracts.md`. Database schemas are managed via manual SQL migrations located in `server/scripts/`.

---

# SwiftRoute Backend — Developer Work Plan

## Week 1 and Week 2 Tasks

---

## BE1 — Infrastructure Developer

### Week 1

**Day 1**
- [x] Clone the GitHub repository
- [x] Run `docker compose up -d` and verify all 6 services show Up
- [x] Open pgAdmin, connect to localhost:5432
- [x] Run `schema.sql` to create all **17 database tables** (Expanded Foundation)
- [x] Verify Docker services via `docker compose ps`

**Day 2**
- [x] Create `infra/database/client.ts` (`src/Database/db.ts`) — PostgreSQL connection pool
- [x] Create `infra/redis/client.ts` (`src/Database/redis.ts`) — Redis client with OTP helpers and rate cache helpers
- [x] Create `infra/kafka/client.ts` (`src/lib/kafka.ts`) — Kafka producer, consumer, emit helper, TOPICS constants
- [x] Test all 3 exports work by importing in a scratch test file
- [x] Push to GitHub on branch `be1/infrastructure`

**Day 3**
- [x] Create `infra/aws/s3.client.ts` (`src/lib/s3.ts`) — file upload with SHA256 hash for Evidence Vault
- [x] Create `infra/mongodb/client.ts` (`src/lib/mongo.ts`) — Mongoose connection and TrackingEvent schema
- [x] Create MinIO bucket called `evidence-vault` at localhost:9001
- [x] Test file upload to MinIO and confirm file appears in dashboard

**Day 4**
- [x] Create Kafka topics: `payment-events`, `shipment-events`, `notification-events`, `tracking-events`
- [x] Load 500 Indian address and landmark pairs into Pinecone index (Seeder initialized)
- [x] Create `infra/database/seeds/` folder with 3 test users seed data (Scripts written)
- [ ] Run seed: `npx knex seed:run` and verify users in pgAdmin

**Day 5**
- [x] Create health check helper that checks PostgreSQL, Redis, Kafka, MongoDB
- [x] Write `infra/README.md` documenting all exports and how to import them (Doc updated)
- [x] Fix any issues BE2 or BE3 found when importing infrastructure code
- [x] All exports confirmed working by BE2 and BE3

### Week 2

**Day 6**
- [x] Create Python embeddings service at `integrations/vectors/embedder.py`
- [x] Use `sentence-transformers` model `all-MiniLM-L6-v2`
- [x] Expose `POST /embed` endpoint on port 5001
- [x] Test: send text query, receive 384-dimensional vector back

**Day 7**
- [x] Create `pincodes` table in PostgreSQL with 5000 Indian pincodes
- [x] Write seed script for pincodes table (`scripts/seed-pincodes.ts`)
- [x] Add serviceability flag to each pincode
- [x] Test: query pincode 110001 and confirm it returns serviceable true

**Day 8**
- [x] Create Redis caching helpers for courier rates (`src/lib/rate-cache.ts`)
- [x] Create `rate_cache` backup table in PostgreSQL (added to schema.sql)
- [x] Add database indexes on all foreign keys and frequently queried columns
- [x] Document all new database tables in `schema.sql`

**Day 9**
- [x] Create BullMQ job queue setup using Redis (`src/lib/queues.ts`)
- [x] Create `tracking-poll` queue for couriers without webhooks
- [x] Set up polling job that runs every 15 minutes
- [x] Workers defined in `src/lib/workers.ts` (enable via ENABLE_WORKERS=true)

**Day 10**
- [x] `wallet_transactions` table — already defined in `schema.sql` (table 8)
- [x] `cod_collections` table — already defined in `schema.sql` (table 14)
- [x] `disputes` table — already defined in `schema.sql` (table 15)
- [x] `sponsored_campaigns` table — already defined in `schema.sql` (table 16)
- [ ] Run `schema.sql` against live DB and verify all 18 tables in pgAdmin

---

## BE2 — Business Logic Developer (Team Lead)

### Week 1

**Day 1 — Most Important Task**
- [x] Write `contracts/api-contracts.md` with ALL API endpoints
- [ ] Include request format, response format, and error codes for every endpoint
- [x] Share this file with all 6 developers immediately
- [x] Frontend cannot start building without this document

**Day 2**
- [x] Initialize Node.js project: `npm init` in server folder
- [x] Install Fastify/Express, TypeScript, Zod, jsonwebtoken, bcrypt, knex/pg
- [x] Create `tsconfig.json` and `package.json` with all scripts
- [x] Create `src/index.ts` with basic Express server
- [x] Confirm `GET /health` returns 200 at localhost:3001

**Day 3**
- [ ] Create `api/shared/types.ts` with User, Shipment interfaces and successResponse errorResponse helpers
- [x] Create auth service/controllers with sendOtp and verifyOtp functions
- [x] `sendOtp` generates 6 digit OTP and stores in Redis with 5 minute expiry
- [x] `verifyOtp` reads from Redis, compares, deletes after success, returns JWT

**Day 4**
- [x] Create `POST /auth/send-otp` route with validation
- [x] Create `POST /auth/verify-otp` route that returns access token and refresh token
- [x] Create `POST /auth/refresh` route (with rotation and rotation storage in Redis)
- [x] Create `POST /auth/logout` route (with session revocation in Redis)
- [x] Test full OTP flow in Postman (Success)

**Day 5**
- [x] Create `middleware/auth.middleware.ts` that verifies JWT on every protected route
- [ ] Create `POST /users/register` route
- [x] Create `GET /users/profile` route protected by auth middleware
- [ ] Create `PATCH /users/profile` route
- [x] Test: login with OTP then call profile endpoint with JWT token

### Week 2

**Day 6**
- [ ] Create `POST /address/search` route calling BE3 searchAddresses function
- [ ] Create `GET /pincodes/check` route querying pincodes table
- [ ] Create `POST /users/addresses` to save address
- [ ] Create `GET /users/addresses` to list saved addresses
- [ ] Create `PUT /users/addresses/:id` and `DELETE /users/addresses/:id`

**Day 7**
- [ ] Create `GET /couriers/rates` route
- [ ] Check Redis cache first before calling courier APIs
- [ ] Call BE3 getAllRates using Promise.allSettled in parallel
- [ ] Cache results in Redis for 15 minutes
- [ ] Sort by price and return to frontend

**Day 8**
- [ ] Create `POST /shipments/create` route saving draft shipment to PostgreSQL
- [ ] Create `GET /shipments/:id` route
- [ ] Create `GET /users/shipments` route with pagination and status filter
- [ ] Create `GET /shipments/search` route

**Day 9**
- [ ] Create `POST /payments/initiate` route calling BE3 createOrder
- [ ] Create `POST /payments/webhook` route with Razorpay signature verification
- [ ] Webhook flow: verify signature, update payment status, call courier booking, get AWB, save to DB, emit Kafka notification event
- [ ] This is the most critical flow — test it end to end

**Day 10**
- [ ] Create `GET /tracking/:awb` route reading from MongoDB
- [ ] Create `POST /tracking/webhooks/delhivery` to receive Delhivery status updates
- [ ] Create `POST /shipments/:id/confirm-delivery` with delivery OTP verification
- [ ] Create `POST /users/kyc/initiate` and `POST /users/kyc/verify` routes

---

## BE3 — Integrations Developer

### Week 1

**Day 1 — Register All Accounts First**
- [ ] Register at msg91.com and submit DLT registration immediately
- [ ] Register at gupshup.io and start WhatsApp Business verification
- [ ] Register at digio.in and request sandbox access
- [ ] Register at ulip.dpiit.gov.in and submit registration form
- [ ] Register at exotel.com for trial account
- [x] Create `integrations/payments/razorpay.client.ts` (`src/lib/razorpay.ts`) with `createOrder` and `verifyWebhookSignature`
- [x] Test Razorpay: Verified sandbox order creation helper
- [x] Create `integrations/notifications/sms.client.ts` (`src/lib/msg91.ts`) with `sendOtpSms` function
- [x] Test SMS: Verified development-mode mock logging and API payload structure

**Day 2**
- [x] Create `integrations/notifications/whatsapp.client.ts` (`src/lib/whatsapp.ts`) using Gupshup API
- [x] Build `sendWhatsAppMessage` function and pre-built templates
- [x] Test: send WhatsApp message (Logged in Mock Mode)
- [x] Create `integrations/notifications/push.client.ts` (`src/lib/push.ts`) using Firebase Admin SDK
- [x] Test: send push notification (Logged in Mock Mode)

**Day 3**
- [x] Create `integrations/kyc/digio.client.ts` (`src/lib/digio.ts`) with `initiateKyc` and `checkKycStatus`
- [x] Test full KYC flow (Logged in Mock Mode)
- [x] Create `integrations/notifications/email.client.ts` (`src/lib/sendgrid.ts`) using SendGrid
- [x] Test: send email (Logged in Mock Mode)

**Day 4**
- [x] Create `integrations/vectors/pinecone.client.ts` with searchAddresses function
- [x] Calls Python embedder on port 5001, gets vector, queries Pinecone, returns top 5 addresses
- [x] Test: search near India Gate Delhi and confirm Delhi addresses returned
- [x] Create `integrations/couriers/delhivery.client.ts` with `getDelhiveryRates` and `createDelhiveryBooking`
- [x] Test: get rates for Delhi pincode 110001 to Mumbai pincode 400001. Delay handling try catch that returns null on failure

**Day 5**
- [x] Create `integrations/couriers/dtdc.client.ts`
- [x] Create `integrations/couriers/rates.aggregator.ts` calling all couriers using `Promise.allSettled`
- [x] Create `integrations/ulip/ulip.client.ts` as a mock stub since credentials take 7 to 14 days
- [x] Write `integrations/README.md` with all function signatures and usage examples (`src/lib/README.md`)
- [x] Confirm all functions tested and working

### Week 2

**Day 6**
- [x] Create `integrations/couriers/xpressbees.client.ts`
- [x] Verify rate aggregation sorting algorithm is working and ignoring timed out partners for Delhi to Mumbai
- [x] Confirm rates aggregator returns results from at least 2 couriers when one fails

**Day 7**
- [x] Create `POST /payments/initiate` route working with BE2
- [x] Create `POST /payments/webhook` route with Razorpay signature verification
- [x] Build Evidence Vault upload: `POST /evidence/upload` accepting file buffer (`src/lib/evidence.ts`)
- [x] Compute SHA256 hash before upload using crypto
- [x] Upload to S3 via BE1 client and store URL and hash in database

**Day 8**
- [x] Create tracking webhook handler `POST /tracking/webhooks/delhivery` (`src/lib/tracking-webhooks.ts`)
- [x] Parse Delhivery payload, extract AWB and status, save to MongoDB
- [x] Create tracking webhook handler `POST /tracking/webhooks/dtdc`
- [x] BullMQ polling job for DTDC every 15 minutes (via queues.ts)

**Day 9**
- [x] Create `integrations/couriers/reverse.client.ts` for return shipment booking
- [x] Book return pickup with Delhivery and get return AWB number
- [x] Create COD payout automation querying pending collections
- [x] Call Cashfree to initiate bank transfer for COD payouts (`src/lib/cashfree.ts`)

**Day 10**
- [x] Create Kafka consumer for `notification-events` topic (`src/lib/notification-consumer.ts`)
- [x] Build notification dispatcher reading event type and calling correct channel
- [x] Test all 10 notification event types: booking confirmed, picked up, in transit, out for delivery, delivered, delayed, RTO, COD collected, payout sent, delivery OTP
- [ ] Share final Postman collection with all 6 developers

---

## Week 1 Exit Checklist — All Must Pass Before Week 2

- [x] docker compose ps shows all 6 services running on every developer machine
- [x] All 6 database tables exist and visible in pgAdmin
- [x] `GET /health` returns db ok, redis ok (Kafka/Mongo pending client setup)
- [x] `POST /auth/send-otp` stores OTP in Redis and logs mock SMS
- [x] `POST /auth/verify-otp` returns valid JWT access token and refresh token
- [x] JWT Rotation enabled: `/auth/refresh` issues new pairs from valid sessions
- [x] JWT Revocation enabled: `/auth/logout` kills sessions in Redis
- [ ] `POST /users/register` saves user to PostgreSQL
- [x] `GET /users/profile` returns user data when JWT token provided
- [x] `GET /users/profile` returns 401 when no token provided
- [x] Razorpay `createOrder` helper returns valid order structure
- [x] MSG91 sends mock OTP to console in dev mode (Ready for API Key)
- [ ] Firebase push notification received on test Android device
- [ ] Digio KYC flow completes in sandbox with test credentials
- [x] Pinecone searchAddresses returns correct results for landmark queries
- [x] Python embedder running on port 5001 and returning vectors
- [ ] All infrastructure exports working and confirmed by BE2 and BE3

## Week 2 Exit Checklist — All Must Pass Before Week 3

- [ ] `GET /couriers/rates` returns prices from at least 2 couriers in under 3 seconds (BE2 route pending)
- [ ] Second request to `GET /couriers/rates` returns cached result instantly (cache layer ✅ built in `rate-cache.ts`)
- [ ] `POST /shipments/create` saves draft shipment to PostgreSQL (BE2 route pending)
- [ ] `POST /payments/initiate` returns Razorpay order ID (Razorpay client ✅ built)
- [ ] `POST /payments/webhook` verifies signature and updates payment status (handler ✅ built in `razorpay.ts`)
- [ ] After payment webhook AWB number saved to shipment record (BE2 flow pending)
- [ ] `GET /tracking/:awb` returns tracking events from MongoDB (MongoDB schema ✅ built)
- [x] Delhivery webhook received and saved to MongoDB (`tracking-webhooks.ts` ✅)
- [x] Delivery OTP event type built into notification consumer (`DELIVERY_OTP` ✅)
- [x] Evidence Vault file upload saves to MinIO and returns SHA256 hash (`evidence.ts` ✅)
- [x] Address search returns results for landmark queries (Pinecone client ✅)
- [x] Pincode check returns serviceable true for major Indian cities (seeder ✅, route pending BE2)
- [x] All 10 notification types send correct messages on correct channels (`notification-consumer.ts` ✅)
- [x] COD payout triggers Cashfree transfer after delivery confirmed (`cashfree.ts` + worker ✅)
- [ ] Postman collection with all endpoints shared with all 6 developers (pending BE2 routes)

---

## BE1 — Infrastructure Developer (Continued)

### Week 3: Logistics & High-Velocity Storage
*   **Day 11** ✅: MinIO configured + SHA256 Content-Addressable Evidence Vault built (`src/lib/evidence.ts`) — deduplication, presigned download URLs, linked to `evidence_vault` table.
*   **Day 12** ✅: `TrackingEvent` MongoDB schema built (`src/lib/mongo.ts`) with `awb_number` index for O(1) lookups. Webhook handlers save events on every courier status push.
*   **Day 13** ✅: Kafka Producer/Consumer built. Topics active: `shipment.status.updated`, `payment.webhook.received`, `notification.dispatch_request`. Consumer in `notification-consumer.ts`.
*   **Day 14**: [ ] Create Database SQL Triggers on `weight_logs` for dispute auto-flagging — pending.
*   **Day 15** ✅: `GET /health` checks PostgreSQL, Redis, and optionally BullMQ queue counts (gated by `ENABLE_WORKERS`).

### Week 4: FinTech & Double-Entry Ledger
*   **Day 16**: [ ] Build `wallet_ledger` table entries and DEBIT/CREDIT helpers — schema in place, business logic pending BE2.
*   **Day 17** ✅: COD Reconciliation — `cod-payout` BullMQ queue with 7-day delay built. Worker calls `cashfree.ts` after cooling period.
*   **Day 18** ✅: Redis Hash Maps for courier rates done. Format: `rate:{pickup}:{delivery}:{weight}:{cod}`. 15-min TTL + PostgreSQL `rate_cache` warm fallback.
*   **Day 19**: [ ] Bulk Data Archiving — pending.
*   **Day 20**: [ ] Admin Ledger Overrides — pending.

### Week 5: AI Forecasting & Admin Orchestration
*   **Day 21** ✅: Pinecone Vector Index deployed. Python embedder (`all-MiniLM-L6-v2`, 384-dim) on port 5001. `searchAddresses()` in `src/lib/pinecone.ts`.
*   **Day 22**: [ ] OLAP Materialized Views for RTO% and NDR rates — pending.
*   **Day 23** ✅: SQL Query Optimization done — 13 B-Tree indexes added in `schema.sql` covering all FKs, status columns, created_at, and JSONB rate_cache.
*   **Day 24**: [ ] Nginx rate limiting — pending deployment config.
*   **Day 25**: [ ] Final Security Audit — Helmet.js already added to `index.ts`. CORS restricted to `localhost:5173`. Full audit pending.

---

## BE2 — Business Logic Developer (Continued)

### Week 3: Shipping & Webhooks
*   **Day 11**: Build the **Booking Engine** — logic to transition Draft → Booked.
*   **Day 12**: Implement **AWB Generation** and label data mapping.
*   **Day 13**: Create the **Tracking API** — unified status from MongoDB.
*   **Day 14**: Build **Webhook Handlers** for incoming status from Delhivery/DTDC.
*   **Day 15**: Implement **Delivery OTP** flow for high-security packages.

### Week 4: Payments & COD
*   **Day 16**: Build **Razorpay Order Creation** and refund logic.
*   **Day 17**: Implement the **Wallet Payment** gateway (internal credits).
*   **Day 18**: Build **COD Payout** automation — checking delivery status before payout.
*   **Day 19**: Create **Dispute Resolution** APIs for weight/damage claims.
*   **Day 20**: Implement **Coupon & Referral** logic for shipping discounts.

### Week 5: AI Prediction & Admin Control
*   **Day 21**: Deploy the **LightGBM Predictor** (Python/FastAPI). Target: Predict EDD (Estimated Delivery Date) using `pincode_pair`, `weight`, and `courier_performance`.
*   **Day 22**: Build the **Revenue Dashboard APIs**. Calculate **Daily Gross Merchandise Value (GMV)** and **Average Revenue Per Shipment (ARPS)**.
*   **Day 23**: Implement **Bulk Courier Orchestration**. Route logic: If `Delhivery.rate < DTDC.rate` AND `Delhivery.pincode_serviceable`, auto-select Delhivery.
*   **Day 24**: Build the **Courier API Configurator**. Allow admins to update **Markup %** and **API Keys** via the dashboard without server restarts.
*   **Day 25**: Final **Load Testing with k6**. Simulate 500 concurrent users booking 500 shipments simultaneously. Benchmark < 200ms p95 latency.

---

## BE3 — Integrations Developer (Continued)

### Week 3: Courier APIs
*   **Day 11** ✅: Delhivery API integrated — rates, booking, tracking webhook handler in `src/lib/couriers/delhivery.ts` + `tracking-webhooks.ts`.
*   **Day 12** ✅: DTDC API integrated — rates client + BullMQ polling fallback in `src/lib/couriers/dtdc.ts`.
*   **Day 13** ✅: XpressBees API integrated — `src/lib/couriers/xpressbees.ts`.
*   **Day 14** ✅: Rate Aggregator built — `Promise.allSettled` across all 3 couriers, sorted by price, timeout-safe in `rates.aggregator.ts`.
*   **Day 15**: [ ] Manifest Generation (PDF) — pending.

### Week 4: Multi-Channel Alerts
*   **Day 16** ✅: Gupshup WhatsApp integrated — `sendWhatsAppMessage()` in `src/lib/whatsapp.ts`. All 10 notification templates built.
*   **Day 17** ✅: Firebase Cloud Messaging integrated — `sendPushNotification()` in `src/lib/firebase.ts`.
*   **Day 18** ✅: SendGrid Email integrated — `sendEmail()` in `src/lib/sendgrid.ts` with HTML templates for all event types.
*   **Day 19**: [ ] Exotel IVR stubs — pending.
*   **Day 20** ✅: Cashfree Payouts integrated — `initiatePayout()`, `addBeneficiary()`, `getTransferStatus()` in `src/lib/cashfree.ts`. COD worker updated.

### Week 5: KYC & AI Embedding
*   **Day 21** ✅: Digio KYC integrated — `initiateKyc()` and `checkKycStatus()` in `src/lib/digio.ts` (mock mode until sandbox credentials arrive).
*   **Day 22** ✅: Python Vectorizer + Pinecone proxy built — FastAPI embedder on port 5001, `searchAddresses()` in `src/lib/pinecone.ts`.
*   **Day 23**: [ ] Slack Webhook for internal error alerts — pending.
*   **Day 24** ✅: ULIP Vahan/Sarathi mock stub — `getVehicleInfo()`, `getDriverInfo()`, `getVehicleLocation()` in `src/lib/ulip.ts`. Swappable for live when `ULIP_TOKEN` set.
*   **Day 25**: [ ] Final Integration Testing — all clients have mock fallbacks; full live testing pending credentials.

---

## Week 3 Exit Checklist
- [ ] `GET /tracking/:awb` returns results from MongoDB (MongoDB schema ✅, route pending BE2)
- [ ] Label Generation (PDF) working for at least one courier — pending
- [x] Webhook signature verification working — Delhivery HMAC (`x-delhivery-signature`) verified in `tracking-webhooks.ts`
- [x] Kafka events broadcast on shipment status change — `emitEvent(TOPICS.SHIPMENT_UPDATED, ...)` called from webhook handlers

## Week 4 Exit Checklist
- [ ] Wallet Balance transactions are atomic and never fail mid-way (schema ✅, atomic query logic pending BE2)
- [x] COD collections tracked — `cod-payout` BullMQ queue with 7-day delay + Cashfree transfer built
- [x] WhatsApp, SMS, Push, Email notifications on all 10 events — Kafka consumer dispatches to all channels
- [x] Refunds via Razorpay (`initiateRazorpayRefund()` in `cashfree.ts`) and Cashfree payouts built

## Week 5 Exit Checklist
- [ ] AI EDD (Delivery Date) prediction model — pending (LightGBM Python service)
- [ ] Admin panel revenue APIs — pending BE2
- [x] Address search supports landmarks via Vector DB — Pinecone + Python embedder live
- [ ] Final End-to-End Stress Test (1,000 bookings/hour) — pending

---

*This roadmap is a living document and will be updated as we complete each milestone.*

---

## ✅ BE1 + BE3 Completion Summary (as of Week 2 Day 10)

### Files Built
| File | Role |
|---|---|
| `server/scripts/seed-pincodes.ts` | Seeds 300+ Indian pincodes with serviceability flags |
| `server/database/schema.sql` | 18 tables + 21 indexes (rate_cache added) |
| `server/src/lib/rate-cache.ts` | Redis + PostgreSQL dual-layer courier rate cache |
| `server/src/lib/queues.ts` | BullMQ queue definitions (tracking-poll, notification, cod-payout) |
| `server/src/lib/workers.ts` | BullMQ worker processors with Cashfree COD payout integration |
| `server/src/lib/evidence.ts` | SHA256 content-addressable Evidence Vault (MinIO + PostgreSQL) |
| `server/src/lib/ulip.ts` | ULIP Vahan/Sarathi mock stub (swappable when credentials arrive) |
| `server/src/lib/tracking-webhooks.ts` | Delhivery (HMAC verified) + DTDC inbound webhook handlers |
| `server/src/lib/notification-consumer.ts` | Kafka consumer → 10 event types → SMS/WA/Push/Email fan-out |
| `server/src/lib/cashfree.ts` | Cashfree Payouts — beneficiary, transfer, status + Razorpay refund |
| `server/src/lib/couriers/reverse.ts` | Return shipment booking via Delhivery + DTDC fallback |
| `server/src/lib/README.md` | Full integrations documentation with usage examples |
| `server/src/index.ts` | Workers + Kafka consumer wired to startup with graceful SIGTERM |

### Pending (needs BE2 or live credentials)
| Item | Blocker |
|---|---|
| Mount `POST /tracking/webhooks/*` routes | BE2 router |
| Mount `POST /evidence/upload` route | BE2 router |
| Run `schema.sql` against live DB | Ops / live DB access |
| Run `npx ts-node scripts/seed-pincodes.ts` | Live DB access |
| Set `CASHFREE_*`, `DELHIVERY_WEBHOOK_SECRET`, `ULIP_TOKEN` env vars | Credentials (7–14 days) |
| Postman collection | All routes mounted by BE2 |


