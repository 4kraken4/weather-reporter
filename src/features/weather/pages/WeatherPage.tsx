import { WeatherView } from '@features/weather/components/WeatherView';

export const WeatherPage = () => {
  return (
    <div className='weather-page'>
      <h1>Weather Information</h1>
      <WeatherView city='Colombo' countryCode='LK' />
    </div>
  );
};
