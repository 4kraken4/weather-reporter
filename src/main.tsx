import { PrimeReactProvider } from 'primereact/api';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { LayoutProvider } from './core/contexts/LayoutProvider';
import { MessageProvider } from './core/contexts/MessageProvider';
import { ThemeProvider } from './core/contexts/ThemeProvider';
import './index.scss';

const rootElement = document.getElementById('root');
if (rootElement) {
  const value = { locale: 'en', ripple: false };
  createRoot(rootElement).render(
    <StrictMode>
      <PrimeReactProvider value={value}>
        <ThemeProvider>
          <MessageProvider>
            <LayoutProvider>
              <App />
            </LayoutProvider>
          </MessageProvider>
        </ThemeProvider>
      </PrimeReactProvider>
    </StrictMode>
  );
} else {
  throw new Error("Root element with id 'root' not found.");
}
