import { useEffect, useState } from 'react';
import './styles/WindDirectionIndicator.scss';

export const WindDirectionIndicator = ({
  deg,
  speed,
  maxSpeed,
  minSpeed,
  showLabel = true,
}: {
  deg: number;
  speed: number;
  maxSpeed: number;
  minSpeed: number;
  showLabel?: boolean;
}) => {
  // Normalize wind speed (0-1 range based on expected max of 20 m/s)
  const normalizedSpeed = Math.min(
    1,
    Math.max(0, (speed - minSpeed) / (maxSpeed - minSpeed || 20))
  );

  // Calculate movement using normalized speed
  const radians = (deg - 90) * (Math.PI / 180);
  const maxOffset = 15; // Maximum possible movement in pixels
  const baseOffset = maxOffset * normalizedSpeed;

  // Color based on normalized speed (HSL gradient)
  const getArrowColor = (normalized: number) => {
    const hue = 240 * (1 - normalized); // Blue (240°) to Red (0°)
    const saturation = 90;
    const lightness = 40 + 30 * normalized; // Darker for calm, brighter for strong
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Animation positions - all based on normalized speed
  const positions = [
    { x: 0, y: 0 }, // Frame 1: Center
    {
      x: Math.cos(radians) * baseOffset * 0.7, // Frame 2: Partial offset
      y: Math.sin(radians) * baseOffset * 0.7,
    },
    {
      x: Math.cos(radians) * baseOffset, // Frame 3: Full offset
      y: Math.sin(radians) * baseOffset,
    },
  ];

  const [currentFrame, setCurrentFrame] = useState(0);
  const [arrowColor, setArrowColor] = useState(getArrowColor(normalizedSpeed));

  // Update color when speed changes
  useEffect(() => {
    setArrowColor(getArrowColor(normalizedSpeed));
  }, [normalizedSpeed]);

  // Animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 3);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='wind-direction-indicator flex items-center gap-2 relative'>
      <i
        className='wind-arrow pi pi-arrow-up text-md relative'
        style={{
          transform: `translate(${positions[currentFrame].x}px, ${positions[currentFrame].y}px) rotate(${deg}deg)`,
          color: arrowColor,
          transition: 'transform 0.3s ease-out, color 0.5s ease',
        }}
      />
      {showLabel && (
        <span className='text-sm font-medium' style={{ color: arrowColor }}>
          {speed.toFixed(1)} m/s
        </span>
      )}
    </div>
  );
};
