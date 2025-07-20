// Refactored useRegionSearch.ts
import type {
  CachedSearchResult,
  Countries,
  RegionResponseType,
  SearchOptions,
  Suggestion,
} from '@core/types/common.types';
import { RegionService } from '@features/weather/services/regionService';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { sanitizeInput, validateSearchInput } from './searchValidation';
import { useAnalytics } from './useAnalytics';
import { useRateLimiter } from './useRateLimiter';
import { useSearchCache } from './useSearchCache';

import type {
  ErrorType,
  LoadingState,
  SearchError,
  SearchSuggestion,
} from '@/core/components/search/types/common';

// Types
type SearchConfig = {
  debounceDelay: number;
  maxCacheSize: number;
  autoRetry?: boolean;
  cacheTTL: number;
  maxRetries: number;
  retryDelay: number;
  rateLimit: {
    maxRequests: number;
    timeWindow: number;
  };
};

const DEFAULT_CONFIG: SearchConfig = {
  debounceDelay: 300,
  maxCacheSize: 100,
  cacheTTL: 5 * 60 * 1000,
  maxRetries: 3,
  retryDelay: 3000,
  rateLimit: {
    maxRequests: 20,
    timeWindow: 60 * 1000,
  },
};

type UseRegionSearchState = {
  data: {
    suggestions: Suggestion[];
    countries: Countries;
  };
  loading: LoadingState;
  error: SearchError | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  searchHistory: string[];
  metrics: {
    totalSearches: number;
    cacheHitRate: number;
    averageResponseTime: number;
  };
};

type UseRegionSearchReturn = UseRegionSearchState & {
  search: (query: string, options?: SearchOptions) => Promise<void>;
  goToPage: (page: number) => void;
  changePageSize: (pageSize: number) => void;
  reset: () => void;
  clearCache: () => void;
  retryLastSearch: () => Promise<void>;
  getSuggestions: (query: string, limit?: number) => SearchSuggestion[];
  getAnalytics: () => {
    totalSearches: number;
    errorsByType: Record<ErrorType, number>;
    averageResponseTime: number;
    peakUsageHours: number[];
  };
};

// Suggestion tracker (in-memory, not persisted)
const SEARCH_SUGGESTIONS = new Map<string, SearchSuggestion>();

const createCacheKey = (query: string, page: number, pageSize: number): string => {
  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, '_');
  return `${normalizedQuery}_${page}_${pageSize}`;
};

const createSearchError = (
  type: ErrorType,
  message: string,
  retryable = false,
  code?: string,
  query?: string
): SearchError => ({
  type,
  message,
  retryable,
  code,
  timestamp: Date.now(),
  query,
});

const createLoadingState = (overrides: Partial<LoadingState> = {}): LoadingState => ({
  searching: false,
  paginating: false,
  retrying: false,
  backgroundRefreshing: false,
  ...overrides,
});

