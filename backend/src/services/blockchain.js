import { ethers } from 'ethers';
import { BUILD_FACTORY_ADDRESS, BUILD_FACTORY_ABI, BUILD_CLAIM_ABI, PROJECTS_MAP } from '../../../shared/constants/contracts.js';

// Load Infura API keys from environment
function getInfuraKeys() {
  const keys = process.env.INFURA_API_KEYS?.split(',') || [];
  if (keys.length === 0) {
    console.error('[blockchain] INFURA_API_KEYS is required!');
    throw new Error('Missing INFURA_API_KEYS environment variable');
  }
  return keys;
}

export function getRandomInfuraUrl() {
  const keys = getInfuraKeys();
  const key = keys[Math.floor(Math.random() * keys.length)];
  return `https://mainnet.infura.io/v3/${key}`;
}

export function getProject(tokenAddress) {
  return PROJECTS_MAP[tokenAddress.toLowerCase()];
}

export async function fetchProjectConfig(tokenAddress, seasonId = 1) {
  const project = getProject(tokenAddress);
  if (!project) {
    throw new Error('Project not found');
  }

  const provider = new ethers.JsonRpcProvider(getRandomInfuraUrl());
  const factoryContract = new ethers.Contract(BUILD_FACTORY_ADDRESS, BUILD_FACTORY_ABI, provider);

  const [projectSeasonConfig, unlockStartTime] = await factoryContract.getProjectSeasonConfig(tokenAddress, seasonId);
  const tokenAmounts = await factoryContract.getTokenAmounts(tokenAddress);

  return {
    tokenAmount: Number(ethers.formatUnits(projectSeasonConfig.tokenAmount, project.decimals)),
    tokenAmountRaw: projectSeasonConfig.tokenAmount.toString(),
    totalDeposited: Number(ethers.formatUnits(tokenAmounts.totalDeposited, project.decimals)),
    totalDepositedRaw: tokenAmounts.totalDeposited.toString(),
    totalWithdrawn: Number(ethers.formatUnits(tokenAmounts.totalWithdrawn, project.decimals)),
    totalAllocated: Number(ethers.formatUnits(tokenAmounts.totalAllocatedToAllSeasons, project.decimals)),
    merkleRoot: projectSeasonConfig.merkleRoot,
    unlockDelay: Number(projectSeasonConfig.unlockDelay),
    unlockDuration: Number(projectSeasonConfig.unlockDuration),
    unlockDurationDays: Math.round(Number(projectSeasonConfig.unlockDuration) / 86400),
    earlyVestRatioMinBps: Number(projectSeasonConfig.earlyVestRatioMinBps),
    earlyVestRatioMaxBps: Number(projectSeasonConfig.earlyVestRatioMaxBps),
    baseTokenClaimBps: Number(projectSeasonConfig.baseTokenClaimBps),
    isRefunding: projectSeasonConfig.isRefunding,
    unlockStartTime: Number(unlockStartTime),
    unlockStartDate: unlockStartTime > 0
      ? new Date(Number(unlockStartTime) * 1000).toISOString().split("T")[0]
      : null,
  };
}

export async function fetchGlobalState(tokenAddress, seasonId = 1) {
  const project = getProject(tokenAddress);
  if (!project) {
    throw new Error('Project not found');
  }

  const provider = new ethers.JsonRpcProvider(getRandomInfuraUrl());
  const claimContract = new ethers.Contract(project.claimAddress, BUILD_CLAIM_ABI, provider);

  const globalStates = await claimContract.getGlobalState([seasonId]);
  const globalStateData = globalStates[0];

  return {
    totalLoyalty: Number(ethers.formatUnits(globalStateData.totalLoyalty, project.decimals)),
    totalLoyaltyRaw: globalStateData.totalLoyalty.toString(),
    totalLoyaltyIneligible: Number(ethers.formatUnits(globalStateData.totalLoyaltyIneligible, project.decimals)),
    totalLoyaltyIneligibleRaw: globalStateData.totalLoyaltyIneligible.toString(),
    totalClaimed: Number(ethers.formatUnits(globalStateData.totalClaimed, project.decimals)),
    totalClaimedRaw: globalStateData.totalClaimed.toString(),
  };
}

export async function proxyRpcRequest(body) {
  const infuraUrl = getRandomInfuraUrl();
  const response = await fetch(infuraUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await response.json();
}

