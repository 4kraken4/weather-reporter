import { motion, useScroll, useTransform } from 'motion/react';
import { Button } from 'primereact/button';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './styles/hero.scss';

type HeroProps = {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
};

type WeatherData = {
  temperature: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
};

const HeroComponent = memo(({ onGetStarted, onLearnMore }: HeroProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Use refs to avoid re-renders for mouse tracking
  const throttleRef = useRef<number | null>(null);
  const featuresElementRef = useRef<Element | null>(null);

  // Framer Motion scroll tracking - Ultra-optimized for 60fps performance
  const { scrollY } = useScroll();

  // Separate transforms for better performance and granular control
  const weatherCardY = useTransform(scrollY, [0, 800], [0, -200]);
  const weatherCardRotate = useTransform(scrollY, [0, 800], [0, -8]);
  const weatherCardScale = useTransform(scrollY, [0, 800], [1, 0.9]);
  const weatherCardOpacity = useTransform(scrollY, [0, 600], [1, 0.7]);

  // Static weather data - moved outside component to prevent recreation
  const weatherData = useMemo(
    () => ({
      temperature: 28,
      condition: 'Partly Cloudy',
      location: 'Colombo, Sri Lanka',
      humidity: 75,
      windSpeed: 12,
    }),
    []
  );

  // Ultra-optimized mouse movement with minimal reflow and improved throttling
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (throttleRef.current) {
      return; // Skip if already throttled
    }

    throttleRef.current = requestAnimationFrame(() => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        // Use CSS custom properties for hardware-accelerated transforms
        heroRef.current.style.setProperty('--mouse-x', x.toString());
        heroRef.current.style.setProperty('--mouse-y', y.toString());
      }
      throttleRef.current = null;
    });
  }, []);

  // Optimized scroll handler with cached element reference
  const handleScrollToNext = useCallback(() => {
    // Use cached reference or find and cache it
    featuresElementRef.current ??= document.querySelector(
      '[data-section="features__container"]'
    );

    const featuresSection = featuresElementRef.current;
    if (featuresSection) {
      const headerHeight = 80;
      const elementPosition =
        featuresSection.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      // Fallback
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  // Use Intersection Observer for better visibility detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Set weather data after visibility is confirmed
          setTimeout(() => setCurrentWeather(weatherData), 800);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    // Add optimized event listeners
    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      observer.disconnect();
      if (heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove);
      }
      if (throttleRef.current) {
        cancelAnimationFrame(throttleRef.current);
      }
    };
  }, [weatherData, handleMouseMove]);

  // Ultra-optimized animation configurations - GPU-accelerated
  const weatherCardInitial = useMemo(
    () => ({
      opacity: 0,
      y: 30,
      scale: 0.9,
      willChange: 'transform, opacity',
    }),
    []
  );

  const weatherCardAnimate = useMemo(
    () => ({
      opacity: 1,
      y: 0,
      scale: 1,
      willChange: 'auto',
    }),
    []
  );

  const weatherCardTransition = useMemo(
    () => ({
      duration: 0.6,
      delay: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      type: 'tween' as const,
    }),
    []
  );

  // Ultra-optimized badge animations - Reduced complexity for 60fps
  const badgeAnimationConfig = useMemo(
    () => ({
      initial: {
        opacity: 0,
        scale: 0.9,
        y: 15,
        willChange: 'transform, opacity',
      },
      animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        willChange: 'auto',
      },
      transition: {
        duration: 0.5,
        delay: 0.1,
        ease: [0.23, 1, 0.32, 1] as const,
        type: 'tween' as const,
      },
      hover: {
        scale: 1.02,
        transition: {
          duration: 0.2,
          ease: 'easeOut' as const,
          type: 'tween' as const,
        },
      },
      tap: {
        scale: 0.98,
        transition: {
          duration: 0.1,
          ease: 'easeOut' as const,
          type: 'tween' as const,
        },
      },
    }),
    []
  );

  const shimmerAnimationConfig = useMemo(
    () => ({
      animate: { x: ['0%', '200%'] },
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatDelay: 4,
        ease: 'linear' as const,
        repeatType: 'loop' as const,
        type: 'tween' as const,
      },
    }),
    []
  );

  const badgeTextAnimationConfig = useMemo(
    () => ({
      text: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: {
          duration: 0.3,
          delay: 0.4,
          ease: 'easeOut' as const,
          type: 'tween' as const,
        },
      },
      icon: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: {
          duration: 0.4,
          delay: 0.6,
          ease: [0.34, 1.56, 0.64, 1] as const,
          type: 'tween' as const,
        },
      },
      span: {
        initial: { opacity: 0, x: -5 },
        animate: { opacity: 1, x: 0 },
        transition: {
          duration: 0.3,
          delay: 0.8,
          ease: 'easeOut' as const,
          type: 'tween' as const,
        },
      },
    }),
    []
  );

  return (
    <section
      ref={heroRef}
      className={`hero-section-container ${isVisible ? 'visible' : ''}`}
      aria-label='Weather Reporter Hero Section'
    >
      {/* Optimized Animated Background - Minimal elements for maximum performance */}
      <div className='hero-background'>
        <div className='hero-gradient-orb orb-1' />
        <div className='hero-gradient-orb orb-2' />
        <div className='hero-grid-pattern' />
        <div className='hero-mesh-gradient' />
      </div>

      {/* Optimized Floating Elements - Reduced for performance */}
      <div className='hero-floating-elements'>
        <div className='floating-element element-1'>
          <i className='pi pi-cloud text-4xl' />
        </div>
        <div className='floating-element element-2'>
          <i className='pi pi-sun text-3xl' />
        </div>
      </div>

      {/* Optimized Weather Preview with Combined Transform */}
      {currentWeather && (
        <motion.div
          className='hero-weather-preview'
          style={{
            y: weatherCardY,
            rotate: weatherCardRotate,
            scale: weatherCardScale,
            opacity: weatherCardOpacity,
          }}
          initial={weatherCardInitial}
          animate={weatherCardAnimate}
          transition={weatherCardTransition}
        >
          <div className='weather-preview-card'>
            <div className='weather-icon'>
              <i className='pi pi-cloud-sun' />
            </div>
            <div className='weather-info'>
              <div
                className='temperature weather-stat-animate'
                style={{ animationDelay: '1.5s' }}
              >
                {currentWeather.temperature}°C
              </div>
              <div
                className='condition weather-stat-animate'
                style={{ animationDelay: '1.6s' }}
              >
                {currentWeather.condition}
              </div>
              <div
                className='location weather-stat-animate'
                style={{ animationDelay: '1.7s' }}
              >
                {currentWeather.location}
              </div>
            </div>
            <div className='weather-stats'>
              <div
                className='stat weather-stat-animate'
                style={{ animationDelay: '1.8s' }}
              >
                <i className='pi pi-chart-bar' />
                <span>{currentWeather.humidity}%</span>
              </div>
              <div
                className='stat weather-stat-animate'
                style={{ animationDelay: '1.9s' }}
              >
                <i className='pi pi-compass' />
                <span>{currentWeather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content - Optimized structure */}
      <div className='hero-content'>
        <motion.div
          className='hero-badge'
          initial={badgeAnimationConfig.initial}
          animate={badgeAnimationConfig.animate}
          transition={badgeAnimationConfig.transition}
          whileHover={badgeAnimationConfig.hover}
          whileTap={badgeAnimationConfig.tap}
        >
          <motion.div
            className='badge-shimmer'
            animate={shimmerAnimationConfig.animate}
            transition={shimmerAnimationConfig.transition}
          />
          <motion.span
            className='badge-text'
            initial={badgeTextAnimationConfig.text.initial}
            animate={badgeTextAnimationConfig.text.animate}
            transition={badgeTextAnimationConfig.text.transition}
          >
            <motion.i
              className='pi pi-verified'
              initial={badgeTextAnimationConfig.icon.initial}
              animate={badgeTextAnimationConfig.icon.animate}
              transition={badgeTextAnimationConfig.icon.transition}
            />
            <motion.span
              initial={badgeTextAnimationConfig.span.initial}
              animate={badgeTextAnimationConfig.span.animate}
              transition={badgeTextAnimationConfig.span.transition}
            >
              Trusted Weather Data
            </motion.span>
          </motion.span>
        </motion.div>

        <div className='hero-title-container'>
          <h1 className='hero-title'>
            <span className='title-line title-line-1'>THE</span>
            <span className='title-line title-line-2'>
              <span className='word-weather glitch-effect'>
                WEATHER
                <span className='glitch-overlay'>WEATHER</span>
                <span className='glitch-overlay'>WEATHER</span>
              </span>
            </span>
            <span className='title-line title-line-3 slide-in'>REPORTER</span>
          </h1>

          <div className='hero-subtitle'>
            <p>
              Experience real-time weather data with stunning
              <span className='highlight'> interactive visualizations</span>
              &nbsp; and accurate forecasting across Sri Lanka
            </p>
          </div>
        </div>

        {/* Enhanced Interactive Stats */}
        <div className='hero-stats'>
          <div className='stat-item'>
            <div className='stat-number' data-count='25'>
              25+
            </div>
            <div className='stat-label'>Districts</div>
          </div>
          <div className='stat-divider' />
          <div className='stat-item'>
            <div className='stat-number' data-count='99'>
              99%
            </div>
            <div className='stat-label'>Accuracy</div>
          </div>
          <div className='stat-divider' />
          <div className='stat-item'>
            <div className='stat-number' data-count='24'>
              24/7
            </div>
            <div className='stat-label'>Updates</div>
          </div>
        </div>

        {/* Enhanced CTA Buttons */}
        <div className='hero-cta-buttons'>
          <Button
            label='Get Started'
            icon='pi pi-arrow-right'
            className='hero-cta-primary'
            onClick={onGetStarted}
            size='large'
          />
          <Button
            label='Learn More'
            icon='pi pi-info-circle'
            className='hero-cta-secondary'
            outlined
            size='large'
            onClick={onLearnMore}
          />
        </div>
      </div>

      {/* Optimized Scroll Hint */}
      <div className='minimal-scroll-hint'>
        <button
          className='scroll-chevron'
          onClick={handleScrollToNext}
          aria-label='Scroll to features section'
          type='button'
        >
          <i className='pi pi-chevron-down' />
        </button>
      </div>
    </section>
  );
});

// Add display name for debugging
HeroComponent.displayName = 'HeroComponent';

// Export the optimized component
const Hero = HeroComponent;

export default Hero;
