import { useEffect, useRef } from 'react';
import './styles/TemperatureIndicator.scss';

type TemperatureIndicatorProps = {
  temperature: number;
  showLabel?: boolean;
  minTemp?: number;
  maxTemp?: number;
  height?: number;
  width?: number;
};

export const TemperatureIndicator = ({
  temperature,
  minTemp = -20,
  maxTemp = 40,
  height = 150,
  width = 30,
  showLabel = true,
}: TemperatureIndicatorProps) => {
  const barRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const prevTempRef = useRef<number>(temperature);

  // Calculate normalized temperature (0-1 range)
  const normalizedTemp = Math.min(
    1,
    Math.max(0, (temperature - minTemp) / (maxTemp - minTemp))
  );

  // Get color based on normalized temperature
  const getTemperatureColor = (normalized: number) => {
    // HSL progression from blue (cold) to red (hot)
    const hue = 240 * (1 - normalized); // 240° (blue) → 0° (red)
    const saturation = 90;
    const lightness = 30 + 40 * normalized; // Darker cold, brighter hot

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  useEffect(() => {
    if (!barRef.current) return;

    if (showLabel && !labelRef.current) return;

    const color = getTemperatureColor(normalizedTemp);
    const wasGettingWarmer = temperature > prevTempRef.current;

    // Animate bar height
    barRef.current.style.transition = 'height 0.6s ease-out';
    barRef.current.style.height = `${normalizedTemp * 100}%`;
    barRef.current.style.backgroundColor = color;

    // Animate label with direction-aware animation
    if (labelRef.current) {
      labelRef.current.style.transform = wasGettingWarmer
        ? 'translateY(-4px) scale(1.05)'
        : 'translateY(2px) scale(1.02)';
      labelRef.current.style.transition = 'all 0.3s ease-out';
      labelRef.current.style.color = color;
    }

    // Reset animation after delay
    const timer = setTimeout(() => {
      if (labelRef.current) {
        labelRef.current.style.transform = 'translateY(0) scale(1)';
      }
    }, 300);

    prevTempRef.current = temperature;

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temperature, normalizedTemp]);

  return (
    <div className='temp-indicator' style={{ width }}>
      <div className='temp-bar-container' style={{ height }}>
        <div
          className='temp-bar'
          ref={barRef}
          style={{
            backgroundColor: getTemperatureColor(normalizedTemp),
          }}
        />
        <div className='temp-ticks'>
          {[...Array<number>(5)].map((_, i) => {
            const tickPosition = (i / 4) * 100;
            const tickTemp = minTemp + (i / 4) * (maxTemp - minTemp);
            return (
              <div
                key={`temp-tick-${tickTemp}`}
                className='temp-tick'
                style={{
                  bottom: `${tickPosition}%`,
                  opacity: normalizedTemp >= i / 4 ? 0.8 : 0.3,
                }}
              />
            );
          })}
        </div>
      </div>

      {showLabel && (
        <div
          className='temp-label'
          ref={labelRef}
          style={{
            color: getTemperatureColor(normalizedTemp),
          }}
        >
          {Math.round(temperature)}°
        </div>
      )}
    </div>
  );
};
