-- 🚚 SwiftRoute (PARCEL) Streamlined Core Schema (Aggregator Model)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (clean reset)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS notifications_log CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS couriers CASCADE;
DROP TABLE IF EXISTS pincodes CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS rate_cache CASCADE;

-- 1. Users Table (Optimized for Email-Only Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    phone VARCHAR(15), -- Optional phone
    username VARCHAR(50) UNIQUE,
    role VARCHAR(20) DEFAULT 'USER', -- USER, ADMIN, PARTNER
    kyc_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, INITIATED, VERIFIED, REJECTED
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
    country VARCHAR(100) DEFAULT 'India',
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

-- 5. Shipments Table (Aggregator Logic)
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
    is_cod BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, BOOKED, PICKED_UP, IN_TRANSIT, DELIVERED, RTO, CANCELLED
    charge DECIMAL(15,2),          -- Price quoted to user
    courier_service VARCHAR(50),   -- e.g. "Express", "Surface"
    parcel_type VARCHAR(50),       -- e.g. "document", "parcel"
    manifest_url TEXT,             -- Link to S3/MinIO PDF
    manifest_hash VARCHAR(64),      -- SHA256 of manifest for integrity
    delivery_otp VARCHAR(10),      -- Secure delivery verification
    booked_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Notifications Log
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

-- 7. Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id),
    user_id UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, RESOLVED, CLOSED
    resolution_notes TEXT,
    evidence_urls TEXT[], -- Generic array of proof links (replaces vault)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Admin Users Table
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

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL, -- e.g. "APPROVE_KYC", "CANCEL_SHIPMENT"
    resource_type VARCHAR(50) NOT NULL, -- e.g. "users", "shipments"
    resource_id UUID,
    payload JSONB, -- Logs what changed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Rate Cache Backup Table
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
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_shipments_user ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_awb ON shipments(awb);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_rate_cache_expiry ON rate_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_user ON disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_pincodes_serviceable ON pincodes(is_serviceable);
