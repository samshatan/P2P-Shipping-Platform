# 🚚 PARCEL — P2P Shipping Platform

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
npm run dev
# Opens at http://localhost:5173
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
Starts PostgreSQL (5432), Redis (6379), etc.
```bash
cd server
docker compose up -d
```

### Running the Backend
```bash
cd server
npm install
npm run dev
# Server running at http://localhost:3001
```

---

## 👥 Backend Developer Assignments & Roadmap

### 🗓️ Phase 1: Foundation (COMPLETED)
- [x] Server initialization (Express, TS, Middleware)
- [x] Database & Redis connectivity (Raw SQL)
- [x] `POST /auth/send-otp` (Redis storage, Dev check)
- [x] `POST /auth/verify-otp` (JWT issuance, User Upsert)
- [x] `authMiddleware.ts` (JWT verification)

---

### 🗓️ Phase 2: Core Logic (IN PROGRESS)

#### 👤 Developer 1 — Identity & Users
- [ ] `GET /users/profile`: Get logged-in user details.
- [ ] `PUT /users/profile`: Update name, email.
- [ ] `GET /users/addresses`: List saved addresses.
- [ ] `POST /users/addresses`: Add new address.
- [ ] `POST /users/kyc/initiate`: Aadhaar KYC via Digio.

#### 📦 Developer 2 — Logistics & Rates
- [ ] `GET /couriers/rates`: Fetch rates (Fake → Real Delhivery).
- [ ] `POST /shipments/create`: Create draft shipment + AWB.
- [ ] `GET /users/shipments`: Paginated shipment history.
- [ ] `GET /tracking/:awb`: Real-time tracking status.

#### 💳 Developer 3 — Payments & Wallet (Priority)
- [ ] `POST /payments/initiate`: Create Razorpay order (amounts in PAISE).
- [ ] `POST /payments/webhook`: **Vital Security** - Verify signature & update status.
- [ ] `GET /users/wallet`: Balance + Transaction history.
- [ ] `POST /users/wallet/topup`: Atomic wallet credit via SQL transactions.

---

## ⚠️ Key Developer Rules
1. **Raw SQL ONLY**: Do not use Prisma. Use `src/lib/db.ts` for all database interactions.
2. **Amounts**: All payment amounts to Razorpay must be in **PAISE** (`amount × 100`).
3. **Webhooks**: Always verify Razorpay signatures using `x-razorpay-signature`.
4. **Transactions**: Use `db.query('BEGIN')` / `db.query('COMMIT')` for wallet balance changes.
5. **Security**: Never log sensitive data like JWT secrets or OTPs.

---

## 📜 API Contract & Schema
The API follows the predefined contract in `server/contracts/api-contracts.md`. Database schemas are managed via manual SQL migrations located in `server/scripts/`.