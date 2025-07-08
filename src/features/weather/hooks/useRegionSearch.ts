import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  Countries,
  RegionResponseType,
  SearchOptions,
  Suggestion,
} from '@/core/types/common.types';
import { RegionService } from '@/features/weather/services/regionService';

// Enhanced types for robust state management
type LoadingState = {
  searching: boolean;
  paginating: boolean;
  retrying: boolean;
  backgroundRefreshing: boolean;
};

type ErrorType =
  | 'VALIDATION'
  | 'NETWORK'
  | 'SERVER'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'ABORT';

type SearchError = {
  type: ErrorType;
  message: string;
  retryable: boolean;
  code?: string;
  timestamp: number;
  query?: string;
};

type SearchSuggestion = {
  query: string;
  frequency: number;
  lastUsed: number;
  source: 'history' | 'popular' | 'suggested';
};

// @ts-expect-error Unused type prepared for future analytics implementation
type _SearchAnalytics = {
  searchCount: number;
  errorCount: number;
  cacheHitCount: number;
  averageResponseTime: number;
  popularQueries: SearchSuggestion[];
  errorsByType: Record<ErrorType, number>;
  peakUsageHours: number[];
};

type CachedSearchResult = {
  data: {
    suggestions: Suggestion[];
    countries: Countries;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  timestamp: number;
  query: string;
  accessCount: number;
  lastAccessed: number;
};

type SearchConfig = {
  debounceDelay: number;
  maxCacheSize: number;
  cacheTTL: number;
  maxRetries: number;
  retryDelay: number;
  rateLimit: {
    maxRequests: number;
    timeWindow: number;
  };
};

type RateLimitEntry = {
  timestamp: number;
  count: number;
};

// Configuration with industry-standard defaults
const DEFAULT_CONFIG: SearchConfig = {
  debounceDelay: 300,
  maxCacheSize: 100,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000,
  rateLimit: {
    maxRequests: 20,
    timeWindow: 60 * 1000, // 1 minute
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

// Global cache and utilities
const SEARCH_CACHE = new Map<string, CachedSearchResult>();
const RATE_LIMIT_TRACKER = new Map<string, RateLimitEntry[]>();
const IN_FLIGHT_REQUESTS = new Set<string>();

// Global search suggestions tracker
const SEARCH_SUGGESTIONS = new Map<string, SearchSuggestion>();
const ANALYTICS_TRACKER = {
  totalSearches: 0,
  errorsByType: {} as Record<ErrorType, number>,
  responseTimesHistory: [] as number[],
  peakUsageHours: new Array(24).fill(0), // Track usage by hour of day
};

// Enhanced utility functions
const createCacheKey = (query: string, page: number, pageSize: number): string => {
  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, '_');
  return `${normalizedQuery}_${page}_${pageSize}`;
};

const isRateLimited = (identifier: string, config: SearchConfig): boolean => {
  const now = Date.now();
  const requests = RATE_LIMIT_TRACKER.get(identifier) ?? [];

  // Clean old entries
  const validRequests = requests.filter(
    entry => now - entry.timestamp < config.rateLimit.timeWindow
  );

  RATE_LIMIT_TRACKER.set(identifier, validRequests);

  return validRequests.length >= config.rateLimit.maxRequests;
};

const addRateLimitEntry = (identifier: string): void => {
  const now = Date.now();
  const requests = RATE_LIMIT_TRACKER.get(identifier) ?? [];
  requests.push({ timestamp: now, count: 1 });
  RATE_LIMIT_TRACKER.set(identifier, requests);
};

const evictLRUCache = (maxSize: number): void => {
  if (SEARCH_CACHE.size <= maxSize) return;

  let oldestKey = '';
  let oldestTime = Date.now();

  const entries = Array.from(SEARCH_CACHE.entries());
  for (const [key, result] of entries) {
    if (result.lastAccessed < oldestTime) {
      oldestTime = result.lastAccessed;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    SEARCH_CACHE.delete(oldestKey);
  }
};

const setCacheData = (key: string, data: CachedSearchResult): void => {
  evictLRUCache(DEFAULT_CONFIG.maxCacheSize - 1);
  SEARCH_CACHE.set(key, { ...data, lastAccessed: Date.now() });
};

const getCacheData = (key: string): CachedSearchResult | null => {
  const data = SEARCH_CACHE.get(key);
  if (!data) return null;

  // Check if expired
  const now = Date.now();
  if (now - data.timestamp > DEFAULT_CONFIG.cacheTTL) {
    SEARCH_CACHE.delete(key);
    return null;
  }

  // Update access stats
  data.lastAccessed = now;
  data.accessCount += 1;
  SEARCH_CACHE.set(key, data);

  return data;
};

// Enhanced input validation
const validateSearchInput = (
  input: string
): { isValid: boolean; reason?: string } => {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      reason: 'Search query cannot be empty',
    };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      reason: 'Search query must be at least 2 characters long',
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      reason: 'Search query too long (max 100 characters)',
    };
  }

  // Enhanced meaningless patterns
  const meaninglessPatterns = [
    /^[0-9]+$/, // Only numbers
    /^[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]+$/, // Only special characters
    /^(.)\1{2,}$/, // Repeated characters (aaa, 111, etc.)
    /^[a-zA-Z]$/, // Single letter
    /^\s+$/, // Only whitespace
    /^[^a-zA-Z0-9\s]*$/, // No alphanumeric characters
  ];

  for (const pattern of meaninglessPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        reason: 'Invalid search pattern',
      };
    }
  }

  // Enhanced spam patterns
  const spamPatterns = [
    /^(test|asdf|qwer|zxcv|hjkl|lorem|ipsum|dummy|sample|example)$/i,
    /^(abc|xyz|123|000|999|null|undefined|nan)$/i,
    /^(.)\1*$/, // Single character repeated
    /^\d{10,}$/, // Long number sequences
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        reason: 'Please enter a valid location name',
      };
    }
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return {
      isValid: false,
      reason: 'Search must contain at least one letter',
    };
  }

  // XSS protection - basic check for script tags and suspicious patterns
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        reason: 'Invalid characters detected',
      };
    }
  }

  return { isValid: true };
};

