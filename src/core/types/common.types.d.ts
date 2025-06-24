import type { WeatherServiceError } from '@core/errors/WeatherService.error';
import type { RouteObject } from 'react-router-dom';

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

// Weather API response types
export type WeatherResponseType = {
  coord: Coord;
  weather: Weather[];
  base: string;
  main: Main;
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  snow?: Record<string, number>;
  rain?: Record<string, number>;
  dt: number;
  sys: Sys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
};

export type Coord = {
  lon: number;
  lat: number;
};

export type Weather = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

export type Main = {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level: number;
  grnd_level: number;
};

export type Wind = {
  speed: number;
  deg: number;
  gust: number;
};

export type Clouds = {
  all: number;
};

export type Sys = {
  country: string;
  sunrise: number;
  sunset: number;
};
