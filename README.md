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

**Status: Phase 1 — Authentication & Foundation Complete ✅ (35%)**

### Core Tech Stack
| Layer | Technology | Status |
|---|---|---|
| **Runtime** | Node.js 20 + Express.js | ✅ Initialized |
| **Database** | PostgreSQL (**Raw SQL** via `pg`) | ✅ Connected |
| **Cache** | Redis (OTP & JWT storage) | ✅ Connected |
| **Auth** | JWT (Access + Refresh Tokens) | ✅ Functional |
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
- [ ] Open pgAdmin, connect to localhost:5432
- [ ] Run `schema.sql` to create all 6 database tables
- [ ] Send screenshot of `docker compose ps` to team group

**Day 2**
- [x] Create `infra/database/client.ts` (`src/Database/db.ts`) — PostgreSQL connection pool
- [x] Create `infra/redis/client.ts` (`src/Database/redis.ts`) — Redis client with OTP helpers and rate cache helpers
- [ ] Create `infra/kafka/client.ts` — Kafka producer, consumer, emit helper, TOPICS constants
- [ ] Test all 3 exports work by importing in a scratch test file
- [ ] Push to GitHub on branch `be1/infrastructure`

**Day 3**
- [ ] Create `infra/aws/s3.client.ts` — file upload with SHA256 hash for Evidence Vault
- [ ] Create `infra/mongodb/client.ts` — Mongoose connection and TrackingEvent schema
- [ ] Create MinIO bucket called `evidence-vault` at localhost:9001
- [ ] Test file upload to MinIO and confirm file appears in dashboard

**Day 4**
- [ ] Create Kafka topics: `payment-events`, `shipment-events`, `notification-events`, `tracking-events`
- [ ] Load 500 Indian address and landmark pairs into Pinecone index
- [ ] Create `infra/database/seeds/` folder with 3 test users seed data
- [ ] Run seed: `npx knex seed:run` and verify users in pgAdmin

**Day 5**
- [ ] Create health check helper that checks PostgreSQL, Redis, Kafka, MongoDB
- [ ] Write `infra/README.md` documenting all exports and how to import them
- [ ] Fix any issues BE2 or BE3 found when importing infrastructure code
- [ ] All exports confirmed working by BE2 and BE3

### Week 2

**Day 6**
- [ ] Create Python embeddings service at `integrations/vectors/embedder.py`
- [ ] Use `sentence-transformers` model `all-MiniLM-L6-v2`
- [ ] Expose `POST /embed` endpoint on port 5001
- [ ] Test: send text query, receive 384-dimensional vector back

**Day 7**
- [ ] Create `pincodes` table in PostgreSQL with 5000 Indian pincodes
- [ ] Write Knex migration for pincodes table
- [ ] Add serviceability flag to each pincode
- [ ] Test: query pincode 110001 and confirm it returns serviceable true

**Day 8**
- [ ] Create Redis caching helpers for courier rates
- [ ] Create `rate_cache` backup table in PostgreSQL
- [ ] Add database indexes on all foreign keys and frequently queried columns
- [ ] Document all new database tables in `schema.sql`

**Day 9**
- [ ] Create BullMQ job queue setup using Redis
- [ ] Create `tracking-poll` queue for couriers without webhooks
- [ ] Set up polling job that runs every 15 minutes
- [ ] Test: confirm BullMQ dashboard shows jobs running

**Day 10**
- [ ] Create `wallet_transactions` table migration
- [ ] Create `cod_collections` table migration
- [ ] Create `disputes` table migration
- [ ] Create `sponsored_campaigns` table migration
- [ ] Run all migrations and verify all tables in pgAdmin

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
- [ ] Create `POST /auth/refresh` route
- [ ] Create `POST /auth/logout` route
- [ ] Test full OTP flow in Postman

**Day 5**
- [x] Create `middleware/auth.middleware.ts` that verifies JWT on every protected route
- [ ] Create `POST /users/register` route
- [ ] Create `GET /users/profile` route protected by auth middleware
- [ ] Create `PATCH /users/profile` route
- [ ] Test: login with OTP then call profile endpoint with JWT token

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
- [ ] Create `integrations/payments/razorpay.client.ts` with createOrder and verifyWebhookSignature
- [ ] Test Razorpay: call createOrder and confirm real order ID returned in sandbox
- [ ] Create `integrations/notifications/sms.client.ts` with sendOtpSms function
- [ ] Test SMS: send OTP to your own phone number and confirm received

**Day 2**
- [ ] Create `integrations/notifications/whatsapp.client.ts` using Gupshup API
- [ ] Build sendWhatsApp function and pre-built helpers for booking confirmation, delivery OTP, out for delivery, delivered, COD payout
- [ ] Test: send WhatsApp message to your own number
- [ ] Create `integrations/notifications/push.client.ts` using Firebase Admin SDK
- [ ] Test: send push notification to test Android device and confirm received

