import { weatherRoutes } from '@features/weather/routes/weather.routes';
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { AppLayout } from '@/core/layout/AppLayout';

// Lazy load pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage'));

type AppRoute = RouteObject & {
  title?: string;
  requiresAuth?: boolean;
  icon?: React.ReactNode;
  hiddenInMenu?: boolean;
};

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
