-- 🚚 SwiftRoute (PARCEL) Full Core Schema (17 Tables)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (clean reset)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;
DROP TABLE IF EXISTS referral_earnings CASCADE;
DROP TABLE IF EXISTS insurance_claims CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS notifications_log CASCADE;
DROP TABLE IF EXISTS sponsored_campaigns CASCADE;
DROP TABLE IF EXISTS evidence_vault CASCADE;
DROP TABLE IF EXISTS cod_remittances CASCADE;
DROP TABLE IF EXISTS cod_collections CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS couriers CASCADE;
DROP TABLE IF EXISTS pincodes CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(20) DEFAULT 'USER', -- USER, ADMIN, PARTNER
    kyc_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, INITIATED, VERIFIED, REJECTED
    wallet_balance DECIMAL(15, 2) DEFAULT 0.00,
    referral_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50), -- Home, Work, Warehouse
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    state VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    area TEXT NOT NULL,
    flat VARCHAR(100),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Pincodes Table
CREATE TABLE IF NOT EXISTS pincodes (
    pincode VARCHAR(10) PRIMARY KEY,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    is_serviceable BOOLEAN DEFAULT true,
    zone VARCHAR(20), -- North, South, East, West
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Couriers Table
CREATE TABLE IF NOT EXISTS couriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- delhivery, dtdc, xpressbees
    rating DECIMAL(3, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    api_config JSONB, -- For carrier specific settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    awb VARCHAR(50) UNIQUE, -- Nullable for drafts
    pickup_address_id UUID REFERENCES addresses(id),
    delivery_address_id UUID REFERENCES addresses(id),
    courier_id UUID REFERENCES couriers(id),
    weight_grams INTEGER NOT NULL,
    dimensions_cm JSONB, -- {l, w, h}
    cod_amount DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, BOOKED, PICKED_UP, IN_TRANSIT, DELIVERED, RTO, CANCELLED
    payment_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
    payment_id VARCHAR(100), -- Razorpay Order ID
    charge DECIMAL(15,2),          -- price charged to user
    courier_service VARCHAR(50),   -- e.g. "Express", "Surface"
    parcel_type VARCHAR(50),       -- e.g. "document", "parcel"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Wallet Transactions Table (Atomic Balance Logs)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    shipment_id UUID REFERENCES shipments(id),
    type VARCHAR(20) NOT NULL, -- CREDIT, DEBIT
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'SUCCESS', -- SUCCESS, PENDING, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. COD Collections Table
CREATE TABLE IF NOT EXISTS cod_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id),
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COLLECTED, DEPOSITED
    collected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. COD Remittances Table (Payouts to Users)
CREATE TABLE IF NOT EXISTS cod_remittances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(15, 2) NOT NULL,
    bank_ref VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSING, PAID, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Evidence Vault Table
CREATE TABLE IF NOT EXISTS evidence_vault (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id),
    file_url TEXT NOT NULL,
    file_hash VARCHAR(64) NOT NULL, -- SHA256 of proof
    type VARCHAR(20) NOT NULL, -- PICKUP, DELIVERY, DAMAGE, DISPUTE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Sponsored Campaigns Table
CREATE TABLE IF NOT EXISTS sponsored_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    discount_pct DECIMAL(5, 2) NOT NULL,
    banner_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Notifications Log
CREATE TABLE IF NOT EXISTS notifications_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    shipment_id UUID REFERENCES shipments(id),
    channel VARCHAR(20) NOT NULL, -- SMS, WHATSAPP, PUSH, EMAIL
    type VARCHAR(50) NOT NULL, -- ORDER_BOOKED, OUT_FOR_DELIVERY, etc.
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'SENT', -- SENT, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id),
    user_id UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, RESOLVED, CLOSED
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Insurance Claims
CREATE TABLE IF NOT EXISTS insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id),
    amount_claimed DECIMAL(15, 2) NOT NULL,
    amount_approved DECIMAL(15, 2),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, PAID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Referral Earnings
CREATE TABLE IF NOT EXISTS referral_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id), -- Earner
    referred_id UUID REFERENCES users(id), -- User who signed up
    shipment_id UUID REFERENCES shipments(id), -- Optional: earn on referral's first shipment
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- PERCENTAGE, FLAT
    discount_value DECIMAL(15, 2) NOT NULL,
    min_order_value DECIMAL(15, 2) DEFAULT 0.00,
    max_discount DECIMAL(15, 2),
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'SUPPORT', -- SUPER_ADMIN, SUPPORT, BILLING, LOGISTICS
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL, -- e.g. "APPROVE_KYC", "CANCEL_SHIPMENT"
    resource_type VARCHAR(50) NOT NULL, -- e.g. "users", "shipments"
    resource_id UUID,
    payload JSONB, -- Logs what changed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Rate Cache Backup Table (warm fallback when Redis is cold)
CREATE TABLE IF NOT EXISTS rate_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pickup_pincode VARCHAR(10) NOT NULL,
    delivery_pincode VARCHAR(10) NOT NULL,
    weight_grams INTEGER NOT NULL,
    is_cod BOOLEAN DEFAULT false,
    payload JSONB NOT NULL,       -- Full AggregatedRatesResult JSON
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (pickup_pincode, delivery_pincode, weight_grams, is_cod)
);

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_shipments_user ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_awb ON shipments(awb);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_cod_status ON cod_collections(status);

-- Additional indexes for high-query columns (BE1 Day 8)
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_payment_status ON shipments(payment_status);
CREATE INDEX IF NOT EXISTS idx_shipments_courier ON shipments(courier_id);
CREATE INDEX IF NOT EXISTS idx_shipments_created ON shipments(created_at);
CREATE INDEX IF NOT EXISTS idx_pincodes_city ON pincodes(city);
CREATE INDEX IF NOT EXISTS idx_pincodes_state ON pincodes(state);
CREATE INDEX IF NOT EXISTS idx_pincodes_serviceable ON pincodes(is_serviceable);
CREATE INDEX IF NOT EXISTS idx_rate_cache_expiry ON rate_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_evidence_shipment ON evidence_vault(shipment_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_user ON disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications_log(type);
CREATE INDEX IF NOT EXISTS idx_cod_collections_shipment ON cod_collections(shipment_id);
