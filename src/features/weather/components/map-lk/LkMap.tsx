import statesData from '@assets/mapdata/gadm41_LKA_1.json';
import { MapUpdater } from '@features/weather/hooks/mapUpdater';
import chroma from 'chroma-js';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Polygon, useMap } from 'react-leaflet';
import './styles/LkMap.scss';

type LkMapProps = {
  selectedDistrict: string;
  isMapVisible: boolean;
  callback: (districtName: string) => Promise<void>;
  disabledDistricts?: string[];
  districtInfo?: {
    name: string;
    population?: number;
    area?: number;
    description?: string;
  } | null;
  pointerOptions?: {
    showPulseIndicator?: boolean;
    showExtendingLine?: boolean;
    showInfoPanel?: boolean;
  };
};

type PolygonProperties = {
  NAME_1: string;
};

type PolygonData = {
  properties: PolygonProperties;
  coordinates: number[][][];
  fillColor: string;
  type: string;
  isDisabled: boolean;
};

type Coordinate = {
  lat: number;
  lng: number;
};

type EventHandlers = {
  mouseover: (e: L.LeafletMouseEvent) => void;
  mouseout: (e: L.LeafletMouseEvent) => void;
  click: (e: L.LeafletMouseEvent) => void;
};

const POLYGON_STYLE: L.PathOptions = {
  fillOpacity: 1.0,
  weight: 2,
  opacity: 0.2,
  color: 'var(--surface-ground)',
  lineJoin: 'bevel',
  lineCap: 'round' as L.LineCapShape,
};

const CENTER: L.LatLngExpression = [7.798588679284219, 80.6777562357943];

