/**
 * Behavioral Analysis Tracker
 * 
 * Tracks user behavior patterns to distinguish humans from bots.
 * Analyzes mouse movements, keyboard interactions, scroll behavior, and timing patterns.
 * 
 * Scoring System:
 * - 0-100 score (higher = more human-like)
 * - Real humans: 60-100
 * - Suspicious: 30-60
 * - Bot-like: 0-30
 */

import { securityConfig } from '../config/securityConfig.js';

class BehaviorTracker {
  constructor() {
    this.reset();
    this.startTime = Date.now();
    this.isTracking = false;
  }
  
  /**
   * Reset all tracking data
   */
  reset() {
    // Mouse tracking
    this.mouseMovements = [];
    this.mouseClicks = [];
    this.lastMouseTime = 0;
    
    // Keyboard tracking
    this.keystrokes = [];
    this.lastKeyTime = 0;
    
    // Scroll tracking
    this.scrollEvents = [];
    this.lastScrollTime = 0;
    
    // Touch tracking (mobile)
    this.touchEvents = [];
    this.lastTouchTime = 0;
    
    // Timing patterns
    this.pageLoadTime = Date.now();
    this.firstInteractionTime = null;
    this.interactionCount = 0;
    
    // Bot detection signals
    this.suspiciousPatterns = [];
  }
  
  /**
   * Start tracking user behavior
   */
  start() {
    if (this.isTracking) return;
    
    // Don't start if behavior tracking is disabled
    if (!securityConfig.enableBehaviorTracking) {
      console.log('[Behavior] Behavior tracking disabled');
      return;
    }
    
    console.log('[Behavior] Starting behavior tracking...');
    this.isTracking = true;
    this.startTime = Date.now();
    
    // Mouse event listeners
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mousedown', this.handleMouseClick);
    document.addEventListener('click', this.handleClick);
    
    // Keyboard event listeners
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    
    // Scroll event listeners
    document.addEventListener('scroll', this.handleScroll, true);
    window.addEventListener('scroll', this.handleScroll);
    
    // Touch event listeners (mobile)
    document.addEventListener('touchstart', this.handleTouchStart);
    document.addEventListener('touchmove', this.handleTouchMove);
    document.addEventListener('touchend', this.handleTouchEnd);
    
    // Focus/blur tracking
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('blur', this.handleBlur);
  }
  
