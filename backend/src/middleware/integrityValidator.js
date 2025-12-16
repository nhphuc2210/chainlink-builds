/**
 * Browser Integrity Validator Middleware
 * 
 * Validates browser integrity signals sent from the client.
 * Detects automation tools, tampering, and suspicious environments.
 */

/**
 * Validate browser integrity middleware
 * @param {Object} options - Configuration options
 * @param {number} options.minScore - Minimum integrity score required (0-100)
 * @param {boolean} options.required - If true, reject requests without integrity data
 * @param {boolean} options.blockAutomation - If true, block detected automation tools
 * @returns {Function} Express middleware
 */
export function validateBrowserIntegrity(options = {}) {
  const {
    minScore = 50,
    required = false,
    blockAutomation = true,
  } = options;
  
  return (req, res, next) => {
    const integrityHash = req.headers['x-integrity'];
    const integrityScore = parseInt(req.headers['x-integrity-score'], 10);
    
    // Check if integrity data is required
    if (!integrityHash || isNaN(integrityScore)) {
      if (required) {
        return res.status(403).json({
          error: 'Browser integrity check required',
          message: 'Request must include x-integrity and x-integrity-score headers',
        });
      }
      return next();
    }
    
    // Check minimum score
    if (integrityScore < minScore) {
      console.warn(`[IntegrityValidator] Low integrity score: ${integrityScore} (min: ${minScore})`);
      
      return res.status(403).json({
        error: 'Browser integrity check failed',
        message: 'Your browser environment appears to be compromised or tampered with.',
        score: integrityScore,
        required: minScore,
      });
    }
    
    // Check for automation signals (if blockAutomation enabled)
    if (blockAutomation) {
      // Check for common automation indicators in user agent
      const userAgent = req.headers['user-agent'] || '';
      const automationPatterns = [
        /headless/i,
        /phantomjs/i,
        /selenium/i,
        /puppeteer/i,
        /playwright/i,
        /crawler/i,
        /bot/i,
      ];
      
      for (const pattern of automationPatterns) {
        if (pattern.test(userAgent)) {
          console.warn(`[IntegrityValidator] Automation detected in UA: ${userAgent}`);
          
          return res.status(403).json({
            error: 'Automation detected',
            message: 'Automated requests are not allowed.',
          });
        }
      }
    }
    
    // Store integrity data in request
    req.integrity = {
      hash: integrityHash,
      score: integrityScore,
    };
    
    next();
  };
}

