import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

type MapUpdaterProps = {
  isVisible: boolean;
  onUpdateComplete?: () => void;
};

export const MapUpdater = ({ isVisible, onUpdateComplete }: MapUpdaterProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !isVisible) return;

    // eslint-disable-next-line prefer-const
    let timeoutId: NodeJS.Timeout;

    // Hide overlay when resize completes
    const handleResize = () => {
      clearTimeout(timeoutId);
      onUpdateComplete?.();
      map.off('resize', handleResize);
      map.invalidateSize();
    };

    // Fallback: Hide overlay after 500ms if resize event fails
    timeoutId = setTimeout(() => {
      onUpdateComplete?.();
      map.off('resize', handleResize);
    }, 500);

    // Trigger map update
    map.on('resize', handleResize);
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.off('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [isVisible, map, onUpdateComplete]);

  return null;
};
