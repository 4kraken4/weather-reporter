import { Outlet } from 'react-router-dom';

import Header from './HeaderLayout';
import './styles/app-layout.scss';

export const AppLayout = () => {
  return (
    <div className='layout-wrapper'>
      <Header />
      <main className='layout-content h-screen'>
        <Outlet />
      </main>
    </div>
  );
};
