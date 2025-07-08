import { motion } from 'framer-motion';

export const SuspenseFallback = () => (
  <motion.div
    className='flex justify-content-center align-items-center h-screen'
    style={{
      background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #67e8f9 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {/* Animated background particles */}
    {Array.from({ length: 6 }, (_, i) => (
      <motion.div
        key={`particle-${i}`}
        className='absolute'
        style={{
          width: '4px',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '50%',
          left: `${20 + i * 12}%`,
          top: `${30 + (i % 2) * 20}%`,
          boxShadow: '0 0 8px rgba(103, 232, 249, 0.8)',
        }}
        animate={{
          y: [-20, -40, -20],
          opacity: [0.4, 1, 0.4],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.3,
          ease: 'easeInOut',
        }}
      />
    ))}

    {/* Main loading content */}
    <motion.div
      className='flex flex-column align-items-center gap-4'
      initial={{ scale: 0.8, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Spinning loader */}
      <motion.div
        className='relative flex justify-content-center align-items-center'
        style={{
          width: '80px',
          height: '80px',
        }}
      >
        {/* Outer ring */}
        <motion.div
          style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            borderTop: '3px solid #67e8f9',
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(103, 232, 249, 0.5)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Inner ring */}
        <motion.div
          style={{
            position: 'absolute',
            width: '50px',
            height: '50px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderBottom: '2px solid #06b6d4',
            borderRadius: '50%',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
          }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Center dot */}
        <motion.div
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#67e8f9',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(103, 232, 249, 0.8)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Loading text */}
      <motion.div
        className='text-center'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.h3
          style={{
            color: '#ffffff',
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: '600',
            letterSpacing: '0.5px',
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Loading
        </motion.h3>
        <motion.p
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0.5rem 0 0 0',
            fontSize: '0.9rem',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Please wait while we prepare your experience
        </motion.p>
      </motion.div>

      {/* Animated dots */}
      <motion.div
        className='flex gap-2'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#67e8f9',
              borderRadius: '50%',
              boxShadow: '0 0 6px rgba(103, 232, 249, 0.6)',
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>

    {/* Floating clouds in background */}
    {Array.from({ length: 3 }, (_, i) => (
      <motion.div
        key={`cloud-${i}`}
        className='absolute'
        style={{
          width: `${40 + i * 20}px`,
          height: `${20 + i * 10}px`,
          backgroundColor: 'rgba(103, 232, 249, 0.15)',
          borderRadius: '50px',
          left: `${10 + i * 30}%`,
          top: `${10 + i * 15}%`,
          filter: 'blur(1px)',
          boxShadow: '0 0 15px rgba(103, 232, 249, 0.2)',
        }}
        animate={{
          x: [0, 30, 0],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 4 + i,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: i * 0.8,
        }}
      />
    ))}
  </motion.div>
);
export default SuspenseFallback;
