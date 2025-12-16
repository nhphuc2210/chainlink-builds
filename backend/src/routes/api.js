import express from 'express';
import { fetchProjectConfig, fetchGlobalState, fetchUserClaimValues, getProject } from '../services/blockchain.js';
import { formatApiResponse, formatErrorResponse, CONTRACT_INFO } from '../utils/responseFormatter.js';
import { withCache } from '../middleware/cache.js';
import { API_DEFAULTS } from '../../../config/backend/constants.js';
import { validateProject } from '../middleware/projectValidation.js'; // Import new middleware
import { sendApiResponse } from '../utils/apiResponse.js'; // Import new helper
import requestLogger from '../middleware/requestLogger.js'; // Import requestLogger
import { API_ROUTES } from '../../../config/shared/api.js'; // Import shared API routes
import { verifyClientSignature } from '../middleware/signature.js'; // Import signature verification

// V1 API Router (Query-Based Parameters)
const router = express.Router();

// Enforce security mode (true = always enforce, false = skip in development)
const enforceSecurityMode = process.env.FORCE_SECURITY === 'true';

// NOTE: Protected endpoints list is defined in config/shared/security.js
// Each protected endpoint must have verifyClientSignature() middleware applied

// Request Logging Middleware
router.use(requestLogger);

// GET /api/v1/project/config
// ⚠️ Protected endpoint - requires client signature with server-issued nonce
router.get(
  API_ROUTES.PROJECT.CONFIG,
  verifyClientSignature(enforceSecurityMode), // Signature verification
  validateProject,
  ...withCache('projectConfig'),
  async (req, res) => {
  try {
    const { tokenAddress, seasonId = API_DEFAULTS.DEFAULT_SEASON_ID } = req.query;
    
    if (!tokenAddress) {
      return res.status(400).json(formatErrorResponse(
        'Missing required parameter',
        'tokenAddress query parameter is required'
      ));
    }
    
    const project = getProject(tokenAddress);
    if (!project) {
      return res.status(404).json(formatErrorResponse(
        'Project not found',
        `No project found for token address: ${tokenAddress}`
      ));
    }

    const result = await fetchProjectConfig(tokenAddress, parseInt(seasonId));
    
    sendApiResponse(
      res,
      result.data,
      {
        cacheStatus: result.cacheStatus,
        timestamp: result.timestamp,
        ttl: result.ttl
      },
      CONTRACT_INFO.buildFactory
    );
  } catch (error) {
    console.error('[API v1] Error fetching config:', error.message);
    res.status(500).json(formatErrorResponse(
      'Failed to fetch config',
      error.message
    ));
  }
});

// GET /api/v1/project/global-state
// ⚠️ Protected endpoint - requires client signature with server-issued nonce
router.get(
  API_ROUTES.PROJECT.GLOBAL_STATE,
  verifyClientSignature(enforceSecurityMode), // Signature verification
  validateProject,
  ...withCache('globalState'),
  async (req, res) => {
  try {
    const { tokenAddress, seasonId = API_DEFAULTS.DEFAULT_SEASON_ID } = req.query;
    const project = req.project; // Get project from middleware

    const result = await fetchGlobalState(tokenAddress, parseInt(seasonId));
    
    sendApiResponse(
      res,
      result.data,
      {
        cacheStatus: result.cacheStatus,
        timestamp: result.timestamp,
        ttl: result.ttl
      },
      CONTRACT_INFO.claimContract(project.claimAddress)
    );
  } catch (error) {
    console.error('[API v1] Error fetching global state:', error.message);
    res.status(500).json(formatErrorResponse(
      'Failed to fetch global state',
      error.message
    ));
  }
});

// POST /api/v1/project/user-claim
// ⚠️ Protected endpoint - requires client signature with server-issued nonce
router.post(
  API_ROUTES.PROJECT.USER_CLAIM,
  verifyClientSignature(enforceSecurityMode), // Signature verification
  validateProject,
  ...withCache('userClaim'),
  async (req, res) => {
  try {
    const { tokenAddress } = req.query;
    const { userAddress, maxTokenAmount, seasonId } = req.body;
    const project = req.project; // Get project from middleware

    if (!userAddress) {
      return res.status(400).json(formatErrorResponse(
        'Missing required field',
        'userAddress is required in request body'
      ));
    }

    const season = seasonId || API_DEFAULTS.DEFAULT_SEASON_ID;
    const maxAmount = maxTokenAmount || 0;

    const result = await fetchUserClaimValues(userAddress, tokenAddress, season, maxAmount);
    
    sendApiResponse(
      res,
      result.data,
      {
        cacheStatus: result.cacheStatus,
        timestamp: result.timestamp,
        ttl: result.ttl
      },
      CONTRACT_INFO.claimContract(project.claimAddress)
    );
  } catch (error) {
    console.error('[API v1] Error fetching user claim values:', error.message);
    
    if (error.message.includes('Invalid Ethereum address')) {
      return res.status(400).json(formatErrorResponse(
        'Invalid wallet address',
        error.message
      ));
    }
    
    res.status(500).json(formatErrorResponse(
      'Failed to fetch user claim data',
      error.message
    ));
  }
});

export default router;


