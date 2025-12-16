export const DEFAULTS = {
  // Config defaults (before API fetch)
  baseTokenClaimBps: 0, // 0%
  unlockDurationDays: 90,
  earlyVestRatioMinBps: 2000, // 20%
  earlyVestRatioMaxBps: 6000, // 60%
  unlockStartDate: '2025-12-16',
  
  // Global state defaults (before API fetch)
  tokenAmount: 76880160, // 76.88M SXT tokens
  totalClaimed: 0,
  totalLoyalty: 0,
  totalLoyaltyIneligible: 0,
  
  // UI settings
  animationDuration: 0.4, // Counter animation duration in seconds
};
