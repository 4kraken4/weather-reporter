import LkMap from '@features/weather/components/map-lk/LkMap';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Skeleton } from 'primereact/skeleton';
import { useEffect, useState } from 'react';

import ErrorHandler from '@/core/components/error/errorHandler';
import { WeatherServiceError } from '@/core/errors/WeatherService.error';
import { useMessage } from '@/core/hooks/useMessage';
import { useTheme } from '@/core/hooks/useTheme';
import { HumidityIndicator } from '@/features/weather/components/humidity-indicator/HumidityIndicator';
import { WeatherInfoTab } from '@/features/weather/components/moreinfo-tab/MoreInfoTab';
import { TemperatureIndicator } from '@/features/weather/components/temp-indicator/TemperatureIndicator';
import { WindDirectionIndicator } from '@/features/weather/components/wind-direction-indicator/WindDirectionIndicator';
import { useWeatherData } from '@/features/weather/hooks/usetWeather';
import './styles/WeatherPage.scss';

export const WeatherPage = () => {
  const { isDarkMode } = useTheme();
  const [isMapVisible, _setIsMapVisible] = useState(false);
  const owIconURL = import.meta.env.VITE_OPEN_WEATHER_ICON_URL as string;
  const { showMessage } = useMessage();

  const { data, error, loading, currentDistrict, retry, fetchWeatherData } =
    useWeatherData();

  const [tabs, setTabs] = useState([
    {
      disabled: false,
      header: 'More Info',
      children: data ? <WeatherInfoTab {...data} /> : null,
    },
  ]);

  useEffect(() => {
    if (data === null) {
      void fetchWeatherData('colombo');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data) {
      setTabs(prevTabs => {
        const updatedTabs = [...prevTabs];
        updatedTabs[0].children = <WeatherInfoTab {...data} />;
        return updatedTabs;
      });
    }
  }, [data]);

  const createDynamicTabs = () => {
    return tabs.map((tab, _i) => {
      return (
        <AccordionTab key={tab.header} header={tab.header} disabled={tab.disabled}>
          {tab.children}
        </AccordionTab>
      );
    });
  };

  useEffect(() => {
    if (error) {
      if (error.error instanceof WeatherServiceError) {
        showMessage({
          severity: 'error',
          summary: 'Error',
          detail: `Weather data for "${error.district}" could not be found.`,
          life: 5000,
        });
      }
    }
  }, [error, showMessage]);

  if (error && !(error.error instanceof WeatherServiceError)) {
    return <ErrorHandler error={error} onRetry={retry} isLoading={loading} />;
  }

  return (
    <div className='flex z-4 p-4'>
      <div className='grid'>
        <div className='col-12 md:col-6 flex flex-column justify-content-center align-items-center p-4'>
          <LkMap
            selectedDistrict={currentDistrict}
            isMapVisible={isMapVisible}
            callback={fetchWeatherData}
          />
        </div>

        <div className='col-12 md:col-6 flex flex-column justify-content-center align-items-center p-4'>
          {loading ? (
            <div className='flex flex-column justify-content-center align-items-start pr-6 w-full h-full gap-3'>
              <Skeleton shape='rectangle' className='h-3rem w-12rem' />
              <Skeleton shape='rectangle' className='h-2rem w-10rem' />
              <Skeleton shape='rectangle' className='h-2rem w-11rem' />
              <Skeleton shape='rectangle' className='h-2rem w-11rem' />
              <Skeleton shape='rectangle' className='h-2rem w-11rem' />
              <Skeleton shape='rectangle' className='h-3rem w-full' />
            </div>
          ) : (
            <div className='flex flex-column justify-content-center md:align-items-start align-items-center'>
              {!error && data ? (
                <>
                  <div className='grid'>
                    <div className='col-12 md:col-9 flex flex-column justify-content-center md:align-items-start align-items-center'>
                      <h4
                        className={`font-semibold text-3xl m-0 ${
                          isDarkMode ? 'text-cyan-300' : 'text-cyan-700'
                        }`}
                      >
                        {data?.name}, {data?.sys?.country}
                      </h4>
                    </div>
                    <div className='col-12 md:col-3 flex flex-column justify-content-center md:align-items-start align-items-center'>
                      <p
                        className={`text-sm font-light m-0 ${
                          isDarkMode ? 'text-200' : 'text-500'
                        }`}
                      >
                        <img
                          src={`${owIconURL}/${data?.weather[0].icon}@2x.png`}
                          alt={data.weather[0]?.description}
                        />
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-row justify-content-start align-items-start gap-3'>
                    <p className='text-sm text-800'>
                      Temperature:{' '}
                      <span className='font-bold font-italic'>
                        {data ? data.main.temp : ''}°C
                      </span>
                    </p>
                    {data && (
                      <TemperatureIndicator
                        temperature={data ? data.main.temp : 0}
                        showLabel={false}
                        minTemp={-5}
                        maxTemp={40}
                        height={37}
                        width={7}
                      />
                    )}
                  </div>
                  <div className='flex flex-row justify-content-start align-items-center gap-3'>
                    <p className='text-sm text-800'>
                      Wind Speed:{' '}
                      <span className='font-bold font-italic'>
                        {data ? data.wind.speed : ''} m/s
                      </span>
                    </p>
                    {data && (
                      <WindDirectionIndicator
                        deg={data.wind.deg}
                        showLabel={false}
                        speed={data.wind.speed || 0}
                        maxSpeed={25}
                        minSpeed={0}
                      />
                    )}
                  </div>
                  <div className='flex flex-row justify-content-start align-items-center gap-3'>
                    <p className='text-sm text-800'>
                      Humidity:{' '}
                      <span className='font-bold font-italic'>
                        {data ? data.main.humidity : ''}%
                      </span>
                    </p>
                    {data && (
                      <HumidityIndicator
                        showLabel={false}
                        humidity={data ? data.main.humidity : 0}
                        size={22}
                      />
                    )}
                  </div>

                  {data ? (
                    <Accordion className='w-full'>{createDynamicTabs()}</Accordion>
                  ) : (
                    ''
                  )}
                </>
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
};
