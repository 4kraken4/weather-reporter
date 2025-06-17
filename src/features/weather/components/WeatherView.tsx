import type { UseWeatherResultType } from '@core/types/common.types';
import { useWeather } from '@features/weather/hooks/useWeather';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export const WeatherView = ({
  city: defaultCity = '',
  countryCode: defaultCountry = '',
}) => {
  const { city = defaultCity, countryCode = defaultCountry } = useParams();
  const { data, loading, error }: UseWeatherResultType = useWeather(
    city,
    countryCode
  );
  const [_retryCount, setRetryCount] = useState(0);

  if (loading) return <div className='loading'>Loading weather data...</div>;
  if (error) {
    return (
      <div className='error'>
        <div className='error'>Error: {error.message}</div>
        <button type='button' onClick={() => setRetryCount(c => c + 1)}>
          Retry
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
