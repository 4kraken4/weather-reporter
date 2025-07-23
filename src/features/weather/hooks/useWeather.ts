import { useContext } from 'react';

import { WeatherDataContext } from '@/features/weather/context/WeatherContext';

export const useWeatherData = () => {
  const context = useContext(WeatherDataContext);
  if (!context) {
    throw new Error('useWeatherData must be used within a WeatherDataProvider');
  }
  return context;
};
