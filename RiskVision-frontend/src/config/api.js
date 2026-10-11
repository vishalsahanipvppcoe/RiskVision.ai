/**
 * RiskVision API Configuration
 * Centralizes all backend URL references to support both local dev and production hosting.
 */

// In development, default to local Flask server. In production, require configured VITE_API_URL.
const configuredUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim() : '';
const isDev = import.meta.env.DEV;

// Never fallback to localhost:5000 in production builds
export const API_BASE_URL = (configuredUrl || (isDev ? 'http://localhost:5000' : '')).replace(/\/$/, '');

// Helper boolean indicating whether backend API connection is defined
export const isBackendConfigured = Boolean(configuredUrl || isDev);

export const API_ENDPOINTS = {
  // Health & Diagnostics
  health: `${API_BASE_URL}/health`,

  // Auth endpoints
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  profile: `${API_BASE_URL}/auth/profile`,
  analytics: `${API_BASE_URL}/auth/analytics`,

  // Monitoring & Alerts
  alerts: `${API_BASE_URL}/alerts`,
  videoFeed: `${API_BASE_URL}/video_feed`,
  historyClips: `${API_BASE_URL}/history_clips`,

  // Media resolvers
  resolveMediaUrl: (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (!API_BASE_URL) return null;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  },
};

/**
 * Friendly error message helper for network / offline failures
 */
export const getErrorMessage = (error, defaultMsg = 'Operation failed') => {
  if (!isBackendConfigured) {
    return 'Backend host connection (VITE_API_URL) is not configured for this deployment.';
  }
  if (!error?.response) {
    return 'Unable to reach RiskVision detection host. Ensure the backend is running and connected.';
  }
  return error.response?.data?.error || defaultMsg;
};

export default API_BASE_URL;
