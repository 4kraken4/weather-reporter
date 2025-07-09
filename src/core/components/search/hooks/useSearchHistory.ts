import { useCallback, useEffect, useState } from 'react';

import { type UseSearchHistoryReturn } from '../types/search.types';
import {
  loadHistoricalSearches,
  saveHistoricalSearches,
  addToHistoricalSearches,
  clearHistoricalSearches as clearHistory,
  isStorageAvailable,
} from '../utils/searchHistoryHelpers';

/**
 * Custom hook for managing search history in localStorage
 * @returns Object containing historical searches and methods to manage them
 */
export const useSearchHistory = (): UseSearchHistoryReturn => {
  const [historicalSearches, setHistoricalSearches] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load historical searches on mount
  useEffect(() => {
    if (!isInitialized && isStorageAvailable()) {
      try {
        const storedSearches = loadHistoricalSearches();
        setHistoricalSearches(storedSearches);
      } catch (error) {
        console.warn('Error loading historical searches:', error);
        setHistoricalSearches([]);
      } finally {
        setIsInitialized(true);
      }
    }
  }, [isInitialized]);

  // Save searches whenever they change
  useEffect(() => {
    if (isInitialized && isStorageAvailable()) {
      const timeoutId = setTimeout(() => {
        saveHistoricalSearches(historicalSearches);
      }, 1000); // Debounce writes to localStorage

      return () => clearTimeout(timeoutId);
    }
  }, [historicalSearches, isInitialized]);

  // Add new search to history
  const addToHistory = useCallback((searchQuery: string) => {
    setHistoricalSearches(currentSearches =>
      addToHistoricalSearches(searchQuery, currentSearches)
    );
  }, []);

  // Clear all historical searches
  const clearHistoricalSearches = useCallback(() => {
    setHistoricalSearches([]);
    if (isStorageAvailable()) {
      clearHistory();
    }
  }, []);

  return {
    historicalSearches,
    addToHistory,
    clearHistory: clearHistoricalSearches,
  };
};
