import { WeatherService } from '@features/weather/services/weatherService';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { WeatherDataContext } from './WeatherContext';

import type {
  WeatherDataFetchErrorType,
  WeatherResponseType,
} from '@/core/types/common.types';

type CacheItem = {
  data: WeatherResponseType;
  timestamp: number;
};

type CacheKey = string | number;

// Maximum number of items in cache
const MAX_CACHE_ITEMS = 50;
// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;
const getCacheKey = (key: CacheKey) => `weather-${key}`;

export const WeatherProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [weatherData, setWeatherData] = useState<WeatherResponseType | null>(null);
  const [currentDistrict, setCurrentDistrict] = useState('Colombo');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<WeatherDataFetchErrorType | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Unified cache getter
  const getCachedData = useCallback((key: CacheKey) => {
    const cacheKey = getCacheKey(key);
    const cachedData = localStorage.getItem(cacheKey);
    if (!cachedData) return null;

    try {
      const { data, timestamp } = JSON.parse(cachedData) as CacheItem;
      const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;
      return isExpired ? null : data;
    } catch {
      // If cache is corrupted, remove it
      localStorage.removeItem(cacheKey);
      return null;
    }
  }, []);

  // Unified cache setter
  const cacheData = useCallback((key: CacheKey, data: WeatherResponseType) => {
    const cacheKey = getCacheKey(key);
    let keys: string[] = JSON.parse(
      localStorage.getItem('weather-cache-keys') ?? '[]'
    ) as string[];

    // Remove if already present to avoid duplicates, then push to end (most recent)
    keys = keys.filter(k => k !== cacheKey);
    keys.push(cacheKey);

    // Remove oldest if over limit
    if (keys.length > MAX_CACHE_ITEMS) {
      const oldestKey = keys.shift();
      if (oldestKey) localStorage.removeItem(oldestKey);
    }
    localStorage.setItem('weather-cache-keys', JSON.stringify(keys));
    const cacheItem: CacheItem = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
  }, []);

  const fetchWeatherData = useCallback(
    async (district: string, country = 'LK', isRetry = false) => {
      setIsLoading(true);

      try {
        // Check cache first
        const cachedData = getCachedData(district);
        setCurrentDistrict(district);
        if (cachedData) {
          setWeatherData(cachedData);
          setError(null);
          setLastUpdated(Date.now());
          return;
        }

        // Fetch fresh data
        const data = await WeatherService.getByCity(district, country);
        setError(null);
        setWeatherData(data);
        setCurrentDistrict(district);
        setLastUpdated(Date.now());
        cacheData(district, data);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError({
          message: errorMessage,
          district,
          timestamp: Date.now(),
          error: err,
        });
        if (!isRetry) setWeatherData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [getCachedData, cacheData]
  );

  // Automatic retry mechanism
  useEffect(() => {
    if (error && retryTrigger > 0) {
      const retry = async () => {
        await fetchWeatherData(currentDistrict, 'LK', true);
      };
      void retry();
    }
  }, [retryTrigger, currentDistrict, fetchWeatherData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = useCallback(() => {
    setRetryTrigger(prev => prev + 1);
  }, []);

  const fetchWeatherDataById = useCallback(
    async (cityId: number) => {
      setIsLoading(true);
      try {
        const cachedData = getCachedData(cityId);
        if (cachedData) {
          setWeatherData(cachedData);
          setError(null);
          setLastUpdated(Date.now());
          return;
        }
        const data = await WeatherService.getCityById(cityId);
        setWeatherData(data);
        setLastUpdated(Date.now());
        cacheData(cityId, data);
        setCurrentDistrict(data.cityName);
        setError(null);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError({
          message: errorMessage,
          district: currentDistrict,
          timestamp: Date.now(),
          error: err,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [cacheData, currentDistrict, getCachedData]
  );

  // Memoize context value to avoid unnecessary re-renders
  const value = useMemo(
    () => ({
      data: weatherData,
      currentDistrict,
      loading: isLoading,
      error,
      lastUpdated,
      fetchWeatherData,
      fetchWeatherDataById,
      retry: handleRetry,
      setCurrentDistrict,
    }),
    [
      weatherData,
      currentDistrict,
      isLoading,
      error,
      lastUpdated,
      fetchWeatherData,
      fetchWeatherDataById,
      handleRetry,
      setCurrentDistrict,
    ]
  );

  return (
    <WeatherDataContext.Provider value={value}>
      {children}
    </WeatherDataContext.Provider>
  );
};
