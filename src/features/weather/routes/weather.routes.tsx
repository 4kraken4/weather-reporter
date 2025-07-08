import { lazy } from 'react';

import { WeatherProvider } from '../context/WeatherProvider';

import { ErrorBoundary } from '@/pages/error-page/ErrorPage';

// Lazy load WeatherPage for better performance
const LkWeatherPage = lazy(() => import('@/pages/LkWeatherPage'));
const WeatherPage = lazy(() => import('@/pages/WeatherPage'));

export const weatherRoutes = [
  {
    path: '/weather-lk',
    element: (
      <WeatherProvider>
        <LkWeatherPage />
      </WeatherProvider>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/weather/:cityId',
    element: (
      <WeatherProvider>
        <WeatherPage />
      </WeatherProvider>
    ),
    errorElement: <ErrorBoundary />,
  },
];
