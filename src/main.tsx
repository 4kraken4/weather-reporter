import { PrimeReactProvider } from 'primereact/api';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { LayoutProvider } from './core/contexts/LayoutProvider';
import { MessageProvider } from './core/contexts/MessageProvider';
import { ThemeProvider } from './core/contexts/ThemeProvider';
import { ErrorBoundary } from './core/errors/ErrorBoundary';
import './index.scss';

const rootElement = document.getElementById('root');
if (rootElement) {
  const value = { locale: 'en', ripple: false };
  createRoot(rootElement).render(
    <StrictMode>
      <PrimeReactProvider value={value}>
        <ErrorBoundary>
          <ThemeProvider>
            <MessageProvider>
              <LayoutProvider>
                <App />
              </LayoutProvider>
            </MessageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </PrimeReactProvider>
    </StrictMode>
  );
} else {
  throw new Error("Root element with id 'root' not found.");
}
