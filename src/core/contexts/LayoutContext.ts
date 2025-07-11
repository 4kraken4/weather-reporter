import { createContext } from 'react';

import type { LayoutState } from '../types/common.types';

type LayoutContextType = {
  uiState: LayoutState;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setHeaderVisibility: (visible: boolean) => void;
  setFooterVisibility: (visible: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
};

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);
