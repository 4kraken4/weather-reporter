import statesData from '@assets/mapdata/gadm41_LKA_1.json';
import { MapUpdater } from '@features/weather/hooks/mapUpdater';
import chroma from 'chroma-js';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Polygon } from 'react-leaflet';
import './styles/LkMap.scss';

type LkMapProps = {
  selectedDistrict: string;
  isMapVisible: boolean;
  callback: (districtName: string) => Promise<void>;
};

type PolygonProperties = {
  NAME_1: string;
};

type PolygonData = {
  properties: PolygonProperties;
  coordinates: number[][][];
  fillColor: string;
  type: string;
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

const LkMap = ({ selectedDistrict, isMapVisible, callback }: LkMapProps) => {
  const selectedPolygonRef = useRef<L.Polygon | null>(null);
  const defaultRef = useRef<L.Polygon | null>(null);
  const [polygonFillColor, setPolygonFillColor] = useState('#3B82F6');
  const colorObserver = useRef<MutationObserver | null>(null);

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
        return feat.geometry.coordinates.map(coords => ({
          type: 'Polygon',
          coordinates: coords,
          properties: feat.properties,
          fillColor: polygonFillColor,
        }));
      }),
    [polygonFillColor]
  ); // Add polygonFillColor as dependency

  const getCoordinates = useCallback(
    (coords: number[][][]): Coordinate[] =>
      coords.flatMap(element => element.map(([lng, lat]) => ({ lat, lng }))),
    []
  );

  const createEventHandlers = useCallback(
    (polygon: PolygonData): EventHandlers => ({
      mouseover: (e: L.LeafletMouseEvent) => {
        if (polygon.properties.NAME_1 !== selectedDistrict) {
          (e.target as L.Path).setStyle({
            fillColor: chroma(polygonFillColor).darken(0.4).hex(),
          });
        }
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        if (polygon.properties.NAME_1 !== selectedDistrict) {
          (e.target as L.Path).setStyle({ fillColor: polygonFillColor });
        }
      },
      click: (e: L.LeafletMouseEvent) => {
        if (!polygon.properties.NAME_1 || selectedPolygonRef.current === e.target) {
          return;
        }

        const previousPolygon = selectedPolygonRef.current;
        void callback(polygon.properties.NAME_1).then(() => {
          previousPolygon?.setStyle({ fillColor: polygonFillColor });
          selectedPolygonRef.current = e.target as L.Polygon;
          (e.target as L.Path).setStyle({
            fillColor: chroma(polygonFillColor).brighten(0.8).hex(),
            color: 'var(--red-500)',
            opacity: 0.9,
          });
        });
      },
    }),
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

  return (
    <div className='flex flex-row justify-content-center align-items-even w-24rem h-30rem overflow-hidden'>
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
        {polygons.map((polygon, _index) => (
          <Polygon
            key={`${polygon.properties.NAME_1}-${JSON.stringify(polygon.coordinates[0][0])}`}
            ref={selectedDistrict === polygon.properties.NAME_1 ? defaultRef : null}
            pathOptions={{ ...POLYGON_STYLE, fillColor: polygon.fillColor }}
            positions={getCoordinates(polygon.coordinates)}
            eventHandlers={createEventHandlers(polygon)}
          />
        ))}
        <MapUpdater isVisible={isMapVisible} />
      </MapContainer>
    </div>
  );
};

export default memo(LkMap);
