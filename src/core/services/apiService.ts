import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

class ApiService {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    if (!baseURL || typeof baseURL !== 'string') {
      throw new Error('Base URL must be a valid string');
    }
    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private isCancel(error: unknown): boolean {
    return axios.isCancel(error);
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      config => {
        if (config && typeof config !== 'object') {
          throw new Error('Config must be an object or undefined');
        }
        if (config?.params && typeof config.params !== 'object') {
          throw new Error('Params must be an object or undefined');
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(new Error(error.message));
      }
    );

    this.instance.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (this.isCancel(error)) {
          return Promise.reject(new Error('Request cancelled'));
        }
        if (error.response) {
          console.error('API Error:', {
            status: error.response.status,
            data: error.response.data,
          });
        } else {
          console.error('Network Error:', {
            message: error.message,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      let requestUrl = url;
      if (!requestUrl.startsWith('/')) {
        requestUrl = `/${requestUrl}`;
      }

      const response: AxiosResponse<T> = await this.instance.get(requestUrl, {
        ...config,
        paramsSerializer: params => {
          return new URLSearchParams(params as Record<string, string>).toString();
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          ((error.response?.data as Record<string, unknown>)?.message as string) ??
          error.message ??
          'Unknown API error';
        throw new Error(`API request failed: ${message}`);
      }
      throw error;
    }
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      if (typeof url !== 'string') {
        throw new Error('URL must be a string');
      }

      const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

      if (data !== undefined && data !== null) {
        if (typeof data !== 'object' || Array.isArray(data)) {
          throw new Error('Data must be a plain object when provided');
        }
      }

      // Add request timestamp and unique ID
      const enhancedConfig: AxiosRequestConfig = {
        ...config,
        headers: {
          ...config?.headers,
          'X-Request-ID': crypto.randomUUID(),
          'X-Request-Timestamp': Date.now(),
        },
      };

      const response = await this.instance.post<T>(
        normalizedUrl,
        data,
        enhancedConfig
      );

      if (typeof response.data !== 'object' || response.data === null) {
        throw new Error('Invalid response format from server');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as Record<string, unknown>;

          switch (status) {
            case 400:
              throw new Error((data?.message as string) ?? 'Bad request');
            case 401:
              throw new Error((data?.message as string) ?? 'Unauthorized');
            case 403:
              throw new Error((data?.message as string) ?? 'Forbidden');
            case 404:
              throw new Error((data?.message as string) ?? 'Resource not found');
            case 500:
              throw new Error((data?.message as string) ?? 'Internal server error');
            default:
              throw new Error(
                (data?.message as string) ?? `Request failed with status ${status}`
              );
          }
        } else if (error.request) {
          throw new Error('No response received from server');
        } else {
          throw new Error(`Request setup error: ${error.message}`);
        }
      }
      throw error;
    }
  }
}

export const apiService = new ApiService(import.meta.env.VITE_API_BASE_URL as string);
