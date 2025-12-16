import { createContext, useContext, useState, useCallback } from 'react';

const RateLimitContext = createContext(undefined);

export function RateLimitProvider({ children }) {
  const [rateLimitActive, setRateLimitActive] = useState(false);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState(0);

  const triggerRateLimit = useCallback((retryAfter) => {
    setRateLimitActive(true);
    setRateLimitRetryAfter(retryAfter);
  }, []);

  const clearRateLimit = useCallback(() => {
    setRateLimitActive(false);
    setRateLimitRetryAfter(0);
  }, []);

  const value = {
    rateLimitActive,
    rateLimitRetryAfter,
    triggerRateLimit,
    clearRateLimit,
  };

  return (
    <RateLimitContext.Provider value={value}>
      {children}
    </RateLimitContext.Provider>
  );
}

export function useRateLimit() {
  const context = useContext(RateLimitContext);
  if (!context) {
    throw new Error('useRateLimit must be used within a RateLimitProvider');
  }
  return context;
}

