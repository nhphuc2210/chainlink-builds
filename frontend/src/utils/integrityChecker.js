/**
 * Browser Integrity Checker
 * 
 * Verifies that the browser environment hasn't been tampered with
 * and detects automation tools, headless browsers, and code modifications.
 * 
 * Security checks:
 * - Critical API integrity
 * - Code function integrity
 * - Anti-debugging detection
 * - DevTools detection
 * - Runtime environment validation
 */

import { securityConfig } from '../config/securityConfig.js';

/**
 * Check if critical browser APIs are intact
 * @returns {Object} API integrity status
 */
function checkAPIIntegrity() {
  const checks = {
    // Core APIs
    fetch: typeof fetch === 'function',
    crypto: typeof crypto === 'object' && typeof crypto.subtle === 'object',
    webCrypto: typeof crypto?.subtle?.digest === 'function',
    
    // Storage APIs
    localStorage: typeof localStorage === 'object',
    sessionStorage: typeof sessionStorage === 'object',
    
    // Navigation APIs
    history: typeof history === 'object',
    location: typeof location === 'object',
    
    // Canvas & WebGL
    canvas: !!document.createElement('canvas').getContext,
    webgl: !!(document.createElement('canvas').getContext('webgl') || document.createElement('canvas').getContext('experimental-webgl')),
    
    // Essential objects
    document: typeof document === 'object',
    window: typeof window === 'object',
    navigator: typeof navigator === 'object',
  };
  
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  
  return {
    checks,
    passed,
    total,
    score: (passed / total) * 100,
    intact: passed === total,
  };
}

/**
 * Check if critical functions have been modified
 * @returns {Object} Function integrity status
 */
function checkFunctionIntegrity() {
  const checks = {};
  
  try {
    // Check fetch hasn't been overridden
    const fetchStr = fetch.toString();
    checks.fetch = fetchStr.includes('[native code]') || fetchStr.length < 100;
    
    // Check crypto APIs
    const cryptoStr = crypto.subtle.digest.toString();
    checks.cryptoDigest = cryptoStr.includes('[native code]') || cryptoStr.length < 100;
    
    // Check if important prototype functions are intact
    checks.jsonStringify = JSON.stringify.toString().includes('[native code]');
    checks.jsonParse = JSON.parse.toString().includes('[native code]');
    checks.objectKeys = Object.keys.toString().includes('[native code]');
    
    // Check document methods
    checks.createElement = document.createElement.toString().includes('[native code]');
    checks.getElementById = document.getElementById.toString().includes('[native code]');
    
    // Check addEventListener
    checks.addEventListener = Element.prototype.addEventListener.toString().includes('[native code]');
    
  } catch (error) {
    console.warn('[Integrity] Function check error:', error);
  }
  
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  
  return {
    checks,
    passed,
    total,
    score: total > 0 ? (passed / total) * 100 : 0,
    intact: passed === total,
  };
}

/**
 * Detect if DevTools is open
 * @returns {boolean} True if DevTools detected
 */
function detectDevTools() {
  let devToolsOpen = false;
  
  // Method 1: Check window.outerWidth/Height vs innerWidth/Height
  const widthThreshold = window.outerWidth - window.innerWidth > 160;
  const heightThreshold = window.outerHeight - window.innerHeight > 160;
  
  if (widthThreshold || heightThreshold) {
    devToolsOpen = true;
  }
  
  // Method 2: Console detection (toString trigger)
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function() {
      devToolsOpen = true;
      return 'devtools-check';
    }
  });
  
  // Trigger toString (only happens if console is open)
  requestIdleCallback(() => {
    console.log(element);
    console.clear();
  });
  
  // Method 3: Timing check (removed debugger statement for performance)
  // Note: debugger statement removed as it pauses execution when DevTools is open
  
  return devToolsOpen;
}

/**
 * Check for debugger/breakpoint manipulation
 * @returns {boolean} True if debugger detected
 */
function detectDebugger() {
  // Debugger detection disabled for performance
  // (eval with debugger statement is expensive)
  return false;
}

/**
 * Check runtime environment for suspicious properties
 * @returns {Object} Environment validation results
 */
