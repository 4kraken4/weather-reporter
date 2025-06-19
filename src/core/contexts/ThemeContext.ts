import type { ThemeContextType } from '@core/types/common.types';
import { createContext } from 'react';

export const ThemeContext = createContext<ThemeContextType>(null);
