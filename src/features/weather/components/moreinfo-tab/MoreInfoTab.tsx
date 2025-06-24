import type { WeatherResponseType } from '@/core/types/common.types';

export const WeatherInfoTab: React.FC<WeatherResponseType> = (
  data: WeatherResponseType
) => {
  return (
    <div className='text-400 text-sm'>
      <p>
        Weather:{' '}
        <span className='font-bold font-italic'>
          {data ? data.weather[0].description : 'No data available'}
        </span>
      </p>
      <p>
        Pressure:{' '}
        <span className='font-bold font-italic'>
          {data ? `${data.main.pressure} hPa` : 'No data available'}
        </span>
      </p>
      <p>
        Feels Like:{' '}
        <span className='font-bold font-italic'>
          {data ? `${data.main.feels_like}°C` : 'No data available'}
        </span>
      </p>
      <p>
        Visibility:{' '}
        <span className='font-bold font-italic'>
          {data ? `${data.visibility / 1000} km` : 'No data available'}
        </span>
      </p>
      <p>
        Cloudiness:{' '}
        <span className='font-bold font-italic'>
          {data ? `${data.clouds.all}%` : 'No data available'}
        </span>
      </p>
      {data.snow ? (
        <p>
          Snow:{' '}
          <span className='font-bold font-italic'>
            {data.snow['1h']} mm in the last hour
          </span>
        </p>
      ) : (
        ''
      )}
      {data.rain ? (
        <p>
          Rain:{' '}
          <span className='font-bold font-italic'>
            {data.rain['1h']} mm in the last hour
          </span>
        </p>
      ) : (
        ''
      )}
      <p>
        Last Updated:{' '}
        <span className='font-bold font-italic'>
          {data ? new Date(data.dt * 1000).toLocaleString() : 'No data available'}
        </span>
      </p>
    </div>
  );
};
