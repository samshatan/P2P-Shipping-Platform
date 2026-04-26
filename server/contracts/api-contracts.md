# SwiftRoute API Contracts
# Version: 1.1
# Last Updated: April 26, 2026
# Base URL: http://localhost:3001 (development)

---

## IMPORTANT RULES FOR ALL DEVELOPERS

1. Every request that needs login must send this header:
   Authorization: Bearer <your_jwt_token>

2. Every response follows this format:
   Success: { "success": true, "data": { ... } }
   Error:   { "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable message" } }

3. All amounts are in PAISE not rupees
   Example: Rs 114.46 = 11446 paise

4. All dates are in ISO 8601 format
   Example: "2025-03-22T14:30:00.000Z"

5. All IDs are UUIDs
   Example: "550e8400-e29b-41d4-a716-446655440000"

---

## ERROR CODES — ALL POSSIBLE ERROR CODES

AUTH_001 = Email address is invalid or missing
AUTH_002 = OTP has expired (5 minutes passed)
AUTH_003 = OTP is incorrect
AUTH_004 = Too many OTP attempts — account blocked for 30 minutes
AUTH_005 = JWT token is invalid or malformed
AUTH_006 = JWT token has expired — user must login again
AUTH_007 = User not found with this email
AUTH_008 = Account is suspended

USER_001 = User already exists with this email
USER_002 = User already exists with this email
USER_003 = KYC verification failed
USER_004 = Profile update failed — invalid data

SHIPMENT_001 = Pickup pincode not serviceable
SHIPMENT_002 = Delivery pincode not serviceable
SHIPMENT_003 = No couriers available for this route
SHIPMENT_004 = Shipment not found
SHIPMENT_005 = Shipment cannot be cancelled — already picked up
SHIPMENT_006 = Invalid weight — must be between 1 gram and 50000 grams
SHIPMENT_007 = AWB number not found

ADDRESS_001 = Pincode not found in database
ADDRESS_002 = Address not found
ADDRESS_003 = Cannot delete default address — set another as default first

VALIDATION_001 = Required field missing
VALIDATION_002 = Invalid field format
VALIDATION_003 = Field value out of allowed range

SERVER_001 = Internal server error — try again
SERVER_002 = Service temporarily unavailable
SERVER_003 = Courier API is down — try again in a few minutes

---

## ═══════════════════════════════════
## SECTION 1 — AUTH APIs
## ═══════════════════════════════════

### POST /auth/send-otp
Send OTP to an email address.

REQUEST BODY:
{ "email": "user@example.com" }

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "message": "OTP sent successfully", "expires_in": 300 }
}


### POST /auth/verify-otp
Verify email OTP and get tokens.

REQUEST BODY:
{ "email": "user@example.com", "otp": "123456" }

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "access_token": "...", "refresh_token": "...", "is_new_user": true }
}


### POST /auth/register
First-time registration via Google flow.

REQUEST BODY:
{
  "name": "Rahul Sharma",
  "email": "rahul@gmail.com"
}

SUCCESS RESPONSE (201):
{
  "success": true,
  "data": {
    "message": "User registered successfully",
    "user": { "id": "...", "name": "...", "email": "..." }
  }
}

---

## ═══════════════════════════════════
## SECTION 2 — USER APIs
## ═══════════════════════════════════

### GET /users/profile
Get logged-in user profile.

HEADERS: Authorization: Bearer <token>

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "user_id": "550e8400-...",
    "name": "Rahul Sharma",
    "email": "rahul@gmail.com",
    "phone": "9876543210",
    "role": "USER",
    "kyc_status": "verified",
    "referral_code": "RAHUL2024",
    "created_at": "2025-03-22T14:30:00.000Z"
  }
}


### PATCH /users/profile
Update user profile — name and email only.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "name": "Rahul Kumar",           // optional
  "email": "newemail@gmail.com"    // optional
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "user_id": "550e8400-...",
    "name": "Rahul Kumar",
    "email": "newemail@gmail.com",
    "updated_at": "2025-03-22T15:00:00.000Z"
  }
}


### POST /users/kyc/initiate
Start Aadhaar OTP KYC process.

REQUEST BODY:
{
  "aadhaar_number": "123456789012"
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "session_id": "digio_session_xxx",
    "message": "OTP sent to Aadhaar linked mobile number"
  }
}


### POST /users/kyc/verify
Verify Aadhaar OTP to complete KYC.

