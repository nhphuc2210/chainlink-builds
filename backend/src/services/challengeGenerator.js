/**
 * Challenge Generator Service
 * 
 * Generates and validates security challenges for suspicious sessions.
 * Challenge types: math, time, interactive, custom
 */

import crypto from 'crypto';
import { getRedisClient, isRedisAvailable } from '../utils/redis.js'; // Shared Redis client

const CHALLENGE_PREFIX = 'challenge:';
const CHALLENGE_TTL = 5 * 60; // 5 minutes

// Use shared Redis client
const redis = getRedisClient();

// In-memory fallback
const memoryChallenges = new Map();

/**
 * Generate math challenge
 * @returns {Object} Challenge data
 */
function generateMathChallenge() {
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;
  const operators = ['+', '-', '*'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let answer;
  let question;
  
  switch (operator) {
    case '+':
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
      break;
    case '-':
      answer = num1 > num2 ? num1 - num2 : num2 - num1;
      question = num1 > num2 ? `${num1} - ${num2}` : `${num2} - ${num1}`;
      break;
    case '*':
      answer = num1 * num2;
      question = `${num1} × ${num2}`;
      break;
  }
  
  return {
    type: 'math',
    question: `What is ${question}?`,
    answer: answer.toString(),
  };
}

/**
 * Generate time challenge
 * @returns {Object} Challenge data
 */
function generateTimeChallenge() {
  const waitSeconds = Math.floor(Math.random() * 20) + 10; // 10-30 seconds
  
  return {
    type: 'time',
    waitSeconds,
    message: `Please wait ${waitSeconds} seconds before continuing.`,
  };
}

/**
 * Generate interactive challenge
 * @returns {Object} Challenge data
 */
function generateInteractiveChallenge() {
  return {
    type: 'interactive',
    message: 'Click on the highlighted area to continue.',
  };
}

/**
 * Generate challenge
 * @param {string} type - Challenge type ('math', 'time', 'interactive', 'random')
 * @param {string} deviceHash - Device fingerprint hash
 * @returns {Promise<Object>} Challenge object with ID
 */
export async function generateChallenge(type = 'random', deviceHash = null) {
  // Select challenge type
  let challengeType = type;
  if (type === 'random') {
    const types = ['math', 'time', 'interactive'];
    challengeType = types[Math.floor(Math.random() * types.length)];
  }
  
  // Generate challenge
  let challengeData;
  switch (challengeType) {
    case 'math':
      challengeData = generateMathChallenge();
      break;
    case 'time':
      challengeData = generateTimeChallenge();
      break;
    case 'interactive':
      challengeData = generateInteractiveChallenge();
      break;
    default:
      challengeData = generateMathChallenge();
  }
  
  // Generate challenge ID
  const challengeId = crypto.randomBytes(16).toString('hex');
  
  // Store challenge
  const challenge = {
    id: challengeId,
    ...challengeData,
    deviceHash,
    createdAt: Date.now(),
    expiresAt: Date.now() + (CHALLENGE_TTL * 1000),
    attempts: 0,
    completed: false,
  };
  
  const key = `${CHALLENGE_PREFIX}${challengeId}`;
  
  try {
    if (isRedisAvailable() && redis) {
      await redis.setex(key, CHALLENGE_TTL, JSON.stringify(challenge));
    } else {
      memoryChallenges.set(challengeId, challenge);
    }
    
    console.log(`[ChallengeGenerator] Generated ${challengeType} challenge:`, challengeId);
    
    // Return challenge without answer (for client)
    const { answer, ...clientChallenge } = challenge;
    return clientChallenge;
  } catch (error) {
    console.error('[ChallengeGenerator] Error generating challenge:', error);
    throw error;
  }
}

/**
 * Validate challenge response
 * @param {string} challengeId - Challenge ID
 * @param {string} response - User's response
 * @returns {Promise<Object>} Validation result
 */
export async function validateChallenge(challengeId, response) {
  const key = `${CHALLENGE_PREFIX}${challengeId}`;
  
  try {
    // Get challenge
    let challenge;
    if (isRedisAvailable() && redis) {
      const data = await redis.get(key);
      if (!data) {
        return { valid: false, reason: 'challenge-not-found' };
      }
      challenge = JSON.parse(data);
    } else {
      challenge = memoryChallenges.get(challengeId);
      if (!challenge) {
        return { valid: false, reason: 'challenge-not-found' };
      }
    }
    
    // Check expiration
    if (Date.now() > challenge.expiresAt) {
      return { valid: false, reason: 'challenge-expired' };
    }
    
    // Check if already completed
    if (challenge.completed) {
      return { valid: false, reason: 'challenge-already-completed' };
    }
    
    // Increment attempts
    challenge.attempts++;
    
    // Validate based on type
    let valid = false;
    
    switch (challenge.type) {
      case 'math':
        valid = response === challenge.answer;
        break;
      case 'time':
        // Time challenge auto-completes after wait period
        valid = Date.now() >= challenge.createdAt + (challenge.waitSeconds * 1000);
        break;
      case 'interactive':
        // Interactive challenges validated by client, just accept
        valid = true;
        break;
    }
    
    if (valid) {
      challenge.completed = true;
      challenge.completedAt = Date.now();
    }
    
    // Update challenge
    if (isRedisAvailable() && redis) {
      await redis.setex(key, CHALLENGE_TTL, JSON.stringify(challenge));
    } else {
      memoryChallenges.set(challengeId, challenge);
    }
    
    console.log(`[ChallengeGenerator] Challenge ${challengeId} validation:`, valid ? 'PASS' : 'FAIL');
    
    return {
      valid,
      reason: valid ? 'success' : 'incorrect-answer',
      attempts: challenge.attempts,
    };
  } catch (error) {
    console.error('[ChallengeGenerator] Error validating challenge:', error);
    return { valid: false, reason: 'validation-error' };
  }
}

/**
 * Get challenge by ID
 * @param {string} challengeId - Challenge ID
 * @returns {Promise<Object|null>} Challenge data
 */
export async function getChallenge(challengeId) {
  const key = `${CHALLENGE_PREFIX}${challengeId}`;
  
  try {
    if (isRedisAvailable() && redis) {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      return memoryChallenges.get(challengeId) || null;
    }
  } catch (error) {
    console.error('[ChallengeGenerator] Error getting challenge:', error);
    return null;
  }
}

