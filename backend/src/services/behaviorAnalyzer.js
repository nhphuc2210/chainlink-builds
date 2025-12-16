/**
 * Behavioral Analysis Service
 * 
 * Analyzes behavioral scores from clients and maintains score history.
 * Helps distinguish humans from bots based on interaction patterns.
 */

import { getRedisClient, isRedisAvailable } from '../utils/redis.js'; // Shared Redis client

const BEHAVIOR_PREFIX = 'behavior:';
const BEHAVIOR_TTL = 24 * 60 * 60; // 24 hours

// Use shared Redis client
const redis = getRedisClient();

// In-memory fallback
const memoryBehaviorScores = new Map();

/**
 * Record behavioral score for a device
 * @param {string} deviceHash - Device fingerprint hash
 * @param {number} score - Behavior score (0-100)
 * @param {Object} details - Score details
 * @returns {Promise<Object>} Analysis result
 */
export async function recordBehaviorScore(deviceHash, score, details = {}) {
  const key = `${BEHAVIOR_PREFIX}${deviceHash}`;
  const timestamp = Date.now();
  
  const entry = {
    score,
    timestamp,
    details,
  };
  
  try {
    if (isRedisAvailable() && redis) {
      // Get existing scores
      const existingData = await redis.get(key);
      const scores = existingData ? JSON.parse(existingData) : [];
      
      // Add new score
      scores.push(entry);
      
      // Keep only last 50 scores
      if (scores.length > 50) {
        scores.shift();
      }
      
      // Store back
      await redis.setex(key, BEHAVIOR_TTL, JSON.stringify(scores));
    } else {
      // Memory storage
      if (!memoryBehaviorScores.has(deviceHash)) {
        memoryBehaviorScores.set(deviceHash, []);
      }
      
      const scores = memoryBehaviorScores.get(deviceHash);
      scores.push(entry);
      
      if (scores.length > 50) {
        scores.shift();
      }
    }
    
    return { success: true, score };
  } catch (error) {
    console.error('[BehaviorAnalyzer] Error recording score:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get behavior score history for a device
 * @param {string} deviceHash - Device fingerprint hash
 * @returns {Promise<Array>} Score history
 */
export async function getBehaviorHistory(deviceHash) {
  const key = `${BEHAVIOR_PREFIX}${deviceHash}`;
  
  try {
    if (isRedisAvailable() && redis) {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : [];
    } else {
      return memoryBehaviorScores.get(deviceHash) || [];
    }
  } catch (error) {
    console.error('[BehaviorAnalyzer] Error getting history:', error);
    return [];
  }
}

/**
 * Analyze behavior patterns
 * @param {string} deviceHash - Device fingerprint hash
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeBehavior(deviceHash) {
  const history = await getBehaviorHistory(deviceHash);
  
  if (history.length === 0) {
    return {
      averageScore: 0,
      trend: 'unknown',
      classification: 'unknown',
      confidence: 0,
    };
  }
  
  // Calculate average score
  const scores = history.map(h => h.score);
  const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  
  // Calculate trend (improving/declining)
  let trend = 'stable';
  if (history.length >= 5) {
    const recentAvg = scores.slice(-5).reduce((sum, s) => sum + s, 0) / 5;
    const olderAvg = scores.slice(0, -5).reduce((sum, s) => sum + s, 0) / (scores.length - 5);
    
    if (recentAvg > olderAvg + 10) {
      trend = 'improving';
    } else if (recentAvg < olderAvg - 10) {
      trend = 'declining';
    }
  }
  
  // Classify behavior
  let classification = 'suspicious';
  if (averageScore >= 60) {
    classification = 'human-like';
  } else if (averageScore >= 30) {
    classification = 'uncertain';
  } else {
    classification = 'bot-like';
  }
  
  // Calculate confidence based on sample size
  const confidence = Math.min(100, (history.length / 20) * 100);
  
  return {
    averageScore: Math.round(averageScore),
    trend,
    classification,
    confidence: Math.round(confidence),
    sampleSize: history.length,
  };
}