// Enhanced input sanitization
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"&]/g, '') // Remove potential XSS characters
    .replace(/^[^\w\s]+|[^\w\s]+$/g, '') // Remove leading/trailing special chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Enhanced error creation
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

// Helper function to create complete loading state
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

  // Update refs when values change
  useEffect(() => {
    retryCountRef.current = retryCount;
  }, [retryCount]);

  useEffect(() => {
    pageSizeRef.current = state.pagination.pageSize;
  }, [state.pagination.pageSize]);

  const searchMetricsRef = useRef<{
    totalSearches: number;
    cacheHits: number;
    responseTimes: number[];
  }>({
    totalSearches: 0,
    cacheHits: 0,
    responseTimes: [],
  });

  // Utility functions for suggestions and analytics
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
          a.frequency + (Date.now() - a.lastUsed) / (1000 * 60 * 60 * 24); // Decay over days
        const scoreB =
          b.frequency + (Date.now() - b.lastUsed) / (1000 * 60 * 60 * 24);
        return scoreB - scoreA;
      })
      .slice(0, limit);

    return suggestions;
  };

  const updateAnalytics = (
    error?: SearchError,
    responseTime?: number,
    incrementTotal = true
  ): void => {
    // Only increment total searches for actual API calls, not validation/rate limit errors
    if (incrementTotal) {
      ANALYTICS_TRACKER.totalSearches += 1;
    }

    if (error) {
      ANALYTICS_TRACKER.errorsByType[error.type] =
        (ANALYTICS_TRACKER.errorsByType[error.type] || 0) + 1;
    }

    if (responseTime) {
      ANALYTICS_TRACKER.responseTimesHistory.push(responseTime);
      // Keep only last 100 response times
      if (ANALYTICS_TRACKER.responseTimesHistory.length > 100) {
        ANALYTICS_TRACKER.responseTimesHistory.shift();
      }
    }

    // Only track usage by hour for actual searches, not validation errors
    if (incrementTotal) {
      const hour = new Date().getHours();
      ANALYTICS_TRACKER.peakUsageHours[hour] += 1;
    }
  };

  // Enhanced search function with caching, debouncing, and retry logic
  const performSearch = useCallback(
    async (
      query: string,
      options?: SearchOptions & { isRetry?: boolean; isBackground?: boolean }
    ): Promise<void> => {
      const startTime = Date.now();
      const isRetry = options?.isRetry ?? false;
      const isBackground = options?.isBackground ?? false;

      // Validation
      const validation = validateSearchInput(query);
      if (!validation.isValid) {
        const validationError = createSearchError(
          'VALIDATION',
          validation.reason ?? 'Invalid search query'
        );
        // Note: Don't track analytics for validation errors as these aren't real searches

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
      const rateLimitKey = 'search'; // Could be user-specific in real app
      if (!isRetry && isRateLimited(rateLimitKey, searchConfig)) {
        const rateLimitError = createSearchError(
          'RATE_LIMIT',
          'Too many search requests. Please wait a moment.',
          true
        );
        // Note: Don't track analytics for rate limit errors as these aren't actual API calls

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
        const cached = getCacheData(cacheKey);
        if (cached) {
          setState(prev => ({
            ...prev,
            data: cached.data,
            loading: createLoadingState(),
            error: null,
            pagination: cached.pagination,
          }));

          // Update metrics
          searchMetricsRef.current.cacheHits += 1;
          searchMetricsRef.current.totalSearches += 1;

          // If cached data is older than 2 minutes, refresh in background
          const cacheAge = Date.now() - cached.timestamp;
          if (cacheAge > 2 * 60 * 1000 && !isBackground) {
            setTimeout(() => {
              void performSearch(query, { ...options, isBackground: true });
            }, 100); // Small delay to not block UI
          }

          return;
        }
      }

      // Prevent duplicate requests
      if (IN_FLIGHT_REQUESTS.has(cacheKey)) {
        return;
      }

      // Set loading state
      setState(prev => ({
        ...prev,
        loading: createLoadingState({
          searching: !isBackground && (!options?.page || options.page === 1),
          paginating: !isBackground && Boolean(options?.page && options.page > 1),
          retrying: isRetry,
          backgroundRefreshing: isBackground,
        }),
        error: null,
      }));

      // Add rate limit entry
      if (!isRetry) {
        addRateLimitEntry(rateLimitKey);
      }

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      IN_FLIGHT_REQUESTS.add(cacheKey);

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

        // Update metrics and analytics
        searchMetricsRef.current.totalSearches += 1;
        searchMetricsRef.current.responseTimes.push(responseTime);
        updateAnalytics(undefined, responseTime);

        // Update search suggestions
        if (!isBackground) {
          updateSearchSuggestion(sanitizedQuery);
        }

        if (response?.suggestions) {
          const resultData = {
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
          setCacheData(cacheKey, resultData);

          setState(prev => ({
            ...prev,
            data: resultData.data,
            loading: createLoadingState(),
            pagination: resultData.pagination,
            searchHistory: (() => {
              if (isBackground) return prev.searchHistory; // Don't update history for background refreshes
              if (prev.searchHistory.includes(sanitizedQuery)) {
                return prev.searchHistory;
              }
              return [sanitizedQuery, ...prev.searchHistory.slice(0, 9)]; // Keep last 10 searches
            })(),
            metrics: {
              totalSearches: searchMetricsRef.current.totalSearches,
              cacheHitRate:
                (searchMetricsRef.current.cacheHits /
                  searchMetricsRef.current.totalSearches) *
                100,
              averageResponseTime:
                searchMetricsRef.current.responseTimes.reduce((a, b) => a + b, 0) /
                searchMetricsRef.current.responseTimes.length,
            },
          }));

          // Reset retry count on success
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
        // Handle different error types
        let searchError: SearchError;

        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return; // Request was cancelled, don't update state
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
        updateAnalytics(searchError);

        setState(prev => ({
          ...prev,
          loading: createLoadingState(),
          error: searchError,
        }));

        // Auto-retry for retryable errors
        if (
          searchError.retryable &&
          retryCountRef.current < searchConfig.maxRetries
        ) {
          const delay = searchConfig.retryDelay * Math.pow(2, retryCountRef.current); // Exponential backoff
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            void performSearch(query, { ...options, isRetry: true });
          }, delay);
        }
      } finally {
        IN_FLIGHT_REQUESTS.delete(cacheKey);
      }
    },
    [searchConfig]
  );

  // Debounced search function
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (query: string, options?: SearchOptions & { isRetry?: boolean }) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        void performSearch(query, options);
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
        // Use the search function instead of performSearch directly
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
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear debounce timer
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
  }, [initialPageSize]);

  const clearCache = useCallback(() => {
    SEARCH_CACHE.clear();
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        cacheHitRate: 0,
      },
    }));
  }, []);

  const retryLastSearch = useCallback(async () => {
    if (currentQuery && state.error?.retryable) {
      await performSearch(currentQuery, { isRetry: true });
    }
  }, [currentQuery, state.error, performSearch]);

  const getSuggestions = useCallback((query: string, limit = 5) => {
    return getSearchSuggestions(query, limit);
  }, []);

  const getAnalytics = useCallback(() => {
    const avgResponseTime =
      ANALYTICS_TRACKER.responseTimesHistory.length > 0
        ? ANALYTICS_TRACKER.responseTimesHistory.reduce((a, b) => a + b, 0) /
        ANALYTICS_TRACKER.responseTimesHistory.length // eslint-disable-line prettier/prettier
        : 0;

    return {
      totalSearches: ANALYTICS_TRACKER.totalSearches,
      errorsByType: { ...ANALYTICS_TRACKER.errorsByType },
      averageResponseTime: avgResponseTime,
      peakUsageHours: Array.from(ANALYTICS_TRACKER.peakUsageHours),
    };
  }, []);

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

