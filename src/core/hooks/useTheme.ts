import { ThemeContext } from '@core/contexts/ThemeContext';
import { useContext } from 'react';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
