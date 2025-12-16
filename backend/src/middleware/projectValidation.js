import { getProject } from '../services/blockchain.js';
import { formatErrorResponse } from '../utils/responseFormatter.js';

export const validateProject = (req, res, next) => {
  const { tokenAddress } = req.query;

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

  req.project = project; // Attach project to request
  next();
};
