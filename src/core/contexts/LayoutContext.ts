import type { LayoutState } from '@core/types/common.types';
import { createContext } from 'react';

type LayoutContextType = {
  uiState: LayoutState;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setHeaderVisibility: (visible: boolean) => void;
  setFooterVisibility: (visible: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  setHeaderButtonVisibility: (key: string, active: boolean) => void;
};

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);
