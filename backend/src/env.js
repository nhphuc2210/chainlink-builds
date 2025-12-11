import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (reward_preview/)
// Check if env is already loaded (e.g., from start.cjs wrapper) to avoid loading twice
if (!process.env.INFURA_API_KEYS) {
  dotenv.config({ path: join(__dirname, '../../.env') });
}

