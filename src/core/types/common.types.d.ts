import type { WeatherServiceError } from '@core/errors/WeatherService.error';
import type { RouteObject } from 'react-router-dom';

export type WeatherData = {
  temp: number;
  humidity: number;
  pressure: number;
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

export type Theme = {
  label: string;
  icon: string;
  theme: string;
};

export type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
} | null;

export type Themes = Record<string, Theme>;

export type SearchResultProps = {
  headIcon?: React.ReactNode;
  title?: string;
  description?: string;
  location?: string;
  tailIcon?: React.ReactNode;
};

export type SearchModalProps = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onClose: () => void;
};
