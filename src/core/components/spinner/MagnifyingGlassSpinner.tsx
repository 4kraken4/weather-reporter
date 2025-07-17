import { AnimatePresence, motion, type Variants } from 'motion/react';
import { type FC } from 'react';
import './styles/magnifying-glass-spinner.scss';

export type MagnifyingGlassSpinnerProps = {
  /** Whether the spinner is visible */
  isVisible?: boolean;
  /** Size of the spinner container in rem units */
  size?: number;
  /** Aria label for accessibility */
  ariaLabel?: string;
};

/**
 * MagnifyingGlassSpinner component
 *
 * Features an animated magnifying glass with handle and glass animations
 */
export const MagnifyingGlassSpinner: FC<MagnifyingGlassSpinnerProps> = ({
  isVisible = true,
  size = 4,
  ariaLabel = 'Searching',
}) => {
  const gradientVariants: Variants = {
    initial: {
      backgroundPosition: '-100% 0',
    },
    animate: {
      backgroundPosition: '100% 0',
      transition: {
        duration: 1.5,
        ease: 'linear' as const,
        repeat: Infinity,
      },
    },
  };
  return (
    <AnimatePresence mode='wait'>
      {isVisible && (
        <motion.div
          className='shimmer-icon-wrapper'
          aria-label={ariaLabel}
          style={{ width: `${size}rem`, height: `${size}rem` }}
        >
          <i className='icon-static' />
          <motion.div
            className='shimmer-mask'
            variants={gradientVariants}
            initial='initial'
            animate='animate'
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

MagnifyingGlassSpinner.displayName = 'MagnifyingGlassSpinner';
export default MagnifyingGlassSpinner;
