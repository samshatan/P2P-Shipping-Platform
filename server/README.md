# SwiftRoute: P2P Shipping Platform (Backend)

Welcome to the SwiftRoute backend. This project is built with **Node.js, Express, TypeScript, and Prisma**.

## 🚀 Quick Setup
Run these commands to get your local environment ready:
```bash
npm install
cp .env.example .env
docker-compose up -d
npx prisma generate
npx prisma migrate dev
npm run dev
```

## 👥 Team Task Assignments
Each developer is responsible for a specific domain to ensure speed and avoid code conflicts.

### 👤 Developer 1: Authentication & Identity
- **Folder**: `src/api/auth` and `src/api/users`
- **Tasks**:
  - `authMiddleware.ts` for route protection.
  - Registration and Login endpoints (using Bcrypt).
  - User profiles and KYC update logic.

### 📦 Developer 2: Logistics & Operations
- **Folder**: `src/api/shipments`, `src/api/tracking`, and `src/api/couriers`
- **Tasks**:
  - Shipment booking and listing APIs.
  - Tracking system (connecting to Kafka).
  - Integration with the **Delhivery** courier API.

### 💳 Developer 3: FinTech & Payments
- **Folder**: `src/api/payments`, `src/api/wallet`, and `src/api/cod`
- **Tasks**:
  - Internal wallet logic (credit/debit balances).
  - Razorpay payment gateway integration.
  - COD (Cash on Delivery) transaction flows.

---

## 🛠️ Project Structure
- `src/api/`: Feature-specific modules (where most work happens).
- `src/lib/`: Shared utility instances (Prisma, Redis, etc.).
- `src/middleware/`: Global and route-specific middlewares.
- `prisma/`: Database schema and migrations.

## ⚠️ Important Rules
1. **Schema Changes**: If you update `prisma/schema.prisma`, tell the team immediately so they can run `npx prisma generate`.
2. **Environment**: Update `.env.example` if you add any new environment variables.
3. **TS Errors**: If VS Code shows red squiggles after generating Prisma, run **"TypeScript: Restart TS Server"** from the Command Palette (`Ctrl+Shift+P`).
