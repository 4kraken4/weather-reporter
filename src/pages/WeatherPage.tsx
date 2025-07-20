import { HourglassSpinner } from '@core/components/spinner';
import { HumidityIndicator } from '@features/weather/components/humidity-indicator/HumidityIndicator';
import { TemperatureIndicator } from '@features/weather/components/temp-indicator/TemperatureIndicator';
import { WindDirectionIndicator } from '@features/weather/components/wind-direction-indicator/WindDirectionIndicator';
import { motion } from 'motion/react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { TabMenu } from 'primereact/tabmenu';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaClock,
  FaCloudRain,
  FaCompass,
  FaEye,
  FaHome,
  FaMoon,
  FaSnowflake,
  FaSun,
  FaThermometerHalf,
  FaWind,
} from 'react-icons/fa';
import { RiMistFill } from 'react-icons/ri';
import {
  WiCloudy,
  WiDayCloudy,
  WiDayCloudyHigh,
  WiDaySunny,
  WiNightClear,
  WiNightCloudy,
  WiNightCloudyHigh,
  WiThunderstorm,
} from 'react-icons/wi';
import { useNavigate, useParams } from 'react-router-dom';

import { useWeatherData } from '@/features/weather/hooks/useWeather';

import './styles/WeatherPage.scss';

type WeatherPageProps = Record<string, never>;

