import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'chainlink_wallet_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Hook to manage wallet address history in localStorage
 * - Stores up to 10 most recent valid addresses
 * - Sorts DESC (newest first)
 * - Handles duplicates by moving to top
 * 
 * @returns {Object} { history, addToHistory, removeFromHistory, clearHistory }
 */
export function useWalletHistory() {
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (error) {
      console.error('[useWalletHistory] Failed to load history:', error);
      setHistory([]);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('[useWalletHistory] Failed to save history:', error);
    }
  }, [history]);

  /**
   * Add address to history (or move to top if duplicate)
   * Only accepts valid Ethereum addresses (0x + 40 hex chars)
   */
  const addToHistory = useCallback((address) => {
    if (!address || typeof address !== 'string') {
      return;
    }

    // Validate Ethereum address format
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    if (!isValid) {
      return;
    }

    setHistory((prev) => {
      // Remove if already exists (will be added to top)
      const filtered = prev.filter((addr) => addr.toLowerCase() !== address.toLowerCase());
      
      // Add to beginning and limit to MAX_HISTORY_ITEMS
      const updated = [address, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      return updated;
    });
  }, []);

  /**
   * Remove a specific address from history
   */
  const removeFromHistory = useCallback((address) => {
    setHistory((prev) => prev.filter((addr) => addr.toLowerCase() !== address.toLowerCase()));
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}

