import { useState, useEffect, useRef, useCallback } from 'react';
import { useMarketHours } from './useMarketHours';

export const useMarketDataFetch = (fetchFunction, options = {}) => {
  const { interval = 30000 } = options;
  const { isMarketOpen, checkMarketHours } = useMarketHours();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const intervalRef = useRef(null);
  const hasInitialFetchRef = useRef(false);

  const wrappedFetchFunction = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFunction();
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      console.error("Market data fetch error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const startRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (checkMarketHours()) {
        wrappedFetchFunction();
      }
    }, interval);
    
    console.log('✅ Real-time updates started (every 30 seconds)');
  }, [wrappedFetchFunction, interval, checkMarketHours]);

  const stopRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('⏸️ Real-time updates stopped');
    }
  }, []);

  const manualRefresh = useCallback(() => {
    return wrappedFetchFunction();
  }, [wrappedFetchFunction]);

  useEffect(() => {
    // Initial fetch (always fetch once regardless of market status)
    if (!hasInitialFetchRef.current) {
      wrappedFetchFunction();
      hasInitialFetchRef.current = true;
    }

    if (isMarketOpen) {
      // Market is open - start real-time updates
      startRealTimeUpdates();
    } else {
      // Market is closed - stop real-time updates
      stopRealTimeUpdates();
    }

    return () => {
      stopRealTimeUpdates();
    };
  }, [isMarketOpen, startRealTimeUpdates, stopRealTimeUpdates, wrappedFetchFunction]);

  return {
    data,
    loading,
    error,
    isMarketOpen,
    manualRefresh
  };
};
