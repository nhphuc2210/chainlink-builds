import { PROJECTS_MAP } from '../../../config/shared/contracts.js';

export function validateProjectAndGet(tokenAddress) {
  const project = PROJECTS_MAP[tokenAddress.toLowerCase()];
  if (!project) {
    throw new Error('Project not found');
  }
  return project;
}
