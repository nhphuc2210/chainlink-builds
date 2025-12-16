import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';
import viteCompression from 'vite-plugin-compression';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { getObfuscationConfig, shouldExcludeFile } from '../obfuscator.config.js';
import { getEnvironmentConfig } from '../config/environment.js';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Load centralized environment config
  const appConfig = getEnvironmentConfig(mode);
  
  // Load encrypted secrets from build-time encryption script
  let encryptedSecrets = {};
  const secretsCachePath = resolve(__dirname, '..', 'scripts', '.secrets-cache');
  
  if (existsSync(secretsCachePath)) {
    try {
      const secretsData = JSON.parse(readFileSync(secretsCachePath, 'utf-8'));
      encryptedSecrets = secretsData.encrypted || {};
      console.log('✅ Loaded encrypted secrets from cache');
    } catch (error) {
      console.warn('⚠️  Failed to load encrypted secrets:', error.message);
    }
  } else {
    console.warn('⚠️  No encrypted secrets cache found. Run "pnpm run prebuild" first.');
  }
  
  // Use centralized config for obfuscation
  const isProduction = mode === 'production' || process.env.NODE_ENV === 'production';
  const enableObfuscation = appConfig.ENABLE_OBFUSCATION === 'true';
  const enableChunks = appConfig.ENABLE_CHUNKS === 'true';
  
  // Get obfuscation config based on mode
  const obfuscationConfig = getObfuscationConfig(mode);
  
  // Configure plugins
  const plugins = [react()];
  
  if (enableObfuscation) {
    console.log('🔒 Obfuscation ENABLED for production build');
    plugins.push(
      obfuscatorPlugin({
        // Only obfuscate app code, not vendor libraries or workers
        include: [
          'frontend/src/**/*.js',
          'frontend/src/**/*.jsx',
        ],
        exclude: [
          /node_modules/,
          /\.vite/,
        ],
        apply: 'build', // Only apply during build, not dev
        options: obfuscationConfig,
      })
    );
  } else {
    console.log('🔓 Obfuscation DISABLED (ENABLE_OBFUSCATION=false)');
  }
  
  // Log chunking status
  console.log(`📦 Code chunking: ${enableChunks ? 'ENABLED' : 'DISABLED'}`);
  
  // Add compression plugins for Cloudflare (Brotli + Gzip)
  if (isProduction) {
    // Brotli compression (best for Cloudflare)
    plugins.push(
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024, // Only compress files > 1KB
        deleteOriginFile: false,
        compressionOptions: {
          level: 11, // Maximum compression
        },
      })
    );
    
    // Gzip fallback for older browsers
    plugins.push(
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false,
        compressionOptions: {
          level: 9, // Maximum compression
        },
      })
    );
    
    console.log('📦 Compression ENABLED (Brotli + Gzip)');
  }
  
  return {
    root: 'frontend',
    publicDir: 'public',
    plugins,
    
    // Drop console for BOTH dev and prod
    esbuild: {
      drop: ['console', 'debugger'],
    },
    
    // Worker configuration - ensure workers are bundled correctly
    worker: {
      format: 'es',  // Use ES module format for workers
      plugins: [],   // Don't apply obfuscation to workers
    },
    
    // Inject encrypted secrets and environment config into the bundle
    define: {
      // Remove direct exposure of secrets
      'import.meta.env.VITE_HMAC_SECRET': JSON.stringify(''), // Empty fallback
      'import.meta.env.VITE_API_KEY': JSON.stringify(''), // Empty fallback
      // Instead, inject encrypted secrets that will be decrypted at runtime
      'window.__ENCRYPTED_SECRETS__': JSON.stringify(encryptedSecrets),
      // Inject cache configuration from centralized config
      'import.meta.env.VITE_ENABLE_CACHE_SWR': JSON.stringify(appConfig.ENABLE_CACHE_SWR),
      // Inject security feature flags for performance optimization
      'import.meta.env.VITE_ENABLE_FINGERPRINT_AUDIO': JSON.stringify(appConfig.ENABLE_FINGERPRINT_AUDIO),
      'import.meta.env.VITE_ENABLE_FONT_DETECTION': JSON.stringify(appConfig.ENABLE_FONT_DETECTION),
      'import.meta.env.VITE_ENABLE_CANVAS_FINGERPRINT': JSON.stringify(appConfig.ENABLE_CANVAS_FINGERPRINT),
      'import.meta.env.VITE_ENABLE_WEBGL_FINGERPRINT': JSON.stringify(appConfig.ENABLE_WEBGL_FINGERPRINT),
      'import.meta.env.VITE_ENABLE_BROWSER_INTEGRITY': JSON.stringify(appConfig.ENABLE_BROWSER_INTEGRITY),
      'import.meta.env.VITE_ENABLE_POISONING_DETECTION': JSON.stringify(appConfig.ENABLE_POISONING_DETECTION),
      'import.meta.env.VITE_ENABLE_BEHAVIOR_TRACKING': JSON.stringify(appConfig.ENABLE_BEHAVIOR_TRACKING),
    },
    server: {
      port: 5173,
      host: true,
      // Proxy API requests to backend during development
      proxy: {
        '/api': {
          target: 'http://localhost:7000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: '../backend/public', // Output to Express public folder for EJS serving
      emptyOutDir: true,
      manifest: true, // Generate manifest.json for production asset mapping
      sourcemap: false, // Never generate sourcemaps for production
      cssCodeSplit: true, // Split CSS by component for better caching
      reportCompressedSize: false, // Faster builds (compression plugin handles this)
      minify: 'esbuild', // Use esbuild - faster and safer than terser
      esbuildOptions: {
        drop: ['console', 'debugger'],
      },
      modulePreload: {
        polyfill: false, // Disable polyfill for modern browsers (reduces bundle size)
      },
      rollupOptions: {
        output: {
          experimentalMinChunkSize: 10000, // 10KB minimum to prevent over-splitting
          
          // Predictable entry point name for EJS template
          // Format: index.[hash].js (EJS template will dynamically find this)
          entryFileNames: 'assets/index.[hash].js',
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
          
          // Apply manual chunks only if enabled (for production optimization)
          ...(enableChunks && {
            manualChunks(id) {
              // Workers - keep separate, don't bundle with app
              if (id.includes('/workers/') || id.includes('worker.js')) {
                return undefined; // Let Vite handle worker bundling
              }
              
              // Particles - keep in main vendor bundle for simplicity
              // (lazy loading causes issues with obfuscated names)
              
              // Ethers - blockchain library, independent
              if (id.includes('node_modules/ethers')) {
                return 'ethers';
              }
              
              // All other node_modules in single vendor chunk to avoid circular deps
              // This includes: React, ReactDOM, SWR, Particles, and misc libs
              if (id.includes('node_modules')) {
                return 'vendor';
              }
              
              // App code in separate chunk (will be obfuscated)
              if (id.includes('/src/')) {
                return 'app';
              }
            },
          }),
        }
      },
      // Increase chunk size warning limit (obfuscation increases size)
      chunkSizeWarningLimit: 1000, // 1000 KB (up from 500 KB default)
    }
  };
});

