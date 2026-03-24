# 🛠️ Backend Developer Plan — Week 1 & Week 2

This document is for the 3 backend developers building the server for the PARCEL shipping platform.
Read the full API contract at: `server/contracts/api-contracts.md`

---

## 👥 Developer Assignments

| Developer | Module | Endpoints |
|---|---|---|
| **Dev 1** | Auth + Users + KYC | `/auth/*`, `/users/*` |
| **Dev 2** | Couriers + Shipments + Tracking | `/couriers/*`, `/shipments/*`, `/tracking/*` |
| **Dev 3** | Payments + Wallet | `/payments/*`, `/users/wallet/*` |

---

## ⚙️ Technology Stack

| Layer | Technology | Why |
|---|---|---|
| **Runtime** | Node.js 20 | Same language as frontend, huge ecosystem |
| **Framework** | Express.js | Lightweight, fast to set up |
| **Language** | TypeScript | Type safety, matches frontend |
| **ORM** | Prisma | Schema already exists in repo |
| **Primary DB** | PostgreSQL | Relational data (users, shipments, payments) |
| **Cache** | Redis | OTP storage, JWT sessions, rate limiting |
| **File Storage** | MinIO (local) / AWS S3 (prod) | Evidence Vault uploads |
| **Auth** | JWT | Access token (15 min) + Refresh token (7 days) |
| **Payments** | Razorpay | Order creation + webhook |
| **OTP SMS** | MSG91 | Send OTP to user's phone |
| **KYC** | Digio API | Aadhaar eKYC verification |
| **Email** | SendGrid | Booking receipts |

All infrastructure (Postgres, Redis, MinIO, Kafka) is already defined in `server/docker-compose.yml`. Just run `docker compose up -d`.

---

## 📁 Folder Structure

```
server/
├── src/
│   ├── api/
│   │   ├── auth/           → Dev 1
│   │   ├── users/          → Dev 1
│   │   ├── couriers/       → Dev 2
│   │   ├── shipments/      → Dev 2
│   │   ├── tracking/       → Dev 2
│   │   ├── payments/       → Dev 3
│   │   └── wallet/         → Dev 3
│   ├── middleware/
│   │   ├── auth.ts         → JWT verification (shared by all)
│   │   └── errorHandler.ts
│   ├── lib/
│   │   ├── prisma.ts       → Prisma client
│   │   ├── redis.ts        → Redis client
│   │   └── razorpay.ts     → Razorpay client
│   └── index.ts            → Server entry point (port 3001)
├── prisma/
│   └── schema.prisma
└── .env
```

---

# 📅 WEEK 1 — Foundation & Core Auth

**Goal:** Server is running, database connected, OTP login works end-to-end, frontend can log in against the real backend.

---

## Day 1 — Project Setup (ALL 3 DEVS together)

**What to do:**
- Initialize the Node.js + TypeScript + Express project inside `server/`
- Install all dependencies: `express`, `prisma`, `ioredis`, `jsonwebtoken`, `bcryptjs`, `cors`, `helmet`, `dotenv`
- Configure `tsconfig.json` for TypeScript
- Set up `nodemon` or `ts-node-dev` for auto-restart on file changes
- Run `docker compose up -d` to start PostgreSQL and Redis
- Run `npx prisma migrate dev` to create all database tables from the schema
- Create a `GET /health` endpoint that returns `{ status: "ok" }`

**✅ Checkpoint:** Server starts on port 3001. Hitting `/health` returns success response.

---

## Day 2 — Send OTP Endpoint (DEV 1)

**What to build:** `POST /auth/send-otp`

**Logic:**
1. Receive phone number in request body
2. Validate it is exactly 10 digits
3. Generate a random 6-digit OTP
4. Store the OTP in Redis with a **5-minute expiry** using key `otp:{phone}`
5. For now, just `console.log` the OTP instead of calling MSG91 (real SMS comes in Week 2)
6. Return success response with `expires_in: 300`

**✅ Checkpoint:** Send a phone number → OTP printed in terminal → OTP visible in Redis.

---

## Day 3 — Verify OTP + JWT + Auth Middleware (DEV 1)

**What to build:** `POST /auth/verify-otp` + shared `authMiddleware`

**Logic for verify-otp:**
1. Receive phone + OTP in request body
2. Look up OTP from Redis using key `otp:{phone}`
3. If not found or doesn't match → return `401 INVALID_OTP`
4. Delete the OTP from Redis immediately (one-time use)
5. Find the user in the database. If not found, create a new user record
6. Sign a JWT Access Token (15 min expiry) and Refresh Token (7 day expiry)
7. Return both tokens + `user_id` + `is_new_user` flag

