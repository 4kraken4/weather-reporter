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
          console.warn('Request cancelled:', error.message);
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
    if (!url.startsWith('/')) {
      throw new Error('URL must start with a forward slash (/)');
    }
    const response: AxiosResponse<T> = await this.instance.get(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    if (!url.startsWith('/')) {
      throw new Error('URL must start with a forward slash (/)');
    }
    if (data && typeof data !== 'object') {
      throw new Error('Data must be an object or undefined');
    }
    const response: AxiosResponse<T> = await this.instance.post(url, data, config);
    return response.data;
  }
}

export const apiService = new ApiService(import.meta.env.VITE_API_BASE_URL as string);