function checkRuntimeEnvironment() {
  const checks = {
    // Check if running in iframe
    iframed: window.self !== window.top,
    
    // Check if window properties are accessible
    windowAccessible: typeof window.document !== 'undefined',
    
    // Check if DOM is accessible
    domAccessible: !!document.body,
    
    // Check if running in a valid browser context
    browserContext: typeof navigator !== 'undefined' && typeof document !== 'undefined',
    
    // Check timezone consistency
    timezoneConsistent: (() => {
      try {
        const date1 = new Date().getTimezoneOffset();
        const date2 = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return date2 !== 'UTC' || date1 === 0; // Suspicious if forced to UTC
      } catch {
        return false;
      }
    })(),
    
    // Check if permissions API exists (missing in some automation tools)
    permissionsAPI: typeof navigator.permissions !== 'undefined',
    
    // Check if notification API exists
    notificationAPI: typeof Notification !== 'undefined',
    
    // Check if service worker API exists
    serviceWorkerAPI: 'serviceWorker' in navigator,
    
    // Check if WebGL is available (often disabled in headless)
    webglAvailable: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    })(),
    
    // Check if user can interact (not in headless mode)
    interactionPossible: 'ontouchstart' in window || 'onmousedown' in window,
  };
  
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  
  return {
    checks,
    passed,
    total,
    score: (passed / total) * 100,
    valid: passed >= total * 0.7, // At least 70% should pass
  };
}

/**
 * Detect automation-specific properties and behaviors
 * @returns {Object} Automation detection results
 */
function detectAutomationSignals() {
  const signals = {
    // Webdriver flag
    webdriver: navigator.webdriver === true,
    
    // Chrome automation detection
    chromeDriverPresent: !!window.document.$cdc_,
    chromeAutomation: !!window.chrome && !window.chrome.runtime,
    
    // Phantom JS detection
    phantomJS: !!(window._phantom || window.callPhantom),
    
    // Selenium detection
    seleniumIDE: !!window._Selenium_IDE_Recorder,
    seleniumRC: !!window.document.__selenium_unwrapped,
    seleniumWebdriver: !!window.document.__webdriver_evaluate || !!window.document.__selenium_evaluate || !!window.document.__webdriver_script_function,
    
    // Nightmare JS detection
    nightmareJS: !!window.__nightmare,
    
    // Headless browser detection
    headlessChrome: /HeadlessChrome/.test(navigator.userAgent),
    headlessUserAgent: /headless/i.test(navigator.userAgent),
    
    // Puppeteer detection
    puppeteer: (() => {
      // Puppeteer often has no plugins
      if (navigator.plugins.length === 0) return true;
      // Check for CDP runtime
      return !!window.chrome?.runtime?.connect;
    })(),
    
    // Playwright detection
    playwright: !!navigator.webdriver && /Playwright/.test(navigator.userAgent),
    
    // Check for automation language hints
    automationLanguage: (() => {
      const langs = navigator.languages;
      if (!langs || langs.length === 0) return true;
      // Real browsers usually have multiple languages
      return langs.length === 1 && langs[0] === 'en-US';
    })(),
    
    // Check for missing plugins (common in automation)
    noPlugins: navigator.plugins.length === 0,
    
    // Check for CDP (Chrome DevTools Protocol) availability
    cdpAvailable: !!window.chrome?.runtime?.connect,
    
    // Check if running in Node.js context
    nodeContext: typeof process !== 'undefined' && process.versions && process.versions.node,
  };
  
  const detectedCount = Object.values(signals).filter(Boolean).length;
  const totalChecks = Object.keys(signals).length;
  
  return {
    signals,
    detectedCount,
    totalChecks,
    automationLikelihood: (detectedCount / totalChecks) * 100,
    isAutomated: detectedCount >= 3, // If 3+ signals detected, likely automated
  };
}

/**
 * Check for canvas/WebGL poisoning (anti-fingerprinting extensions)
 * @returns {Object} Poisoning detection results
 */
function detectPoisoning() {
  let canvasPoisoned = false;
  let webglPoisoned = false;
  
  try {
    // Test canvas consistency
    const canvas1 = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    
    if (ctx1 && ctx2) {
      ctx1.fillText('test', 0, 0);
      ctx2.fillText('test', 0, 0);
      
      const data1 = canvas1.toDataURL();
      const data2 = canvas2.toDataURL();
      
      // Same operations should produce same results
      if (data1 !== data2) {
        canvasPoisoned = true;
      }
    }
    
    // Test WebGL consistency
    const gl1 = canvas1.getContext('webgl');
    const gl2 = canvas2.getContext('webgl');
    
    if (gl1 && gl2) {
      const param1 = gl1.getParameter(gl1.VERSION);
      const param2 = gl2.getParameter(gl2.VERSION);
      
      if (param1 !== param2) {
        webglPoisoned = true;
      }
    }
  } catch (error) {
    console.warn('[Integrity] Poisoning detection error:', error);
  }
  
  return {
    canvasPoisoned,
    webglPoisoned,
    anyPoisoned: canvasPoisoned || webglPoisoned,
  };
}

