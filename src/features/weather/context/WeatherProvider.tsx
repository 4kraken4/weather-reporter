import { WeatherService } from '@features/weather/services/weatherService';
import { useCallback, useEffect, useState } from 'react';

import {
  WeatherDataContext,
  type CacheItem,
  type WeatherDataFetchErrorType,
} from './WeatherContext';

import type { WeatherResponseType } from '@/core/types/common.types';

export const WeatherProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [weatherData, setWeatherData] = useState<WeatherResponseType | null>(null);
  const [currentDistrict, setCurrentDistrict] = useState('Colombo');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<WeatherDataFetchErrorType | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Cache expiration time (5 minutes)
  const CACHE_EXPIRATION = 5 * 60 * 1000;

  const getCachedData = useCallback((district: string) => {
    const cachedData = localStorage.getItem(`weather-${district}`);
    if (!cachedData) return null;

    const { data, timestamp } = JSON.parse(cachedData) as CacheItem;
    const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;

    return isExpired ? null : data;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cacheData = useCallback((district: string, data: WeatherResponseType) => {
    const cacheItem: CacheItem = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`weather-${district}`, JSON.stringify(cacheItem));
  }, []);

  const fetchWeatherData = useCallback(
    async (district: string, isRetry = false) => {
      setIsLoading(true);

      try {
        // Check cache first
        const cachedData = getCachedData(district);
        setCurrentDistrict(district);
        if (cachedData) {
          setWeatherData(cachedData);
          setLastUpdated(Date.now());
          return;
        }

        // Fetch fresh data
        const data = await WeatherService.getByCity(district, 'LK');
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
        await fetchWeatherData(currentDistrict, true);
      };
      void retry();
    }
  }, [retryTrigger, currentDistrict, fetchWeatherData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = useCallback(() => {
    setRetryTrigger(prev => prev + 1);
  }, []);

  const value = {
    data: weatherData,
    currentDistrict,
    loading: isLoading,
    error,
    lastUpdated,
    fetchWeatherData,
    retry: handleRetry,
    setCurrentDistrict,
  };

  return (
    <WeatherDataContext.Provider value={value}>
      {children}
    </WeatherDataContext.Provider>
  );
};
