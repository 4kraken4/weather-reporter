import { Outlet } from 'react-router-dom';

import Header from './HeaderLayout';
import './styles/app-layout.scss';

export const AppLayout = () => {
  return (
    <div className='layout-wrapper md:h-screen'>
      <Header />
      <main className='layout-content w-full h-full flex flex-column justify-content-center align-items-center'>
        <Outlet />
      </main>
    </div>
  );
};
