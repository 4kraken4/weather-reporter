import { Skeleton } from 'primereact/skeleton';
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useMessage } from '@/core/hooks/useMessage';
import { useTheme } from '@/core/hooks/useTheme';
import { useWeatherData } from '@/features/weather/hooks/useWeather';

// Lazy load heavy components
const LkMap = lazy(() => import('@/features/weather/components/map-lk/LkMap'));
const WeatherInformationPanel = lazy(() =>
  import(
    '@/features/weather/components/weather-info-panel/WeatherInformationPanel'
  ).then(module => ({ default: module.WeatherInformationPanel }))
);

// Static data - moved outside component to prevent recreation on every render
const DISABLED_DISTRICTS = ['Matale', 'Mullaitivu'];

const DISTRICT_DATA: Record<
  string,
  { population: number; area: number; description: string }
> = {
  Colombo: {
    population: 2324349,
    area: 699,
    description:
      'The commercial capital and largest city of Sri Lanka, known for its bustling harbor and business district.',
  },
  Kandy: {
    population: 1375382,
    area: 1940,
    description:
      'The cultural capital of Sri Lanka, home to the Temple of the Sacred Tooth Relic and surrounded by mountains.',
  },
  Galle: {
    population: 1063334,
    area: 1652,
    description:
      'A historic coastal city famous for its Dutch colonial architecture and the iconic Galle Fort.',
  },
  Jaffna: {
    population: 599917,
    area: 1025,
    description:
      'The cultural heart of the Tamil community in Sri Lanka, located in the northern peninsula.',
  },
  Anuradhapura: {
    population: 860575,
    area: 7179,
    description:
      'An ancient capital city with significant archaeological sites and Buddhist temples.',
  },
};

// Static pointer options
const POINTER_OPTIONS = {
  showPulseIndicator: true,
  showExtendingLine: false,
  showInfoPanel: false,
} as const;

// Environment variable - read once
const OW_ICON_URL = import.meta.env.VITE_OPEN_WEATHER_ICON_URL as string;