  /**
   * Stop tracking and cleanup
   */
  stop() {
    if (!this.isTracking) return;
    
    console.log('[Behavior] Stopping behavior tracking...');
    this.isTracking = false;
    
    // Remove all event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mousedown', this.handleMouseClick);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('scroll', this.handleScroll, true);
    window.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);
  }
  
  /**
   * Handle mouse move events
   */
  handleMouseMove = (e) => {
    const now = Date.now();
    const timeSinceLast = this.lastMouseTime ? now - this.lastMouseTime : 0;
    
    // Record first interaction
    if (!this.firstInteractionTime) {
      this.firstInteractionTime = now;
    }
    
    // Sample movements (don't record every single one for performance)
    if (timeSinceLast > 50 || this.mouseMovements.length === 0) {
      this.mouseMovements.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: now,
        timeSinceLast,
      });
      
      // Keep only last 100 movements
      if (this.mouseMovements.length > 100) {
        this.mouseMovements.shift();
      }
      
      this.lastMouseTime = now;
      this.interactionCount++;
    }
  };
  
  /**
   * Handle mouse click events
   */
  handleMouseClick = (e) => {
    const now = Date.now();
    
    if (!this.firstInteractionTime) {
      this.firstInteractionTime = now;
    }
    
    this.mouseClicks.push({
      x: e.clientX,
      y: e.clientY,
      button: e.button,
      timestamp: now,
    });
    
    // Keep only last 50 clicks
    if (this.mouseClicks.length > 50) {
      this.mouseClicks.shift();
    }
    
    this.interactionCount++;
  };
  
  /**
   * Handle click events
   */
  handleClick = (e) => {
    const now = Date.now();
    
    // Check for suspicious rapid clicks
    if (this.mouseClicks.length > 1) {
      const lastClick = this.mouseClicks[this.mouseClicks.length - 1];
      const timeSinceLastClick = now - lastClick.timestamp;
      
      // Human-impossible click speed (< 50ms)
      if (timeSinceLastClick < 50) {
        this.suspiciousPatterns.push({
          type: 'rapid-clicks',
          interval: timeSinceLastClick,
          timestamp: now,
        });
      }
    }
  };
  
  /**
   * Handle keyboard events
   */
  handleKeyDown = (e) => {
    const now = Date.now();
    const timeSinceLast = this.lastKeyTime ? now - this.lastKeyTime : 0;
    
    if (!this.firstInteractionTime) {
      this.firstInteractionTime = now;
    }
    
    this.keystrokes.push({
      key: e.key,
      code: e.code,
      timestamp: now,
      timeSinceLast,
      isRepeat: e.repeat,
    });
    
    // Keep only last 100 keystrokes
    if (this.keystrokes.length > 100) {
      this.keystrokes.shift();
    }
    
    this.lastKeyTime = now;
    this.interactionCount++;
    
    // Check for suspicious patterns
    if (timeSinceLast > 0 && timeSinceLast < 10 && !e.repeat) {
      // Superhuman typing speed
      this.suspiciousPatterns.push({
        type: 'superhuman-typing',
        interval: timeSinceLast,
        timestamp: now,
      });
    }
  };
  
  /**
   * Handle key up events
   */
  handleKeyUp = (e) => {
    // Track key release timing for advanced analysis
  };
  
  /**
   * Handle scroll events
   */
  handleScroll = (e) => {
    const now = Date.now();
    const timeSinceLast = this.lastScrollTime ? now - this.lastScrollTime : 0;
    
    if (!this.firstInteractionTime) {
      this.firstInteractionTime = now;
    }
    
    // Sample scroll events (throttle)
    if (timeSinceLast > 100 || this.scrollEvents.length === 0) {
      this.scrollEvents.push({
        scrollY: window.scrollY,
        scrollX: window.scrollX,
        timestamp: now,
        timeSinceLast,
      });
      
      // Keep only last 50 scroll events
      if (this.scrollEvents.length > 50) {
        this.scrollEvents.shift();
      }
      
      this.lastScrollTime = now;
      this.interactionCount++;
    }
  };
  
  /**
   * Handle touch start (mobile)
   */
  handleTouchStart = (e) => {
    const now = Date.now();
    
    if (!this.firstInteractionTime) {
      this.firstInteractionTime = now;
    }
    
    if (e.touches.length > 0) {
      this.touchEvents.push({
        type: 'start',
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        touches: e.touches.length,
        timestamp: now,
      });
      
      this.interactionCount++;
    }
  };
  
  /**
   * Handle touch move (mobile)
   */
  handleTouchMove = (e) => {
    const now = Date.now();
    const timeSinceLast = this.lastTouchTime ? now - this.lastTouchTime : 0;
    
    if (timeSinceLast > 50 && e.touches.length > 0) {
      this.touchEvents.push({
        type: 'move',
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        touches: e.touches.length,
        timestamp: now,
      });
      
      // Keep only last 100 touch events
      if (this.touchEvents.length > 100) {
        this.touchEvents.shift();
      }
      
      this.lastTouchTime = now;
    }
  };
  
  /**
   * Handle touch end (mobile)
   */
  handleTouchEnd = (e) => {
    const now = Date.now();
    
    this.touchEvents.push({
      type: 'end',
      timestamp: now,
    });
  };
  
  /**
   * Handle window focus
   */
  handleFocus = () => {
    // User returned to tab
  };
  
  /**
   * Handle window blur
   */
  handleBlur = () => {
    // User left tab
  };
  
  /**
   * Calculate mouse movement entropy (randomness)
   * Higher entropy = more human-like
   * @returns {number} Entropy score (0-100)
   */
  calculateMouseEntropy() {
    if (this.mouseMovements.length < 10) return 0;
    
    // Calculate direction changes
    let directionChanges = 0;
    let totalDistance = 0;
    
    for (let i = 1; i < this.mouseMovements.length; i++) {
      const prev = this.mouseMovements[i - 1];
      const curr = this.mouseMovements[i];
      
      // Calculate distance
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      totalDistance += distance;
      
      // Check for direction change
      if (i >= 2) {
        const prevPrev = this.mouseMovements[i - 2];
        const angle1 = Math.atan2(prev.y - prevPrev.y, prev.x - prevPrev.x);
        const angle2 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
        const angleDiff = Math.abs(angle1 - angle2);
        
        if (angleDiff > Math.PI / 4) { // 45 degrees
          directionChanges++;
        }
      }
    }
    
    // Calculate timing variance
    const timings = this.mouseMovements.map(m => m.timeSinceLast).filter(t => t > 0);
    const avgTiming = timings.reduce((sum, t) => sum + t, 0) / timings.length;
    const variance = timings.reduce((sum, t) => sum + Math.pow(t - avgTiming, 2), 0) / timings.length;
    const stdDev = Math.sqrt(variance);
    
    // Human movements have:
    // - Direction changes (not straight lines)
    // - Variable timing (not constant speed)
    // - Reasonable total distance
    
    const directionScore = Math.min(100, (directionChanges / this.mouseMovements.length) * 200);
    const timingScore = Math.min(100, stdDev / 10);
    const distanceScore = totalDistance > 100 ? 100 : (totalDistance / 100) * 100;
    
    return (directionScore + timingScore + distanceScore) / 3;
  }
  
  /**
   * Calculate keyboard timing naturalness
   * @returns {number} Naturalness score (0-100)
   */
  calculateKeyboardNaturalness() {
    if (this.keystrokes.length < 5) return 50; // Neutral if insufficient data
    
    // Filter out repeat keys
    const nonRepeatKeys = this.keystrokes.filter(k => !k.isRepeat);
    if (nonRepeatKeys.length < 5) return 50;
    
    // Calculate timing variance
    const timings = nonRepeatKeys.map(k => k.timeSinceLast).filter(t => t > 0);
    if (timings.length === 0) return 50;
    
    const avgTiming = timings.reduce((sum, t) => sum + t, 0) / timings.length;
    const variance = timings.reduce((sum, t) => sum + Math.pow(t - avgTiming, 2), 0) / timings.length;
    const stdDev = Math.sqrt(variance);
    
    // Human typing has variance (100-400ms average, with stddev 50-200ms)
    // Bot typing often has very consistent timing or very erratic
    
    const isRealisticAverage = avgTiming >= 50 && avgTiming <= 500;
    const isRealisticVariance = stdDev >= 20 && stdDev <= 300;
    
    let score = 50;
    if (isRealisticAverage) score += 25;
    if (isRealisticVariance) score += 25;
    
    // Penalty for superhuman speed
    const tooFast = timings.filter(t => t < 50).length;
    if (tooFast > timings.length * 0.3) {
      score -= 30;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calculate scroll behavior naturalness
   * @returns {number} Naturalness score (0-100)
   */
  calculateScrollNaturalness() {
    if (this.scrollEvents.length < 5) return 50; // Neutral if insufficient data
    
    // Calculate scroll speed variance
    const speeds = [];
    for (let i = 1; i < this.scrollEvents.length; i++) {
      const prev = this.scrollEvents[i - 1];
      const curr = this.scrollEvents[i];
      const distance = Math.abs(curr.scrollY - prev.scrollY);
      const time = curr.timeSinceLast || 1;
      const speed = distance / time;
      speeds.push(speed);
    }
    
    if (speeds.length === 0) return 50;
    
    const avgSpeed = speeds.reduce((sum, s) => sum + s, 0) / speeds.length;
    const variance = speeds.reduce((sum, s) => sum + Math.pow(s - avgSpeed, 2), 0) / speeds.length;
    const stdDev = Math.sqrt(variance);
    
    // Human scrolling has variable speed (acceleration/deceleration)
    // Bot scrolling often has constant speed
    
    const hasVariance = stdDev > 0.1;
    const hasReasonableSpeed = avgSpeed > 0.1 && avgSpeed < 10;
    
    let score = 50;
    if (hasVariance) score += 30;
    if (hasReasonableSpeed) score += 20;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calculate behavioral score (0-100)
   * @returns {Object} Score and breakdown
   */
  calculateScore() {
    // Return neutral score if tracking is disabled
    if (!securityConfig.enableBehaviorTracking) {
      return {
        overall: 70,
        breakdown: {
          mouseEntropy: 70,
          keyboard: 70,
          scroll: 70,
          diversity: 70,
          timing: 70,
          session: 70,
        },
        stats: {
          mouseMovements: 0,
          mouseClicks: 0,
          keystrokes: 0,
          scrollEvents: 0,
          touchEvents: 0,
          interactionCount: 0,
          sessionDuration: 0,
          timeToFirstInteraction: null,
          suspiciousPatterns: 0,
        },
        classification: 'human',
        disabled: true,
      };
    }
    
    const sessionDuration = Date.now() - this.startTime;
    const timeToFirstInteraction = this.firstInteractionTime 
      ? this.firstInteractionTime - this.pageLoadTime 
      : null;
    
    // Component scores
    const mouseEntropyScore = this.calculateMouseEntropy();
    const keyboardScore = this.calculateKeyboardNaturalness();
    const scrollScore = this.calculateScrollNaturalness();
    
    // Interaction diversity (humans interact in multiple ways)
    const hasMouseActivity = this.mouseMovements.length > 0;
    const hasKeyboardActivity = this.keystrokes.length > 0;
    const hasScrollActivity = this.scrollEvents.length > 0;
    const hasTouchActivity = this.touchEvents.length > 0;
    
    const diversityCount = [hasMouseActivity, hasKeyboardActivity, hasScrollActivity, hasTouchActivity].filter(Boolean).length;
    const diversityScore = (diversityCount / 2) * 100; // Mobile might only have touch
    
    // Time-based scores
    let timingScore = 50;
    if (timeToFirstInteraction !== null) {
      // Humans take 500ms-10s to first interaction
      // Bots often interact immediately (<100ms) or never
      if (timeToFirstInteraction >= 500 && timeToFirstInteraction <= 10000) {
        timingScore = 100;
      } else if (timeToFirstInteraction < 100) {
        timingScore = 20; // Too fast = suspicious
      }
    }
    
    // Session duration (longer engaged sessions = more human-like)
    let sessionScore = Math.min(100, (sessionDuration / 60000) * 100); // Max out at 1 minute
    
    // Suspicious pattern penalty
    const suspiciousCount = this.suspiciousPatterns.length;
    const suspiciousPenalty = Math.min(50, suspiciousCount * 10);
    
    // Weighted average
    const weights = {
      mouse: 0.25,
      keyboard: 0.20,
      scroll: 0.15,
      diversity: 0.15,
      timing: 0.15,
      session: 0.10,
    };
    
    let score = (
      mouseEntropyScore * weights.mouse +
      keyboardScore * weights.keyboard +
      scrollScore * weights.scroll +
      diversityScore * weights.diversity +
      timingScore * weights.timing +
      sessionScore * weights.session
    );
    
    // Apply suspicious pattern penalty
    score = Math.max(0, score - suspiciousPenalty);
    
    return {
      overall: Math.round(score),
      breakdown: {
        mouseEntropy: Math.round(mouseEntropyScore),
        keyboard: Math.round(keyboardScore),
        scroll: Math.round(scrollScore),
        diversity: Math.round(diversityScore),
        timing: Math.round(timingScore),
        session: Math.round(sessionScore),
      },
      stats: {
        mouseMovements: this.mouseMovements.length,
        mouseClicks: this.mouseClicks.length,
        keystrokes: this.keystrokes.length,
        scrollEvents: this.scrollEvents.length,
        touchEvents: this.touchEvents.length,
        interactionCount: this.interactionCount,
        sessionDuration: Math.round(sessionDuration / 1000),
        timeToFirstInteraction: timeToFirstInteraction ? Math.round(timeToFirstInteraction) : null,
        suspiciousPatterns: suspiciousCount,
      },
      classification: score >= 60 ? 'human' : score >= 30 ? 'suspicious' : 'bot-like',
    };
  }
  
  /**
   * Get current behavior data for API requests
   * @returns {Object} Behavior data
   */
  getBehaviorData() {
    const score = this.calculateScore();
    return {
      score: score.overall,
      classification: score.classification,
      stats: score.stats,
      timestamp: Date.now(),
    };
  }
}

// Create singleton instance
const behaviorTracker = new BehaviorTracker();

// Auto-start tracking when module loads (only if enabled)
if (typeof document !== 'undefined' && securityConfig.enableBehaviorTracking) {
  // Start tracking after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => behaviorTracker.start());
  } else {
    behaviorTracker.start();
  }
}

// Export singleton instance and class
export { behaviorTracker, BehaviorTracker };
export default behaviorTracker;