const WeatherPage: React.FC<WeatherPageProps> = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const { data, loading, error, fetchWeatherDataById } = useWeatherData();
  const [activeTab, setActiveTab] = useState(0);

  // Fetch weather data when component mounts or params change
  useEffect(() => {
    if (cityId) {
      void fetchWeatherDataById(parseInt(cityId, 10));
    }
  }, [cityId, fetchWeatherDataById]);

  // Memoize tabItems and animation variants to avoid recreation on every render
  const tabItems = useMemo(
    () => [
      { label: 'Overview', icon: 'pi pi-home' },
      { label: 'Details', icon: 'pi pi-chart-line' },
      { label: 'Forecast', icon: 'pi pi-calendar' },
    ],
    []
  );

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          staggerChildren: 0.1,
        },
      },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }),
    []
  );

  // Memoize helper functions that depend only on their arguments
  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getWindDirection = useCallback((degree: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
  }, []);

  const getWeatherIcon = useCallback((iconCode: string): React.ReactElement => {
    const iconMap: Record<string, React.ReactElement> = {
      '01d': <WiDaySunny className='text-yellow-500' />,
      '01n': <WiNightClear className='text-blue-300' />,
      '02d': <WiDayCloudy className='text-yellow-400' />,
      '02n': <WiNightCloudy className='text-blue-200' />,
      '03d': <WiCloudy className='text-gray-400' />,
      '03n': <WiCloudy className='text-gray-300' />,
      '04d': <WiDayCloudyHigh className='text-gray-500' />,
      '04n': <WiNightCloudyHigh className='text-gray-400' />,
      '09d': <FaCloudRain className='text-blue-500' />,
      '09n': <FaCloudRain className='text-blue-400' />,
      '10d': <FaCloudRain className='text-blue-600' />,
      '10n': <FaCloudRain className='text-blue-500' />,
      '11d': <WiThunderstorm className='text-yellow-600' />,
      '11n': <WiThunderstorm className='text-yellow-500' />,
      '13d': <FaSnowflake className='text-blue-200' />,
      '13n': <FaSnowflake className='text-blue-100' />,
      '50d': <RiMistFill className='text-gray-400' />,
      '50n': <RiMistFill className='text-gray-300' />,
    };
    return iconMap[iconCode] ?? <i className='pi pi-question-circle text-gray-400' />;
  }, []);

  const getHumidityLevel = useCallback((humidity: number) => {
    if (humidity > 70) return 'High';
    if (humidity > 40) return 'Moderate';
    return 'Low';
  }, []);

  const getVisibilityLevel = useCallback((visibility: number) => {
    if (visibility >= 10000) return 'Excellent';
    if (visibility >= 5000) return 'Good';
    if (visibility >= 1000) return 'Moderate';
    return 'Poor';
  }, []);

  const handleBackToHome = useCallback(() => {
    void navigate('/');
  }, [navigate]);

  if (!cityId) {
    return (
      <div className='weather-page-error'>
        <Card className='text-center p-4'>
          <h2>Invalid Location</h2>
          <p>Please provide a valid city ID.</p>
          <button
            className='p-button p-button-primary mt-3'
            onClick={handleBackToHome}
          >
            Back to Search
          </button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='weather-page-loading'>
        <motion.div
          className='loading-container'
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HourglassSpinner size={1.3} />
          <h3 className='mt-3 text-primary'>Loading Weather Data</h3>
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className='weather-page-error'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className='text-center p-4'>
            <i className='pi pi-exclamation-triangle text-red-500 text-6xl mb-3' />
            <h2 className='text-red-600'>Weather Data Unavailable</h2>
            <p className='text-700 mb-3'>
              {error?.message ?? `Unable to fetch weather data for ${cityId}`}
            </p>
            <div className='flex justify-content-center gap-2'>
              <button
                type='button'
                className='p-button p-button-outlined'
                onClick={handleBackToHome}
              >
                <i className='pi pi-arrow-left mr-2' />
                Back to Search
              </button>
              <button
                type='button'
                className='p-button p-button-primary'
                onClick={() =>
                  cityId && void fetchWeatherDataById(parseInt(cityId, 10))
                }
              >
                <i className='pi pi-refresh mr-2' />
                Try Again
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className='weather-page'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {/* Header Section */}
      <motion.div className='weather-header' variants={itemVariants}>
        <div className='flex justify-content-between align-items-center mb-4'>
          <Button
            type='button'
            severity='secondary'
            label='Back to Search'
            icon={<FaHome className='mr-2' />}
            size='small'
            iconPos='left'
            className='focus:outline-none focus:shadow-none'
            text
            onClick={handleBackToHome}
          />
          <Tag
            value={`Last Updated: ${formatTime(data.timestamp)}`}
            severity='info'
            className='text-xs'
          />
        </div>

        <div className='location-header'>
          <div className='location-info'>
            <h1 className='city-name'>
              {data.cityName}
              <span className='country-code'>{data.system.country}</span>
            </h1>
            <p className='coordinates text-500'>
              <FaCompass className='mr-1' />
              {data.coordinates.lat.toFixed(4)}°, {data.coordinates.lon.toFixed(4)}°
            </p>
          </div>

          <div className='current-weather'>
            <div className='weather-icon-large'>
              {getWeatherIcon(data.conditions[0]?.icon)}
            </div>
            <div className='temperature-main'>
              <TemperatureIndicator
                temperature={data.metrics.temp}
                showLabel={false}
              />
              <span className='temp-value'>{Math.round(data.metrics.temp)}°C</span>
            </div>
          </div>
        </div>

        <div className='weather-description'>
          <h3 className='condition-main'>{data.conditions[0]?.main}</h3>
          <p className='condition-description text-600'>
            {data.conditions[0]?.description}
          </p>
          <p className='feels-like text-500'>
            Feels like {Math.round(data.metrics.feels_like)}°C
          </p>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div variants={itemVariants}>
        <TabMenu
          model={tabItems}
          activeIndex={activeTab}
          onTabChange={e => setActiveTab(e.index)}
          className='mb-4'
        />
      </motion.div>

      {/* Content based on active tab */}
      {activeTab === 0 && (
        <motion.div className='weather-overview' variants={itemVariants}>
          {/* Quick Stats Grid */}
          <div className='stats-grid'>
            <Card className='stat-card'>
              <div className='stat-content'>
                <div className='stat-icon'>
                  <FaThermometerHalf className='text-orange-500' />
                </div>
                <div className='stat-details'>
                  <span className='stat-label'>Temperature</span>
                  <span className='stat-value'>
                    {Math.round(data.metrics.temp)}°C
                  </span>
                  <span className='stat-range text-500'>
                    {Math.round(data.metrics.temp_min)}° /{' '}
                    {Math.round(data.metrics.temp_max)}°
                  </span>
                </div>
              </div>
            </Card>

            <Card className='stat-card'>
              <div className='stat-content'>
                <div className='stat-icon'>
                  <HumidityIndicator
                    humidity={data.metrics.humidity}
                    size={24}
                    showLabel={false}
                  />
                </div>
                <div className='stat-details'>
                  <span className='stat-label'>Humidity</span>
                  <span className='stat-value'>{data.metrics.humidity}%</span>
                  <span className='stat-range text-500'>
                    {getHumidityLevel(data.metrics.humidity)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className='stat-card'>
              <div className='stat-content'>
                <div className='stat-icon'>
                  <WindDirectionIndicator
                    deg={data.wind.deg}
                    speed={data.wind.speed}
                    maxSpeed={50}
                    minSpeed={0}
                    showLabel={false}
                  />
                </div>
                <div className='stat-details'>
                  <span className='stat-label'>Wind</span>
                  <span className='stat-value'>{data.wind.speed.toFixed(1)} m/s</span>
                  <span className='stat-range text-500'>
                    {getWindDirection(data.wind.deg)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className='stat-card'>
              <div className='stat-content'>
                <div className='stat-icon'>
                  <FaEye className='text-blue-500' />
                </div>
                <div className='stat-details'>
                  <span className='stat-label'>Visibility</span>
                  <span className='stat-value'>
                    {(data.visibility / 1000).toFixed(1)} km
                  </span>
                  <span className='stat-range text-500'>
                    {getVisibilityLevel(data.visibility)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sun Times */}
          <Card className='sun-times-card mt-4'>
            <h4 className='mb-3'>
              <FaSun className='mr-2 text-yellow-500' />
              Sun Times
            </h4>
            <div className='sun-times-grid'>
              <div className='sun-time-item'>
                <FaSun className='text-orange-400' />
                <span className='label'>Sunrise</span>
                <span className='time'>{formatTime(data.system.sunrise)}</span>
              </div>
              <div className='sun-time-item'>
                <FaMoon className='text-blue-400' />
                <span className='label'>Sunset</span>
                <span className='time'>{formatTime(data.system.sunset)}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 1 && (
        <motion.div className='weather-details' variants={itemVariants}>
          <div className='details-grid'>
            {/* Atmospheric Conditions */}
            <Card className='detail-card'>
              <h4 className='card-title'>
                <i className='pi pi-gauge mr-2 text-primary' />
                Atmospheric Conditions
              </h4>
              <Divider />
              <div className='detail-items'>
                <div className='detail-item'>
                  <span className='detail-label'>Pressure</span>
                  <span className='detail-value'>{data.metrics.pressure} hPa</span>
                </div>
                <div className='detail-item'>
                  <span className='detail-label'>Sea Level</span>
                  <span className='detail-value'>
                    {data.metrics.sea_level || 'N/A'} hPa
                  </span>
                </div>
                <div className='detail-item'>
                  <span className='detail-label'>Ground Level</span>
                  <span className='detail-value'>
                    {data.metrics.grnd_level || 'N/A'} hPa
                  </span>
                </div>
                <div className='detail-item'>
                  <span className='detail-label'>Cloudiness</span>
                  <span className='detail-value'>{data.clouds.all}%</span>
                </div>
              </div>
            </Card>

            {/* Wind Information */}
            <Card className='detail-card'>
              <h4 className='card-title'>
                <FaWind className='mr-2 text-cyan-500' />
                Wind Information
              </h4>
              <Divider />
              <div className='detail-items'>
                <div className='detail-item'>
                  <span className='detail-label'>Speed</span>
                  <span className='detail-value'>{data.wind.speed} m/s</span>
                </div>
                <div className='detail-item'>
                  <span className='detail-label'>Direction</span>
                  <span className='detail-value'>
                    {data.wind.deg}° ({getWindDirection(data.wind.deg)})
                  </span>
                </div>
                <div className='detail-item'>
                  <span className='detail-label'>Gust</span>
                  <span className='detail-value'>
                    {data.wind.gust ? `${data.wind.gust} m/s` : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Precipitation */}
            {(data.rain ?? data.snow) && (
              <Card className='detail-card'>
                <h4 className='card-title'>
                  {data.rain ? (
                    <FaCloudRain className='mr-2 text-blue-500' />
                  ) : (
                    <FaSnowflake className='mr-2 text-blue-200' />
                  )}
                  Precipitation
                </h4>
                <Divider />
                <div className='detail-items'>
                  {data.rain && (
                    <div className='detail-item'>
                      <span className='detail-label'>Rain (1h)</span>
                      <span className='detail-value'>{data.rain['1h']} mm</span>
                    </div>
                  )}
                  {data.snow && (
                    <div className='detail-item'>
                      <span className='detail-label'>Snow (1h)</span>
                      <span className='detail-value'>{data.snow['1h']} mm</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Additional Info */}
            <Card className='detail-card'>
              <h4 className='card-title'>
                <FaClock className='mr-2 text-purple-500' />
                Additional Information
              </h4>
              <Divider />
              <div className='detail-items'>
                <div className='detail-item'>
                  <span className='detail-label'>Timezone</span>
                  <span className='detail-value'>
                    UTC {data.timezone >= 0 ? '+' : ''}
                    {data.timezone / 3600}h
                  </span>
                </div>
                <div className='detail-item'>
                  <span className='detail-label'>Data Source</span>
                  <span className='detail-value'>{data.dataSource}</span>
                </div>
                <div className='detail-item'>
                  <span className='detail-label'>City ID</span>
                  <span className='detail-value'>{data.cityId}</span>
                </div>
                <div className='detail-item'>
                  <span className='detail-label'>Last Updated</span>
                  <span className='detail-value'>
                    {new Date(data.timestamp * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === 2 && (
        <motion.div className='weather-forecast' variants={itemVariants}>
          <Card className='forecast-card'>
            <h4 className='card-title'>
              <i className='pi pi-calendar mr-2 text-green-500' />
              Extended Forecast
            </h4>
            <Divider />
            <div className='text-center p-6'>
              <i className='pi pi-clock text-gray-400 text-4xl mb-3' />
              <h5 className='text-gray-600'>Coming Soon</h5>
              <p className='text-gray-500'>
                Extended weather forecast will be available in a future update.
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Tooltips */}
      <Tooltip target='.stat-icon' position='top' />
    </motion.div>
  );
};

export default WeatherPage;