**Day 3**
- [ ] Create `integrations/kyc/digio.client.ts` with initiateKyc and verifyKycOtp
- [ ] Test full KYC flow in Digio sandbox with test Aadhaar number 999999990019 and OTP 123456
- [ ] Create `integrations/notifications/email.client.ts` using SendGrid
- [ ] Test: send email to your own inbox and confirm received

**Day 4**
- [ ] Create `integrations/vectors/pinecone.client.ts` with searchAddresses function
- [ ] Calls Python embedder on port 5001, gets vector, queries Pinecone, returns top 5 addresses
- [ ] Test: search near India Gate Delhi and confirm Delhi addresses returned
- [ ] Create `integrations/couriers/delhivery.client.ts` with getDelhiveryRates and createDelhiveryBooking
- [ ] Every API call must have timeout 3000 and try catch that returns null on failure
- [ ] Test: get rates for Delhi pincode 110001 to Mumbai pincode 400001

**Day 5**
- [ ] Create `integrations/couriers/dtdc.client.ts` for second courier
- [ ] Create `integrations/couriers/rates.aggregator.ts` calling all couriers using Promise.allSettled
- [ ] Create `integrations/ulip/ulip.client.ts` as a mock stub since credentials take 7 to 14 days
- [ ] Write `integrations/README.md` with all function signatures and usage examples
- [ ] Confirm all functions tested and working

### Week 2

**Day 6**
- [ ] Create `integrations/couriers/xpressbees.client.ts` for third courier
- [ ] Test all 3 courier rate functions return prices for Delhi to Mumbai
- [ ] Confirm rates aggregator returns results from at least 2 couriers when one fails

**Day 7**
- [ ] Create `POST /payments/initiate` route working with BE2
- [ ] Create `POST /payments/webhook` route with Razorpay signature verification
- [ ] Build Evidence Vault upload: `POST /evidence/upload` accepting file buffer
- [ ] Compute SHA256 hash before upload using crypto
- [ ] Upload to S3 via BE1 client and store URL and hash in database

**Day 8**
- [ ] Create tracking webhook handler `POST /tracking/webhooks/delhivery`
- [ ] Parse Delhivery payload, extract AWB and status, save to MongoDB
- [ ] Create tracking webhook handler `POST /tracking/webhooks/dtdc`
- [ ] Set up BullMQ polling job for DTDC every 15 minutes

**Day 9**
- [ ] Create `integrations/couriers/reverse.client.ts` for return shipment booking
- [ ] Book return pickup with Delhivery and get return AWB number
- [ ] Create COD payout automation querying pending collections
- [ ] Call Cashfree to initiate bank transfer for COD payouts

**Day 10**
- [ ] Create Kafka consumer for `notification-events` topic
- [ ] Build notification dispatcher reading event type and calling correct channel
- [ ] Test all 10 notification event types: booking confirmed, picked up, in transit, out for delivery, delivered, delayed, RTO, COD collected, payout sent, delivery OTP
- [ ] Share final Postman collection with all 6 developers

---

## Week 1 Exit Checklist — All Must Pass Before Week 2

- [x] docker compose ps shows all 6 services running on every developer machine
- [ ] All 6 database tables exist and visible in pgAdmin
- [x] `GET /health` returns db ok, redis ok, kafka ok, mongodb ok
- [x] `POST /auth/send-otp` stores OTP in Redis and returns success
- [x] `POST /auth/verify-otp` returns valid JWT access token
- [ ] `POST /users/register` saves user to PostgreSQL
- [ ] `GET /users/profile` returns user data when JWT token provided
- [ ] `GET /users/profile` returns 401 when no token provided
- [ ] Razorpay createOrder returns real order ID in sandbox
- [ ] MSG91 sends real OTP SMS to a real Indian phone number
- [ ] Firebase push notification received on test Android device
- [ ] Digio KYC flow completes in sandbox with test credentials
- [ ] Pinecone searchAddresses returns correct results for landmark queries
- [ ] Python embedder running on port 5001 and returning vectors
- [ ] All infrastructure exports working and confirmed by BE2 and BE3

## Week 2 Exit Checklist — All Must Pass Before Week 3

- [ ] `GET /couriers/rates` returns prices from at least 2 couriers in under 3 seconds
- [ ] Second request to `GET /couriers/rates` returns cached result instantly
- [ ] `POST /shipments/create` saves draft shipment to PostgreSQL
- [ ] `POST /payments/initiate` returns Razorpay order ID
- [ ] `POST /payments/webhook` verifies signature and updates payment status
- [ ] After payment webhook AWB number saved to shipment record
- [ ] `GET /tracking/:awb` returns tracking events from MongoDB
- [ ] Delhivery webhook received and saved to MongoDB
- [ ] Delivery OTP generated when status changes to out for delivery
- [ ] Evidence Vault file upload saves to MinIO and returns SHA256 hash
- [ ] Address search returns results for landmark queries
- [ ] Pincode check returns serviceable true for major Indian cities
- [ ] All 10 notification types send correct messages on correct channels
- [ ] COD payout triggers Cashfree transfer after delivery confirmed
- [ ] Postman collection with all endpoints shared with all 6 developers
