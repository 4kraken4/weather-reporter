import { useEffect, useRef, useState } from 'react';
import { FaTint } from 'react-icons/fa';
import './styles/HumidityIndicator.scss';

type HumidityIndicatorProps = {
  showLabel?: boolean;
  humidity: number;
  size?: number;
};

export const HumidityIndicator = ({
  humidity,
  size = 24,
  showLabel = true,
}: HumidityIndicatorProps) => {
  const normalizedHumidity = Math.min(1, Math.max(0, humidity / 100));
  const iconRef = useRef<HTMLDivElement>(null);

  // Color gradient
  const getHumidityColor = (normalized: number) => {
    const hue = 210 - normalized * 90; // Light blue to deep teal
    return `hsl(${hue}, ${70 + normalized * 30}%, ${60 - normalized * 20}%)`;
  };

  // Floating animation for main icon
  useEffect(() => {
    if (!iconRef.current) return;

    const icon = iconRef.current;
    let animationFrame: number;
    let startTime: number | null = null;
    const duration = 3000 + Math.random() * 4000; // 3-7s per cycle
    const amplitude = 3; // Max vertical movement in pixels

    const floatAnimation = (timestamp: number) => {
      startTime ??= timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % duration) / duration;

      // Smooth sine wave movement
      const translateY = Math.sin(progress * Math.PI * 2) * amplitude;
      icon.style.transform = `translateY(${translateY}px)`;

      animationFrame = requestAnimationFrame(floatAnimation);
    };

    animationFrame = requestAnimationFrame(floatAnimation);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Water droplets animation
  const [droplets, setDroplets] = useState<
    {
      id: string;
      left: number;
      delay: number;
      duration: number;
      size: number;
    }[]
  >([]);

  useEffect(() => {
    const dropletCount = Math.floor(3 + normalizedHumidity * 7);
    const newDroplets = Array.from({ length: dropletCount }).map((_, i) => ({
      id: `drop-${i}-${Date.now()}`,
      left: 15 + Math.random() * 70,
      delay: Math.random() * 2,
      duration: 0.5 + Math.random() * 1.5,
      size: 3 + Math.random() * 4,
    }));
    setDroplets(newDroplets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [humidity]);

  return (
    <div className='humidity-indicator'>
      <div
        ref={iconRef}
        className='humidity-icon-container'
        style={{ width: size, height: size }}
      >
        <FaTint
          className='main-drop'
          style={{
            color: getHumidityColor(normalizedHumidity),
            fontSize: size,
            filter: `drop-shadow(0 2px 3px rgba(0,0,0,0.2))`,
            transition: 'transform 0.3s ease-out, filter 0.3s ease',
          }}
        />

        {droplets.map(drop => (
          <div
            key={drop.id}
            className='water-droplet'
            style={{
              left: `${drop.left}%`,
              width: `${drop.size}px`,
              height: `${drop.size}px`,
              backgroundColor: getHumidityColor(normalizedHumidity),
              animation: `droplet-fall ${drop.duration}s ease-in ${drop.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <span
        className='humidity-value'
        style={{ color: getHumidityColor(normalizedHumidity) }}
      >
        {showLabel ? `${humidity}%` : ''}
      </span>
    </div>
  );
};