**Logic for authMiddleware:**
1. Read the `Authorization: Bearer <token>` header from every request
2. If missing → return `401 UNAUTHORIZED`
3. Verify the JWT signature using `JWT_SECRET`
4. If expired → return `401 TOKEN_EXPIRED`
5. Attach decoded user info (`userId`, `phone`, `role`) to the request object
6. Call `next()` to continue

**✅ Checkpoint:** Full auth flow works in Postman. Send OTP → verify → receive JWT → use JWT on a protected test route.

---

## Day 4 — Fake Courier Rates (DEV 2) + Razorpay Setup (DEV 3)

### DEV 2: `GET /couriers/rates`

**What to build:** Return hardcoded fake courier data (real Delhivery API call comes in Week 2)

**Query params to accept:** `pickup`, `delivery`, `weight` (in grams)

**Response must match `api-contracts.md` format exactly:**
- `courier_id`, `courier_name`, `price_paise`, `official_eta_days`, `ai_eta_days`, `cod_available`, `rating`, `is_sponsored`, `tags`

**✅ Checkpoint:** `GET /couriers/rates?pickup=110001&delivery=400001&weight=1500` returns a list of 2–3 fake couriers.

### DEV 3: `POST /payments/initiate`

**What to build:** Create a Razorpay test order

**Logic:**
1. Receive `amount_paise` and `shipment_id` in request body
2. Call Razorpay `orders.create()` with the amount **in paise**
3. Return `order_id`, `amount_paise`, `razorpay_key`, `currency: "INR"`

**Important:** Sign up for a Razorpay test account. All payments in test mode use fake money.

**✅ Checkpoint:** `POST /payments/initiate` returns a real Razorpay order ID in test mode.

---

## Day 5 — Frontend Integration Test (ALL 3 DEVS)

