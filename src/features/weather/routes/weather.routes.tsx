import { ErrorBoundary } from '@core/components/error-page/ErrorPage';
import { WeatherPage } from '@features/weather/pages/WeatherPage';

export const weatherRoutes = [
  {
    path: '/weather',
    element: <WeatherPage />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: ':city/:countryCode',
        element: <WeatherPage />,
      },
    ],
  },
];
