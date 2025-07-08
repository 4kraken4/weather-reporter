import { useEffect, useState } from 'react';

import type { Theme } from '../types/common.types';

import { ThemeContext } from './ThemeContext';

type Themes = Record<string, Theme>;

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

    let selectedTheme;
    if (isValidTheme) {
      selectedTheme = themes[savedTheme];
    } else if (systemPrefersDark) {
      selectedTheme = themes.dark;
    } else {
      selectedTheme = themes.light;
    }

    setTheme(selectedTheme);

    // Apply layout classes immediately on mount
    const applyLayoutClasses = (theme: Theme) => {
      const layoutWrapper: HTMLElement | null =
        document.querySelector('.layout-wrapper');
      if (layoutWrapper) {
        layoutWrapper.setAttribute('data-p-theme', theme.theme);
        layoutWrapper.classList.remove('layout-dark', 'layout-light');
        layoutWrapper.classList.add(
          theme.theme === themes.dark.theme ? 'layout-dark' : 'layout-light'
        );
      }
    };

    // Apply immediately or wait for DOM
    if (document.querySelector('.layout-wrapper')) {
      applyLayoutClasses(selectedTheme);
    } else {
      // Wait for DOM to be ready
      const observer = new MutationObserver(() => {
        const layoutWrapper = document.querySelector('.layout-wrapper');
        if (layoutWrapper) {
          applyLayoutClasses(selectedTheme);
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
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
      layoutWrapper.classList.remove('layout-dark', 'layout-light');
      layoutWrapper.classList.add(
        theme.theme === themes.dark.theme ? 'layout-dark' : 'layout-light'
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