**What to do:**
- Update `client/.env.local`: set `VITE_API_URL=http://localhost:3001`
- Open the frontend and go through the login flow — it should now hit the real backend
- Open browser DevTools → Network tab and verify the JWT token is being sent in `Authorization` header
- Verify the courier rates page shows real (fake) data from the server response
- Fix any CORS errors that appear (add the frontend origin to the server's CORS config)

**✅ Week 1 Final Checklist:**
```
[ ] Server runs on port 3001 with no errors
[ ] All DB tables created (prisma migrate ran successfully)
[ ] POST /auth/send-otp → stores OTP in Redis, prints to console
[ ] POST /auth/verify-otp → returns valid JWT access + refresh token
[ ] authMiddleware blocks requests without Authorization header
[ ] GET /couriers/rates → returns fake data in correct api-contracts format
[ ] POST /payments/initiate → creates real Razorpay test order
[ ] Frontend login works against real backend (not MSW)
[ ] No CORS errors in browser DevTools
```

---

# 📅 WEEK 2 — Core Business Logic

**Goal:** A user can log in, select a courier, create a shipment, complete a payment, and see their tracking events — all with real data in the database.

---

## Day 6 — User Profile + Real OTP SMS (DEV 1)

**What to build:** `GET /users/profile`, `PUT /users/profile`

**GET /users/profile logic:**
1. Use the `userId` from the JWT (already decoded by `authMiddleware`)
2. Look up the user in the database by ID
3. Return: `user_id`, `name`, `phone`, `email`, `kyc_status`, `wallet_balance`, `referral_code`, `role`

**PUT /users/profile logic:**
1. Accept `name` and `email` in request body
2. Update the user record in the database
3. Return success message

**Replace fake OTP with real MSG91 call:**
- Read MSG91 documentation at `https://docs.msg91.com`
- Create a function in `src/lib/msg91.ts` that calls their OTP API with the phone number and OTP
- Replace the `console.log` in `send-otp` controller with this function

**✅ Checkpoint:** OTP delivered via real SMS. Profile endpoint returns real user data from DB.

---

## Day 7 — Address Book (DEV 1) + Create Shipment (DEV 2)

### DEV 1: Build Address Book endpoints

**Endpoints:** `GET`, `POST`, `PUT`, `DELETE /users/addresses`

All require the `authMiddleware`. Store addresses in the database linked to the user's ID.

Each address must have: `label` (Home/Work/Other), `name`, `phone`, `flat`, `area`, `city`, `state`, `pincode`, `country`

### DEV 2: Build `POST /shipments/create`

**Logic:**
1. Receive: `pickup_address`, `delivery_address`, `courier_id`, `weight`, `dimensions`, `parcel_type`, `is_cod`, `cod_amount`
2. Look up the courier partner in DB by `courier_id` — return 404 if not found
3. Generate a unique AWB number (format: `AWB` + timestamp + `IN`)
4. Create a Shipment record in DB with status `DRAFT`
5. Return: `shipment_id`, `awb`, `status: "draft"`, `amount_paise`

**✅ Checkpoint:** Can create a shipment record in database. Get back a real shipment ID and AWB number.

---

## Day 8 — Razorpay Webhook + Wallet Top-up (DEV 3)

### Build `POST /payments/webhook`

**This is the most critical security endpoint in the entire backend.**

**Logic:**
1. This route must use raw body middleware (not JSON parser) — Razorpay sends raw bytes
2. Read the `x-razorpay-signature` header from the incoming request
3. Generate an HMAC-SHA256 signature of the raw body using `RAZORPAY_WEBHOOK_SECRET`
4. **Compare the signatures** — if they don't match, return 400 and stop processing
5. Parse the event type — handle `payment.captured`
6. On `payment.captured`: update the linked shipment status to `BOOKED`, store payment amount

**⚠️ Warning:** Register this webhook route BEFORE `express.json()` middleware in `index.ts`

### Build Wallet Top-up `POST /users/wallet/topup`

**Logic:**
1. Accept an `amount` (in rupees) from the request
2. Create a Razorpay order for `amount × 100` (convert to paise)
3. On webhook success, credit the wallet: use a database transaction to safely add the amount to `walletBalance`

**✅ Checkpoint:** Razorpay test webhook fires → shipment status updates in DB. Wallet balance increases correctly.

---

## Day 9 — Real Tracking + Real Courier Rates (DEV 2)

### Build `GET /tracking/:awb`

**Logic:**
1. Look up shipment by AWB number in DB
2. Include all related `TrackingEvent` records, ordered by timestamp descending
3. Return: `awb`, `courier`, `current_status`, `current_location`, `official_eta`, `events[]`

Each event must have: `status`, `location`, `description`, `timestamp`

### Upgrade Courier Rates to Real Delhivery API

**Logic:**
1. Read Delhivery API documentation
2. Call their rate check API with `pickup`, `delivery`, `weight`
3. Normalize the Delhivery response to match the format defined in `api-contracts.md`
4. Cache the result in Redis for **10 minutes** to avoid calling the API on every request
5. Return the sorted list (cheapest first by default)

**✅ Checkpoint:** `GET /tracking/:awb` returns real tracking events from DB. Courier rates come from real Delhivery API (not hardcoded).

---

## Day 10 — Full End-to-End Test (ALL 3 DEVS)

Walk through the complete user journey on the live frontend:

1. Open the web app → Enter phone → Receive real SMS OTP → Log in successfully
2. Enter Delhi to Mumbai addresses → See real courier rates from Delhivery
3. Select a courier → Review the price breakdown → Click Pay
4. Complete a test payment via Razorpay → Booking confirmed with real AWB number
5. Go to My Shipments → shipment appears in the list with correct status
6. Click Track → See tracking timeline loaded from real DB records
7. Open Profile → Wallet top-up works → Balance updates

**✅ Week 2 Final Checklist:**
```
[ ] GET /users/profile returns real user data from DB
[ ] PUT /users/profile updates name and email in DB
[ ] Address book CRUD all working
[ ] POST /shipments/create creates real DB record with AWB
[ ] POST /payments/initiate creates Razorpay order
[ ] POST /payments/webhook verifies signature + updates shipment status
[ ] GET /tracking/:awb returns tracking events from DB
[ ] Courier rates come from real Delhivery API (not hardcoded)
[ ] Wallet top-up works and balance updates atomically
[ ] OTP delivered via real MSG91 SMS
[ ] Complete booking flow works on real frontend with zero MSW mocks
```

---

## ⚠️ 7 Rules Every Developer Must Follow

1. **Never commit `.env` to Git** — Add it to `.gitignore` on Day 1
2. **Razorpay amounts are always in PAISE** — 1 rupee = 100 paise. Send `8900` not `89`
3. **Always verify Razorpay webhook signatures** — Never trust a webhook without this check
4. **Use DB transactions for wallet operations** — Prevents race conditions and double-spend bugs
5. **Rate limit the OTP endpoint** — Maximum 3 requests per phone per hour
6. **Delete OTP from Redis after verification** — OTPs must be one-time use only
7. **Never log JWT tokens or raw OTPs** — These are security-sensitive values
