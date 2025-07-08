import { Accordion, AccordionTab } from 'primereact/accordion';
import { memo } from 'react';

import { useTheme } from '@/core/hooks/useTheme';
import type { WeatherResponseType } from '@/core/types/common.types';
import { HumidityIndicator } from '@/features/weather/components/humidity-indicator/HumidityIndicator';
import { WeatherInfoTab } from '@/features/weather/components/moreinfo-tab/MoreInfoTab';
import { TemperatureIndicator } from '@/features/weather/components/temp-indicator/TemperatureIndicator';
import { WindDirectionIndicator } from '@/features/weather/components/wind-direction-indicator/WindDirectionIndicator';

type WeatherInformationPanelProps = {
  data: WeatherResponseType;
  owIconURL: string;
};

export const WeatherInformationPanel = memo(
  ({ data, owIconURL }: WeatherInformationPanelProps) => {
    const { isDarkMode } = useTheme();

    const createDynamicTabs = () => {
      return (
        <AccordionTab header='More Info' disabled={false}>
          <WeatherInfoTab {...data} />
        </AccordionTab>
      );
    };

    return (
      <div className='flex flex-column justify-content-center md:align-items-start align-items-center'>
        {/* Title and Weather Icon Section */}
        <div className='grid'>
          <div className='col-12 md:col-9 flex flex-column justify-content-center md:align-items-start align-items-center'>
            <h4
              className={`font-semibold text-3xl m-0 ${
                isDarkMode ? 'text-cyan-300' : 'text-cyan-700'
              }`}
            >
              {data?.cityName}, {data?.system?.country}
            </h4>
          </div>
          <div className='col-12 md:col-3 flex flex-column justify-content-center md:align-items-start align-items-center'>
            <div
              className={`border-round-lg p-2 border-1 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'surface-border bg-primary-500 shadow-2'
              }`}
            >
              <img
                src={`${owIconURL}/${data?.conditions[0].icon}@2x.png`}
                alt={data.conditions[0]?.description}
                className='w-3rem h-3rem'
              />
            </div>
          </div>
        </div>

        {/* Temperature Section */}
        <div className='flex flex-row justify-content-start align-items-start gap-3'>
          <p className='text-sm text-800'>
            Temperature:{' '}
            <span className='font-bold font-italic'>
              {data ? data.metrics.temp : ''}°C
            </span>
          </p>
          {data && (
            <TemperatureIndicator
              temperature={data ? data.metrics.temp : 0}
              showLabel={false}
              minTemp={-5}
              maxTemp={40}
              height={37}
              width={7}
            />
          )}
        </div>

        {/* Wind Speed Section */}
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

        {/* Humidity Section */}
        <div className='flex flex-row justify-content-start align-items-center gap-3'>
          <p className='text-sm text-800'>
            Humidity:{' '}
            <span className='font-bold font-italic'>
              {data ? data.metrics.humidity : ''}%
            </span>
          </p>
          {data && (
            <HumidityIndicator
              showLabel={false}
              humidity={data ? data.metrics.humidity : 0}
              size={22}
            />
          )}
        </div>

        {/* Accordion Section */}
        {data ? <Accordion className='w-full'>{createDynamicTabs()}</Accordion> : ''}
      </div>
    );
  }
);

WeatherInformationPanel.displayName = 'WeatherInformationPanel';
