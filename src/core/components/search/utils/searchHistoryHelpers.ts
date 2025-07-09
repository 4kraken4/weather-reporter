import {
  HISTORICAL_SEARCHES_KEY,
  MAX_HISTORICAL_SEARCHES,
} from '../types/search.types';

/**
 * Validates and sanitizes a search query
 * @param query The search query to validate
 * @returns The sanitized query or null if invalid
 */
export const sanitizeSearchQuery = (query: string): string | null => {
  try {
    const trimmedQuery = query.trim();

    // Basic validation
    if (!trimmedQuery || trimmedQuery.length < 2 || trimmedQuery.length > 100) {
      return null;
    }

    // Basic XSS prevention - remove HTML special characters
    const sanitizedQuery = trimmedQuery.replace(/[<>'"&]/g, '');
    return sanitizedQuery.length >= 2 ? sanitizedQuery : null;
  } catch (error) {
    console.warn('Error sanitizing search query:', error);
    return null;
  }
};

/**
 * Loads historical searches from localStorage
 * @returns Array of historical searches or empty array if none found
 */
export const loadHistoricalSearches = (): string[] => {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined' || !window.localStorage) {
      return [];
    }

    const stored = localStorage.getItem(HISTORICAL_SEARCHES_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as unknown;

    // Validate that it's an array of strings
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed.slice(0, MAX_HISTORICAL_SEARCHES); // Ensure max limit
    }

    return [];
  } catch (error) {
    console.warn('Failed to load historical searches:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(HISTORICAL_SEARCHES_KEY);
    } catch (clearError) {
      console.warn('Failed to clear corrupted historical searches:', clearError);
    }
    return [];
  }
};

/**
 * Saves historical searches to localStorage
 * @param searches Array of searches to save
 */
export const saveHistoricalSearches = (searches: string[]): void => {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined' || !window.localStorage) {
      return;
    }

    // Validate input
    if (!Array.isArray(searches) || searches.some(item => typeof item !== 'string')) {
      console.warn('Invalid searches array provided to saveHistoricalSearches');
      return;
    }

    // Sanitize and limit size
    const sanitizedSearches = searches
      .slice(0, MAX_HISTORICAL_SEARCHES)
      .map(search => sanitizeSearchQuery(search))
      .filter((search): search is string => search !== null);

    localStorage.setItem(HISTORICAL_SEARCHES_KEY, JSON.stringify(sanitizedSearches));
  } catch (error) {
    // Handle quota exceeded or other localStorage errors
    if (error instanceof DOMException && error.code === 22) {
      console.warn('localStorage quota exceeded, clearing historical searches');
      try {
        localStorage.removeItem(HISTORICAL_SEARCHES_KEY);
      } catch (clearError) {
        console.warn('Failed to clear localStorage:', clearError);
      }
    } else {
      console.warn('Failed to save historical searches:', error);
    }
  }
};

/**
 * Adds a new search to the historical searches
 * @param query The search query to add
 * @param currentSearches Current list of historical searches
 * @returns Updated list of historical searches
 */
export const addToHistoricalSearches = (
  query: string,
  currentSearches: string[]
): string[] => {
  // Input validation
  if (typeof query !== 'string' || !Array.isArray(currentSearches)) {
    console.warn('Invalid input to addToHistoricalSearches');
    return Array.isArray(currentSearches) ? currentSearches : [];
  }

  const sanitizedQuery = sanitizeSearchQuery(query);
  if (!sanitizedQuery) {
    return currentSearches;
  }

  // Remove if already exists to move to front (case-insensitive)
  const filtered = currentSearches.filter(
    search =>
      typeof search === 'string' &&
      search.toLowerCase() !== sanitizedQuery.toLowerCase()
  );

  // Add to front and limit to MAX_HISTORICAL_SEARCHES
  return [sanitizedQuery, ...filtered].slice(0, MAX_HISTORICAL_SEARCHES);
};

/**
 * Clears all historical searches from localStorage
 */
export const clearHistoricalSearches = (): void => {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined' || !window.localStorage) {
      return;
    }
    localStorage.removeItem(HISTORICAL_SEARCHES_KEY);
  } catch (error) {
    console.warn('Failed to clear historical searches:', error);
  }
};

/**
 * Checks if localStorage is available
 * @returns boolean indicating if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    return typeof Storage !== 'undefined' && Boolean(window.localStorage);
  } catch {
    return false;
  }
};
