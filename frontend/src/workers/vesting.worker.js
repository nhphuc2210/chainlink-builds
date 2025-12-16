// Web Worker for vesting calculations
// Self-contained worker with no external dependencies

/**
 * Calculate vesting metrics for a given day
 * Based on BUILDClaim.sol logic
 */
function calculateVestingMetrics({
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
function generateVestingTimeline({
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

// Listen for calculation requests from main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  if (type === 'CALCULATE_TIMELINE') {
    try {
      const timeline = generateVestingTimeline(payload);
      self.postMessage({ 
        type: 'TIMELINE_RESULT', 
        payload: timeline 
      });
    } catch (error) {
      self.postMessage({ 
        type: 'TIMELINE_ERROR', 
        payload: { message: error.message } 
      });
    }
  }
});

