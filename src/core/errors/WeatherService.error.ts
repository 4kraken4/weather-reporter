export type ApiError = {
  response?: {
    status?: number;
    data?: unknown;
  };
} & Error;

export function isApiError(error: unknown): error is ApiError {
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
