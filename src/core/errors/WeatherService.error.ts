type WeatherServiceApiError = {
  response?: {
    status?: number;
    data?: unknown;
  };
} & Error;

export function isApiError(error: unknown): error is WeatherServiceApiError {
  return (
    error instanceof Error &&
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}
