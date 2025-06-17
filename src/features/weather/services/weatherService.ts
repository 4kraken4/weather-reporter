import { isApiError, WeatherServiceError } from '@core/errors/WeatherService.error';
import { apiService } from '@core/services/apiService';
import type { WeatherResponseType } from '@core/types/common.types';

export const WeatherService = {
  async getByCity(city: string, countryCode: string): Promise<WeatherResponseType> {
    try {
      return await apiService.get<WeatherResponseType>('/weather', {
        params: {
          q: `${city},${countryCode}`,
          appid: import.meta.env.VITE_WEATHER_API_KEY as string,
          units: (import.meta.env.VITE_WEATHER_API_UNITS as string) || 'metric',
          lang: (import.meta.env.VITE_WEATHER_API_LANG as string) || 'en',
          mode: (import.meta.env.VITE_WEATHER_API_MODE as string) || 'json',
        },
      });
    } catch (error: unknown) {
      if (isApiError(error)) {
        throw new WeatherServiceError(
          error.message,
          error.response?.status,
          error.response?.data
        );
      }
      throw new WeatherServiceError(
        error instanceof Error ? error.message : 'Unknown weather service error'
      );
    }
  },
};
