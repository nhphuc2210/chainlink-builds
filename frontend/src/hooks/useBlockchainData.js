import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to fetch blockchain data for a BUILD project
 * Uses server-side decoded API endpoints (no ethers.js needed on frontend)
 * @param {Object} project - The selected project object
 * @returns {Object} - { config, globalState, loading, error, refetch }
 */
export function useBlockchainData(project) {
  const [config, setConfig] = useState(null);
  const [globalState, setGlobalState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!project) {
      setConfig(null);
      setGlobalState(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch config and global state in parallel from server API
      const [configRes, globalStateRes] = await Promise.all([
        fetch(`/api/project/${project.tokenAddress}/config?seasonId=${project.seasonId}`),
        fetch(`/api/project/${project.tokenAddress}/global-state?seasonId=${project.seasonId}`)
      ]);

      if (!configRes.ok) {
        const errorData = await configRes.json();
        throw new Error(errorData.message || 'Failed to fetch config');
      }

      if (!globalStateRes.ok) {
        const errorData = await globalStateRes.json();
        throw new Error(errorData.message || 'Failed to fetch global state');
      }

      // Parse the decoded JSON responses from server
      const configData = await configRes.json();
      const globalStateData = await globalStateRes.json();

      setConfig(configData);
      setGlobalState(globalStateData);
    } catch (err) {
      console.error("Error fetching blockchain data:", err);
      setError(err.message || "Failed to fetch blockchain data");
    } finally {
      setLoading(false);
    }
  }, [project]);

  // Fetch data when project changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    config,
    globalState,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Calculate vesting metrics for a given day
 * Based on BUILDClaim.sol logic
 */
export function calculateVestingMetrics({
  maxTokenAmount,
  baseTokenClaimBps,
  unlockDurationDays,
  earlyVestRatioMinBps,
  earlyVestRatioMaxBps,
  dayT,
  totalLoyalty,
  totalLoyaltyIneligible,
  tokenAmount,
}) {
  const BPS_DENOMINATOR = 10000;

  // Base calculation
  const base = (maxTokenAmount * baseTokenClaimBps) / BPS_DENOMINATOR;
  const bonus = maxTokenAmount - base;

  // Check if unlock is complete (matches smart contract isUnlocking logic)
  const isUnlockComplete = dayT >= unlockDurationDays;

  // Vested calculation at day t - cap at bonus (can't vest more than 100%)
  const vestedRaw = unlockDurationDays > 0 ? (bonus * dayT) / unlockDurationDays : bonus;
  const vested = Math.min(vestedRaw, bonus);

  const unlocked = base + vested;
  const locked = Math.max(0, maxTokenAmount - unlocked); // Can't be negative

  // Loyalty bonus estimate (share of pool if wait till end)
  // Formula: maxTokenAmount * totalLoyalty / (tokenAmount - totalLoyaltyIneligible)
  const eligiblePool = tokenAmount - totalLoyaltyIneligible;
  const loyaltyBonus = eligiblePool > 0 ? (maxTokenAmount * totalLoyalty) / eligiblePool : 0;

  // Early vest only applies during unlock period (matches smart contract)
  let earlyVestRatio = 0;
  let earlyVestableBonus = 0;
  let forfeited = 0;

  if (!isUnlockComplete && locked > 0) {
    // Early vest ratio at day t (scales linearly from min to max)
    const earlyVestRatioMin = earlyVestRatioMinBps / BPS_DENOMINATOR;
    const earlyVestRatioMax = earlyVestRatioMaxBps / BPS_DENOMINATOR;
    earlyVestRatio = earlyVestRatioMin + ((earlyVestRatioMax - earlyVestRatioMin) * dayT) / unlockDurationDays;

    // Early vestable bonus (what you can claim early from locked portion)
    earlyVestableBonus = locked * earlyVestRatio;

    // Forfeited to loyalty pool (what you give up if early claim)
    forfeited = locked - earlyVestableBonus;
  }

  // Total if early claim (only valid during unlock period)
  // After unlock complete, early claim = same as waiting (full amount + loyalty)
  const totalIfEarlyClaim = isUnlockComplete
    ? maxTokenAmount + loyaltyBonus
    : unlocked + earlyVestableBonus;

  // Total if wait till end
  const totalIfWait = maxTokenAmount + loyaltyBonus;

  return {
    base,
    bonus,
    vested,
    unlocked,
    locked,
    earlyVestRatio,
    earlyVestRatioPercent: earlyVestRatio * 100,
    earlyVestableBonus,
    totalIfEarlyClaim,
    forfeited,
    loyaltyBonus,
    totalIfWait,
    isUnlockComplete,
  };
}

/**
 * Generate full vesting timeline table data
 */
export function generateVestingTimeline({
  maxTokenAmount,
  config,
  globalState,
  startDate,
}) {
  if (!config || !maxTokenAmount || maxTokenAmount <= 0) {
    return [];
  }

  const rows = [];
  const days = config.unlockDurationDays || 90;

  for (let t = 0; t <= days; t++) {
    const metrics = calculateVestingMetrics({
      maxTokenAmount,
      baseTokenClaimBps: config.baseTokenClaimBps,
      unlockDurationDays: days,
      earlyVestRatioMinBps: config.earlyVestRatioMinBps,
      earlyVestRatioMaxBps: config.earlyVestRatioMaxBps,
      dayT: t,
      totalLoyalty: globalState?.totalLoyalty || 0,
      totalLoyaltyIneligible: globalState?.totalLoyaltyIneligible || 0,
      tokenAmount: config.tokenAmount,
    });

    // Calculate date
    let date = "";
    if (startDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + t);
      date = d.toISOString().split("T")[0];
    }

    rows.push({
      t,
      date,
      ...metrics,
    });
  }

  return rows;
}

