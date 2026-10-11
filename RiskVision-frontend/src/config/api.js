/**
 * RiskVision API Configuration
 * Centralizes all backend URL references to support both local dev and production hosting.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const API_ENDPOINTS = {
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
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  },
};

export default API_BASE_URL;
