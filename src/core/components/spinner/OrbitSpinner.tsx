import { AnimatePresence, easeIn, easeInOut, easeOut, motion } from 'motion/react';
import { type FC } from 'react';
import './styles/orbit-spinner.scss';

export type OrbitSpinnerProps = {
  /** Whether the spinner is visible */
  isVisible?: boolean;
  /** Size of the spinner container in rem units */
  size?: number;
  /** Aria label for accessibility */
  ariaLabel?: string;
};

/**
 * DocumentSearchSpinner component
 *
 * Uses Framer Motion for smooth entrance, exit, and continuous animations
 */
export const OrbitSpinner: FC<OrbitSpinnerProps> = ({
  isVisible = true,
  size = 4,
  ariaLabel = 'Loading',
}) => {
  // Animation variants for the spinner container
  const containerVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: easeOut,
      },
    },
    exit: {
      opacity: 0,
      scale: 0,
      transition: {
        duration: 0.3,
        ease: easeIn,
      },
    },
  };

  // Animation variants for the outer circle
  const circleVariants = {
    initial: { scale: 0.8, opacity: 0.6 },
    animate: {
      rotate: 360,
      scale: [0.9, 1, 0.9],
      opacity: 1,
      transition: {
        rotate: {
          duration: 1.8,
          ease: 'linear' as const,
          repeat: Infinity,
          repeatType: 'loop' as const,
        },
        scale: {
          duration: 2,
          ease: easeInOut,
          repeat: Infinity,
          repeatType: 'reverse' as const,
        },
      },
    },
  };

  // Animation variants for the inner dot
  const dotVariants = {
    initial: { scale: 0 },
    animate: {
      scale: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        ease: easeInOut,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        delay: 0.2,
      },
    },
  };

  return (
    <AnimatePresence mode='wait'>
      {isVisible && (
        <motion.div
          className='search-spinner'
          style={
            {
              '--spinner-size': `${size}rem`,
              '--spinner-circle-size': `${size * 0.625}rem`,
            } as React.CSSProperties
          }
          variants={containerVariants}
          initial='initial'
          animate='animate'
          exit='exit'
          role='status'
          aria-label={ariaLabel}
        >
          <motion.div
            className='spinner-circle'
            variants={circleVariants}
            initial='initial'
            animate='animate'
          />
          <motion.div
            className='spinner-dot'
            variants={dotVariants}
            initial='initial'
            animate='animate'
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrbitSpinner;
