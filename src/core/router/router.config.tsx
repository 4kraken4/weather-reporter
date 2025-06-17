import { AppLayout } from '@core/layout/AppLayout';
import type { AppRoute } from '@core/types/common.types';
import { WeatherPage } from '@features/weather/pages/WeatherPage';
import { weatherRoutes } from '@features/weather/routes/weather.routes';

export const routes: AppRoute[] = [
  {
    path: '/',
    element: <AppLayout />,
    title: 'Weather Reporter',
    requiresAuth: false,
    children: [
      {
        index: true,
        element: <WeatherPage />,
      },
      ...weatherRoutes,
    ],
  },
];
