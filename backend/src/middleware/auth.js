import jwt from 'jsonwebtoken';

/**
 * JWT Token verification middleware
 * Use this for routes that require authenticated users
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Token required',
      message: 'Please provide Authorization header with Bearer token'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please refresh your token'
      });
    }
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'The provided token is not valid'
    });
  }
}

/**
 * Generate a JWT token for a user
 * @param {Object} payload - User data to encode in token
 * @param {string} expiresIn - Token expiration time (default: 24h)
 * @returns {string} JWT token
 */
export function generateToken(payload, expiresIn = '24h') {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

/**
 * Optional token verification - doesn't fail if no token provided
 * Useful for routes that work for both authenticated and anonymous users
 */
export function optionalToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    // Token invalid but we continue anyway (optional auth)
  }
  
  next();
}