// Export utility functions for testing and external use
export const regionSearchUtils = {
  validateSearchInput,
  sanitizeInput,
  createCacheKey,
  clearAllCache: () => SEARCH_CACHE.clear(),
  getCacheStats: () => ({
    size: SEARCH_CACHE.size,
    maxSize: DEFAULT_CONFIG.maxCacheSize,
  }),
  clearSuggestions: () => SEARCH_SUGGESTIONS.clear(),
  getSuggestionsCount: () => SEARCH_SUGGESTIONS.size,
  getGlobalAnalytics: () => ({
    totalSearches: ANALYTICS_TRACKER.totalSearches,
    errorsByType: { ...ANALYTICS_TRACKER.errorsByType },
    averageResponseTime:
      ANALYTICS_TRACKER.responseTimesHistory.length > 0
        ? ANALYTICS_TRACKER.responseTimesHistory.reduce((a, b) => a + b, 0) /
        ANALYTICS_TRACKER.responseTimesHistory.length // eslint-disable-line prettier/prettier
        : 0,
    peakUsageHours: Array.from(ANALYTICS_TRACKER.peakUsageHours),
  }),
  resetAnalytics: () => {
    ANALYTICS_TRACKER.totalSearches = 0;
    ANALYTICS_TRACKER.errorsByType = {} as Record<ErrorType, number>;
    ANALYTICS_TRACKER.responseTimesHistory = [];
    ANALYTICS_TRACKER.peakUsageHours.fill(0);
  },
};
