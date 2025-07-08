import { PrimeReactProvider } from 'primereact/api';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { LayoutProvider } from './core/contexts/LayoutProvider';
import { LoadingProvider } from './core/contexts/LoadingProvider';
import { MessageProvider } from './core/contexts/MessageProvider';
import { ThemeProvider } from './core/contexts/ThemeProvider';
import { ErrorBoundary } from './core/errors/ErrorBoundary';
import './index.scss';

const rootElement = document.getElementById('root');
if (rootElement) {
  const value = { locale: 'en', ripple: false };

  // Remove initial loading screen once React is ready
  const removeInitialLoading = () => {
    const loading = document.getElementById('initial-loading');
    if (loading) {
      loading.style.display = 'none';
    }
    document.body.classList.add('react-loaded');
  };

  createRoot(rootElement).render(
    <StrictMode>
      <PrimeReactProvider value={value}>
        <ErrorBoundary>
          <ThemeProvider>
            <LoadingProvider>
              <MessageProvider>
                <LayoutProvider>
                  <App />
                </LayoutProvider>
              </MessageProvider>
            </LoadingProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </PrimeReactProvider>
    </StrictMode>
  );

  // Remove loading screen after React renders
  setTimeout(removeInitialLoading, 100);
} else {
  throw new Error("Root element with id 'root' not found.");
}
