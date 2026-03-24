# Frontend Readiness Evaluation

Here is the objective evaluation of the `client` codebase against the strict checklist criteria.

---

## PART 1: UI Screens Check 📱

### WEB APP
**Auth Screens**
- [x] Login page (phone + OTP UI exists)
- [x] Sign up page (wizard exists)
- [ ] KYC page (Missing)
- [ ] Forgot password screen (Missing)
- [ ] OTP expired / resend screen (Missing)

**Main Booking Flow**
- [x] Landing page with Domestic/International toggle
- [x] Domestic & International booking forms
- [ ] Address search works (Missing — inputs are static UI)
- [ ] Pincode not serviceable error screen (Missing)
- [x] Courier comparison results
- [x] Booking confirmation page
- [x] Evidence Vault upload screen
- [x] Payment page
- [ ] Payment success/failed pages (Missing)

**Tracking**
- [x] My Shipments page
- [x] Tracking detail page
- [ ] Delivery OTP confirmation screen (Missing)

**Account**
- [x] User profile page
- [ ] Edit profile screen (Missing)
- [ ] Address book management (Missing)
- [ ] Wallet page (Missing)
- [ ] Notifications, Help, Referral pages (Missing)

**COD and Returns**
- [x] COD management page
- [ ] Initiate return / Dispute raise screens (Missing)

---

## PART 2: Technical Checks Breakdown ⚙️

The frontend is currently a **static UI prototype** and fails the technical integration checks. Here is exactly what is wrong and why:

### 1. Hardcoded API Paths & No Environment Variables
**Where:** `src/app/(dashboard)/book/courier/page.tsx`
**The Problem:** The code makes a call to a dead relative path (`fetch("/api/rates")`) instead of hitting the real backend URL (`http://localhost:3001/couriers/rates`). 
**Why it fails:** It should utilize an environment variable like `import.meta.env.VITE_API_URL`. This current approach will break instantly in production.

### 2. Incorrect Request Body Formats
**Where:** `src/app/(dashboard)/book/courier/page.tsx`
**The Problem:** The frontend sends variables that do not match the API Contract:
```javascript
{
  pickupPincode: "400001",
  deliveryPincode: "110001",
  weight: 1.5,
  type: "PARCEL",
  isCod: false
}
```
**Why it fails:** The contract specifically expects `pickup` and `delivery`, and strictly requires `weight` in **grams** (1500), not kilograms (1.5).

### 3. Missing Authorization Headers
**Where:** Everywhere in the codebase
**The Problem:** There is no `Authorization: Bearer <token>` header being sent, nor is there any authentication state management tracking the user's login session.
**Why it fails:** Without this header, the backend will reject every protected request with a `401 Unauthorized` error. 

### 4. Amounts are using Rupees instead of Paise
**Where:** `src/app/(dashboard)/book/review/page.tsx`
**The Problem:** Payment logic is fully hardcoded using Rupees (Floats):
```javascript
const baseShipping = 45.00;
const fuelSurcharge = 12.50;
const subtotal = baseShipping + fuelSurcharge;
```
**Why it fails:** The contract states amounts must be calculated in **PAISE** (integers) to avoid severe financial javascript decimal precision errors (e.g. `10502` instead of `105.02`). 

### 5. No Mock Server (Option 3 is being used)
**Where:** `src/app/(dashboard)/dashboard/page.tsx` and `book/address/page.tsx`
**The Problem:** Instead of using a Mock Service Worker (MSW), the app relies on static dummy arrays hardcoded straight into the React components (e.g., `const activeShipments = [...]`).
**Why it fails:** Without intercepted network requests, you cannot test real application behaviors like network offline states, latency, or 500 API errors.

---

## Actionability & Next Steps 🚀

**For the Frontend Developer:**
1. Install **MSW** (`npm install msw --save-dev`).
2. Implement `handlers.js` to mock the API exactly to the `api-contracts.md`.
3. Create a global API utility (e.g., Axios instance) that automatically attaches `Authorization: Bearer <token>` to all requests.
4. Replace all hardcoded values (`₹45.00`, static addresses) with dynamic state fetching from the MSW mock APIs.
5. Create a `.env.local` to manage the API URL across environments.
