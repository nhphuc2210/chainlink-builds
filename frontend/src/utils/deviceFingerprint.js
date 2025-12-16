/**
 * Device Fingerprinting Module
 * 
 * Generates a unique fingerprint for the device based on multiple browser characteristics.
 * Used to identify and track devices for security purposes.
 * 
 * Security Features:
 * - Canvas fingerprinting
 * - WebGL fingerprinting
 * - Audio context fingerprinting
 * - Font detection
 * - Screen properties
 * - Hardware characteristics
 * - Anti-automation detection
 */

import { securityConfig } from '../config/securityConfig.js';

/**
 * Generate canvas fingerprint
 * @returns {string} Canvas fingerprint hash
 */
function generateCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return 'no-canvas';
    
    // Set canvas size
    canvas.width = 280;
    canvas.height = 60;
    
    // Draw text with different properties
    ctx.textBaseline = 'top';
    ctx.font = '16px "Arial"';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Canvas Fingerprint 🔒', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Canvas Fingerprint 🔒', 4, 17);
    
    // Draw shapes
    ctx.strokeStyle = 'rgb(255, 0, 255)';
    ctx.beginPath();
    ctx.arc(50, 50, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();
    
    // Get canvas data URL
    return canvas.toDataURL();
  } catch (error) {
    console.warn('[Fingerprint] Canvas error:', error);
    return 'canvas-error';
  }
}

/**
 * Generate WebGL fingerprint
 * @returns {Object} WebGL characteristics
 */
function generateWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return { supported: false };
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    return {
      supported: true,
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown',
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown',
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
    };
  } catch (error) {
    console.warn('[Fingerprint] WebGL error:', error);
    return { supported: false, error: true };
  }
}

/**
 * Generate audio context fingerprint
 * @returns {Promise<string>} Audio fingerprint
 */
async function generateAudioFingerprint() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return 'no-audio';
    
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
    
    gainNode.gain.value = 0; // Mute
    oscillator.type = 'triangle';
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start(0);
    
    return new Promise((resolve) => {
      scriptProcessor.onaudioprocess = function(event) {
        const output = event.outputBuffer.getChannelData(0);
        const fingerprint = Array.from(output.slice(0, 30))
          .map(v => v.toFixed(10))
          .join(',');
        
        oscillator.stop();
        scriptProcessor.disconnect();
        context.close();
        
        resolve(fingerprint);
      };
    });
  } catch (error) {
    console.warn('[Fingerprint] Audio error:', error);
    return 'audio-error';
  }
}

/**
 * Detect available fonts
 * @returns {Array<string>} List of detected fonts
 */
function detectFonts() {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
    'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
    'Impact', 'Lucida Console', 'Tahoma', 'Lucida Sans Unicode',
    'Monaco', 'Consolas', 'Helvetica', 'Geneva', 'MS Sans Serif'
  ];
  
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  
  // Get baseline widths
  const baselineWidths = {};
  baseFonts.forEach(font => {
    ctx.font = `${testSize} ${font}`;
    baselineWidths[font] = ctx.measureText(testString).width;
  });
  
  // Test fonts
  const detectedFonts = [];
  testFonts.forEach(font => {
    let detected = false;
    baseFonts.forEach(baseFont => {
      ctx.font = `${testSize} '${font}', ${baseFont}`;
      const width = ctx.measureText(testString).width;
      if (width !== baselineWidths[baseFont]) {
        detected = true;
      }
    });
    if (detected) {
      detectedFonts.push(font);
    }
  });
  
  return detectedFonts;
}

/**
 * Get screen properties
 * @returns {Object} Screen characteristics
 */
function getScreenProperties() {
  return {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    devicePixelRatio: window.devicePixelRatio || 1,
    orientation: screen.orientation?.type || 'unknown',
  };
}

/**
 * Get navigator properties
 * @returns {Object} Navigator characteristics
 */
function getNavigatorProperties() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages ? Array.from(navigator.languages) : [],
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: navigator.deviceMemory || 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    vendor: navigator.vendor,
    productSub: navigator.productSub,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || 'unknown',
  };
}

/**
 * Detect automation tools and suspicious signals
 * @returns {Object} Anti-automation signals
 */
function detectAutomation() {
  return {
    // Webdriver detection
    webdriver: navigator.webdriver || false,
    
    // Headless Chrome detection
    headlessChrome: /HeadlessChrome/.test(navigator.userAgent),
    
    // PhantomJS detection
    phantomJS: !!(window._phantom || window.callPhantom),
    
    // Selenium detection
    selenium: !!(window.document.$cdc_ || window.document.documentElement.getAttribute('selenium') || window.document.documentElement.getAttribute('webdriver')),
    
    // Puppeteer detection
    puppeteer: !!(navigator.webdriver && navigator.plugins.length === 0),
    
    // Chrome automation detection
    chromeRuntime: !!window.chrome?.runtime,
    
    // Check for automation-specific properties
    automationControlled: navigator.webdriver === true || window.navigator.webdriver === true,
    
    // Check plugins (headless browsers usually have 0)
    pluginCount: navigator.plugins?.length || 0,
    
    // Check if running in iframe
    iframed: window.self !== window.top,
    
    // Check for common bot user agents
    botUserAgent: /bot|crawler|spider|crawling/i.test(navigator.userAgent),
  };
}