REQUEST BODY:
{
  "session_id": "digio_session_xxx",
  "otp": "123456"
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "kyc_status": "verified",
    "message": "KYC verified successfully"
  }
}

---

## ═══════════════════════════════════
## SECTION 3 — ADDRESS APIs
## ═══════════════════════════════════

### POST /address/search
Search for an address landmark.

REQUEST BODY:
{ "query": "near India Gate Delhi" }

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "results": [ { "address": "India Gate, New Delhi", "pincode": "110001", "city": "Delhi" } ]
  }
}


### GET /pincodes/check
Check if both pincodes are serviceable.

QUERY PARAMS: pickup=110001&delivery=400001

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "both_serviceable": true }
}

---

## ═══════════════════════════════════
## SECTION 4 — COURIER RATE APIs
## ═══════════════════════════════════

### GET /couriers/rates
Get shipping rates from couriers.

QUERY PARAMS:
pickup=110001, delivery=400001, weight=1000, is_cod=false

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "couriers": [
      {
        "courier_id": "delhivery",
        "courier_name": "Delhivery",
        "price_paise": 8900,
        "ai_eta_days": 4,
        "cod_available": true
      }
    ]
  }
}

---

## ═══════════════════════════════════
## SECTION 5 — SHIPMENT APIs
## ═══════════════════════════════════

### POST /shipments/create
Create a shipment record.

REQUEST BODY:
{
  "pickup_address": { ... },
  "delivery_address": { ... },
  "courier_id": "delhivery",
  "weight_grams": 1000,
  "parcel_type": "parcel",
  "is_cod": false,
  "amount_paise": 8900
}

SUCCESS RESPONSE (201):
{
  "success": true,
  "data": {
    "shipment_id": "550e8400-...",
    "status": "draft",
    "awb": "AWB123IN"
  }
}


### POST /shipments/:id/book
Book the shipment with the courier.

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "shipment_id": "...",
    "awb": "...",
    "status": "booked",
    "label_url": "...",
    "delivery_otp": "123456"
  }
}


### GET /shipments/:id
Get shipment details.

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "shipment": {
      "id": "...",
      "status": "booked",
      "awb_number": "...",
      "pickup_address": { ... },
      "delivery_address": { ... },
      "total_amount": 8900
    }
  }
}


### GET /users/shipments
List shipments for logged-in user.

QUERY PARAMS: page=1, limit=10, status=draft

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "shipments": [ { ... } ], "pagination": { ... } }
}


### POST /shipments/:id/cancel
Cancel a shipment.

REQUEST BODY: { "reason": "..." }

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "message": "Shipment cancelled successfully", "shipment_id": "..." }
}


### POST /shipments/:id/confirm-delivery
Confirm delivery via OTP.

REQUEST BODY: { "otp": "123456" }

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "status": "delivered", "delivered_at": "..." }
}

---

## ═══════════════════════════════════
## SECTION 6 — TRACKING APIs
## ═══════════════════════════════════

### GET /shipments/:id/tracking
Get unified tracking timeline.

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "awb": "...",
    "current_status": "out_for_delivery",
    "events": [ { "status": "...", "location": "...", "timestamp": "..." } ]
  }
}


### POST /tracking/webhooks/delhivery
Webhook for status updates.

---

## ═══════════════════════════════════
## SECTION 7 — DISPUTES APIs
## ═══════════════════════════════════

### POST /disputes
Raise a dispute for a shipment.

REQUEST BODY:
{
  "shipment_id": "...",
  "type": "weight_mismatch",
  "description": "..."
}

SUCCESS RESPONSE (201):
{
  "success": true,
  "data": { "dispute_id": "...", "status": "OPEN" }
}


### GET /disputes
List all disputes for user.

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "disputes": [ { ... } ] }
}


### GET /disputes/:id
Get dispute details.

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "dispute": { ... } }
}

---

## ═══════════════════════════════════
## SECTION 8 — AI APIs
## ═══════════════════════════════════

### POST /ai/predict-eta
Get AI predicted delivery time.

REQUEST BODY:
{
  "courier_id": "delhivery",
  "pickup_pincode": "110001",
  "delivery_pincode": "400001",
  "weight_grams": 1000
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "predicted_days": 4, "confidence": 0.82 }
}

---

## ═══════════════════════════════════
## SECTION 9 — HEALTH & MISC
## ═══════════════════════════════════

### GET /health
Server health check.

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "status": "ok", "services": { "database": "connected", "redis": "connected" } }
}