#!/usr/bin/env node

/**
 * Build-time Secret Encryption Script
 * 
 * This script runs before the Vite build to encrypt sensitive environment variables.
 * The encrypted values are then injected into the bundle via vite.config.js
 * 
 * Usage: node scripts/encrypt-secrets.js
 * 
 * Environment variables needed:
 * - VITE_HMAC_SECRET: HMAC secret for signature generation
 * - VITE_API_KEY: API key for backend authentication
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate the same decryption key that the client will use
 * Must match the logic in secretDecryptor.js
 * @returns {string} Encryption/decryption key
 */
function generateEncryptionKey() {
  // This must match generateDecryptionKey() in secretDecryptor.js
  const parts = [
    'build',
    'reward',
    'calc',
    'Mozil', // First 5 chars of typical user agent
    '2024'
  ];
  
  return parts.join('-');
}

/**
 * Simple XOR cipher for string encryption
 * @param {string} text - Plain text to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Base64 encoded encrypted string
 */
function xorEncrypt(text, key) {
  let encrypted = '';
  
  // XOR each character with key (cycling through key)
  for (let i = 0; i < text.length; i++) {
    const textChar = text.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(textChar ^ keyChar);
  }
  
  // Encode to base64
  return Buffer.from(encrypted, 'binary').toString('base64');
}

/**
 * Load environment variables from .env file
 * @returns {Object} Environment variables
 */
function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env');
  const env = { ...process.env };
  
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
        env[key] = value;
      }
    });
  }
  
  return env;
}

/**
 * Main encryption function
 */
function encryptSecrets() {
  console.log('🔐 Encrypting secrets for production build...\n');
  
  // Load environment variables
  const env = loadEnv();
  
  // Get secrets from environment
  const secrets = {
    HMAC_SECRET: env.VITE_HMAC_SECRET,
    API_KEY: env.VITE_API_KEY
  };
  
  // Validate that secrets exist
  const missingSecrets = Object.entries(secrets)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingSecrets.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingSecrets.forEach(key => {
      const envKey = key === 'HMAC_SECRET' ? 'VITE_HMAC_SECRET' : 'VITE_API_KEY';
      console.error(`   - ${envKey}`);
    });
    console.error('\nPlease set these variables in your .env file or environment.\n');
    process.exit(1);
  }
  
  // Encrypt secrets
  const encryptionKey = generateEncryptionKey();
  const encrypted = {};
  
  Object.entries(secrets).forEach(([key, value]) => {
    encrypted[key] = xorEncrypt(value, encryptionKey);
    console.log(`✅ Encrypted ${key}: ${value.substring(0, 8)}...`);
  });
  
  // Create output for vite.config.js to consume
  const outputPath = resolve(__dirname, '.secrets-cache');
  const output = {
    encrypted,
    timestamp: new Date().toISOString(),
    note: 'This file is auto-generated. Do not edit manually.'
  };
  
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`\n✅ Encrypted secrets saved to: ${outputPath}`);
  console.log('   These will be injected into the bundle during build.\n');
  
  // Also output as environment variable for vite.config.js
  const envOutput = `ENCRYPTED_SECRETS=${JSON.stringify(encrypted)}`;
  const envOutputPath = resolve(__dirname, '.secrets-env');
  writeFileSync(envOutputPath, envOutput);
  
  return encrypted;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    encryptSecrets();
  } catch (error) {
    console.error('❌ Failed to encrypt secrets:', error.message);
    process.exit(1);
  }
}

export { encryptSecrets, xorEncrypt, generateEncryptionKey };

