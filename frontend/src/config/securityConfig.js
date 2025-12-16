/**
 * Security Feature Configuration
 * 
 * Controls which expensive security checks are enabled.
 * These flags are injected at build time from config/environment.js
 * 
 * Setting all to false improves initial page load by ~500ms
 */

export const securityConfig = {
  // Audio fingerprinting (saves ~200ms when disabled)
  enableAudioFingerprint: import.meta.env.VITE_ENABLE_FINGERPRINT_AUDIO === 'true',
  
  // Font detection (saves ~100ms when disabled)
  enableFontDetection: import.meta.env.VITE_ENABLE_FONT_DETECTION === 'true',
  
  // Canvas fingerprinting (saves ~50ms when disabled)
  enableCanvasFingerprint: import.meta.env.VITE_ENABLE_CANVAS_FINGERPRINT === 'true',
  
  // WebGL fingerprinting (saves ~30ms when disabled)
  enableWebGLFingerprint: import.meta.env.VITE_ENABLE_WEBGL_FINGERPRINT === 'true',
  
  // Browser integrity checks (saves ~50ms when disabled)
  enableBrowserIntegrity: import.meta.env.VITE_ENABLE_BROWSER_INTEGRITY === 'true',
  
  // Canvas/WebGL poisoning detection (saves ~50ms when disabled)
  enablePoisoningDetection: import.meta.env.VITE_ENABLE_POISONING_DETECTION === 'true',
  
  // Behavior tracking (saves ~20ms when disabled)
  enableBehaviorTracking: import.meta.env.VITE_ENABLE_BEHAVIOR_TRACKING === 'true',
};

export default securityConfig;

