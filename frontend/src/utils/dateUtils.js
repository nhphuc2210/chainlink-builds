export function calculateCurrentDay(unlockStartDate, durationDays) {
  if (!unlockStartDate) return 0;

  const today = new Date();
  const unlockStart = new Date(unlockStartDate);
  const diffTime = today.getTime() - unlockStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return durationDays !== undefined && durationDays !== null
    ? Math.max(0, Math.min(diffDays, durationDays))
    : Math.max(0, diffDays);
}