export const useRegionSearch = (
  initialPageSize: number = 10,
  config: Partial<SearchConfig> = {}
): UseRegionSearchReturn => {
  const searchConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const {
    setCache,
    getCache,
    clearCache: clearCacheStore,
  } = useSearchCache({
    maxCacheSize: searchConfig.maxCacheSize,
    cacheTTL: searchConfig.cacheTTL,
  });
  const {
    isRateLimited,
    addRequest,
    clear: clearRateLimit,
  } = useRateLimiter({
    maxRequests: searchConfig.rateLimit.maxRequests,
    timeWindow: searchConfig.rateLimit.timeWindow,
  });
  const {
    trackSearch,
    trackError,
    getAnalytics: getAnalyticsData,
    clear: clearAnalytics,
  } = useAnalytics();

  const [state, setState] = useState<UseRegionSearchState>({
    data: {
      suggestions: [],
      countries: {},
    },
    loading: createLoadingState(),
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      pageSize: initialPageSize,
    },
    searchHistory: [],
    metrics: {
      totalSearches: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
    },
  });

  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs to avoid dependency issues
  const retryCountRef = useRef<number>(0);
  const pageSizeRef = useRef<number>(initialPageSize);

  // Track the current request ID for debugging
  const currentRequestIdRef = useRef<string>('');
  const inFlightSearchingCountRef = useRef(0);

  useEffect(() => {
    retryCountRef.current = retryCount;
  }, [retryCount]);

  useEffect(() => {
    pageSizeRef.current = state.pagination.pageSize;
  }, [state.pagination.pageSize]);

  // Utility functions for suggestions
  const updateSearchSuggestion = (query: string): void => {
    const normalized = query.toLowerCase().trim();
    const existing = SEARCH_SUGGESTIONS.get(normalized);

    if (existing) {
      existing.frequency += 1;
      existing.lastUsed = Date.now();
    } else {
      SEARCH_SUGGESTIONS.set(normalized, {
        query: normalized,
        frequency: 1,
        lastUsed: Date.now(),
        source: 'history',
      });
    }

    // Keep only top 50 suggestions to prevent memory bloat
    if (SEARCH_SUGGESTIONS.size > 50) {
      const entries = Array.from(SEARCH_SUGGESTIONS.entries());
      entries.sort((a, b) => b[1].frequency - a[1].frequency);
      SEARCH_SUGGESTIONS.clear();
      entries.slice(0, 50).forEach(([key, value]) => {
        SEARCH_SUGGESTIONS.set(key, value);
      });
    }
  };

  const getSearchSuggestions = (query: string, limit = 5): SearchSuggestion[] => {
    const normalized = query.toLowerCase().trim();
    if (normalized.length < 2) return [];

    const suggestions = Array.from(SEARCH_SUGGESTIONS.values())
      .filter(
        suggestion =>
          suggestion.query.includes(normalized) && suggestion.query !== normalized
      )
      .sort((a, b) => {
        // Sort by frequency and recency
        const scoreA =
          a.frequency + (Date.now() - a.lastUsed) / (1000 * 60 * 60 * 24);
        const scoreB =
          b.frequency + (Date.now() - b.lastUsed) / (1000 * 60 * 60 * 24);
        return scoreB - scoreA;
      })
      .slice(0, limit);

    return suggestions;
  };

  // Enhanced search function with caching, debouncing, and retry logic
  const performSearch = useCallback(
    async (
      query: string,
      options?: SearchOptions & {
        isRetry?: boolean;
        isBackground?: boolean;
        requestId?: string;
      }
    ): Promise<void> => {
      const startTime = Date.now();
      const isRetry = options?.isRetry ?? false;
      const isBackground = options?.isBackground ?? false;

      const requestId: string = options?.requestId ?? uuidv4();
      currentRequestIdRef.current = requestId;

      // Validation
      const validation = validateSearchInput(query);
      if (!validation.isValid) {
        const validationError = createSearchError(
          'VALIDATION',
          validation.reason ?? 'Invalid search query'
        );
        setState(prev => ({
          ...prev,
          data: { suggestions: [], countries: {} },
          loading: createLoadingState(),
          error: validationError,
          pagination: {
            ...prev.pagination,
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
          },
        }));
        return;
      }

      // Rate limiting check
      const rateLimitKey = 'search';
      if (!isRetry && isRateLimited(rateLimitKey)) {
        const rateLimitError = createSearchError(
          'RATE_LIMIT',
          'Too many search requests. Please wait a moment.',
          true
        );
        setState(prev => ({
          ...prev,
          loading: createLoadingState(),
          error: rateLimitError,
        }));
        return;
      }

      const page = options?.page ?? 1;
      const pageSize = options?.pageSize ?? pageSizeRef.current;
      const cacheKey = createCacheKey(query, page, pageSize);

      // Check cache first
      if (!isRetry) {
        const cached = getCache(cacheKey);
        if (cached) {
          setState(prev => ({
            ...prev,
            data: {
              suggestions: cached.data.suggestions,
              countries: cached.data.countries,
            },
            loading: createLoadingState(),
            error: null,
            pagination: cached.pagination,
          }));

          // Update metrics
          trackSearch();
          // If cached data is older than 2 minutes, refresh in background
          const cacheAge = Date.now() - cached.timestamp;
          if (cacheAge > 2 * 60 * 1000 && !isBackground) {
            setTimeout(() => {
              void performSearch(query, { ...options, isBackground: true });
            }, 100);
          }
          return;
        }
      }

      // Prevent duplicate requests
      if (inFlightSearchingCountRef.current > 0 && !isRetry) return;

      // Set loading state
      if (!isBackground && (!options?.page || options.page === 1)) {
        inFlightSearchingCountRef.current += 1;
        setState(prev => ({
          ...prev,
          loading: {
            ...createLoadingState(),
            searching: true,
          },
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: createLoadingState({
            paginating: !isBackground && Boolean(options?.page && options.page > 1),
            retrying: isRetry,
            backgroundRefreshing: isBackground,
          }),
          error: null,
        }));
      }

      // Add rate limit entry
      if (!isRetry) addRequest(rateLimitKey);

      // Abort previous request if exists
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        const sanitizedQuery = sanitizeInput(query);
        const response: RegionResponseType = await RegionService.search(
          sanitizedQuery,
          {
            page,
            pageSize,
            signal: abortControllerRef.current.signal,
            ...options,
          }
        );

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Update analytics
        trackSearch(responseTime);

        // Update search suggestions
        if (!isBackground) {
          updateSearchSuggestion(sanitizedQuery);
        }

        if (response?.suggestions) {
          const resultData: CachedSearchResult = {
            data: {
              suggestions: response.suggestions,
              countries: response.countries,
            },
            pagination: {
              currentPage: response.pagination.currentPage,
              totalPages: response.pagination.totalPages,
              totalItems: response.pagination.totalItems,
              pageSize: response.pagination.pageSize,
            },
            timestamp: Date.now(),
            query: sanitizedQuery,
            accessCount: 1,
            lastAccessed: Date.now(),
          };

          // Cache the result
          setCache(cacheKey, resultData);

          setState(prev => ({
            ...prev,
            data: {
              suggestions: resultData.data.suggestions,
              countries: resultData.data.countries,
            },
            loading: createLoadingState(),
            error: null,
            pagination: resultData.pagination,
            searchHistory: (() => {
              if (isBackground) return prev.searchHistory;
              if (prev.searchHistory.includes(sanitizedQuery)) {
                return prev.searchHistory;
              }
              return [sanitizedQuery, ...prev.searchHistory.slice(0, 9)];
            })(),
            metrics: {
              totalSearches: getAnalyticsData().totalSearches,
              cacheHitRate: 0, // Optionally calculate cache hit rate
              averageResponseTime: getAnalyticsData().averageResponseTime,
            },
          }));

          setRetryCount(0);
        } else {
          setState(prev => ({
            ...prev,
            data: { suggestions: [], countries: {} },
            loading: createLoadingState(),
            error: createSearchError('SERVER', 'No results found'),
            pagination: {
              ...prev.pagination,
              currentPage: 1,
              totalPages: 0,
              totalItems: 0,
            },
          }));
        }
      } catch (error) {
        let searchError: SearchError;

        if (
          typeof window !== 'undefined' &&
          window.console &&
          process.env.NODE_ENV !== 'production'
        ) {
          console.error('useRegionSearch error:', error);
        }

        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return;
          }
          if (
            error.message.includes('timeout') ||
            error.message.includes('ECONNRESET')
          ) {
            searchError = createSearchError(
              'TIMEOUT',
              'Request timeout. Please try again.',
              true
            );
          } else if (
            error.message.includes('network') ||
            error.message.includes('fetch')
          ) {
            searchError = createSearchError(
              'NETWORK',
              'Network error. Please check your connection.',
              true
            );
          } else {
            searchError = createSearchError(
              'SERVER',
              error.message || 'Search failed',
              true
            );
          }
        } else {
          searchError = createSearchError(
            'SERVER',
            'An unexpected error occurred',
            true
          );
        }

        // Update analytics with error
        trackError(searchError.type);

        setState(prev => ({
          ...prev,
          loading: createLoadingState(),
          error: {
            ...searchError,
            diagnostics:
              process.env.NODE_ENV !== 'production'
                ? { raw: error, time: new Date().toISOString() }
                : undefined,
          },
        }));

        // Auto-retry for retryable errors
        if (
          searchConfig.autoRetry !== false &&
          searchError.retryable &&
          retryCountRef.current < searchConfig.maxRetries
        ) {
          const delay = searchConfig.retryDelay * Math.pow(2, retryCountRef.current);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            void performSearch(query, { ...options, isRetry: true });
          }, delay);
        }
      } finally {
        inFlightSearchingCountRef.current = Math.max(
          0,
          inFlightSearchingCountRef.current - 1
        );
        if (!isBackground && (!options?.page || options.page === 1)) {
          setState(prev => ({
            ...prev,
            loading: {
              ...prev.loading,
              searching: inFlightSearchingCountRef.current > 0,
            },
          }));
        } else if (currentRequestIdRef.current === requestId) {
          setState(prev => ({
            ...prev,
            loading: createLoadingState(),
          }));
        }
      }
    },
    [
      searchConfig,
      getCache,
      setCache,
      isRateLimited,
      addRequest,
      trackSearch,
      trackError,
      getAnalyticsData,
    ]
  );

  // Debounced search function
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (query: string, options?: SearchOptions & { isRetry?: boolean }) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        void performSearch(query, { ...options, requestId: uuidv4() });
      }, searchConfig.debounceDelay);
    };
  }, [performSearch, searchConfig.debounceDelay]);

  // Public search function
  const search = useCallback(
    async (query: string, options?: SearchOptions) => {
      setCurrentQuery(query);
      setRetryCount(0);

      // Use debounced search for user input, immediate for pagination
      if (options?.page && options.page > 1) {
        await performSearch(query, options);
      } else {
        debouncedSearch(query, options);
      }
    },
    [performSearch, debouncedSearch]
  );

  const goToPage = useCallback(
    (page: number) => {
      if (currentQuery) {
        void search(currentQuery, {
          page,
          pageSize: pageSizeRef.current,
        });
      }
    },
    [currentQuery, search]
  );

  const changePageSize = useCallback(
    (pageSize: number) => {
      setState(prev => ({
        ...prev,
        pagination: { ...prev.pagination, pageSize },
      }));

      if (currentQuery) {
        void performSearch(currentQuery, { page: 1, pageSize });
      }
    },
    [currentQuery, performSearch]
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setState({
      data: {
        suggestions: [],
        countries: {},
      },
      loading: createLoadingState(),
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: initialPageSize,
      },
      searchHistory: [],
      metrics: {
        totalSearches: 0,
        cacheHitRate: 0,
        averageResponseTime: 0,
      },
    });
    setCurrentQuery('');
    setRetryCount(0);
    clearCacheStore();
    clearRateLimit();
    clearAnalytics();
  }, [initialPageSize, clearCacheStore, clearRateLimit, clearAnalytics]);

  const clearCache = useCallback(() => {
    clearCacheStore();
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        cacheHitRate: 0,
      },
    }));
  }, [clearCacheStore]);

  const retryLastSearch = useCallback(async () => {
    if (currentQuery && state.error?.retryable) {
      await performSearch(currentQuery, { isRetry: true });
    }
  }, [currentQuery, state.error, performSearch]);

  const getSuggestions = useCallback((query: string, limit = 5) => {
    return getSearchSuggestions(query, limit);
  }, []);

  const getAnalytics = useCallback(() => {
    const analytics = getAnalyticsData();
    return {
      totalSearches: analytics.totalSearches,
      errorsByType: { ...analytics.errorsByType },
      averageResponseTime: analytics.averageResponseTime,
      peakUsageHours: Array.from(analytics.peakUsageHours),
    };
  }, [getAnalyticsData]);

  // Cleanup on unmount
  useEffect(() => {
    const currentAbortController = abortControllerRef.current;
    const currentDebounceTimer = debounceTimerRef.current;

    return () => {
      if (currentAbortController) {
        currentAbortController.abort();
      }
      if (currentDebounceTimer) {
        clearTimeout(currentDebounceTimer);
      }
    };
  }, []);

  return {
    ...state,
    search,
    goToPage,
    changePageSize,
    reset,
    clearCache,
    retryLastSearch,
    getSuggestions,
    getAnalytics,
  };
};
