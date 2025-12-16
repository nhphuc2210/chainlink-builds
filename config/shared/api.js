/**
 * Shared API Routes Configuration
 * Single source of truth for API endpoint paths
 * Used by both frontend and backend to ensure sync
 */
export const API_ROUTES = {
  // Base paths
  BASE_PATH: '/api/v1',
  INTERNAL_PATH: '/internal/api',
  
  // Project endpoints (relative to BASE_PATH)
  PROJECT: {
    CONFIG: '/project/config',
    GLOBAL_STATE: '/project/global-state',
    USER_CLAIM: '/project/user-claim', // ✅ Canonical name - used by both frontend and backend
  },
};

// Helper to build full path
export const getFullPath = (route) => `${API_ROUTES.BASE_PATH}${route}`;

