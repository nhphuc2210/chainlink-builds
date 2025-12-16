/**
 * Server Configuration
 * 
 * Centralized server settings for Express.
 * Modify these values to adjust server behavior.
 */

export const SERVER_CONFIG = {
  // Server listening configuration
  port: 7000,                    // Default port (can be overridden by process.env.PORT)
  host: '0.0.0.0',               // Default host (can be overridden by process.env.HOST)
  
  // Static file serving configuration
  staticFiles: {
    maxAge: '1d',                // Cache static files for 1 day
    etag: true,                  // Enable ETag for cache validation
  },
  
  // Path to dist folder (relative to server.js in backend/src/)
  distPath: '../public',
};

