# BUILD Reward Calculator

A production-ready React application for calculating BUILD token vesting rewards with on-chain data integration.

## Project Structure

```
reward_preview/
├── frontend/           # React frontend (Vite)
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   ├── styles/     # Theme and component styles
│   │   └── utils/      # Utility functions
│   ├── public/         # Static assets
│   └── vite.config.js  # Vite configuration
│
├── backend/            # Express API server
│   └── src/
│       ├── routes/     # API routes
│       ├── services/   # Business logic
│       └── server.js   # Entry point
│
├── shared/             # Shared constants
│   └── constants/
│       └── contracts.js # Contract addresses & ABIs
│
├── .env.example        # Environment variables template
├── ecosystem.config.cjs # PM2 config
└── package.json        # Root workspace scripts
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your Infura API keys
   INFURA_API_KEYS=key1,key2,key3
   PORT=7000
   HOST='0.0.0.0'
   ```

## Development

Run both frontend and backend concurrently:
```bash
pnpm dev
```

Or run separately:
```bash
# Frontend only (http://localhost:5173)
pnpm dev:frontend

# Backend only (http://localhost:7000)
pnpm dev:backend
```

## Production Build

1. **Build the frontend:**
   ```bash
   pnpm build
   ```
   This creates the production build in the `dist/` folder.

2. **Start the production server:**
   ```bash
   pnpm start
   ```

3. **Or use PM2:**
   ```bash
   # Start server + tunnel
   pm2 start ecosystem.config.cjs
   
   # View logs
   pm2 logs reward-preview  
   
   # Check status (by namespace)
   pm2 status --namespace chainlink-build
   
   # Restart all in namespace
   pm2 restart --namespace chainlink-build
   
   # Stop all in namespace
   pm2 stop --namespace chainlink-build
   
   # Delete from PM2
   pm2 delete --namespace chainlink-build
   ```
