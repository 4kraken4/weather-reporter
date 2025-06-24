import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

import Hero from '@/core/components/hero/Hero';

import './styles/HomePage.scss';

export const HomePage = () => {
  const navigate = useNavigate();

  const handleOnGetStarted = () => {
    void navigate('/weather');
  };

  return (
    <div className='flex flex-column relative w-full h-screen'>
      <div className='w-full h-full z-0 parallax-hero-container'>
        <Hero />
      </div>

      <section className='get-started'>
        <div className='flex flex-column gap-3 justify-content-center align-items-center'>
          <Button
            label='Get Started'
            className='focus:shadow-none'
            onClick={handleOnGetStarted}
          />
        </div>
      </section>
      <section className='flex flex-column gap-3 justify-content-center align-items-center mt-5'>
        <p className='text-sm text-gray-500'>
          @2025 Weather Reporter. All rights reserved.
        </p>
      </section>
    </div>
  );
};
