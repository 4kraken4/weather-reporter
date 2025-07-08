import { isApiError, WeatherServiceError } from '@core/errors/WeatherService.error';
import { apiService } from '@core/services/apiService';
import type { WeatherResponseType } from '@core/types/common.types';

export const WeatherService = {
  async getByCity(
    city: string,
    countryCode: string,
    options?: { signal?: AbortSignal }
  ): Promise<WeatherResponseType> {
    try {
      return apiService.get<WeatherResponseType>('/weather/current', {
        params: {
          city,
          ccode: countryCode,
        },
        signal: options?.signal,
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

  getCityById: async (
    cityId: number,
    options?: { signal?: AbortSignal }
  ): Promise<WeatherResponseType> => {
    try {
      return apiService.get<WeatherResponseType>(`/weather/current/${cityId}`, {
        signal: options?.signal,
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
