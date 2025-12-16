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

### 1. Local Development Mode (Hot Reload)

Chạy cả frontend và backend với hot reload để phát triển:

```bash
pnpm local:dev
```

**Chi tiết:**
- Frontend: `http://localhost:5173` (Vite dev server với HMR)
- Backend: `http://localhost:7000` (nodemon auto-restart)
- Sử dụng `NODE_ENV=development`
- Chạy đồng thời cả 2 processes với concurrently

**Chạy riêng lẻ (nếu cần):**
```bash
# Chỉ frontend
pnpm dev:frontend

# Chỉ backend
pnpm dev:backend
```

### 2. Local Production Mode (Test Production Build)

Test production build trên máy local trước khi deploy:

```bash
pnpm local:prod
```

**Chi tiết:**
- Build frontend với production config (minified, obfuscated)
- Chạy backend ở production mode
- Sử dụng `NODE_ENV=local-production`
- Backend serve static files từ `dist/`
- Truy cập: `http://localhost:7000`

### 3. Production Deployment (PM2)

Deploy lên production server với PM2:

**Build trước:**
```bash
pnpm build
```
*(Script này tự động encrypt secrets và build frontend)*

**Chạy với PM2:**
```bash
# Khởi động server
pnpm pm2:start

# Restart server
pnpm pm2:restart

# Stop server
pnpm pm2:stop

# Xem logs
pnpm pm2:logs
```

**Hoặc quản lý trực tiếp với PM2:**
```bash
# Start với ecosystem config
pm2 start ecosystem.config.cjs

# Xem status theo namespace
pm2 status --namespace chainlink-build

# Restart tất cả trong namespace
pm2 restart --namespace chainlink-build

# Stop tất cả trong namespace
pm2 stop --namespace chainlink-build

# Xóa khỏi PM2
pm2 delete --namespace chainlink-build
```

**Chi tiết Production:**
- Sử dụng `NODE_ENV=production`
- Frontend đã được build, minified và obfuscated
- Secrets được encrypt (nếu có)
- Compression và rate limiting enabled
- PM2 quản lý process, auto-restart nếu crash


```major version release
git tag -a v1.0.0 -m "Release v1.0.0"
git archive --prefix=chainlink-builds-v1.0.0/ -o chainlink-builds-v1.0.0.zip v1.0.0
git push origin v1.0.0
git tag
```