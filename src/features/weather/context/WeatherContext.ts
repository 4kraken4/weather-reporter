import { createContext } from 'react';

import type {
  WeatherDataFetchErrorType,
  WeatherResponseType,
} from '@/core/types/common.types';

type WeatherDataContextType = {
  data: WeatherResponseType | null;
  currentDistrict: string;
  loading: boolean;
  error: WeatherDataFetchErrorType | null;
  lastUpdated: number | null;
  fetchWeatherData: (district: string) => Promise<void>;
  fetchWeatherDataById: (cityId: number) => Promise<void>;
  retry: () => void;
  setCurrentDistrict: (district: string) => void;
};

export const WeatherDataContext = createContext<WeatherDataContextType | undefined>(
  undefined
);
