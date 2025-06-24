import './styles/hero.scss';

const Hero = () => {
  return (
    <section className='flex flex-column m-auto justify-content-center align-items-start hero-height w-full overflow-hidden'>
      <div className='hero-inner-container'>
        <div className='hero-text-container'>
          <h1
            className='text-5xl font-italic font-bold text-center hero-text-main'
            style={{ lineHeight: '0.7', letterSpacing: '0.3rem' }}
          >
            THE
            <br />
            <span
              className='text-primary text-8xl hero-text-weather'
              style={{
                letterSpacing: '0.6rem',
              }}
            >
              WEATHER
            </span>
            <br />
            REPORTER
          </h1>
        </div>
      </div>
    </section>
  );
};

export default Hero;
