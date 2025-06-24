import { WeatherProvider } from '../context/WeatherProvider';

import { ErrorBoundary } from '@/pages/error-page/ErrorPage';
import { WeatherPage } from '@/pages/WeatherPage';

export const weatherRoutes = [
  {
    path: '/weather',
    element: (
      <WeatherProvider>
        <WeatherPage />
      </WeatherProvider>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: ':city/:countryCode',
        element: (
          <div className='weather-page'>
            <h1 className='text-center'>Weather Information</h1>
            <p className='text-center text-gray-500'>
              Select a city to view the weather details.
            </p>
            <div className='flex justify-content-center align-items-center h-screen'>
              <p className='text-lg text-gray-700'>
                Please select a city from the map or the dropdown menu to see the
                weather details.
              </p>
            </div>
          </div>
        ),
      },
    ],
  },
];
