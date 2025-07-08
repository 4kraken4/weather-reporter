import { apiService } from '@/core/services/apiService';
import type { RegionResponseType, SearchOptions } from '@/core/types/common.types';

export const RegionService = {
  async search(query: string, options?: SearchOptions): Promise<RegionResponseType> {
    try {
      return apiService.get<RegionResponseType>('/weather/search', {
        params: {
          q: query,
          page: options?.page ?? 1, // Default to first page
          pageSize: options?.pageSize ?? 10, // Default page size
        },
        signal: options?.signal,
      });
    } catch (error) {
      console.error('Error fetching region data:', error);
      throw error;
    }
  },
};
