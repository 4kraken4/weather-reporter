import { useState } from 'react';

import { LayoutContext, type LayoutState } from './LayoutContext';

export const LayoutProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [uiState, setUiState] = useState<LayoutState>(() => ({
    isSidebarOpen: false,
    isMobileMenuOpen: false,
    isHeaderVisible: true,
    isFooterVisible: true,
    isSearchModalOpen: false,
  }));

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

  return (
    <LayoutContext.Provider
      value={{
        uiState,
        toggleSidebar,
        toggleMobileMenu,
        setHeaderVisibility,
        setFooterVisibility,
        setSearchModalOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
