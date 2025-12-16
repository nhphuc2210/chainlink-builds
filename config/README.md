# Configuration Files - Usage Guide

This folder contains all centralized configuration files for the reward_preview application.

## Structure

```
config/
├── backend/
│   ├── index.js              # Re-exports all backend configs
│   ├── api.js                # API base paths (imports from shared)
│   ├── rateLimiting.js       # Rate limit settings
│   ├── security.js           # Signature, nonce, CORS settings
│   ├── cache.js              # Redis cache TTL settings
│   ├── constants.js          # Backend constants
│   └── server.js             # Server port, host, static files
├── frontend/
│   ├── index.js              # Re-exports all frontend configs
│   ├── api.js                # API endpoints (imports from shared)
│   ├── defaults.js           # Frontend defaults
│   └── theme.js              # UI theme colors
├── shared/                   # Shared configs between frontend & backend
│   ├── api.js                # API routes (single source of truth)
│   ├── contracts.js          # Smart contract addresses & ABIs
│   └── security.js           # Protected endpoints list
└── README.md                 # This file
```

## Usage

### Backend

```javascript
// Import specific config
import { RATE_LIMIT_CONFIG } from '../../config/backend/rateLimiting.js';
import { SECURITY_CONFIG } from '../../config/backend/security.js';
import { CACHE_CONFIG } from '../../config/backend/cache.js';
import { SERVER_CONFIG } from '../../config/backend/server.js';

// Or import multiple configs at once
import { RATE_LIMIT_CONFIG, SECURITY_CONFIG } from '../../config/backend/index.js';
```

### Frontend

```javascript
// Import specific config
import { API_CONFIG } from '../../../config/frontend/api.js';
import { theme } from '../../../config/frontend/theme.js';

// Or import multiple configs at once
import { API_CONFIG, theme } from '../../../config/frontend/index.js';
```

## Configuration Details

### Backend Configurations

#### 1. Rate Limiting (`backend/rateLimiting.js`)
- **Per-second limit**: 50 requests/second per IP
- **Per-minute limit**: 150 requests/minute per IP
- **Penalty duration**: 60 seconds block after violation
- **Cleanup interval**: 60 seconds

**To modify**: Edit `RATE_LIMIT_CONFIG` values

#### 2. Security (`backend/security.js`)
- **Signature window**: 5 minutes validity
- **Nonce TTL**: 5 minutes
- **Cleanup interval**: 60 seconds
- **CORS origins**: Whitelist of allowed domains

**To modify**: Edit `SECURITY_CONFIG` values

#### 3. Cache (`backend/cache.js`)
- **Project config**: 24h primary, 48h stale
- **Global state**: 1h primary, 2h stale
- **User claim**: 1h primary, 2h stale
- **Redis retries**: 3 attempts, max 1000ms backoff

**To modify**: Edit `CACHE_CONFIG.ttl` values (in seconds)

#### 4. Server (`backend/server.js`)
- **Default port**: 7000
- **Default host**: 0.0.0.0
- **Static files cache**: 1 day

**To modify**: Edit `SERVER_CONFIG` values

### Frontend Configurations

#### 1. API (`frontend/api.js`)
- **Default season ID**: 1
- **Base path**: `/api/v1` (imported from `shared/api.js`)
- **Endpoints**: Config, global state, user claim (imported from `shared/api.js`)

**To modify API routes**: Edit `shared/api.js` (changes apply to both frontend and backend)  
**To modify defaults**: Edit `API_CONFIG` values in `frontend/api.js`

### Shared Configurations

#### 1. API Routes (`shared/api.js`)
- **Single source of truth** for all API endpoint paths
- Used by both frontend (`config/frontend/api.js`) and backend (`backend/src/routes/api.js`)
- **Base paths**: `/api/v1`, `/internal/api`
- **Project endpoints**: `/project/config`, `/project/global-state`, `/project/user-claim`

**To modify**: Edit `API_ROUTES` values - changes automatically apply to both frontend and backend

#### 2. Protected Endpoints (`shared/security.js`)
- **List of endpoints** that require HMAC signature verification
- Currently protected: `/api/v1/project/config`, `/api/v1/project/global-state`, `/api/v1/project/user-claim`
- Used by frontend to determine when to fetch nonce and add signatures
- Used by backend routes as documentation reference
- **Helper functions**: `requiresSignature(path)`, `getProtectedEndpointCount()`

**To add a new protected endpoint**:
1. Add path to `PROTECTED_ENDPOINTS` array in `shared/security.js`
2. Add `verifyClientSignature()` middleware to route in `backend/src/routes/api.js`
3. Update `/api/init` rate limit multiplier in `backend/rateLimiting.js` (multiply by endpoint count)

#### 3. Smart Contracts (`shared/contracts.js`)
- **BUILD Factory address**: Main factory contract
- **Contract ABIs**: For BuildFactory and BuildClaim contracts
- **BUILD Projects list**: All 9 projects with token addresses, claim addresses, decimals
- **Projects map**: Quick lookup by token address (for backend)

**To modify**: Edit contract constants - used across the entire application

#### 2. Theme (`frontend/theme.js`)
- **Colors**: Chainlink official theme colors
- **Includes**: Primary, secondary, accent colors, shadows

**To modify**: Edit `theme` object values

## Benefits

1. **Single Source of Truth**: All config values in one place
2. **Easy Maintenance**: Change values without searching through code
3. **Environment-friendly**: Easy to override with environment variables
4. **Documentation**: Clear comments for each configuration
5. **Type Safety**: JSDoc comments enable IDE autocomplete

## Examples

### Changing Rate Limits

Edit `config/backend/rateLimiting.js`:

```javascript
export const RATE_LIMIT_CONFIG = {
  perSecond: {
    windowMs: 1 * 1000,
    max: 100,  // Changed from 50 to 100
  },
  // ...
};
```

### Adjusting Cache TTL

Edit `config/backend/cache.js`:

```javascript
export const CACHE_CONFIG = {
  ttl: {
    projectConfig: 12 * 60 * 60,  // Changed from 24h to 12h
    // ...
  },
};
```

### Updating Theme Colors

Edit `config/frontend/theme.js`:

```javascript
export const theme = {
  accentBlue: "#0000FF",  // Changed to pure blue
  // ...
};
```

## Migration Notes

The following files were updated to use centralized config:

**Backend:**
- `backend/src/middleware/rateLimiter.js`
- `backend/src/middleware/signature.js`
- `backend/src/middleware/nonce.js`
- `backend/src/services/blockchain.js`
- `backend/src/server.js`

**Frontend:**
- `frontend/src/hooks/useBlockchainData.js`
- `frontend/src/styles/theme.js` (now re-exports from config)

**Unchanged:**
- `shared/constants/contracts.js` (already well-organized)

