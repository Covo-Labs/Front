// API configuration
const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
export const API_BASE_URL = rawApiBaseUrl.endsWith('/') ? rawApiBaseUrl.slice(0, -1) : rawApiBaseUrl;

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  
  // Rooms
  ROOMS: '/api/rooms',
  ROOM: (id: string) => `/api/rooms/${id}`,
  ROOM_MESSAGES: (id: string) => `/api/rooms/${id}/messages`,
  ROOM_INVITE: (id: string) => `/api/rooms/${id}/invite`,
  
  // Invites
  INVITES: '/api/invites',
  INVITE_ACCEPT: (id: string) => `/api/invites/${id}/accept`,
} as const; 