// Component to capture map reference
const MapRef = ({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) => {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  return null;
};

const LkMap = ({
  selectedDistrict,
  isMapVisible,
  callback,
  disabledDistricts = [],
  districtInfo,
  pointerOptions = {
    showPulseIndicator: true,
    showExtendingLine: false,
    showInfoPanel: false,
  },
}: LkMapProps) => {
  const selectedPolygonRef = useRef<L.Polygon | null>(null);
  const defaultRef = useRef<L.Polygon | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const currentDistrictRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isClickTriggered = useRef<boolean>(false); // Track if change was from click
  const [polygonFillColor, setPolygonFillColor] = useState('#3B82F6');
  const colorObserver = useRef<MutationObserver | null>(null);

  // Extract pointer options with defaults
  const {
    showPulseIndicator = true,
    showExtendingLine = true,
    showInfoPanel = true,
  } = pointerOptions;

  // Pointer animation state
  const [pointerPosition, setPointerPosition] = useState<{
    x: number;
    y: number;
    visible: boolean;
    districtCenter: { lat: number; lng: number } | null;
    animationKey: string;
    direction: { angle: number; length: number; targetX: number; targetY: number };
  }>({
    x: 0,
    y: 0,
    visible: false,
    districtCenter: null,
    animationKey: '',
    direction: { angle: 0, length: 150, targetX: 0, targetY: 0 },
  });

  // Helper function to check if a district is disabled
  const isDistrictDisabled = useCallback(
    (districtName: string) => disabledDistricts.includes(districtName),
    [disabledDistricts]
  );

  // Helper function to validate coordinates
  const isValidCoordinate = useCallback((lat: number, lng: number): boolean => {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      // Sri Lanka bounds check
      lat >= 5.9 &&
      lat <= 9.9 &&
      lng >= 79.5 &&
      lng <= 82.0
    );
  }, []);

  // Color initialization with MutationObserver
  useEffect(() => {
    const updateFillColor = () => {
      const primaryColor: string =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--primary-color')
          .trim() || '#3B82F6';

      const newColor: string = chroma(primaryColor).darken(0.8).hex();
      if (newColor !== polygonFillColor) {
        setPolygonFillColor(newColor);
      }
    };

    colorObserver.current = new MutationObserver(updateFillColor);
    colorObserver.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    updateFillColor();
    return () => colorObserver.current?.disconnect();
  }, [isMapVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  const polygons = useMemo(
    () =>
      statesData.features.flatMap(feat => {
        if (feat.geometry.type !== 'MultiPolygon') return [];
        const districtName = feat.properties.NAME_1;
        const isDisabled = isDistrictDisabled(districtName);

        return feat.geometry.coordinates.map(coords => ({
          type: 'Polygon',
          coordinates: coords,
          properties: feat.properties,
          fillColor: isDisabled
            ? chroma(polygonFillColor).desaturate(2).darken(1).hex()
            : polygonFillColor,
          isDisabled,
        }));
      }),
    [polygonFillColor, isDistrictDisabled]
  );

  const getCoordinates = useCallback((coords: number[][][]): Coordinate[] => {
    // For multipolygon data, find the largest polygon part
    // (usually the main landmass of the district)
    let largestPart = coords[0];
    let maxLength = coords[0].length;

    for (let i = 1; i < coords.length; i++) {
      if (coords[i].length > maxLength) {
        maxLength = coords[i].length;
        largestPart = coords[i];
      }
    }

    // Convert coordinates from [lng, lat] to {lat, lng} format
    return largestPart.map(([lng, lat]) => ({ lat, lng }));
  }, []);

  // Memoized polygon center calculation to prevent unnecessary recalculations
  const polygonCenterCache = useRef<Map<string, { lat: number; lng: number }>>(
    new Map()
  );

  // Helper function to calculate polygon centroid (geographic center)
  const getPolygonCenter = useCallback(
    (coordinates: Coordinate[]): { lat: number; lng: number } => {
      if (coordinates.length === 0) {
        return { lat: 0, lng: 0 };
      }

      // Create a cache key based on coordinates
      const cacheKey = JSON.stringify(coordinates.slice(0, 3)); // Use first 3 points for cache key

      // Check cache first
      if (polygonCenterCache.current.has(cacheKey)) {
        const cachedResult = polygonCenterCache.current.get(cacheKey);
        return cachedResult ?? { lat: 0, lng: 0 };
      }

      try {
        // For complex polygons, use a simpler but more reliable approach
        // Calculate bounds and use the center of bounds
        let minLat = coordinates[0].lat;
        let maxLat = coordinates[0].lat;
        let minLng = coordinates[0].lng;
        let maxLng = coordinates[0].lng;

        for (const coord of coordinates) {
          minLat = Math.min(minLat, coord.lat);
          maxLat = Math.max(maxLat, coord.lat);
          minLng = Math.min(minLng, coord.lng);
          maxLng = Math.max(maxLng, coord.lng);
        }

        // Use the center of the bounding box
        const boundingBoxCenter = {
          lat: (minLat + maxLat) / 2,
          lng: (minLng + maxLng) / 2,
        };

        // Try to calculate the proper centroid using the shoelace formula
        let area = 0;
        let centroidLat = 0;
        let centroidLng = 0;

        for (let i = 0; i < coordinates.length; i++) {
          const j = (i + 1) % coordinates.length;
          const xi = coordinates[i].lng;
          const yi = coordinates[i].lat;
          const xj = coordinates[j].lng;
          const yj = coordinates[j].lat;

          const crossProduct = xi * yj - xj * yi;
          area += crossProduct;
          centroidLat += (yi + yj) * crossProduct;
          centroidLng += (xi + xj) * crossProduct;
        }

        area = area / 2;

        // If area calculation fails or gives unexpected results, use bounding box center
        if (Math.abs(area) < 1e-10) {
          polygonCenterCache.current.set(cacheKey, boundingBoxCenter);
          return boundingBoxCenter;
        }

        centroidLat = centroidLat / (6 * area);
        centroidLng = centroidLng / (6 * area);

        const centroidResult = {
          lat: centroidLat,
          lng: centroidLng,
        };

        // Validate that the centroid is within reasonable bounds of the polygon
        const isWithinBounds =
          centroidResult.lat >= minLat - 0.1 &&
          centroidResult.lat <= maxLat + 0.1 &&
          centroidResult.lng >= minLng - 0.1 &&
          centroidResult.lng <= maxLng + 0.1;

        // If centroid is outside reasonable bounds, use bounding box center
        const result = isWithinBounds ? centroidResult : boundingBoxCenter;

        // Validate the final result
        if (!isValidCoordinate(result.lat, result.lng)) {
          console.warn('Invalid coordinates calculated, using Sri Lanka center');
          const fallback = { lat: 7.8731, lng: 80.7718 }; // Center of Sri Lanka
          polygonCenterCache.current.set(cacheKey, fallback);
          return fallback;
        }

        // Cache the result
        polygonCenterCache.current.set(cacheKey, result);
        return result;
      } catch (error) {
        console.warn('Error calculating polygon center:', error);
        // Return a safe fallback
        const fallback = { lat: 7.8731, lng: 80.7718 }; // Center of Sri Lanka
        polygonCenterCache.current.set(cacheKey, fallback);
        return fallback;
      }
    },
    [isValidCoordinate]
  );

  // Helper function to convert lat/lng to screen coordinates using Leaflet's projection
  const latLngToScreenPosition = useCallback(
    (lat: number, lng: number): { x: number; y: number } => {
      if (!mapRef.current) {
        return { x: 0, y: 0 };
      }

      try {
        // Use Leaflet's native method to convert lat/lng to container point
        const point = mapRef.current.latLngToContainerPoint([lat, lng]);
        return { x: point.x, y: point.y };
      } catch (error) {
        console.warn('Error converting lat/lng to screen position:', error);
        return { x: 0, y: 0 };
      }
    },
    []
  );

  // Helper function to calculate direction towards weather data container
  const calculatePointerDirection = useCallback(
    (
      startX: number,
      startY: number,
      mapContainer: HTMLElement
    ): { angle: number; length: number; targetX: number; targetY: number } => {
      try {
        // Get the weather data container (right side of the grid)
        const weatherDataContainer = document.querySelector(
          '.col-12.md\\:col-6:last-child'
        );
        const mapRect = mapContainer.getBoundingClientRect();

        if (weatherDataContainer) {
          const weatherRect = weatherDataContainer.getBoundingClientRect();

          // Calculate target position (left edge of weather container, vertically centered)
          const targetX = weatherRect.left - mapRect.left;
          const targetY = weatherRect.top + weatherRect.height / 2 - mapRect.top;

          // Calculate direction and distance
          const deltaX = targetX - startX;
          const deltaY = targetY - startY;
          const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
          const length = Math.min(
            Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 0.7,
            200
          );

          return { angle, length, targetX, targetY };
        }

        // Fallback to right direction
        return { angle: 0, length: 150, targetX: startX + 150, targetY: startY };
      } catch (error) {
        console.warn('Error calculating pointer direction:', error);
        // Fallback to right direction
        return { angle: 0, length: 150, targetX: startX + 150, targetY: startY };
      }
    },
    []
  );

  const createEventHandlers = useCallback(
    (polygon: PolygonData): EventHandlers => {
      // If district is disabled, return empty event handlers
      if (polygon.isDisabled) {
        return {
          mouseover: () => {},
          mouseout: () => {},
          click: () => {},
        };
      }

      return {
        mouseover: (e: L.LeafletMouseEvent) => {
          if (
            polygon.properties.NAME_1.toLowerCase() !== selectedDistrict.toLowerCase()
          ) {
            (e.target as L.Path).setStyle({
              fillColor: chroma(polygonFillColor).darken(0.4).hex(),
            });
          }
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          if (
            polygon.properties.NAME_1.toLowerCase() !== selectedDistrict.toLowerCase()
          ) {
            (e.target as L.Path).setStyle({ fillColor: polygonFillColor });
          }
        },
        click: (e: L.LeafletMouseEvent) => {
          if (!polygon.properties.NAME_1 || selectedPolygonRef.current === e.target) {
            return;
          }

          // Mark that this district change is from a click
          isClickTriggered.current = true;

          const previousPolygon = selectedPolygonRef.current;
          void callback(polygon.properties.NAME_1).then(() => {
            previousPolygon?.setStyle({ fillColor: polygonFillColor });
            selectedPolygonRef.current = e.target as L.Polygon;
            (e.target as L.Path).setStyle({
              fillColor: chroma(polygonFillColor).brighten(0.8).hex(),
              color: 'var(--red-500)',
              opacity: 0.9,
            });

            // Clear any existing click timer to prevent race conditions
            if (clickTimerRef.current) {
              clearTimeout(clickTimerRef.current);
            }

            // Calculate pointer position and show it with a small delay
            clickTimerRef.current = setTimeout(() => {
              try {
                const coordinates = getCoordinates(polygon.coordinates);
                const center = getPolygonCenter(coordinates);

                const screenPos = latLngToScreenPosition(center.lat, center.lng);

                // Calculate direction towards weather data
                const mapElement = document.querySelector(
                  '.leaflet-container'
                ) as HTMLElement;

                if (mapElement && screenPos.x !== 0 && screenPos.y !== 0) {
                  const direction = calculatePointerDirection(
                    screenPos.x,
                    screenPos.y,
                    mapElement
                  );

                  setPointerPosition({
                    x: screenPos.x,
                    y: screenPos.y,
                    visible: true,
                    districtCenter: center,
                    animationKey: `${polygon.properties.NAME_1}-${Date.now()}`, // Unique key to restart animation
                    direction,
                  });
                }
              } catch (error) {
                console.warn('Error calculating pointer position on click:', error);
              }

              clickTimerRef.current = null;
              // Reset the flag after click handling is complete
              setTimeout(() => {
                isClickTriggered.current = false;
              }, 150); // Wait a bit longer than useEffect delay
            }, 50); // Small delay to ensure map state is stable
          });
        },
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDistrict, callback, polygonFillColor, isMapVisible]
  );

  useEffect(() => {
    const leafletEl = document.querySelector('.leaflet-container');
    if (leafletEl instanceof HTMLElement) {
      leafletEl.style.setProperty('background-color', 'transparent', 'important');
    }
  }, []);

  useEffect(() => {
    if (defaultRef.current && selectedDistrict) {
      selectedPolygonRef.current = defaultRef.current;
      if (selectedPolygonRef.current instanceof L.Polygon) {
        selectedPolygonRef.current.setStyle({
          fillColor: chroma(polygonFillColor).brighten(0.8).hex(),
          color: 'var(--red-500)',
          opacity: 0.9,
        } as L.PathOptions);
      }
    }
  }, [selectedDistrict, polygonFillColor]);

  // Effect to handle district selection and pointer positioning (including initial load)
  useEffect(() => {
    if (selectedDistrict) {
      // Prevent recalculation if the district hasn't changed
      if (currentDistrictRef.current === selectedDistrict) {
        return;
      }

      // Skip recalculation if this change was triggered by a click
      // The click handler has already calculated the correct position
      if (isClickTriggered.current) {
        currentDistrictRef.current = selectedDistrict;
        return;
      }

      currentDistrictRef.current = selectedDistrict;

      // Find the polygon for the selected district
      const selectedPolygon = polygons.find(
        polygon =>
          polygon.properties.NAME_1.toLowerCase() === selectedDistrict.toLowerCase()
      );

      if (selectedPolygon && !selectedPolygon.isDisabled) {
        // Clear any existing timer to prevent race conditions
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        // Add a small delay to ensure map is fully initialized
        timerRef.current = setTimeout(() => {
          try {
            // Calculate pointer position for the selected district
            const coordinates = getCoordinates(selectedPolygon.coordinates);
            const center = getPolygonCenter(coordinates);

            // Single calculation without setTimeout to prevent flickering
            const screenPos = latLngToScreenPosition(center.lat, center.lng);

            const mapElement = document.querySelector(
              '.leaflet-container'
            ) as HTMLElement;

            if (mapElement && screenPos.x !== 0 && screenPos.y !== 0) {
              const direction = calculatePointerDirection(
                screenPos.x,
                screenPos.y,
                mapElement
              );

              setPointerPosition({
                x: screenPos.x,
                y: screenPos.y,
                visible: true,
                districtCenter: center,
                animationKey: `${selectedDistrict}-${Date.now()}`,
                direction,
              });
            }
          } catch (error) {
            console.warn(
              'Error calculating pointer position for district:',
              selectedDistrict,
              error
            );
          }

          timerRef.current = null;
        }, 100); // Small delay to ensure map is ready

        return () => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        };
      }
    } else {
      currentDistrictRef.current = '';
      // Hide pointer if no district is selected
      setPointerPosition(prev => ({ ...prev, visible: false }));
    }
  }, [
    selectedDistrict,
    polygons,
    getCoordinates,
    getPolygonCenter,
    latLngToScreenPosition,
    calculatePointerDirection,
  ]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up timers
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }

      // Clean up observer
      if (colorObserver.current) {
        colorObserver.current.disconnect();
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className='flex flex-row justify-content-center align-items-even w-24rem h-30rem overflow-hidden relative'
    >
      <MapContainer
        center={CENTER}
        zoom={7}
        zoomControl={false}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <MapRef mapRef={mapRef} />
        {polygons.map((polygon, _index) => {
          const isDisabled = polygon.isDisabled;
          const isSelected =
            selectedDistrict.toLowerCase() ===
            polygon.properties.NAME_1.toLowerCase();

          // Calculate opacity and fillOpacity
          let opacity = POLYGON_STYLE.opacity;
          if (isDisabled) {
            opacity = 0.3;
          } else if (isSelected) {
            opacity = 0.9;
          }

          const fillOpacity = isDisabled ? 0.3 : POLYGON_STYLE.fillOpacity;

          return (
            <Polygon
              key={`${polygon.properties.NAME_1}-${JSON.stringify(polygon.coordinates[0][0])}`}
              ref={isSelected && !isDisabled ? defaultRef : null}
              pathOptions={{
                ...POLYGON_STYLE,
                fillColor: isSelected
                  ? chroma(polygonFillColor).brighten(0.8).hex()
                  : polygon.fillColor,
                color: isSelected ? 'var(--red-500)' : POLYGON_STYLE.color,
                opacity,
                fillOpacity,
                className: isDisabled ? 'disabled-district' : '',
              }}
              positions={getCoordinates(polygon.coordinates)}
              eventHandlers={createEventHandlers(polygon)}
            />
          );
        })}
        <MapUpdater isVisible={isMapVisible} />
      </MapContainer>

      {/* Animated Pointer and Info Panel */}
      {pointerPosition.visible && selectedDistrict && (
        <div className='district-pointer-container'>
          <div
            className='district-pointer'
            key={pointerPosition.animationKey} // Use key to restart animations
            style={{
              left: `${pointerPosition.x}px`,
              top: `${pointerPosition.y}px`,
            }}
          >
            {/* Pulsing dot at district center */}
            {showPulseIndicator && <div className='pointer-dot' />}

            {/* Animated line extending towards weather data */}
            {showExtendingLine && (
              <div
                className='pointer-line'
                style={
                  {
                    transform: `translateY(-50%) rotate(${pointerPosition.direction.angle}deg)`,
                    '--target-width': `${pointerPosition.direction.length}px`,
                  } as React.CSSProperties
                }
              />
            )}

            {/* Info panel */}
            {showInfoPanel && (
              <div
                className='district-info-panel'
                style={{
                  left: `${pointerPosition.direction.length + 20}px`,
                  top: `${Math.tan((pointerPosition.direction.angle * Math.PI) / 180) * pointerPosition.direction.length}px`,
                  transform: 'translateY(-50%)',
                }}
              >
                <div className='info-panel-content'>
                  <h4 className='district-name'>{selectedDistrict}</h4>
                  {districtInfo && (
                    <>
                      {districtInfo.population && (
                        <p className='district-detail'>
                          <i className='pi pi-users' />
                          Population: {districtInfo.population.toLocaleString()}
                        </p>
                      )}
                      {districtInfo.area && (
                        <p className='district-detail'>
                          <i className='pi pi-map' />
                          Area: {districtInfo.area} km²
                        </p>
                      )}
                      {districtInfo.description && (
                        <p className='district-description'>
                          {districtInfo.description}
                        </p>
                      )}
                    </>
                  )}
                  <button
                    className='close-pointer-btn'
                    title='Close district info'
                    onClick={() =>
                      setPointerPosition(prev => ({ ...prev, visible: false }))
                    }
                  >
                    <i className='pi pi-times' />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(LkMap);
