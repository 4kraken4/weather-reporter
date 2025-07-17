import MagicCard from '@core/components/magic-card';
import { motion, useInView } from 'motion/react';
import { memo, useRef } from 'react';
import {
  FaBell,
  FaChartLine,
  FaCloud,
  FaMapMarkerAlt,
  FaMobile,
} from 'react-icons/fa';
import { WiThermometer } from 'react-icons/wi';

import './styles/features.scss';

type FeatureData = {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
};

const featuresData: FeatureData[] = [
  {
    id: 1,
    icon: <WiThermometer />,
    title: 'Real-time Weather Data',
    description:
      'Get accurate, up-to-the-minute weather information from trusted meteorological sources worldwide.',
    color: '#22d3ee',
  },
  {
    id: 2,
    icon: <FaMapMarkerAlt />,
    title: 'Location-based Forecasts',
    description:
      'Precise weather predictions tailored to your exact location with interactive map visualization.',
    color: '#06ffa5',
  },
  {
    id: 3,
    icon: <FaChartLine />,
    title: 'Advanced Analytics',
    description:
      'Detailed weather trends, historical data analysis, and predictive insights for better planning.',
    color: '#8b5cf6',
  },
  {
    id: 4,
    icon: <FaCloud />,
    title: 'Multi-layer Atmosphere',
    description:
      'Comprehensive atmospheric monitoring including humidity, pressure, air quality metrics.',
    color: '#f59e0b',
  },
  {
    id: 5,
    icon: <FaBell />,
    title: 'Smart Notifications',
    description:
      'Customizable weather alerts and severe weather warnings delivered right to your device.',
    color: '#ef4444',
  },
  {
    id: 6,
    icon: <FaMobile />,
    title: 'Cross-platform Access',
    description:
      'Seamless weather experience across all your devices with responsive design and sync.',
    color: '#06b6d4',
  },
];

// Optimized animation variants for maximum performance
const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  card: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  },
  header: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  },
} as const;

const Features = memo(() => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  return (
    <section className='features' ref={containerRef} data-section='features'>
      {/* Simplified Background Elements */}
      <div className='features__background'>
        <div className='features__bg-gradient-1' />
        <div className='features__bg-gradient-2' />
        <div className='features__floating-shape features__floating-shape--1' />
        <div className='features__floating-shape features__floating-shape--2' />
        <div className='features__grid-pattern' />
      </div>

      <div className='features__container'>
        {/* Header */}
        <motion.div
          className='features__header'
          variants={ANIMATION_VARIANTS.header}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
        >
          <div className='features__badge'>
            <i className='pi pi-star-fill' />
            Advanced Weather Intelligence
          </div>
          <h2>
            <span className='features__title-highlight'>Powerful</span> Weather
            Features
          </h2>
          <p>
            Experience comprehensive weather forecasting with our suite of{' '}
            <span className='features__text-accent'>advanced tools</span> designed for{' '}
            <span className='features__text-accent'>accuracy and ease of use</span>.
          </p>
          <div className='features__stats-mini'>
            <div className='features__stat-item'>
              <span className='features__stat-number'>99%</span>
              <span className='features__stat-label'>Accuracy</span>
            </div>
            <div className='features__stat-divider' />
            <div className='features__stat-item'>
              <span className='features__stat-number'>24/7</span>
              <span className='features__stat-label'>Updates</span>
            </div>
            <div className='features__stat-divider' />
            <div className='features__stat-item'>
              <span className='features__stat-number'>25+</span>
              <span className='features__stat-label'>Locations</span>
            </div>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          className='features__grid'
          variants={ANIMATION_VARIANTS.container}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
        >
          {featuresData.map(feature => (
            <motion.div key={feature.id} variants={ANIMATION_VARIANTS.card}>
              <MagicCard
                gradientOpacity={0.15}
                glowIntensity={0.1}
                hoverScale={1.02}
                rotationStrength={6}
                className='features__card'
                gradientColor={feature.color}
              >
                <div className='features__card-content'>
                  <div className='features__icon' style={{ color: feature.color }}>
                    {feature.icon}
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </MagicCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

Features.displayName = 'Features';

export default Features;
