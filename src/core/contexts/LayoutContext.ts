import { createContext } from 'react';

export type LayoutState = {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  isHeaderVisible: boolean;
  isFooterVisible: boolean;
  isSearchModalOpen: boolean;
};

export type LayoutContextType = {
  uiState: LayoutState;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setHeaderVisibility: (visible: boolean) => void;
  setFooterVisibility: (visible: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
};

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);
