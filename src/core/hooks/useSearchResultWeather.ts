import { useCallback, useEffect, useState } from 'react';

import { apiService } from '@/core/services/apiService';

type CachedWeatherData = WeatherData & {
  timestamp: number;
  lastAccessed: number;
  retryCount?: number;
  nextRetryAt?: number;
  accessCount: number;
  etag?: string;
  isBackgroundRefreshing?: boolean;
};

type WeatherData = {
  temperature: number;
  icon: string;
  unit: string;
  condition: string;
  loading: boolean;
  error: boolean;
};

type CacheConfig = {
  maxSize: number;
  successTTL: number;
  errorTTL: number;
  staleWhileRevalidate: number;
  maxRetries: number;
  backgroundRefreshThreshold: number;
  networkTimeout: number;
  retryBaseDelay: number;
  retryMaxDelay: number;
};

const CACHE_CONFIG: CacheConfig = {
  maxSize: 200,
  successTTL: 10 * 60 * 1000, // 10 minutes for successful responses
  errorTTL: 30 * 1000, // 30 seconds for errors
  staleWhileRevalidate: 2 * 60 * 1000, // 2 minutes stale-while-revalidate
  maxRetries: 3,
  backgroundRefreshThreshold: 5 * 60 * 1000, // Start background refresh after 5 minutes
  networkTimeout: 10000, // 10 seconds network timeout
  retryBaseDelay: 1000, // 1 second base retry delay
  retryMaxDelay: 30000, // Maximum 30 seconds retry delay
};

// Global cache and pending requests management
const WEATHER_CACHE = new Map<string, CachedWeatherData>();
const PENDING_REQUESTS = new Set<string>();
const REQUEST_QUEUE = new Map<string, CityRequest>();
const BACKGROUND_REFRESH_TASKS = new Set<string>();
let BULK_FETCH_TIMEOUT: NodeJS.Timeout | null = null;
const BULK_FETCH_DELAY = 800; // 800ms delay to batch requests

// Enhanced utility functions for cache management
const createCacheKey = (city: string, country: string): string => {
  // Normalize cache key to improve hit rate
  const normalizedCity = city
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  const normalizedCountry = country
    .toLowerCase()
    .trim()
    .replace(/[^a-z]/g, '');
  return `${normalizedCity}-${normalizedCountry}`;
};

const isExpired = (cached: CachedWeatherData, isError: boolean): boolean => {
  const ttl = isError ? CACHE_CONFIG.errorTTL : CACHE_CONFIG.successTTL;
  return Date.now() - cached.timestamp > ttl;
};

const isStale = (cached: CachedWeatherData): boolean => {
  return Date.now() - cached.timestamp > CACHE_CONFIG.staleWhileRevalidate;
};

