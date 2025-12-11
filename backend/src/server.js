// Load .env first (before any imports that use env vars)
import './env.js';

import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7000;
const HOST = process.env.HOST || '0.0.0.0';

// CORS for development - allow frontend dev server
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
}

// Parse JSON bodies
app.use(express.json());

// Enable gzip compression
app.use(compression());

// API routes
app.use('/api', apiRoutes);

// Serve static files from dist folder (production build)
app.use(express.static(join(__dirname, '../../dist'), {
  maxAge: '1d',
  etag: true
}));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../../dist', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`[reward-preview] Server running on http://${HOST}:${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[reward-preview] Dev mode: Access frontend at http://localhost:5173`);
  }
});

