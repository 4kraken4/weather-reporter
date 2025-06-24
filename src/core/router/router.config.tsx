import { AppLayout } from '@core/layout/AppLayout';
import type { AppRoute } from '@core/types/common.types';
import { weatherRoutes } from '@features/weather/routes/weather.routes';

import { HomePage } from '@/pages/HomePage';

export const routes: AppRoute[] = [
  {
    path: '/',
    element: <AppLayout />,
    title: 'Weather Reporter',
    requiresAuth: false,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      ...weatherRoutes,
    ],
  },
];
