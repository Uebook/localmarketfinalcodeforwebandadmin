'use client';

import { useEffect, createContext, useContext, useState, ReactNode } from 'react';
import { FESTIVAL_THEMES, getThemeCSS } from '@/lib/festivalThemes';

interface ThemeContextType {
  theme: string;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState('default');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('selectedFestivalTheme') || 'default';
    if (savedTheme && FESTIVAL_THEMES[savedTheme as keyof typeof FESTIVAL_THEMES]) {
      applyTheme(savedTheme);
    } else {
      applyTheme('default');
    }
  }, []);

  const applyTheme = (themeId: string) => {
    if (themeId === 'default') {
      // Remove theme styles
      const styleElement = document.getElementById('festival-theme-style');
      if (styleElement) {
        styleElement.remove();
      }
      setThemeState('default');
      return;
    }

    const festivalTheme = FESTIVAL_THEMES[themeId as keyof typeof FESTIVAL_THEMES];
    if (!festivalTheme) return;

    // Apply theme CSS
    const styleId = 'festival-theme-style';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = getThemeCSS(themeId);

    // Apply theme colors to root
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', festivalTheme.colors.primary);
    root.style.setProperty('--theme-secondary', festivalTheme.colors.secondary);
    root.style.setProperty('--theme-accent', festivalTheme.colors.accent);
    root.style.setProperty('--theme-background', festivalTheme.colors.background);
    root.style.setProperty('--theme-text', festivalTheme.colors.text);
    root.style.setProperty('--theme-header-gradient', `linear-gradient(to right, ${festivalTheme.colors.primary}, ${festivalTheme.colors.secondary})`);

    setThemeState(themeId);
    localStorage.setItem('selectedFestivalTheme', themeId);
  };

  const setTheme = (themeId: string) => {
    applyTheme(themeId);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
