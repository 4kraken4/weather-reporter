import { WeatherServiceError } from '@core/errors/WeatherService.error';
import type { UseWeatherResultType } from '@core/types/common.types';
import { WeatherService } from '@features/weather/services/weatherService';
import { useEffect, useState } from 'react';

export function useWeather(city: string, countryCode: string): UseWeatherResultType {
  const [state, setState] = useState<UseWeatherResultType>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component

    const fetchData = async () => {
      try {
        const data = await WeatherService.getByCity(city, countryCode);
        if (isMounted) {
          setState({
            data: data,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error:
              error instanceof WeatherServiceError
                ? error
                : new WeatherServiceError('Failed to fetch weather data'),
          });
        }
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [city, countryCode]);

  return state;
}