/**
 * Generate integrity hash from critical function signatures
 * @returns {Promise<string>} SHA-256 hash of function signatures
 */
async function generateIntegrityHash() {
  try {
    const signatures = [
      fetch.toString(),
      JSON.stringify.toString(),
      crypto.subtle.digest.toString(),
      Object.keys.toString(),
      Array.isArray.toString(),
    ].join('|');
    
    const encoder = new TextEncoder();
    const data = encoder.encode(signatures);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('[Integrity] Hash generation error:', error);
    return 'error';
  }
}

/**
 * Perform comprehensive browser integrity check
 * @returns {Promise<Object>} Complete integrity report
 */
export async function checkBrowserIntegrity() {
  console.log('[Integrity] Performing browser integrity check...');
  
  // Return early if integrity checks are disabled
  if (!securityConfig.enableBrowserIntegrity) {
    console.log('[Integrity] Browser integrity checks disabled - returning passing score');
    return {
      score: 100,
      passed: true,
      disabled: true,
      timestamp: Date.now(),
    };
  }
  
  try {
    const apiIntegrity = checkAPIIntegrity();
    const functionIntegrity = checkFunctionIntegrity();
    const environment = checkRuntimeEnvironment();
    const automation = detectAutomationSignals();
    const poisoning = securityConfig.enablePoisoningDetection 
      ? detectPoisoning() 
      : { canvasPoisoned: false, webglPoisoned: false, anyPoisoned: false, disabled: true };
    const integrityHash = await generateIntegrityHash();
    
    // Calculate overall integrity score (0-100)
    const scores = [
      apiIntegrity.score,
      functionIntegrity.score,
      environment.score,
      100 - automation.automationLikelihood,
      poisoning.anyPoisoned ? 0 : 100,
    ];
    
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const result = {
      score: Math.round(overallScore),
      passed: overallScore >= 70,
      apiIntegrity,
      functionIntegrity,
      environment,
      automation,
      poisoning,
      integrityHash,
      timestamp: Date.now(),
    };
    
    console.log('[Integrity] Check complete:', {
      score: result.score,
      passed: result.passed,
      automationDetected: automation.isAutomated,
      poisoningDetected: poisoning.anyPoisoned,
    });
    
    return result;
  } catch (error) {
    console.error('[Integrity] Error during integrity check:', error);
    
    return {
      score: 0,
      passed: false,
      error: true,
      errorMessage: error.message,
      timestamp: Date.now(),
    };
  }
}

/**
 * Monitor for runtime integrity changes
 * @param {Function} callback - Called when integrity changes detected
 * @returns {Function} Cleanup function to stop monitoring
 */
export function monitorIntegrityChanges(callback) {
  let lastHash = null;
  let devToolsWasOpen = false;
  
  const checkInterval = setInterval(async () => {
    try {
      // Check for integrity hash changes
      const currentHash = await generateIntegrityHash();
      if (lastHash && currentHash !== lastHash) {
        callback({
          type: 'integrity-changed',
          oldHash: lastHash,
          newHash: currentHash,
        });
      }
      lastHash = currentHash;
      
      // Check for DevTools opening
      const devToolsOpen = detectDevTools();
      if (devToolsOpen && !devToolsWasOpen) {
        callback({
          type: 'devtools-opened',
          timestamp: Date.now(),
        });
      }
      devToolsWasOpen = devToolsOpen;
      
    } catch (error) {
      console.error('[Integrity] Monitoring error:', error);
    }
  }, 5000); // Check every 5 seconds
  
  // Return cleanup function
  return () => clearInterval(checkInterval);
}

/**
 * Quick integrity check (for performance-critical paths)
 * @returns {boolean} True if basic checks pass
 */
export function quickIntegrityCheck() {
  return (
    typeof fetch === 'function' &&
    typeof crypto?.subtle === 'object' &&
    !navigator.webdriver &&
    window.self === window.top
  );
}

