import { Skeleton } from 'primereact/skeleton';
import { lazy, memo, Suspense, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import './styles/HomePage.scss';

// Lazy load components with heavy dependencies
const Hero = lazy(() => import('../core/components/hero/Hero'));
const Features = lazy(() => import('../core/components/features/Features'));

const HomePage = memo(() => {
  const navigate = useNavigate();

  const handleOnGetStarted = useCallback(() => {
    void navigate('/weather-lk');
  }, [navigate]);

  // Memoized skeleton components to prevent recreation
  const heroSkeleton = useMemo(
    () => (
      <div className='hero-skeleton'>
        <div className='flex flex-column align-items-center justify-content-center min-h-screen gap-4 p-4'>
          <Skeleton shape='rectangle' className='h-4rem w-20rem mb-3' />
          <Skeleton shape='rectangle' className='h-2rem w-30rem mb-3' />
          <Skeleton shape='rectangle' className='h-2rem w-25rem mb-4' />
          <div className='flex gap-3'>
            <Skeleton shape='rectangle' className='h-3rem w-8rem border-round' />
            <Skeleton shape='rectangle' className='h-3rem w-8rem border-round' />
          </div>
        </div>
      </div>
    ),
    []
  );

  const featuresSkeleton = useMemo(
    () => (
      <div className='features-skeleton p-6'>
        <div className='text-center mb-6'>
          <Skeleton shape='rectangle' className='h-3rem w-20rem mx-auto mb-3' />
          <Skeleton shape='rectangle' className='h-2rem w-30rem mx-auto' />
        </div>
        <div className='grid'>
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={`feature-skeleton-${index}`}
              className='col-12 md:col-6 lg:col-4 p-3'
            >
              <Skeleton
                shape='rectangle'
                className='h-12rem w-full border-round-lg'
              />
            </div>
          ))}
        </div>
      </div>
    ),
    []
  );

  return (
    <div className='homepage-container full-width-content'>
      {/* Hero Component with integrated CTA */}
      <Suspense fallback={heroSkeleton}>
        <Hero onGetStarted={handleOnGetStarted} onLearnMore={() => {}} />
      </Suspense>

      {/* Enhanced Features Section with Magic Card Layout */}
      <Suspense fallback={featuresSkeleton}>
        <Features />
      </Suspense>
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
