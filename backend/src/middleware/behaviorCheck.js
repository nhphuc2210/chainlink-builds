/**
 * Behavior Check Middleware
 * 
 * Validates behavioral scores and triggers challenges for suspicious behavior.
 */

import { recordBehaviorScore, analyzeBehavior } from '../services/behaviorAnalyzer.js';
import { generateChallenge } from '../services/challengeGenerator.js';

/**
 * Behavior score validation middleware
 * @param {Object} options - Configuration options
 * @param {number} options.minScore - Minimum behavior score required (0-100)
 * @param {boolean} options.triggerChallenge - If true, trigger challenge instead of blocking
 * @param {boolean} options.required - If true, reject requests without behavior score
 * @returns {Function} Express middleware
 */
export function validateBehaviorScore(options = {}) {
  const {
    minScore = 30,
    triggerChallenge = true,
    required = false,
  } = options;
  
  return async (req, res, next) => {
    const behaviorScore = parseInt(req.headers['x-behavior-score'], 10);
    const deviceHash = req.headers['x-fingerprint'];
    
    // Check if behavior score is required
    if (isNaN(behaviorScore)) {
      if (required) {
        return res.status(403).json({
          error: 'Behavior score required',
          message: 'Request must include x-behavior-score header',
        });
      }
      return next();
    }
    
    // Record score
    if (deviceHash) {
      await recordBehaviorScore(deviceHash, behaviorScore, {
        path: req.path,
        method: req.method,
      });
    }
    
    // Check minimum score
    if (behaviorScore < minScore) {
      console.warn(`[BehaviorCheck] Low behavior score: ${behaviorScore} (min: ${minScore})`);
      
      if (triggerChallenge && deviceHash) {
        // Generate challenge instead of blocking
        const challenge = await generateChallenge('random', deviceHash);
        
        return res.status(403).json({
          error: 'Behavior verification required',
          message: 'Your behavior appears suspicious. Please complete the verification challenge.',
          score: behaviorScore,
          required: minScore,
          challenge,
        });
      }
      
      return res.status(403).json({
        error: 'Suspicious behavior detected',
        message: 'Your behavior score is too low.',
        score: behaviorScore,
        required: minScore,
      });
    }
    
    // Store behavior score in request
    req.behaviorScore = behaviorScore;
    
    next();
  };
}

/**
 * Behavior analysis middleware
 * Analyzes behavior patterns over time
 * @returns {Function} Express middleware
 */
export function analyzeBehaviorMiddleware() {
  return async (req, res, next) => {
    const deviceHash = req.headers['x-fingerprint'];
    
    if (!deviceHash) {
      return next();
    }
    
    try {
      const analysis = await analyzeBehavior(deviceHash);
      
      // Store analysis in request
      req.behaviorAnalysis = analysis;
      
      // Log suspicious patterns
      if (analysis.classification === 'bot-like') {
        console.warn(`[BehaviorCheck] Bot-like behavior detected for device ${deviceHash.substring(0, 16)}...`, analysis);
      }
      
      next();
    } catch (error) {
      console.error('[BehaviorCheck] Error analyzing behavior:', error);
      next();
    }
  };
}

