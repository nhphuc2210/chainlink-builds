/**
 * API Configuration
 * 
 * Centralized API settings for frontend.
 * Modify these values to adjust API behavior.
 */

import { API_ROUTES } from '../shared/api.js';

export const API_CONFIG = {
  // Default values for API requests
  defaultSeasonId: 1,
  
  // API base path
  basePath: API_ROUTES.BASE_PATH,
  
  // API endpoint paths (relative to basePath)
  // ✅ Using shared config to ensure sync with backend
  endpoints: {
    projectConfig: API_ROUTES.PROJECT.CONFIG,
    projectGlobalState: API_ROUTES.PROJECT.GLOBAL_STATE,
    projectUserClaimValues: API_ROUTES.PROJECT.USER_CLAIM, // Now synced with backend
  },
  
  // Helper to build full endpoint path
  getEndpointPath(endpointKey) {
    return `${this.basePath}${this.endpoints[endpointKey]}`;
  },
};

