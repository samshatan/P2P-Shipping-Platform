/// <reference types="vite/client" />
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = localStorage.getItem('access_token');
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Something went wrong. Please try again.');
  }

  return data;
}

export interface CourierRatePayload {
  pickup: string;
  delivery: string;
  weight: number; // in grams
  length?: number;
  width?: number;
  height?: number;
  is_cod?: boolean;
}

export async function getCourierRates(payload: CourierRatePayload) {
  const queryParams = new URLSearchParams();
  queryParams.append('pickup', payload.pickup);
  queryParams.append('delivery', payload.delivery);
  queryParams.append('weight', payload.weight.toString()); 
  
  if (payload.length !== undefined) queryParams.append('length', payload.length.toString());
  if (payload.width !== undefined) queryParams.append('width', payload.width.toString());
  if (payload.height !== undefined) queryParams.append('height', payload.height.toString());
  if (payload.is_cod !== undefined) queryParams.append('is_cod', payload.is_cod.toString());

  const data = await fetchAPI(`/couriers/rates?${queryParams.toString()}`);
  return data.data;
}

export async function getTracking(awb: string) {
  const data = await fetchAPI(`/tracking/${awb}`);
  return data.data;
}

export async function getDashboardData(page = 1, limit = 20, status?: string) {
  const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  
  // Convert frontend status format to API format if needed
  let apiStatus = status;
  if (status === 'Delivered') apiStatus = 'delivered';
  else if (status === 'In Transit') apiStatus = 'in_transit';
  else if (status === 'Out for Delivery') apiStatus = 'out_for_delivery';
  else if (status === 'Pending') apiStatus = 'pending';
  else if (status === 'Draft') apiStatus = 'draft';
  else if (status === 'Failed' || status === 'Cancelled') apiStatus = 'cancelled';
  
  if (apiStatus && apiStatus !== 'All') {
    queryParams.append('status', apiStatus.toLowerCase());
  }
  
  const data = await fetchAPI(`/users/shipments?${queryParams.toString()}`);
  return data.data; 
}

export async function loginUser(phone: string) {
  const data = await fetchAPI('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone })
  });
  return data.data;
}

export async function verifyOtp(phone: string, otp: string) {
  const data = await fetchAPI('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp })
  });
  return data.data;
}

export async function getUserProfile() {
  const data = await fetchAPI('/users/profile');
  return data.data;
}

export async function updateUserProfile(payload: { name?: string, email?: string }) {
  const data = await fetchAPI('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function getAddresses() {
  const data = await fetchAPI('/users/addresses');
  return data.data;
}

export async function addAddress(payload: any) {
  const data = await fetchAPI('/users/addresses', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function updateAddress(id: string, payload: any) {
  const data = await fetchAPI(`/users/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function deleteAddress(id: string) {
  const data = await fetchAPI(`/users/addresses/${id}`, {
    method: 'DELETE'
  });
  return data.data;
}

export async function getShipmentDetail(id: string) {
  const data = await fetchAPI(`/shipments/${id}`);
  return data.data;
}

export async function searchAddresses(query: string) {
  const data = await fetchAPI('/address/search', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
  return data.data;
}
