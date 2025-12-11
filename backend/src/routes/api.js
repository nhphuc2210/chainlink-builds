import express from 'express';
import { fetchProjectConfig, fetchGlobalState, proxyRpcRequest, getProject } from '../services/blockchain.js';

const router = express.Router();

// GET /api/project/:tokenAddress/config
router.get('/project/:tokenAddress/config', async (req, res) => {
  try {
    const { tokenAddress } = req.params;
    const seasonId = parseInt(req.query.seasonId) || 1;
    
    const project = getProject(tokenAddress);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const config = await fetchProjectConfig(tokenAddress, seasonId);
    res.json(config);
  } catch (error) {
    console.error('[API] Error fetching config:', error.message);
    res.status(500).json({ error: 'Failed to fetch config', message: error.message });
  }
});

// GET /api/project/:tokenAddress/global-state
router.get('/project/:tokenAddress/global-state', async (req, res) => {
  try {
    const { tokenAddress } = req.params;
    const seasonId = parseInt(req.query.seasonId) || 1;
    
    const project = getProject(tokenAddress);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const globalState = await fetchGlobalState(tokenAddress, seasonId);
    res.json(globalState);
  } catch (error) {
    console.error('[API] Error fetching global state:', error.message);
    res.status(500).json({ error: 'Failed to fetch global state', message: error.message });
  }
});

// POST /api/rpc - Legacy RPC Proxy endpoint
router.post('/rpc', async (req, res) => {
  try {
    const data = await proxyRpcRequest(req.body);
    res.json(data);
  } catch (error) {
    console.error('[RPC Proxy] Error:', error.message);
    res.status(500).json({ error: 'RPC request failed', message: error.message });
  }
});

export default router;

