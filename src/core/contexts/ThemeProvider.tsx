import type { Theme, Themes } from '@core/types/common.types';
import { useEffect, useState } from 'react';

import { ThemeContext } from './ThemeContext';

const themes: Themes = {
  light: {
    label: 'light',
    icon: 'pi pi-sun',
    theme: 'lara-light-cyan',
  },
  dark: {
    label: 'dark',
    icon: 'pi pi-moon',
    theme: 'lara-dark-cyan',
  },
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(themes.light);

  useEffect(() => {
    const savedTheme = localStorage.getItem(`${import.meta.env.VITE_APP_NAME}-theme`);

    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    // Check if the savedTheme is a valid key in themes
    const isValidTheme = savedTheme && savedTheme in themes;

    if (isValidTheme) {
      setTheme(themes[savedTheme]);
    } else if (systemPrefersDark) {
      setTheme(themes.dark);
    } else {
      setTheme(themes.light);
    }
  }, []);

  useEffect(() => {
    const applyTheme = (theme: Theme) => {
      const existingThemeId = 'dynamic-theme';
      const newThemeId = `${theme.label}-theme`;

      // Check if the theme is already applied
      if (document.getElementById(newThemeId)) return;

      // Preload and apply new theme
      const newLink = document.createElement('link');
      newLink.id = newThemeId;
      newLink.rel = 'stylesheet';
      newLink.href = `/themes/${theme.theme}/theme.css`;
      newLink.onload = () => {
        // Remove old theme link if it exists
        const existingLink = document.getElementById(existingThemeId);
        if (existingLink) {
          existingLink.remove();
        }
        // Set the new theme as active
        newLink.id = existingThemeId;
      };

      // Add new theme link to the document head
      document.head.appendChild(newLink);
      localStorage.setItem(`${import.meta.env.VITE_APP_NAME}-theme`, theme.label);
    };

    applyTheme(theme);

    const layoutWrapper: HTMLElement | null =
      document.querySelector('.layout-wrapper');
    if (layoutWrapper) {
      layoutWrapper.setAttribute('data-p-theme', theme.theme);
      layoutWrapper.classList.toggle(
        'layout-dark',
        theme.theme === themes.dark.theme
      );
      layoutWrapper.classList.toggle(
        'layout-light',
        theme.theme === themes.light.theme
      );
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme.label === 'light' ? themes.dark : themes.light));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, isDarkMode: theme.label === 'dark' }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
