import { useTheme } from '@core/hooks/useTheme';
import { Button } from 'primereact/button';
import type { TooltipOptions } from 'primereact/tooltip/tooltipoptions';
import { useEffect } from 'react';

import { useLayout } from '../hooks/useLayout';

import SearchModal from '@/core/components/search/SearchModal';

import './styles/header.scss';

type HeaderMenuItemType = {
  key: string;
  icon?: string;
  tooltip?: string;
  tooltipOptions?: {
    position: string;
    className: string;
  };
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  classList?: string;
  label?: string;
  iconClassList?: string;
};

const Header = () => {
  const { uiState, setSearchModalOpen } = useLayout();
  const { toggleTheme, isDarkMode } = useTheme();

  const handleSearchOpenModal = () => {
    setSearchModalOpen(true);
  };

  const handleSearchCloseModal = () => {
    setSearchModalOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const topbar = document.querySelector('.layout-topbar');
      const topbarInner = document.querySelector('.layout-topbar-inner');
      if (window.scrollY > 50) {
        topbar?.classList.add('layout-topbar-sticky');
        topbarInner?.classList.add('h-4rem');
      } else {
        topbar?.classList.remove('layout-topbar-sticky');
        topbarInner?.classList.remove('h-4rem');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleThemeChange = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleTheme();
  };

  const buttonMenuElement = ({
    label = '',
    classList = 'flex flex-shrink-0 px-link border-1 header-menu-item-height header-menu-item-width surface-border border-round-sm surface-card align-items-center justify-content-center transition-all transition-duration-300 hover:border-primary focus:shadow-none',
    icon = '',
    iconClassList = 'text-500 text-xs',
    tooltipOptions = {
      position: 'bottom',
      className: 'text-xs',
    },
    onClick = () => {},
  }: HeaderMenuItemType) => {
    return (
      <Button
        type='button'
        label={label}
        className={classList}
        tooltipOptions={tooltipOptions as TooltipOptions}
        icon={<i className={`${iconClassList} ${icon}`} />}
        onClick={onClick}
      />
    );
  };

  const headerMenuItems: HeaderMenuItemType[] = [
    {
      key: 'search',
      icon: 'pi pi-search',
      tooltip: 'Search for anything ',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        handleSearchOpenModal();
      },
    },
    {
      key: 'github',
      icon: 'pi pi-github',
      tooltip: 'Github',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        window.open('https://github.com', '_blank');
      },
    },
    {
      key: 'theme-toggle',
      classList:
        'header-menu-item-height header-menu-item-width text-400 text-xs font-light border-0 border-black-alpha-30 border-round-sm transition-all transition-duration-300 hover:border-primary focus:shadow-none',
      icon: `pi ${isDarkMode ? 'pi-sun' : 'pi-moon'}`,
      iconClassList: 'text-0 text-xs',
      tooltip: 'Toggle theme',
      onClick: handleThemeChange,
    },
  ];

  return uiState.isHeaderVisible ? (
    <header>
      <div className='layout-topbar z-5'>
        <div className='layout-topbar-inner flex px-8'>
          <nav className='flex justify-content-between align-items-center w-full'>
            <div className='w-6rem border-round-sm flex justify-content-between text-right'>
              <a
                href='/'
                className='text-color no-underline text-lg font-bold uppercase flex align-items-center'
              >
                <div className='h-2rem w-2rem border-round-sm mr-2'>
                  <img src='/logo.svg' alt='logo' className='h-full' />
                </div>
                T<span className='text-primary text-2xl'>W</span>R
              </a>
            </div>
            <div className='flex justify-content-between align-items-center border-round-sm'>
              <ul className='flex list-none m-0 p-0 gap-2 align-items-center'>
                {headerMenuItems.map((item: HeaderMenuItemType) => (
                  <li key={item.key}>{buttonMenuElement(item)}</li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>
      {uiState.isSearchModalOpen && (
        <SearchModal
          onClose={handleSearchCloseModal}
          isOpen={uiState.isSearchModalOpen}
          setOpen={setSearchModalOpen}
        />
      )}
    </header>
  ) : null;
};

export default Header;
