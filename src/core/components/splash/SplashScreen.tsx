import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './styles/SplashScreen.scss';

type SplashScreenProps = {
  onComplete?: () => void;
  duration?: number;
  onError?: (error: Error) => void;
};

// Performance: Extract animation configs as constants to prevent recreation
const ANIMATION_EASE = [0.6, -0.05, 0.01, 0.99] as const;

const CONTAINER_VARIANTS = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.8, ease: ANIMATION_EASE },
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    transition: { duration: 0.5, ease: ANIMATION_EASE },
  },
} as const;

const CLOUD_VARIANTS = {
  initial: { x: -100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 0.6,
    transition: { duration: 2, ease: ANIMATION_EASE },
  },
} as const;

const LOGO_VARIANTS = {
  initial: { scale: 0.3, rotate: -10, opacity: 0 },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { duration: 1.2, ease: ANIMATION_EASE, delay: 0.2 },
  },
} as const;

const TITLE_VARIANTS = {
  initial: { y: 30, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: ANIMATION_EASE, delay: 0.8 },
  },
} as const;

const TAGLINE_VARIANTS = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: ANIMATION_EASE, delay: 1.2 },
  },
} as const;

const PARTICLE_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: [0, 1, 0],
    y: [-20, -40, -60],
    transition: { duration: 3, repeat: Infinity, ease: ANIMATION_EASE },
  },
};

export const SplashScreen = ({
  onComplete,
  duration = 3000,
  onError,
}: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const errorHandlerRef = useRef<typeof window.onerror | null>(null);
  const timersRef = useRef<{ main?: NodeJS.Timeout; exit?: NodeJS.Timeout }>({});

  // Performance: Memoize error handler to prevent recreation
  const handleError = useCallback(
    (error: Error) => {
      console.error('Splash screen error:', error);
      onError?.(error);
      // Still complete the splash even if there's an error
      timersRef.current.exit = setTimeout(() => onComplete?.(), 500);
    },
    [onError, onComplete]
  );

  // Performance: Memoize loading progress animation config
  const loadingProgressConfig = useMemo(
    () => ({
      initial: { width: 0 },
      animate: {
        width: '100%',
        transition: {
          duration: Math.max(duration / 1000 - 0.5, 0.5),
          ease: ANIMATION_EASE,
          delay: 0.5,
        },
      },
    }),
    [duration]
  );

  // Performance: Memoize cloud animation configs with different delays
  const cloudConfigs = useMemo(
    () => [
      {
        ...CLOUD_VARIANTS,
        animate: {
          ...CLOUD_VARIANTS.animate,
          transition: { ...CLOUD_VARIANTS.animate.transition, delay: 0.5 },
        },
      },
      {
        ...CLOUD_VARIANTS,
        animate: {
          ...CLOUD_VARIANTS.animate,
          transition: { ...CLOUD_VARIANTS.animate.transition, delay: 0.7 },
        },
      },
      {
        ...CLOUD_VARIANTS,
        animate: {
          ...CLOUD_VARIANTS.animate,
          transition: { ...CLOUD_VARIANTS.animate.transition, delay: 1.0 },
        },
      },
    ],
    []
  );

  // Performance: Memoize particle configs with different delays
  const particleConfigs = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        ...PARTICLE_VARIANTS,
        animate: {
          ...PARTICLE_VARIANTS.animate,
          transition: {
            ...PARTICLE_VARIANTS.animate.transition,
            delay: i * 0.5,
          },
        },
      })),
    []
  );

  useEffect(() => {
    // Performance: Store original handler in ref to avoid recreating
    errorHandlerRef.current = window.onerror;

    // Capture the timers ref at the start of the effect
    const timersRefCurrent = timersRef.current;

    // Set up optimized error handler
    window.onerror = (message, source, lineno, colno, error) => {
      if (error) handleError(error);
      return errorHandlerRef.current
        ? (errorHandlerRef.current(message, source, lineno, colno, error) as boolean)
        : false;
    };

    // Performance: Cap duration and use single timer with cleanup
    const safeDuration = Math.min(duration, 10000);
    const mainTimer = setTimeout(() => {
      setIsVisible(false);
      const exitTimer = setTimeout(() => {
        onComplete?.();
      }, 500); // Wait for exit animation
      timersRefCurrent.exit = exitTimer;
    }, safeDuration);

    timersRefCurrent.main = mainTimer;

    // Performance: Optimized cleanup function
    return () => {
      // Clear all timers
      clearTimeout(mainTimer);
      const exitTimer = timersRefCurrent.exit;
      if (exitTimer) clearTimeout(exitTimer);

      // Restore original error handler
      window.onerror = errorHandlerRef.current;
    };
  }, [duration, handleError, onComplete]);

  return (
    <AnimatePresence mode='wait'>
      {isVisible && (
        <motion.div
          className='splash-screen'
          variants={CONTAINER_VARIANTS}
          initial='initial'
          animate='animate'
          exit='exit'
        >
          {/* Background gradient */}
          <div className='splash-background'>
            <div className='gradient-overlay' />
          </div>

          {/* Floating clouds - Performance optimized */}
          {cloudConfigs.map((config, index) => (
            <motion.div
              key={`cloud-${index + 1}`}
              className={`cloud cloud-${index + 1}`}
              variants={config}
              initial='initial'
              animate='animate'
            />
          ))}

          {/* Main content */}
          <div className='splash-content'>
            {/* Logo */}
            <motion.div
              className='logo-container'
              variants={LOGO_VARIANTS}
              initial='initial'
              animate='animate'
            >
              <div className='logo-wrapper'>
                <img
                  src='/logo.svg'
                  alt='Weather Reporter Logo'
                  className='logo'
                  loading='eager'
                />
                <div className='logo-glow' />
              </div>
            </motion.div>

            {/* App title */}
            <motion.div
              className='title-container'
              variants={TITLE_VARIANTS}
              initial='initial'
              animate='animate'
            >
              <h1 className='app-title'>Weather Reporter</h1>
            </motion.div>

            {/* Tagline */}
            <motion.div
              className='tagline-container'
              variants={TAGLINE_VARIANTS}
              initial='initial'
              animate='animate'
            >
              <p className='tagline'>Your trusted weather companion</p>
            </motion.div>

            {/* Loading bar */}
            <motion.div className='loading-container'>
              <div className='loading-bar'>
                <motion.div className='loading-progress' {...loadingProgressConfig} />
              </div>
            </motion.div>
          </div>

          {/* Weather particles - Performance optimized */}
          <div className='weather-particles'>
            {particleConfigs.map((config, i) => (
              <motion.div
                key={`particle-${i + 1}`}
                className={`particle particle-${i + 1}`}
                variants={config}
                initial='initial'
                animate='animate'
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
