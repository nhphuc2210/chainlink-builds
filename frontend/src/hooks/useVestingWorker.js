import { useEffect, useRef, useState, useMemo } from 'react';
// Import worker using Vite's explicit syntax
import VestingWorkerUrl from '../workers/vesting.worker.js?worker&url';

/**
 * Hook to use Web Worker for vesting calculations
 * Offloads heavy calculations to background thread for smooth UI
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.maxTokenAmount - Maximum token amount
 * @param {Object} params.config - Project configuration
 * @param {Object} params.globalState - Global state data
 * @param {string} params.startDate - Start date for timeline
 * @returns {Object} - { rows, calculating }
 */
export function useVestingWorker({ maxTokenAmount, config, globalState, startDate }) {
  const [rows, setRows] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const workerRef = useRef(null);
  
  // Create fingerprint for deep comparison (avoid unnecessary recalculations)
  // Only recalculate when these specific values change
  const fingerprint = useMemo(() => {
    if (!config) return '';
    return `${maxTokenAmount}_${config.baseTokenClaimBps}_${config.unlockDurationDays}_${config.earlyVestRatioMinBps}_${config.earlyVestRatioMaxBps}_${globalState?.totalLoyalty || 0}_${globalState?.totalLoyaltyIneligible || 0}_${startDate}`;
  }, [maxTokenAmount, config, globalState, startDate]);
  
  // Initialize worker once on mount
  useEffect(() => {
    try {
      // Use explicit worker URL from Vite import
      workerRef.current = new Worker(VestingWorkerUrl, { type: 'module' });
    } catch (error) {
      console.error('Worker creation error:', error);
      return;
    }
    
    // Listen for results from worker
    workerRef.current.onmessage = (event) => {
      const { type, payload } = event.data;
      
      if (type === 'TIMELINE_RESULT') {
        setRows(payload);
        setCalculating(false);
      } else if (type === 'TIMELINE_ERROR') {
        console.error('[VestingWorker] Error:', payload.message);
        setRows([]);
        setCalculating(false);
      }
    };
    
    // Handle worker errors
    workerRef.current.onerror = (error) => {
      console.error('[VestingWorker] Worker error:', error);
      setRows([]);
      setCalculating(false);
    };
    
    // Cleanup: terminate worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);
  
  // Send calculation task to worker when inputs change
  useEffect(() => {
    if (!config || !maxTokenAmount) {
      setRows([]);
      return;
    }
    
    setCalculating(true);
    
    // Send message to worker to start calculation
    workerRef.current?.postMessage({
      type: 'CALCULATE_TIMELINE',
      payload: { 
        maxTokenAmount, 
        config, 
        globalState, 
        startDate 
      }
    });
  }, [fingerprint]); // Only re-run when fingerprint changes
  
  return { rows, calculating };
}

