// ─────────────────────────────────────────────
//  Shared TypeScript interfaces & response helpers
// ─────────────────────────────────────────────

// ── Response helpers ─────────────────────────

export const successResponse = <T>(data: T) => ({
  success: true as const,
  data,
});

export const errorResponse = (code: string, message: string) => ({
  success: false as const,
  error: { code, message },
});

// ── Domain interfaces ─────────────────────────

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: string;
  kyc_status: string;
  wallet_balance: number;
  referral_code: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  name: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  area: string;
  flat: string | null;
  is_default: boolean;
  created_at: Date;
}

export interface Shipment {
  id: string;
  user_id: string;
  awb: string | null;
  pickup_address_id: string | null;
  delivery_address_id: string | null;
  courier_id: string | null;
  weight_grams: number;
  dimensions_cm: { l: number; w: number; h: number } | null;
  cod_amount: number;
  status: string;
  payment_status: string;
  payment_id: string | null;
  charge: number | null;
  courier_service: string | null;
  parcel_type: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  shipment_id: string | null;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string | null;
  status: string;
  created_at: Date;
}
