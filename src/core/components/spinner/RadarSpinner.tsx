import './styles/radar-spinner.scss';

import { useTheme } from '@core/hooks/useTheme';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import {
  type CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type RadarSpinnerProps = {
  /**
   * Size of the spinner in pixels
   * @default 80
   */
  size?: number;

  /**
   * Primary color for the compass elements
   * @default undefined (uses CSS variable)
   */
  colorPrimary?: string;

  /**
   * Secondary color for visual elements
   * @default undefined (uses CSS variable)
   */
  colorSecondary?: string;

  /**
   * Accent color for highlights
   * @default undefined (uses CSS variable)
   */
  colorAccent?: string;

  /**
   * Highlight color for glowing elements
   * @default undefined (uses CSS variable)
   */
  colorHighlight?: string;

  /**
   * Enable or disable radar dots
   * @default true
   */
  showRadarDots?: boolean;

  /**
   * Animation speed multiplier
   * @default 1
   */
  speed?: number;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Additional inline styles
   */
  style?: CSSProperties;
};

/**
 * location searching animation component with compass/radar style
 *
 * @component
 * @example
 * <RadarSpinner size={100} colorPrimary="#00c6ff" />
 */
const RadarSpinner = ({
  size = 80,
  colorPrimary,
  colorSecondary,
  colorAccent,
  colorHighlight,
  showRadarDots = true,
  speed = 1,
  className = '',
  style = {},
}: RadarSpinnerProps) => {
  // Generate random radar dots (simulating detected locations)
  const [radarDots, setRadarDots] = useState<
    { id: number; distance: number; angle: number; size: number; delay: number }[]
  >([]);

  const { isDarkMode } = useTheme();

  // Track the current pulse ring radius (normalized 0-1)
  const [pulseRadius, setPulseRadius] = useState(0);

  // Helper to generate random dots (memoized)
  const generateRadarDots = useCallback((count = 3) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      distance: Math.random() * 0.4 + 0.2, // Random distance from center (20-60% of radius)
      angle: Math.random() * 360, // Random angle in degrees
      size: Math.random() * 0.02 + 0.025, // Random size
      delay: Math.random() * 0.3, // Random delay for animation
    }));
  }, []);

  // Calculate position for radar dots
  const calculateDotPosition = (distance: number, angle: number) => {
    const radians = (angle * Math.PI) / 180;
    const x = distance * Math.cos(radians);
    const y = distance * Math.sin(radians);
    return { x, y };
  };

  // Animate pulse ring radius (0 to 1, loops)
  useEffect(() => {
    let frameId: number;
    const start = performance.now();
    const duration = 3000 / speed; // ms, matches pulseRingVariants
    let prevPulse = 0;
    const animate = (now: number) => {
      const elapsed = (now - start) % duration;
      const progress = elapsed / duration;
      setPulseRadius(progress); // 0 to 1
      // Detect wrap-around (cycle complete)
      if (prevPulse > 0.8 && progress < 0.2) {
        setRadarDots(generateRadarDots());
      }
      prevPulse = progress;
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [speed, generateRadarDots]);

  const customStyles = useMemo(
    () => ({
      '--lss-size': `${size}px`,
      '--lss-speed': speed,
      ...(colorPrimary && { '--lss-color-primary': colorPrimary }),
      ...(colorSecondary && { '--lss-color-secondary': colorSecondary }),
      ...(colorAccent && { '--lss-color-accent': colorAccent }),
      ...(colorHighlight && { '--lss-color-highlight': colorHighlight }),
    }),
    [size, speed, colorPrimary, colorSecondary, colorAccent, colorHighlight]
  );

  // Memoize radar dot positions for performance
  const radarDotPositions = useMemo(() => {
    return radarDots.map(dot => calculateDotPosition(dot.distance, dot.angle));
  }, [radarDots]);

  // Animation variants for Framer Motion
  const compassVariants = useMemo<{
    base: Variants;
    centerDot: Variants;
    needle: Variants;
    radarScan: Variants;
    pulseRing: Variants;
    radarDot: Variants;
    radarGrid: Variants;
  }>(() => {
    return {
      base: {
        initial: { scale: 0.8, opacity: 0 },
        animate: {
          scale: 1,
          opacity: 1,
          transition: {
            duration: 0.4 / speed,
            ease: 'easeOut',
          },
        },
        exit: { scale: 0.8, opacity: 0 },
      },
      centerDot: {
        initial: { scale: 0, opacity: 0 },
        animate: {
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
          transition: {
            duration: 2 / speed,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
        exit: { scale: 0, opacity: 0 },
      },
      needle: {
        initial: { rotate: 0, opacity: 0 },
        animate: {
          rotate: [0, 180, 220, 270, 360],
          opacity: 1,
          transition: {
            rotate: {
              duration: 8 / speed,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
              times: [0, 0.5, 0.65, 0.8, 1],
            },
            opacity: {
              duration: 0.3 / speed,
            },
          },
        },
        exit: { opacity: 0 },
      },
      radarScan: {
        initial: { rotate: 0, opacity: 0 },
        animate: {
          rotate: 360,
          opacity: 0.6,
          transition: {
            rotate: {
              duration: 3 / speed,
              repeat: Infinity,
              ease: 'linear',
            },
            opacity: {
              duration: 0.3 / speed,
            },
          },
        },
        exit: { opacity: 0 },
      },
      pulseRing: {
        initial: {
          width: '30%',
          height: '30%',
          borderColor: 'var(--lss-color-accent, var(--lss-color-highlight))',
          boxShadow:
            '0 0 5px var(--lss-color-highlight, var(--lss-color-accent)), 0 0 10px var(--lss-color-primary)',
          opacity: 0,
        },
        animate: {
          width: '100%',
          height: '100%',
          borderColor: 'var(--lss-color-primary)',
          boxShadow: '0 0 10px var(--lss-color-primary)',
          opacity: [0, 0.7],
          transition: {
            duration: 3 / speed,
            repeat: Infinity,
            ease: 'easeOut',
            times: [0, 0.5, 1],
          },
        },
        exit: { opacity: 0 },
      },
      radarDot: {
        initial: {
          scale: 0.6,
          opacity: 0,
          background: 'var(--lss-color-accent, var(--lss-color-highlight))',
          boxShadow:
            '0 0 4px var(--lss-color-accent, var(--lss-color-highlight)), 0 0 8px var(--lss-color-primary)',
          transition: {
            duration: 0.5,
            ease: 'easeOut',
          },
        },
        animate: (custom: { delay: number }) => ({
          scale: [0.6, 1, 1.3, 1],
          opacity: [0, 0.7, 1, 0.4],
          background: 'var(--lss-color-primary)',
          boxShadow:
            '0 0 8px var(--lss-color-primary), 0 0 16px var(--lss-color-accent, var(--lss-color-highlight))',
          transition: {
            duration: 2 / speed,
            delay: custom.delay,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          },
        }),
        exit: {
          scale: 0.6,
          opacity: 0,
          background: 'var(--lss-color-accent, var(--lss-color-highlight))',
          boxShadow:
            '0 0 4px var(--lss-color-accent, var(--lss-color-highlight)), 0 0 8px var(--lss-color-primary)',
          transition: {
            duration: 0.5,
            ease: 'easeIn',
          },
        },
      },
      radarGrid: {
        initial: { scale: 0.8, opacity: 0 },
        animate: {
          scale: 1,
          opacity: 0.4,
          transition: {
            duration: 0.4 / speed,
            ease: 'easeOut',
          },
        },
        exit: { scale: 0.8, opacity: 0 },
      },
    };
  }, [speed]);

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        className={`location-search-spinner ${className}`}
        style={{ ...customStyles, ...style }}
        initial='initial'
        animate='animate'
        exit='exit'
        aria-label='Searching for location'
        role='status'
        aria-live='polite'
      >
        {/* Screen reader text */}
        <span className='sr-only'>Scanning for location...</span>

        {/* Compass base */}
        <motion.div className='compass-base' variants={compassVariants.base} />

        {/* Coordinate grids */}
        <motion.div
          className='coordinate-grid'
          variants={compassVariants.radarGrid}
        />
        <motion.div
          className='coordinate-grid-inner'
          variants={compassVariants.radarGrid}
        />

        {/* Pulse rings - multiple rings with different delays */}
        {[0, 1, 2].map(delay => (
          <motion.div
            key={`pulse-${delay}`}
            className='pulse-ring'
            variants={compassVariants.pulseRing}
            style={{
              transitionDelay: `${delay * 0.8}s`,
            }}
          />
        ))}

        {/* Radar scanning effect */}
        <motion.div
          className='radar-scan'
          variants={compassVariants.radarScan}
          style={{
            mixBlendMode: isDarkMode ? 'screen' : 'multiply',
          }}
        />

        {/* Compass needle */}
        <motion.div className='compass-needle' variants={compassVariants.needle} />

        {/* Center dot */}
        <motion.div className='center-dot' variants={compassVariants.centerDot} />

        {/* Radar dots - only show when pulse ring passes over them */}
        {showRadarDots &&
          radarDots.map((dot, idx) => {
            const position = radarDotPositions[idx];
            // Only show dot if pulse ring radius has reached its distance
            // Add a small threshold for smoothness
            const threshold = 0.03;
            const isVisible = pulseRadius >= dot.distance - threshold;
            return isVisible ? (
              <motion.div
                key={`dot-${dot.id}`}
                className='radar-dot'
                style={{
                  width: `calc(var(--lss-size) * ${dot.size})`,
                  height: `calc(var(--lss-size) * ${dot.size})`,
                  left: `calc(50% + var(--lss-size) * ${position.x} / 2)`,
                  top: `calc(50% + var(--lss-size) * ${position.y} / 2)`,
                  transform: 'translate(-50%, -50%)',
                }}
                variants={compassVariants.radarDot}
                custom={{ delay: dot.delay }}
              />
            ) : null;
          })}
      </motion.div>
    </AnimatePresence>
  );
};

RadarSpinner.displayName = 'RadarSpinner';

export default memo(RadarSpinner);
