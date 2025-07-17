import type { LayoutState } from '@core/types/common.types';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { LayoutContext } from './LayoutContext';

export const LayoutProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [uiState, setUiState] = useState<LayoutState>(() => ({
    isSidebarOpen: false,
    isMobileMenuOpen: false,
    isHeaderVisible: true,
    isFooterVisible: true,
    isSearchModalOpen: false,
    headerButtons: {
      github: false,
      search: false,
      theme: false,
    },
  }));

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/home') {
      setUiState(prev => ({
        ...prev,
        isHeaderVisible: true,
        isFooterVisible: true,
        headerButtons: {
          github: false,
          search: false,
          theme: true,
        },
      }));
    } else {
      setUiState(prev => ({
        ...prev,
        isHeaderVisible: true,
        isFooterVisible: false,
        headerButtons: {
          github: true,
          search: true,
          theme: true,
        },
      }));
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setUiState(prevState => ({
      ...prevState,
      isSidebarOpen: !prevState.isSidebarOpen,
    }));
  };

  const toggleMobileMenu = () => {
    setUiState(prevState => ({
      ...prevState,
      isMobileMenuOpen: !prevState.isMobileMenuOpen,
    }));
  };

  const setHeaderVisibility = (visible: boolean) => {
    setUiState(prevState => ({
      ...prevState,
      isHeaderVisible: visible,
    }));
  };

  const setFooterVisibility = (visible: boolean) => {
    setUiState(prevState => ({
      ...prevState,
      isFooterVisible: visible,
    }));
  };

  const setSearchModalOpen = (open: boolean) => {
    setUiState(prevState => ({
      ...prevState,
      isSearchModalOpen: open,
    }));
  };

  const setHeaderButtonVisibility = (key: string, active: boolean) => {
    setUiState(prevState => ({
      ...prevState,
      headerButtons: {
        ...prevState.headerButtons,
        [key]: active,
      },
    }));
  };

  return (
    <LayoutContext.Provider
      value={{
        uiState,
        toggleSidebar,
        toggleMobileMenu,
        setHeaderVisibility,
        setFooterVisibility,
        setSearchModalOpen,
        setHeaderButtonVisibility,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
