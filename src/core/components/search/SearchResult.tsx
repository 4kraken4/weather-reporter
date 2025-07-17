import { useSearchResultWeather } from '@core/hooks/useSearchResultWeather';
import { highlightText } from '@core/utils/textHighlight';
import { Skeleton } from 'primereact/skeleton';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { SearchResultProps } from './types/search.types';

import './styles/SearchResult.scss';

export const SearchResult: React.FC<SearchResultProps> = ({
  headIcon,
  headIconAlt,
  title,
  description,
  location,
  tailIcon,
  searchTerm,
  isSelected,
  showAdditionalInfo = true,
  countryCode,
  state,
  onClick,
}) => {
  const [headIconError, setHeadIconError] = useState(false);
  const [weatherIconError, setWeatherIconError] = useState(false);

  // Stable reference to environment variable
  const owIconURL = useMemo(
    () => import.meta.env.VITE_OPEN_WEATHER_ICON_URL as string,
    []
  );

  const weatherData = useSearchResultWeather(
    showAdditionalInfo ? title : undefined,
    countryCode
  );

  // Memoize weather icon URL to prevent unnecessary re-renders
  const weatherIconUrl = useMemo(() => {
    if (!weatherData.icon || weatherIconError) return null;
    return `${owIconURL}/${weatherData.icon}@2x.png`;
  }, [weatherData.icon, weatherIconError, owIconURL]);

  // Memoize temperature display
  const temperatureDisplay = useMemo(() => {
    if (weatherData.temperature === null || weatherData.temperature === undefined) {
      return null;
    }
    return `${weatherData.temperature}${weatherData.unit}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherData.temperature]);

  // Reset image errors when data changes
  useEffect(() => {
    if (weatherData.icon) {
      setWeatherIconError(false);
    }
  }, [weatherData.icon]);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleHeadIconError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.currentTarget;
      const fallback = target.nextElementSibling as HTMLElement | null;

      setHeadIconError(true);
      target.style.display = 'none';
      if (fallback) {
        fallback.style.display = 'block';
      }
    },
    []
  );

  const handleWeatherIconError = useCallback(() => {
    setWeatherIconError(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (location) {
          window.location.href = location;
        }
      }
    },
    [location]
  );

  // Determine if weather should be shown
  const shouldShowWeather = useMemo(() => {
    return (
      showAdditionalInfo &&
      !weatherData.loading &&
      !weatherData.error &&
      weatherData.icon &&
      weatherData.temperature !== null &&
      weatherData.temperature !== undefined
    );
  }, [
    showAdditionalInfo,
    weatherData.loading,
    weatherData.error,
    weatherData.icon,
    weatherData.temperature,
  ]);

  // Memoize the highlighted title and description
  const highlightedTitle = useMemo(() => {
    if (!title) return null;
    return searchTerm ? highlightText(title, searchTerm) : title;
  }, [title, searchTerm]);

  const highlightedDescription = useMemo(() => {
    if (!description) return null;
    return searchTerm
      ? highlightText(description.toUpperCase(), searchTerm)
      : description.toUpperCase();
  }, [description, searchTerm]);

  // Render content variable to avoid code duplication
  const content = (
    <div
      className={`search-result-container relative overflow-hidden border-round-lg hover:surface-hover 
        transition-all transition-duration-200 transition-ease-in-out p-3 w-full ${
          isSelected ? 'shadow-3' : 'hover:shadow-2'
        }`}
    >
      {/* Subtle background pattern for selected state */}
      {isSelected && (
        <div className='absolute top-0 right-0 w-full h-full opacity-20 bg-primary-700 pointer-events-none' />
      )}

      <div className='relative z-1 flex justify-content-start align-items-center gap-3'>
        {/* Icon container with better styling */}
        <div
          className={`flex align-items-center justify-content-center w-3rem h-3rem border-round-lg 
            transition-all transition-duration-200 transition-ease-in-out ${
              isSelected ? 'text-primary-700' : 'text-600 shadow-2'
            }`}
        >
          {/* Render string headIcon as image (flag) */}
          {headIcon &&
            typeof headIcon === 'string' &&
            headIconAlt &&
            typeof headIconAlt === 'string' &&
            !headIconError && (
              <>
                <img
                  src={headIcon}
                  alt={headIconAlt}
                  className='w-2rem h-2rem'
                  style={{
                    borderRadius: '5px',
                    aspectRatio: '5/2',
                    objectFit: 'cover',
                  }}
                  onError={handleHeadIconError}
                />
                <i
                  className='pi pi-map-marker text-lg'
                  style={{ display: 'none' }}
                  aria-hidden='true'
                />
              </>
            )}

          {/* Show fallback icon if head icon failed to load */}
          {headIcon && typeof headIcon === 'string' && headIconError && (
            <i className='pi pi-map-marker text-lg' aria-hidden='true' />
          )}

          {/* Render non-string headIcon (html)*/}
          {headIcon && typeof headIcon !== 'string' && headIcon}

          {/* Render fallback icon when no headIcon */}
          {!headIcon && <i className='pi pi-map-marker text-lg' aria-hidden='true' />}
        </div>

        {/* Title */}
        <div className='flex-1 min-w-0'>
          <div className='flex justify-content-between align-items-center mb-1'>
            <div className='flex-1 min-w-0'>
              {title ? (
                <div
                  className={`text-base font-semibold line-height-3 transition-colors transition-duration-200 transition-ease-in-out ${
                    isSelected ? 'text-primary-500' : 'text-500'
                  }`}
                >
                  {highlightedTitle}
                </div>
              ) : (
                <Skeleton
                  width='75%'
                  height='1.25rem'
                  className='border-round'
                  aria-label='Loading title'
                />
              )}
            </div>
          </div>

          {/* Description */}
          {description ? (
            <div
              className={`text-xs font-light line-height-3 transition-colors transition-duration-200 transition-ease-in-out m-1 ${
                isSelected ? 'text-500' : 'text-400'
              }`}
            >
              {state && (
                <span className='mr-2 px-1 text-primary font-semibold'>{state}</span>
              )}
              {highlightedDescription}
            </div>
          ) : (
            <Skeleton
              width='65%'
              height='1rem'
              className='border-round mt-1'
              aria-label='Loading description'
            />
          )}
        </div>

        {/* Weather Info */}
        <div className='flex align-items-center justify-content-center h-2rem'>
          {showAdditionalInfo && (
            <div className='flex align-items-center ml-3 flex-shrink-0'>
              {weatherData.loading && (
                <div
                  className='flex align-items-center gap-2 py-1'
                  role='status'
                  aria-label='Loading weather data'
                >
                  <Skeleton
                    width='2rem'
                    height='2rem'
                    className='border-round-md'
                    aria-label='Loading weather icon'
                  />
                  <Skeleton
                    width='3rem'
                    height='1.2rem'
                    className='border-round'
                    aria-label='Loading temperature'
                  />
                </div>
              )}
              {shouldShowWeather && (
                <div
                  className='flex align-items-center gap-2 py-1'
                  role='status'
                  aria-label={`Current weather: ${weatherData.condition || 'Unknown'}, ${temperatureDisplay}`}
                >
                  {/* Weather Icon Container */}
                  <div
                    className={`relative flex align-items-center justify-content-center 
                      w-2rem h-2rem border-round-md transition-all transition-duration-200 
                      transition-ease-in-out overflow-hidden ${
                        isSelected ? 'bg-primary' : 'shadow-2'
                      }`}
                  >
                    {weatherIconUrl && !weatherIconError && (
                      <img
                        src={weatherIconUrl}
                        alt={weatherData.condition || 'Weather icon'}
                        className='w-full h-full object-contain'
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                        }}
                        onError={handleWeatherIconError}
                      />
                    )}
                  </div>

                  {/* Temperature Display */}
                  <span
                    className={`text-sm font-medium transition-colors transition-duration-200 
                      transition-ease-in-out whitespace-nowrap ${
                        isSelected ? 'text-primary-700' : 'text-400'
                      }`}
                  >
                    {temperatureDisplay}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action indicator */}
        <div
          className={`flex align-items-center justify-content-center w-2rem h-2rem 
            border-round-md transition-all transition-duration-200 transition-ease-in-out ${
              isSelected ? 'text-primary-700' : 'text-400'
            }`}
        >
          {tailIcon ? (
            <span className='search-result-tail-icon text-sm' aria-hidden='true'>
              {tailIcon}
            </span>
          ) : (
            <i
              className='search-result-tail-icon pi pi-angle-right text-xs'
              aria-hidden='true'
            />
          )}
        </div>
      </div>

      {/* Bottom border accent for selected state */}
      {isSelected && (
        <div className='absolute bottom-0 left-0 w-full h-2px bg-primary-400' />
      )}
    </div>
  );

  if (onClick) {
    return (
      <div
        className='cursor-pointer flex flex-row no-underline'
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={`${title}, ${description}${state ? `, ${state}` : ''}`}
        tabIndex={isSelected ? 0 : -1}
        role='button'
      >
        {content}
      </div>
    );
  }
  if (location) {
    return (
      <a
        href={location}
        className='cursor-pointer flex flex-row no-underline'
        onKeyDown={handleKeyDown}
        aria-label={`${title}, ${description}${state ? `, ${state}` : ''}`}
        tabIndex={isSelected ? 0 : -1}
      >
        {content}
      </a>
    );
  }
  return null;
};
