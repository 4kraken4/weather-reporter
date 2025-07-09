const HISTORICAL_SEARCHES_KEY = 'weather-app-historical-searches';
const MAX_HISTORICAL_SEARCHES = 3;

export const loadHistoricalSearches = (): string[] => {
  try {
    if (typeof Storage === 'undefined' || !window.localStorage) {
      return [];
    }

    const stored = localStorage.getItem(HISTORICAL_SEARCHES_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as unknown;
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed.slice(0, MAX_HISTORICAL_SEARCHES);
    }
    return [];
  } catch (error) {
    console.warn('Failed to load historical searches:', error);
    try {
      localStorage.removeItem(HISTORICAL_SEARCHES_KEY);
    } catch (clearError) {
      console.warn('Failed to clear corrupted historical searches:', clearError);
    }
    return [];
  }
};

export const saveHistoricalSearches = (searches: string[]): void => {
  try {
    if (typeof Storage === 'undefined' || !window.localStorage) {
      return;
    }

    if (!Array.isArray(searches) || searches.some(item => typeof item !== 'string')) {
      console.warn('Invalid searches array provided to saveHistoricalSearches');
      return;
    }

    const sanitizedSearches = searches
      .slice(0, MAX_HISTORICAL_SEARCHES)
      .map(search => search.trim())
      .filter(search => search.length >= 2 && search.length <= 100);

    localStorage.setItem(HISTORICAL_SEARCHES_KEY, JSON.stringify(sanitizedSearches));
  } catch (error) {
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

export const clearHistoricalSearches = (): void => {
  try {
    if (typeof Storage === 'undefined' || !window.localStorage) {
      return;
    }
    localStorage.removeItem(HISTORICAL_SEARCHES_KEY);
  } catch (error) {
    console.warn('Failed to clear historical searches:', error);
  }
};

export const addToHistoricalSearches = (
  query: string,
  currentSearches: string[]
): string[] => {
  if (typeof query !== 'string' || !Array.isArray(currentSearches)) {
    console.warn('Invalid input to addToHistoricalSearches');
    return Array.isArray(currentSearches) ? currentSearches : [];
  }

  const trimmedQuery = query.trim();
  if (!trimmedQuery || trimmedQuery.length < 2 || trimmedQuery.length > 100) {
    return currentSearches;
  }

  const sanitizedQuery = trimmedQuery.replace(/[<>'"&]/g, '');
  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    return currentSearches;
  }

  const filtered = currentSearches.filter(
    search =>
      typeof search === 'string' &&
      search.toLowerCase() !== sanitizedQuery.toLowerCase()
  );

  return [sanitizedQuery, ...filtered].slice(0, MAX_HISTORICAL_SEARCHES);
};

export const MAX_SEARCHES = MAX_HISTORICAL_SEARCHES;