export const LkWeatherPage = memo(() => {
  const { isDarkMode } = useTheme();
  const [isMapVisible, _setIsMapVisible] = useState(false);
  const { showMessage } = useMessage();

  // Memoized function to get district information
  const getDistrictInfo = useCallback((districtName: string) => {
    return DISTRICT_DATA[districtName]
      ? {
          name: districtName,
          ...DISTRICT_DATA[districtName],
        }
      : {
          name: districtName,
          description: `${districtName} district - Weather information available.`,
        };
  }, []);

  const { data, error, loading, currentDistrict, fetchWeatherData } =
    useWeatherData();

  const isRegionNotFoundError = useCallback(
    (err: typeof error) =>
      err?.error && err.message?.includes("couldn't find the region"),
    []
  );

  // Memoized district info to prevent unnecessary recalculations
  const currentDistrictInfo = useMemo(
    () => (currentDistrict ? getDistrictInfo(currentDistrict) : null),
    [currentDistrict, getDistrictInfo]
  );

  // Memoized skeleton components
  const mapSkeleton = useMemo(
    () => (
      <div className='flex flex-column justify-content-center align-items-center w-full h-full'>
        <Skeleton shape='rectangle' className='h-20rem w-full border-round-lg' />
      </div>
    ),
    []
  );

  const weatherInfoSkeleton = useMemo(
    () => (
      <div className='flex flex-column justify-content-center md:align-items-start align-items-center w-full h-full gap-3'>
        <Skeleton shape='rectangle' className='h-3rem w-16rem' />
        <Skeleton shape='rectangle' className='h-2rem w-10rem' />
        <Skeleton shape='rectangle' className='h-2rem w-8rem' />
      </div>
    ),
    []
  );

  // Memoized error conditions
  const hasError = useMemo(
    () => error && !isRegionNotFoundError(error),
    [error, isRegionNotFoundError]
  );
  const hasRegionNotFoundError = useMemo(
    () => error && isRegionNotFoundError(error),
    [error, isRegionNotFoundError]
  );

  useEffect(() => {
    if (data === null) {
      void fetchWeatherData('colombo');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasError) {
      showMessage({
        severity: 'error',
        summary: 'Error',
        detail: `Weather data for "${error?.district}" could not be found.`,
        life: 5000,
      });
    } else if (hasRegionNotFoundError) {
      showMessage({
        severity: 'warn',
        summary: 'Region Not Found',
        detail: `Weather data for "${error?.district}" could not be found. Please select another district.`,
        life: 5000,
      });
    }
  }, [hasError, hasRegionNotFoundError, error?.district, showMessage]);

  return (
    <div className='flex z-4 p-4'>
      <div className='grid'>
        <div className='col-12 md:col-6 flex flex-column justify-content-center align-items-center p-4'>
          <Suspense fallback={mapSkeleton}>
            <LkMap
              selectedDistrict={currentDistrict}
              isMapVisible={isMapVisible}
              callback={fetchWeatherData}
              disabledDistricts={DISABLED_DISTRICTS}
              districtInfo={currentDistrictInfo}
              pointerOptions={POINTER_OPTIONS}
            />
          </Suspense>
        </div>

        <div className='col-12 md:col-6 flex flex-column justify-content-center align-items-center p-4'>
          {loading ? (
            <div className='flex flex-column justify-content-center md:align-items-start align-items-center w-full h-full gap-3'>
              {/* Title and Weather Icon Skeleton - matches the grid layout */}
              <div className='grid w-full'>
                <div className='col-12 md:col-9 flex flex-column justify-content-center md:align-items-start align-items-center'>
                  <Skeleton shape='rectangle' className='h-3rem w-16rem' />
                </div>
                <div className='col-12 md:col-3 flex flex-column justify-content-center md:align-items-start align-items-center'>
                  <Skeleton
                    shape='rectangle'
                    className='h-4rem w-4rem border-round-lg'
                  />
                </div>
              </div>

              {/* Temperature Section Skeleton */}
              <div className='flex flex-row justify-content-start align-items-start gap-3 w-full'>
                <Skeleton shape='rectangle' className='h-2rem w-10rem' />
                <Skeleton shape='rectangle' className='h-2rem w-1rem' />
              </div>

              {/* Wind Speed Section Skeleton */}
              <div className='flex flex-row justify-content-start align-items-center gap-3 w-full'>
                <Skeleton shape='rectangle' className='h-2rem w-8rem' />
                <Skeleton shape='circle' className='w-2rem h-2rem' />
              </div>

              {/* Humidity Section Skeleton */}
              <div className='flex flex-row justify-content-start align-items-center gap-3 w-full'>
                <Skeleton shape='rectangle' className='h-2rem w-6rem' />
                <Skeleton shape='circle' className='w-2rem h-2rem' />
              </div>

              {/* Accordion Skeleton */}
              <div className='w-full mt-3'>
                <Skeleton
                  shape='rectangle'
                  className='h-3rem w-full border-round-lg'
                />
              </div>
            </div>
          ) : (
            <div className='flex flex-column justify-content-center md:align-items-start align-items-center'>
              {!error && data ? (
                <Suspense fallback={weatherInfoSkeleton}>
                  <WeatherInformationPanel data={data} owIconURL={OW_ICON_URL} />
                </Suspense>
              ) : (
                <div className='flex flex-column justify-content-center align-items-start pr-6 w-full h-full gap-1'>
                  <h4
                    className={`font-semibold ${isDarkMode ? 'text-200' : 'text-500'}`}
                  >
                    No Data Available
                  </h4>
                  <p
                    className={`text-sm font-light m-0 ${isDarkMode ? 'text-200' : 'text-500'}`}
                  >
                    Please click on a district to view weather data for that area.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

LkWeatherPage.displayName = 'LkWeatherPage';

export default LkWeatherPage;
