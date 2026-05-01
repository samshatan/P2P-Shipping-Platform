// Central API Configuration
// This ensures that the frontend knows which backend to talk to 
// without hardcoding localhost in every file.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  TRACKING: `${API_BASE_URL}/tracking`,
  SHIPMENTS: `${API_BASE_URL}/shipments`,
  USERS: `${API_BASE_URL}/users`,
  AUTH: `${API_BASE_URL}/auth`,
  ADMIN: `${API_BASE_URL}/admin`,
  COURIERS: `${API_BASE_URL}/couriers`,
};
