import type { UseWeatherResultType } from '@core/types/common.types';
import { useWeather } from '@features/weather/hooks/useWeather';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export const WeatherView = ({
  city: defaultCity = '',
  countryCode: defaultCountry = '',
}) => {
  const MAX_RETRIES = 3;
  const [retryCount, setRetryCount] = useState(0);
  const { city = defaultCity, countryCode = defaultCountry } = useParams();
  const { data, loading, error }: UseWeatherResultType = useWeather(
    city,
    countryCode,
    retryCount
  );

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
    }
  };

  if (loading) return <div className='loading'>Loading weather data...</div>;
  if (error) {
    return (
      <div className='error'>
        <div className='error'>Error: {error.message}</div>
        <button
          type='button'
          onClick={handleRetry}
          className='retry-button'
          disabled={loading || retryCount >= MAX_RETRIES}
        >
          {loading ? (
            <div className='spinner'>Loading...</div>
          ) : (
            `Retry (${MAX_RETRIES - retryCount} left)`
          )}
        </button>
      </div>
    );
  }
  if (!data) return <div className='no-data'>No weather data available</div>;

  return (
    <div className='weather-display'>
      <h2>{data.name} Weather</h2>
      <div className='weather-stats'>
        <p>Temperature: {data.main.temp}°C</p>
        <p>Pressure: {data.main.pressure} hPa</p>
        <p>Humidity: {data.main.humidity}%</p>
      </div>
    </div>
  );
};
