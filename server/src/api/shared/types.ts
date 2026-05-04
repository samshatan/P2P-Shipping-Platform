
export type UserRole = 'USER' | 'ADMIN' | 'PARTNER' | 'SUPPORT';



export type ShipmentStatus =
    | 'DRAFT'
    | 'BOOKED'
    | 'PICKUP_PENDING'
    | 'IN_TRANSIT'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'EXCEPTION'
    | 'RETURNED'
    | 'CANCELLED'
    | 'PAYMENT_FAILED';

export type ParcelType = 'DOCUMENT' | 'PARCEL' | 'FRAGILE';

export type PaymentMethod = 'RAZORPAY' | 'WALLET' | 'COD';

export type PaymentStatus = 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED';



export type DisputeType =
    | 'WEIGHT_MISMATCH'
    | 'DAMAGE'
    | 'MISSING_ITEM'
    | 'LATE_DELIVERY'
    | 'OTHER';

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export type NotificationChannel = 'SMS' | 'WHATSAPP' | 'PUSH' | 'EMAIL';


export interface User {
    id: string;
    phone: string;
    name?: string;
    email?: string;
    role: UserRole;
    referral_code?: string;
    created_at: string;
}

export interface Address {
    name: string;
    phone: string;
    flat: string;
    area: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
}

export interface SavedAddress extends Address {
    id: string;
    user_id: string;
    is_default: boolean;
    created_at: string;
}

export interface Shipment {
    id: string;
    user_id: string;
    awb_number: string;
    status: ShipmentStatus;
    courier_id: string;
    courier_name?: string;
    pickup_address: Address;
    delivery_address: Address;
    weight: number;                 // in grams
    dimensions?: string;            // e.g. "30x20x10"
    parcel_type: ParcelType;
    is_cod: boolean;
    cod_amount: number;             // in paise
    total_amount: number;           // in paise
    payment_method?: PaymentMethod;
    razorpay_order_id?: string;
    label_url?: string;
    delivery_otp?: string;
    booked_at?: string;
    delivered_at?: string;
    cancelled_at?: string;
    cancel_reason?: string;
    created_at: string;
}

export interface Payment {
    id: string;
    shipment_id: string;
    razorpay_order_id: string;
    razorpay_payment_id?: string;
    amount_paise: number;
    status: PaymentStatus;
    created_at: string;
}



export interface Dispute {
    id: string;
    user_id: string;
    shipment_id: string;
    type: DisputeType;
    status: DisputeStatus;
    description: string;
    evidence_urls: string[];
    created_at: string;
}

export interface CourierPartner {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    is_active: boolean;
    markup_percent: number;
    created_at: string;
}

export interface TrackingEvent {
    awb_number: string;
    status: string;
    location?: string;
    description?: string;
    timestamp: string;
}

export interface EddPrediction {
    pickup_pincode: string;
    delivery_pincode: string;
    courier_slug: string;
    weight_grams: number;
    predicted_days: number;
    confidence: number;             // 0–1
    predicted_delivery_date: string; // ISO date
}


export interface ApiSuccess<T = unknown> {
    success: true;
    data: T;
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export function successResponse<T>(data: T): ApiSuccess<T> {
    return { success: true, data };
}

export function errorResponse(code: string, message: string, details?: unknown): ApiError {
    return {
        success: false,
        error: { code, message, ...(details !== undefined ? { details } : {}) },
    };
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationMeta;
}


export function parsePagination(query: Record<string, unknown>): {
    page: number;
    limit: number;
    offset: number;
} {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const limit = Math.min(50, parseInt(query.limit as string) || 10);
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}
