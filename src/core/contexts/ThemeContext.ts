import { createContext } from 'react';

import type { Theme } from '../types/common.types';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
} | null;

export const ThemeContext = createContext<ThemeContextType>(null);
