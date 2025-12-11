// CommonJS wrapper to load ESM server
// Load dotenv first
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// Dynamic import ES Module
(async () => {
  await import('./server.js');
})();

