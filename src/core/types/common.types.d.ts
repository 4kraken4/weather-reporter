import type { WeatherServiceError } from '@core/errors/WeatherService.error';
import type { RouteObject } from 'react-router-dom';

export type WeatherData = {
  temp: number;
  humidity: number;
  timestamp: string;
};

export type WeatherResponseType = {
  main: WeatherData;
  name: string;
};

export type UseWeatherResultType = {
  data: WeatherResponseType | null;
  loading: boolean;
  error: WeatherServiceError | null;
};

export type AppRoute = RouteObject & {
  title?: string;
  requiresAuth?: boolean;
  icon?: React.ReactNode;
  hiddenInMenu?: boolean;
};
