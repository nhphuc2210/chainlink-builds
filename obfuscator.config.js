/**
 * JavaScript Obfuscator Configuration
 * 
 * This configuration provides strong obfuscation for production builds.
 * It makes the code significantly harder to reverse engineer while maintaining functionality.
 * 
 * Security vs Performance trade-off:
 * - Bundle size: +15-25%
 * - Parse time: +10-20ms
 * - Readability: Reduced from ~60% to ~5%
 * 
 * Based on best practices from:
 * - javascript-obfuscator documentation
 * - DeFi applications (Uniswap, Aave, DeBank)
 * - Production web apps with sensitive client logic
 */

/**
 * Strong obfuscation preset for production
 * Use this for the main application code
 */
export const strongObfuscationConfig = {
  // === CONTROL FLOW OBFUSCATION ===
  // Makes code flow very hard to follow by flattening if/else and loops
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75, // Apply to 75% of nodes (balance between security and size)
  
  // === DEAD CODE INJECTION ===
  // Adds fake code branches that never execute
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4, // 40% injection (higher = bigger bundle)
  
  // === STRING OBFUSCATION ===
  // Extract strings to encoded array with rotation
  stringArray: true,
  stringArrayEncoding: ['base64', 'rc4'], // Multiple encoding layers
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2, // Add wrapper functions
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function', // Use function wrappers
  stringArrayThreshold: 0.8, // Apply to 80% of strings
  
  // === IDENTIFIER OBFUSCATION ===
  // Rename variables/functions to meaningless names
  identifierNamesGenerator: 'mangled-shuffled', // Shortest + randomized
  identifiersDictionary: [], // Let it generate automatically
  identifiersPrefix: '', // No prefix to avoid patterns
  renameGlobals: false, // Don't rename globals (can break libraries)
  renameProperties: false, // CRITICAL: Don't rename properties (breaks React/SWR)
  
  // === TRANSFORMATIONS ===
  // Additional code transformations
  splitStrings: true, // Split long strings into chunks
  splitStringsChunkLength: 10, // Max chunk size
  transformObjectKeys: false, // CRITICAL: Don't transform object keys (breaks libraries)
  unicodeEscapeSequence: false, // Don't use unicode (makes bundle larger)
  
  // === GENERAL SETTINGS ===
  compact: true, // Remove whitespace
  simplify: true, // Simplify code structure
  selfDefending: false, // DISABLED: Can cause issues with React
  
  // === DEBUG PROTECTION ===
  debugProtection: false, // Don't add infinite loops (can annoy users)
  debugProtectionInterval: 0,
  
  // === ADVANCED ===
  disableConsoleOutput: false, // Keep console (useful for debugging)
  domainLock: [], // No domain restrictions
  domainLockRedirectUrl: 'about:blank',
  forceTransformStrings: [], // Auto-detect
  ignoreImports: true, // CRITICAL: Don't obfuscate imports (breaks module resolution)
  inputFileName: '',
  log: false,
  numbersToExpressions: true, // Convert numbers to expressions
  optionsPreset: 'default',
  renamePropertiesMode: 'safe', // Only rename safe properties
  reservedNames: [
    // React internals
    'Children', 'Component', 'Fragment', 'Profiler', 'PureComponent', 'StrictMode',
    'Suspense', 'cloneElement', 'createContext', 'createElement', 'createFactory',
    'createRef', 'forwardRef', 'isValidElement', 'lazy', 'memo', 'useCallback',
    'useContext', 'useDebugValue', 'useEffect', 'useImperativeHandle', 'useLayoutEffect',
    'useMemo', 'useReducer', 'useRef', 'useState',
    // SWR internals
    'cache', 'mutate', 'revalidate', 'fetcher', 'useSWR', 'SWRConfig',
    // Common properties that should not be renamed
    'prototype', 'constructor', '__proto__',
  ],
  reservedStrings: [], // No reserved strings
  seed: 0, // Random seed (0 = use timestamp)
  sourceMap: false, // Never generate sourcemaps
  sourceMapBaseUrl: '',
  sourceMapFileName: '',
  sourceMapMode: 'separate',
  sourceMapSourcesMode: 'sources-content',
  target: 'browser', // Target browser environment
  
  // === SIZE OPTIMIZATION ===
  stringArrayCallsTransform: true, // Transform string array calls
  stringArrayCallsTransformThreshold: 0.5,
};

/**
 * Medium obfuscation preset for testing/staging
 * Use this to test if obfuscation breaks anything
 */
export const mediumObfuscationConfig = {
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: false, // Disabled for smaller bundle
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  identifierNamesGenerator: 'mangled',
  compact: true,
  simplify: true,
  selfDefending: false,
  numbersToExpressions: false,
  target: 'browser',
  sourceMap: false,
};

/**
 * Light obfuscation preset for development testing
 * Minimal obfuscation, mainly for testing the pipeline
 */
export const lightObfuscationConfig = {
  controlFlowFlattening: false,
  deadCodeInjection: false,
  stringArray: true,
  stringArrayEncoding: [],
  stringArrayThreshold: 0.5,
  identifierNamesGenerator: 'mangled',
  compact: true,
  simplify: true,
  target: 'browser',
  sourceMap: false,
};

/**
 * Get obfuscation config based on environment
 * @param {string} mode - Build mode ('production', 'staging', 'development')
 * @returns {Object} Obfuscation configuration
 */
export function getObfuscationConfig(mode = 'production') {
  switch (mode) {
    case 'production':
      return strongObfuscationConfig;
    case 'staging':
      return mediumObfuscationConfig;
    case 'development':
      return lightObfuscationConfig;
    default:
      return strongObfuscationConfig;
  }
}

/**
 * Check if a file should be excluded from obfuscation
 * @param {string} filePath - File path to check
 * @returns {boolean} True if should be excluded
 */
export function shouldExcludeFile(filePath) {
  // Don't obfuscate vendor libraries (they're already minified)
  const excludePatterns = [
    /node_modules/,
    /vendor\..*\.js$/,
    /vendor-swr/,  // SWR breaks when obfuscated
    /react\..*\.js$/,
    /react-dom\..*\.js$/,
    /particles\..*\.js$/,
    /@tsparticles/,
  ];
  
  return excludePatterns.some(pattern => pattern.test(filePath));
}

// Default export for convenience
export default {
  strong: strongObfuscationConfig,
  medium: mediumObfuscationConfig,
  light: lightObfuscationConfig,
  getConfig: getObfuscationConfig,
  shouldExclude: shouldExcludeFile,
};

