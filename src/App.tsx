import { SplashScreen, SuspenseFallback } from '@core/components/splash';
import { LayoutProvider } from '@core/contexts/LayoutProvider';
import { useAppLoading } from '@core/hooks/useAppLoading';
import { RouterProvider } from '@core/router/RouterProvider';
import 'primeflex/primeflex.css'; // flex
import 'primeicons/primeicons.css'; // icons
import 'primereact/resources/primereact.min.css'; // core css
import { Suspense, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

function App() {
  const { isAppLoading, setAppLoading } = useAppLoading();
  const [componentsLoaded, setComponentsLoaded] = useState(false);

  // Production safety: Prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isAppLoading) {
        console.warn('Splash screen timeout reached, forcing app load');
        setAppLoading(false);
      }
    }, 10000); // 10 second max loading time

    return () => clearTimeout(timeout);
  }, [isAppLoading, setAppLoading]);

  // Simulate component loading completion
  useEffect(() => {
    // Mark components as loaded after a reasonable time for splash screen
    const timer = setTimeout(() => {
      setComponentsLoaded(true);
    }, 500); // Shorter delay to ensure splash completes first

    return () => clearTimeout(timer);
  }, []);

  const handleSplashComplete = () => {
    // When splash completes, mark both app and components as loaded
    setAppLoading(false);
    setComponentsLoaded(true);
  };

  // Show splash screen until both app loading is complete AND components are loaded
  const showSplashScreen = isAppLoading || !componentsLoaded;

  return (
    <>
      {showSplashScreen && (
        <SplashScreen
          onComplete={handleSplashComplete}
          duration={1500} // Responsive duration - will complete when loading is done
        />
      )}
      {!showSplashScreen && (
        <BrowserRouter>
          <Suspense fallback={<SuspenseFallback />}>
            <LayoutProvider>
              <RouterProvider />
            </LayoutProvider>
          </Suspense>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
