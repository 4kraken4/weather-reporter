import { createContext } from 'react';

import type { WeatherResponseType } from '@/core/types/common.types';

export type WeatherDataContextType = {
  data: WeatherResponseType | null;
  currentDistrict: string;
  loading: boolean;
  error: WeatherDataFetchErrorType | null;
  lastUpdated: number | null;
  fetchWeatherData: (district: string) => Promise<void>;
  retry: () => void;
  setCurrentDistrict: (district: string) => void;
};

export type WeatherDataFetchErrorType = {
  message: string;
  district: string;
  timestamp: number;
  error: unknown;
};

export type CacheItem = {
  data: WeatherResponseType;
  timestamp: number;
};

export const WeatherDataContext = createContext<WeatherDataContextType | undefined>(
  undefined
);
