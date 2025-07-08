import { Button } from 'primereact/button';
import React, { type ErrorInfo, type ReactNode } from 'react';
import Tilty from 'react-tilty';

import './styles/ErrorBoundary.scss';

type ErrorMessage = {
  summary: string;
  detail: string;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  getErrorMessage = (error: Error): ErrorMessage => {
    // Handle different types of errors
    if (error.name === 'ChunkLoadError') {
      return {
        summary: 'Loading Error',
        detail: 'Failed to load application resources. Please refresh the page.',
      };
    }

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

    // Check for common React errors
    if (
      error.message.includes('Cannot read property') ||
      error.message.includes('Cannot read properties')
    ) {
      return {
        summary: 'Application Error',
        detail: 'A component encountered an unexpected error.',
      };
    }

    if (error.message.includes('Maximum update depth exceeded')) {
      return {
        summary: 'Rendering Error',
        detail: 'A component is causing too many re-renders.',
      };
    }

    // Fallback for any other error
    return {
      summary: 'Unexpected Error',
      detail: error.message || 'An unexpected error occurred. Please try again.',
    };
  };

  handleRetry = () => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional onRetry callback
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI using the same design as errorHandler.tsx
      const errorMessage = this.state.error
        ? this.getErrorMessage(this.state.error)
        : {
            summary: 'Unexpected Error',
            detail: 'An unexpected error occurred. Please try again.',
          };

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
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className='mt-4 text-xs text-gray-400'>
                    <summary className='cursor-pointer mb-2'>
                      Error Details (Development)
                    </summary>
                    <pre className='text-xs overflow-auto max-w-full'>
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className='text-xs overflow-auto max-w-full mt-2'>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </details>
                )}
              </div>
              <Button
                label='Try Again'
                icon='pi pi-refresh'
                severity='danger'
                onClick={this.handleRetry}
                className='focus:shadow-none w-10rem mt-4'
              />
            </div>
          </Tilty>
        </div>
      );
    }

    return this.props.children;
  }
}
