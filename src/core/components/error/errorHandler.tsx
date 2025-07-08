import { Button } from 'primereact/button';
import { useEffect } from 'react';
import Tilty from 'react-tilty';

import { useMessage } from '@/core/hooks/useMessage';
import './styles/errorHandler.scss';

type ErrorMessage = {
  summary: string;
  detail: string;
};

type ErrorHandlerProps = {
  error: ApiError;
  onRetry?: () => void;
  isLoading: boolean;
};

type ApiError = {
  response?: {
    data?: {
      summary?: string;
      detail?: string;
    };
    status?: number;
  };
  message?: string;
};

const ErrorHandler = ({ error, onRetry, isLoading }: ErrorHandlerProps) => {
  const { showMessage } = useMessage();

  const getErrorMessage = (error: ApiError): ErrorMessage => {
    // Check for server-provided error details first
    if (error?.response?.data?.summary) {
      return {
        summary: error.response.data.summary,
        detail: error.response.data.detail ?? 'An unexpected error occurred.',
      };
    }

    // Handle HTTP status codes with structured messages
    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          return {
            summary: 'Bad Request',
            detail: 'The server cannot process the request.',
          };
        case 401:
          return {
            summary: 'Unauthorized',
            detail: 'Please login to access this resource.',
          };
        case 403:
          return {
            summary: 'Forbidden',
            detail: 'You do not have permission to access this resource.',
          };
        case 404:
          return {
            summary: 'Not Found',
            detail: 'The requested resource could not be found.',
          };
        case 500:
          return {
            summary: 'Internal Server Error',
            detail: 'Please try again later.',
          };
        case 502:
          return {
            summary: 'Bad Gateway',
            detail: 'Server received an invalid response.',
          };
        case 503:
          return {
            summary: 'Service Unavailable',
            detail: 'The server is currently unavailable.',
          };
        default:
          return {
            summary: `Error (${error.response.status})`,
            detail: 'An unexpected error occurred',
          };
      }
    }

    // Handle network errors with structured messages
    if (error?.message) {
      if (error.message.includes('Network Error')) {
        return {
          summary: 'Network Error',
          detail: 'Please check your internet connection.',
        };
      }
      if (error.message.includes('timeout')) {
        return {
          summary: 'Request Timeout',
          detail: 'The server took too long to respond.',
        };
      }
    }

    // Fallback structured message
    return {
      summary: 'Unexpected Error',
      detail: 'An unexpected error occurred. Please try again.',
    };
  };

  const errorMessage = getErrorMessage(error);

  useEffect(() => {
    if (error) {
      showMessage({
        closable: true,
        sticky: false,
        severity: 'error',
        summary: errorMessage.summary,
        detail: errorMessage.detail,
      });
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!error) return null;

  return (
    <div className='flex justify-content-center align-items-center w-full h-full z-1 error-container'>
      <Tilty glare={false} scale={1.04} max={5} reverse={true}>
        <div className='flex flex-column justify-content-around align-items-center surface-card border-round border-solid border-1 border-red-900 py-8 px-8 error-card'>
          <div className='flex flex-column align-items-center'>
            <div className='flex justify-content-center align-items-center'>
              <i className='pi pi-exclamation-triangle text-2xl text-red-500' />
            </div>
            <h3 className='font-semibold text-2xl text-red-300 mb-2'>
              {errorMessage.summary}
            </h3>
            {errorMessage.detail && (
              <p className='text font-light text-sm mt-0 mb-4'>
                {errorMessage.detail}
              </p>
            )}
          </div>
          {onRetry && (
            <Button
              label={isLoading ? 'Trying...' : 'Try Again'}
              icon={isLoading ? 'pi pi-spin pi-refresh' : 'pi pi-refresh'}
              disabled={isLoading}
              severity='danger'
              onClick={() => {
                onRetry();
              }}
              className='focus:shadow-none w-10rem'
            />
          )}
        </div>
      </Tilty>
    </div>
  );
};

export default ErrorHandler;
