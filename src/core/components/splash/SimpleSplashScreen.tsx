import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import './styles/SimpleSplashScreen.scss';

type SimpleSplashScreenProps = {
  onComplete?: () => void;
  duration?: number;
};

export const SimpleSplashScreen: React.FC<SimpleSplashScreenProps> = ({
  onComplete,
  duration = 3000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 600); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  // Animation variants for the logo
  const logoVariants = {
    hidden: {
      scale: 0.5,
      opacity: 0,
      y: 50,
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 15,
        stiffness: 100,
        duration: 0.8,
      },
    },
  };

  // Animation variants for the text
  const textVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.4,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  // Animation variants for the loading dots
  const dotVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.8,
        duration: 0.3,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.6,
        ease: [0.42, 0, 0.58, 1] as const,
      },
    },
  };

  return (
    <AnimatePresence mode='wait'>
      {isVisible && (
        <motion.div
          className='simple-splash-screen'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
        >
          {/* Background */}
          <div className='simple-splash-background' />

          {/* Content */}
          <div className='simple-splash-content'>
            {/* Logo */}
            <motion.div
              className='simple-logo-container'
              variants={logoVariants}
              initial='hidden'
              animate='visible'
            >
              <div className='simple-logo'>
                <i className='pi pi-cloud' />
              </div>
            </motion.div>

            {/* App Name */}
            <motion.div
              className='simple-app-info'
              variants={textVariants}
              initial='hidden'
              animate='visible'
            >
              <h1 className='simple-app-title'>Weather Reporter</h1>
              <p className='simple-app-subtitle'>Your weather companion</p>
            </motion.div>

            {/* Loading Animation */}
            <motion.div
              className='simple-loading'
              variants={dotVariants}
              initial='hidden'
              animate='visible'
            >
              <div className='simple-loading-dots'>
                <motion.div
                  className='simple-dot'
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className='simple-dot'
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className='simple-dot'
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.4,
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Subtle animated background element */}
          <motion.div
            className='simple-background-circle'
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimpleSplashScreen;
