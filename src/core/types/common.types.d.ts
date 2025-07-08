export type Theme = {
  label: string;
  icon: string;
  theme: string;
};

export type WeatherResponseType = {
  coordinates: Coordinates;
  conditions: Weather[];
  dataSource: string;
  metrics: Main;
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  snow?: Record<string, number>;
  rain?: Record<string, number>;
  timestamp: number;
  system: Sys;
  timezone: number;
  cityId: number;
  cityName: string;
  responseCode: number;
};

type Coordinates = {
  lon: number;
  lat: number;
};

type Weather = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

type Main = {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level: number;
  grnd_level: number;
};

type Wind = {
  speed: number;
  deg: number;
  gust: number;
};

type Clouds = {
  all: number;
};

type Sys = {
  country: string;
  sunrise: number;
  sunset: number;
};

type Pagination = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type Countries = {
  [key: string]: {
    name: string;
    flagUrl: string;
    mapUrl: string;
    region: string;
    subregion: string;
  };
};

type Suggestion = {
  id: number;
  name: string;
  state: string;
  countryCode: string;
  coordinates: Coordinates;
};

export type LayoutState = {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  isHeaderVisible: boolean;
  isFooterVisible: boolean;
  isSearchModalOpen: boolean;
};

export type WeatherDataFetchErrorType = {
  message: string;
  district: string;
  timestamp: number;
  error: unknown;
};

export type RegionResponseType = {
  success: boolean;
  searchTerm: string;
  pagination: Pagination;
  countries: Countries;
  suggestions: Suggestion[];
};

export type SearchOptions = {
  signal?: AbortSignal;
  page?: number;
  pageSize?: number;
};