const getRetryDelay = (retryCount: number): number => {
  const delay = Math.min(
    CACHE_CONFIG.retryBaseDelay * Math.pow(2, retryCount),
    CACHE_CONFIG.retryMaxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

const shouldRetry = (cached: CachedWeatherData): boolean => {
  if (!cached.error || !cached.retryCount) return false;
  if (cached.retryCount >= CACHE_CONFIG.maxRetries) return false;
  if (!cached.nextRetryAt) return true;
  return Date.now() >= cached.nextRetryAt;
};

// Enhanced LRU Cache implementation with frequency consideration
const evictLRU = (): void => {
  if (WEATHER_CACHE.size <= CACHE_CONFIG.maxSize) return;

  let candidateKey = '';
  let lowestScore = Infinity;

  for (const [key, data] of WEATHER_CACHE.entries()) {
    // Calculate LRU score considering access frequency and recency
    const recencyScore = Date.now() - data.lastAccessed;
    const frequencyScore = 1 / (data.accessCount + 1);
    const combinedScore = recencyScore * frequencyScore;

    if (combinedScore < lowestScore) {
      lowestScore = combinedScore;
      candidateKey = key;
    }
  }

  if (candidateKey) {
    WEATHER_CACHE.delete(candidateKey);
  }
};

const setCacheData = (
  key: string,
  data: Omit<CachedWeatherData, 'accessCount'>
): void => {
  evictLRU();
  const existingData = WEATHER_CACHE.get(key);
  const accessCount = existingData ? existingData.accessCount + 1 : 1;

  WEATHER_CACHE.set(key, {
    ...data,
    lastAccessed: Date.now(),
    accessCount,
  });
};

const getCacheData = (key: string): CachedWeatherData | undefined => {
  const data = WEATHER_CACHE.get(key);
  if (data) {
    // Update last accessed time and increment access count
    data.lastAccessed = Date.now();
    data.accessCount += 1;
    WEATHER_CACHE.set(key, data);
  }
  return data;
};

// Cache utility functions
const invalidateCache = (key: string): void => {
  WEATHER_CACHE.delete(key);
};

const getCacheStats = () => {
  return {
    size: WEATHER_CACHE.size,
    maxSize: CACHE_CONFIG.maxSize,
    utilization: (WEATHER_CACHE.size / CACHE_CONFIG.maxSize) * 100,
  };
};

export type BulkWeatherRequest = {
  cities: CityRequest[];
};

export type CityRequest = {
  city: string;
  country: string;
};

type BulkWeatherResponse = {
  success: boolean;
  summary: Summary;
  processingTimeMs: number;
  cities: City[];
};

type Summary = {
  total: number;
  found: number;
  failed: number;
  cached: number;
};

type City = {
  searchIndex: number;
  input: Input;
  status: string;
  error?: Error;
  location?: Location;
  weather?: Weather;
  meta: Meta;
};

type Input = {
  city: string;
  country: string;
};

type Error = {
  code: string;
  message: string;
};

type Location = {
  name: string;
  country: string;
  countryCode: string;
  coordinates: Coordinates;
};

type Coordinates = {
  lat: number;
  lon: number;
};

type Weather = {
  temperature: number;
  unit: string;
  condition: string;
  icon: string;
  timestamp: string;
};

type Meta = {
  cached: boolean;
  cacheKey: string;
  source?: string;
};

// Enhanced bulk fetch function with retry logic and background refresh
const fetchBulkWeatherData = async (_isBackgroundRefresh = false): Promise<void> => {
  if (REQUEST_QUEUE.size === 0) return;

  const cities = Array.from(REQUEST_QUEUE.values());
  const requestKeys = Array.from(REQUEST_QUEUE.keys());

  // Clear the queue and pending requests
  REQUEST_QUEUE.clear();
  requestKeys.forEach(key => PENDING_REQUESTS.delete(key));

  try {
    const request: BulkWeatherRequest = { cities };

    // Add timeout to request
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CACHE_CONFIG.networkTimeout
    );

    const response = await apiService.post<BulkWeatherResponse>(
      '/weather/bulk',
      request,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (response.success && response.cities) {
      // Process each city response efficiently
      response.cities.forEach(cityResponse => {
        const { input, status, weather, location, meta } = cityResponse;
        const cacheKey = createCacheKey(input.city, input.country);

        if (status === 'found' && weather && location) {
          // Successfully found weather data
          const weatherData: WeatherData = {
            temperature: Math.round(weather.temperature),
            icon: weather.icon,
            unit: weather.unit,
            condition: weather.condition,
            loading: false,
            error: false,
          };

          const cachedData = {
            ...weatherData,
            timestamp: Date.now(),
            lastAccessed: Date.now(),
            etag: meta.cacheKey,
          };

          setCacheData(cacheKey, cachedData);

          // Also cache with meta.cacheKey if available for better cache hits
          if (meta.cacheKey && meta.cacheKey !== cacheKey) {
            setCacheData(meta.cacheKey, cachedData);
          }
        } else {
          // Handle failed requests with retry logic
          const existingCache = getCacheData(cacheKey);
          const retryCount = (existingCache?.retryCount ?? 0) + 1;
          const nextRetryAt = Date.now() + getRetryDelay(retryCount);

          const errorWeather = {
            temperature: 0,
            icon: '',
            unit: '',
            condition: cityResponse.error?.message ?? 'Weather data not found',
            loading: false,
            error: true,
            timestamp: Date.now(),
            lastAccessed: Date.now(),
            retryCount,
            nextRetryAt,
          };

          setCacheData(cacheKey, errorWeather);
        }
      });
    }
  } catch (error) {
    console.warn('Failed to fetch bulk weather data:', error);

    // Handle different types of errors
    const isNetworkError =
      error instanceof Error &&
      (error.name === 'AbortError' || error.message.includes('network'));

    // Mark all requested cities as failed with appropriate retry strategy
    requestKeys.forEach(cacheKey => {
      const existingCache = getCacheData(cacheKey);
      const retryCount = (existingCache?.retryCount ?? 0) + 1;

      const errorWeather = {
        temperature: 0,
        icon: '',
        unit: '',
        condition: isNetworkError
          ? 'Network timeout'
          : 'Service temporarily unavailable',
        loading: false,
        error: true,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        retryCount,
        nextRetryAt: Date.now() + getRetryDelay(retryCount),
      };

      setCacheData(cacheKey, errorWeather);
    });
  }
};

// Enhanced queue function with background refresh support
const queueCityForFetch = (
  cityName: string,
  countryCode?: string,
  isBackgroundRefresh = false
) => {
  const cacheKey = createCacheKey(cityName, countryCode ?? '');

  if (PENDING_REQUESTS.has(cacheKey)) return;

  PENDING_REQUESTS.add(cacheKey);
  REQUEST_QUEUE.set(cacheKey, {
    city: cityName,
    country: countryCode ?? '',
  });

  // Clear existing timeout and set a new one
  if (BULK_FETCH_TIMEOUT) {
    clearTimeout(BULK_FETCH_TIMEOUT);
  }

  BULK_FETCH_TIMEOUT = setTimeout(
    () => {
      void fetchBulkWeatherData(isBackgroundRefresh);
      BULK_FETCH_TIMEOUT = null;
    },
    isBackgroundRefresh ? 100 : BULK_FETCH_DELAY
  ); // Faster background refresh
};

// Background refresh for stale data
const triggerBackgroundRefresh = (cityName: string, countryCode?: string) => {
  const cacheKey = createCacheKey(cityName, countryCode ?? '');

  if (BACKGROUND_REFRESH_TASKS.has(cacheKey)) return;

  BACKGROUND_REFRESH_TASKS.add(cacheKey);

  // Use a separate queue for background refreshes
  setTimeout(() => {
    if (!PENDING_REQUESTS.has(cacheKey)) {
      queueCityForFetch(cityName, countryCode, true);
    }
    BACKGROUND_REFRESH_TASKS.delete(cacheKey);
  }, 50); // Small delay to avoid overwhelming the API
};

export const useSearchResultWeather = (cityName?: string, countryCode?: string) => {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 0,
    icon: '',
    unit: '°C',
    condition: '',
    loading: false,
    error: false,
  });

  const updateWeatherFromCache = useCallback((cacheKey: string) => {
    const cached = getCacheData(cacheKey);
    if (cached) {
      const {
        timestamp: _,
        lastAccessed: __,
        accessCount: ___,
        etag: ____,
        isBackgroundRefreshing: _____,
        retryCount: ______,
        nextRetryAt: _______,
        ...weatherWithoutMeta
      } = cached;
      setWeatherData(weatherWithoutMeta);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (!cityName) return;

    const cacheKey = createCacheKey(cityName, countryCode ?? '');

    // Check cache first
    const cached = getCacheData(cacheKey);
    if (cached) {
      const expired = isExpired(cached, cached.error);
      const stale = isStale(cached);

      if (!expired) {
        // Data is still fresh, use it
        updateWeatherFromCache(cacheKey);

        // If data is stale but not expired, trigger background refresh
        if (stale && !cached.loading && !cached.isBackgroundRefreshing) {
          triggerBackgroundRefresh(cityName, countryCode);
        }
        return;
      } else if (cached.error && !shouldRetry(cached)) {
        // Error data that shouldn't be retried yet
        updateWeatherFromCache(cacheKey);
        return;
      }
    }

    // Set loading state
    setWeatherData(prev => ({ ...prev, loading: true, error: false }));

    // Queue for bulk fetch
    queueCityForFetch(cityName, countryCode);

    // Set up a polling mechanism to check for cache updates
    const pollForUpdate = () => {
      if (updateWeatherFromCache(cacheKey)) {
        return; // Found data, stop polling
      }

      // Continue polling if still loading
      setTimeout(pollForUpdate, 100);
    };

    // Start polling after a short delay
    const pollTimeout = setTimeout(pollForUpdate, 200);

    return () => {
      clearTimeout(pollTimeout);
    };
  }, [cityName, countryCode, updateWeatherFromCache]);

  return weatherData;
};

// Export utility functions for external use
export const weatherCacheUtils = {
  invalidateCache,
  getCacheStats,
  clearAllCache: () => WEATHER_CACHE.clear(),
  getCacheSize: () => WEATHER_CACHE.size,
};
