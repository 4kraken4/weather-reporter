import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import './styles/magic-card.scss';

type MagicCardProps = {
  children: ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  borderRadius?: string;
  padding?: string;
  backgroundColor?: string;
  borderColor?: string;
  hoverScale?: number;
  rotationStrength?: number;
  glowIntensity?: number;
  disabled?: boolean;
  onClick?: () => void;
};

const MagicCard = memo(
  ({
    children,
    className = '',
    gradientSize = 300,
    gradientColor = '#22d3ee',
    gradientOpacity = 0.3,
    borderRadius = '16px',
    padding = '24px',
    backgroundColor = 'var(--surface-card)',
    borderColor = 'var(--surface-border)',
    hoverScale = 1.02,
    rotationStrength = 8,
    glowIntensity = 0.2,
    disabled = false,
    onClick,
  }: MagicCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Use refs for mouse position to avoid unnecessary re-renders
    const mousePositionRef = useRef({ x: 50, y: 50 });
    const throttleRef = useRef<number | null>(null);

    // Mouse position tracking with optimized spring config
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Optimized spring config for better performance - memoized outside component
    const springConfig = useMemo(
      () => ({
        damping: 30,
        stiffness: 300,
        mass: 0.5,
      }),
      []
    );

    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    // Transform mouse position to rotation values
    const rotateX = useTransform(
      y,
      [-0.5, 0.5],
      [rotationStrength, -rotationStrength]
    );
    const rotateY = useTransform(
      x,
      [-0.5, 0.5],
      [-rotationStrength, rotationStrength]
    );

    // Pre-calculate hex values once
    const gradientOpacityHex = useMemo(
      () =>
        Math.round(gradientOpacity * 255)
          .toString(16)
          .padStart(2, '0'),
      [gradientOpacity]
    );

    const glowIntensityHex = useMemo(
      () =>
        Math.round(glowIntensity * 255)
          .toString(16)
          .padStart(2, '0'),
      [glowIntensity]
    );

    // Memoized gradient backgrounds - updated on mouse move via callback
    const [gradientBackground, setGradientBackground] = useState(() => {
      const { x, y } = mousePositionRef.current;
      return `radial-gradient(${gradientSize}px circle at ${x}% ${y}%, ${gradientColor}${gradientOpacityHex}, transparent 70%)`;
    });

    const [glowBackground, setGlowBackground] = useState(() => {
      const { x, y } = mousePositionRef.current;
      return `radial-gradient(circle at ${x}% ${y}%, ${gradientColor}${glowIntensityHex}, transparent 50%)`;
    });

    // Update gradients when mouse moves (in the throttled handler)
    const updateGradients = useCallback(() => {
      const { x, y } = mousePositionRef.current;
      setGradientBackground(
        `radial-gradient(${gradientSize}px circle at ${x}% ${y}%, ${gradientColor}${gradientOpacityHex}, transparent 70%)`
      );
      setGlowBackground(
        `radial-gradient(circle at ${x}% ${y}%, ${gradientColor}${glowIntensityHex}, transparent 50%)`
      );
    }, [gradientSize, gradientColor, gradientOpacityHex, glowIntensityHex]);

    // Throttled mouse move handler for better performance
    const handleMouseMove = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || disabled) return;

        // Throttle mouse move events to 60fps
        if (throttleRef.current) {
          cancelAnimationFrame(throttleRef.current);
        }

        throttleRef.current = requestAnimationFrame(() => {
          if (!cardRef.current) return;

          const rect = cardRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width * 0.5;
          const centerY = rect.top + rect.height * 0.5;

          // Normalize mouse position to -0.5 to 0.5 range
          const normalizedX = (event.clientX - centerX) / (rect.width * 0.5);
          const normalizedY = (event.clientY - centerY) / (rect.height * 0.5);

          // Clamp values to prevent extreme rotations
          const clampedX = Math.max(-0.5, Math.min(0.5, normalizedX));
          const clampedY = Math.max(-0.5, Math.min(0.5, normalizedY));

          mouseX.set(clampedX);
          mouseY.set(clampedY);

          // Update mouse position for gradients without causing re-render
          const percentX = ((event.clientX - rect.left) / rect.width) * 100;
          const percentY = ((event.clientY - rect.top) / rect.height) * 100;
          mousePositionRef.current = {
            x: Math.max(0, Math.min(100, percentX)),
            y: Math.max(0, Math.min(100, percentY)),
          };

          // Update gradients with new mouse position
          updateGradients();
        });
      },
      [disabled, mouseX, mouseY, updateGradients]
    );

    const handleMouseEnter = useCallback(() => {
      if (!disabled) {
        setIsHovered(true);
      }
    }, [disabled]);

    const handleMouseLeave = useCallback(() => {
      if (!disabled) {
        setIsHovered(false);
        mouseX.set(0);
        mouseY.set(0);
        mousePositionRef.current = { x: 50, y: 50 };

        // Clear any pending animation frame
        if (throttleRef.current) {
          cancelAnimationFrame(throttleRef.current);
          throttleRef.current = null;
        }
      }
    }, [disabled, mouseX, mouseY]);

    const handleClick = useCallback(() => {
      if (!disabled && onClick) {
        onClick();
      }
    }, [disabled, onClick]);

    // Memoized style object
    const cardStyle = useMemo(
      () => ({
        borderRadius,
        padding,
        backgroundColor,
        borderColor,
        rotateX: disabled ? 0 : rotateX,
        rotateY: disabled ? 0 : rotateY,
        transformStyle: 'preserve-3d' as const,
      }),
      [
        borderRadius,
        padding,
        backgroundColor,
        borderColor,
        disabled,
        rotateX,
        rotateY,
      ]
    );

    // Memoized class name
    const cardClassName = useMemo(
      () =>
        `magic-card ${className} ${disabled ? 'magic-card--disabled' : ''}`.trim(),
      [className, disabled]
    );

    // Animation configurations
    const scaleAnimation = useMemo(
      () => ({
        scale: isHovered && !disabled ? hoverScale : 1,
      }),
      [isHovered, disabled, hoverScale]
    );

    const animationTransition = useMemo(
      () => ({
        duration: 0.3,
        ease: [0.23, 1, 0.32, 1] as const,
      }),
      []
    );

    const tapAnimation = useMemo(
      () =>
        !disabled
          ? {
              scale: hoverScale * 0.98,
              transition: { duration: 0.1 },
            }
          : undefined,
      [disabled, hoverScale]
    );

    const overlayTransition = useMemo(
      () => ({
        opacity: { duration: 0.3, ease: 'easeOut' as const },
      }),
      []
    );

    const glowTransition = useMemo(
      () => ({
        opacity: { duration: 0.4, ease: 'easeOut' as const },
      }),
      []
    );

    const borderGlowTransition = useMemo(
      () => ({
        opacity: { duration: 0.3, ease: 'easeOut' as const },
      }),
      []
    );

    return (
      <motion.div
        ref={cardRef}
        className={cardClassName}
        style={cardStyle}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        animate={scaleAnimation}
        transition={animationTransition}
        whileTap={tapAnimation}
      >
        {/* Gradient overlay */}
        <motion.div
          className='magic-card__gradient'
          style={{
            background: gradientBackground,
            opacity: isHovered && !disabled ? 1 : 0,
          }}
          transition={overlayTransition}
        />

        {/* Glow effect */}
        <motion.div
          className='magic-card__glow'
          style={{
            background: glowBackground,
            opacity: isHovered && !disabled ? 1 : 0,
          }}
          transition={glowTransition}
        />

        {/* Border glow */}
        <motion.div
          className='magic-card__border-glow'
          style={{
            borderColor: gradientColor,
            opacity: isHovered && !disabled ? 0.6 : 0,
          }}
          transition={borderGlowTransition}
        />

        {/* Content */}
        <div className='magic-card__content'>{children}</div>
      </motion.div>
    );
  }
);

// Add display name for debugging
MagicCard.displayName = 'MagicCard';

export default MagicCard;