/**
 * Get timezone information
 * @returns {Object} Timezone data
 */
function getTimezoneInfo() {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    return {
      timezone,
      offset,
      offsetString: `UTC${offset > 0 ? '-' : '+'}${Math.abs(offset / 60)}`,
    };
  } catch (error) {
    return {
      timezone: 'unknown',
      offset: 0,
      offsetString: 'unknown',
    };
  }
}

/**
 * Hash a string using SHA-256 (via Web Crypto API)
 * @param {string} data - Data to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
async function sha256Hash(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generate complete device fingerprint
 * @returns {Promise<Object>} Device fingerprint object with hash
 */
export async function generateDeviceFingerprint() {
  console.log('[Fingerprint] Generating device fingerprint...');
  
  try {
    // Collect all fingerprint components (conditionally based on config)
    const canvas = securityConfig.enableCanvasFingerprint 
      ? generateCanvasFingerprint() 
      : 'disabled';
    const webgl = securityConfig.enableWebGLFingerprint 
      ? generateWebGLFingerprint() 
      : { supported: false, disabled: true };
    const audio = securityConfig.enableAudioFingerprint 
      ? await generateAudioFingerprint() 
      : 'disabled';
    const fonts = securityConfig.enableFontDetection 
      ? detectFonts() 
      : [];
    const screen = getScreenProperties();
    const navigator = getNavigatorProperties();
    const automation = detectAutomation();
    const timezone = getTimezoneInfo();
    
    // Build fingerprint object
    const fingerprint = {
      canvas,
      webgl,
      audio,
      fonts,
      screen,
      navigator,
      automation,
      timezone,
      timestamp: Date.now(),
    };
    
    // Generate hash from fingerprint components
    const fingerprintString = JSON.stringify(fingerprint);
    const fingerprintHash = await sha256Hash(fingerprintString);
    
    console.log('[Fingerprint] Generated successfully:', {
      hash: fingerprintHash.substring(0, 16) + '...',
      automationDetected: Object.values(automation).some(v => v === true),
      componentsCount: Object.keys(fingerprint).length,
    });
    
    return {
      fingerprint,
      hash: fingerprintHash,
    };
  } catch (error) {
    console.error('[Fingerprint] Error generating fingerprint:', error);
    
    // Fallback fingerprint
    const fallback = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: screen.width,
      screenHeight: screen.height,
      error: true,
    };
    
    const fallbackString = JSON.stringify(fallback);
    const fallbackHash = await sha256Hash(fallbackString);
    
    return {
      fingerprint: fallback,
      hash: fallbackHash,
    };
  }
}

/**
 * Check if device fingerprint has changed suspiciously
 * @param {Object} oldFingerprint - Previous fingerprint
 * @param {Object} newFingerprint - Current fingerprint
 * @returns {Object} Change analysis
 */
export function analyzeFingerprintChanges(oldFingerprint, newFingerprint) {
  if (!oldFingerprint || !newFingerprint) {
    return { suspicious: false, reason: 'missing-data' };
  }
  
  const changes = [];
  
  // Check critical properties that shouldn't change
  const criticalProps = [
    'canvas',
    'webgl.vendor',
    'webgl.renderer',
    'screen.width',
    'screen.height',
    'navigator.platform',
    'navigator.hardwareConcurrency',
  ];
  
  criticalProps.forEach(prop => {
    const parts = prop.split('.');
    let oldValue = oldFingerprint;
    let newValue = newFingerprint;
    
    parts.forEach(part => {
      oldValue = oldValue?.[part];
      newValue = newValue?.[part];
    });
    
    if (oldValue !== newValue && oldValue !== undefined && newValue !== undefined) {
      changes.push({
        property: prop,
        oldValue: String(oldValue).substring(0, 50),
        newValue: String(newValue).substring(0, 50),
      });
    }
  });
  
  // Suspicious if multiple critical properties changed
  const suspicious = changes.length >= 2;
  
  return {
    suspicious,
    changes,
    reason: suspicious ? 'multiple-critical-changes' : 'normal',
    changeCount: changes.length,
  };
}

/**
 * Calculate trust score based on fingerprint analysis
 * @param {Object} fingerprint - Device fingerprint
 * @returns {number} Trust score (0-100, higher = more trustworthy)
 */
export function calculateTrustScore(fingerprint) {
  let score = 100;
  
  const { automation } = fingerprint;
  
  // Deduct points for automation signals
  if (automation.webdriver) score -= 30;
  if (automation.headlessChrome) score -= 30;
  if (automation.phantomJS) score -= 30;
  if (automation.selenium) score -= 30;
  if (automation.puppeteer) score -= 20;
  if (automation.automationControlled) score -= 20;
  if (automation.pluginCount === 0) score -= 10;
  if (automation.iframed) score -= 5;
  if (automation.botUserAgent) score -= 25;
  
  // Deduct points for missing/error components
  if (fingerprint.canvas === 'no-canvas' || fingerprint.canvas === 'canvas-error') score -= 5;
  if (!fingerprint.webgl?.supported) score -= 5;
  if (fingerprint.audio === 'no-audio' || fingerprint.audio === 'audio-error') score -= 5;
  if (!fingerprint.fonts || fingerprint.fonts.length === 0) score -= 5;
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

