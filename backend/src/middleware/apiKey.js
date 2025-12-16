/**
 * Check security enforcement level
 */
const isProduction = process.env.NODE_ENV === 'production';
const forceSecurity = process.env.FORCE_SECURITY === 'true';

/**
 * API Key validation middleware
 * Validates the x-api-key header against the configured API_KEY
 * 
 * Behavior:
 * - Production: API key REQUIRED
 * - Dev + FORCE_SECURITY: API key validated if provided, but not required (for testing)
 * - Dev (no FORCE_SECURITY): No validation
 */
export function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.API_KEY;
  
  // No security enforcement in dev without FORCE_SECURITY
  if (!isProduction && !forceSecurity) {
    return next();
  }
  
  // No API_KEY configured - skip validation
  if (!validKey) {
    return next();
  }
  
  // In dev with FORCE_SECURITY: validate if key provided, but don't require it
  if (!isProduction && forceSecurity) {
    if (!apiKey) {
      return next(); // Allow without key in dev for easier testing
    }
    if (apiKey !== validKey) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      });
    }
    return next();
  }
  
  // Production: require API key
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required',
      message: 'Please provide x-api-key header'
    });
  }
  
  if (apiKey !== validKey) {
    return res.status(401).json({ 
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }
  
  next();
}
