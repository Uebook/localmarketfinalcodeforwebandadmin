'use client';

import { useEffect } from 'react';
import { FESTIVAL_THEMES, getThemeCSS } from '@/constants/festivalThemes';

export default function ThemeProvider({ children }) {
  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('selectedFestivalTheme') || 'diwali';
    const theme = FESTIVAL_THEMES[savedTheme];
    
    if (theme) {
      // Apply theme CSS
      const styleId = 'festival-theme-style';
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      styleElement.textContent = getThemeCSS(savedTheme);

      // Apply theme colors to root
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', theme.colors.primary);
      root.style.setProperty('--theme-secondary', theme.colors.secondary);
      root.style.setProperty('--theme-accent', theme.colors.accent);
      root.style.setProperty('--theme-background', theme.colors.background);
      root.style.setProperty('--theme-text', theme.colors.text);
      root.style.setProperty('--theme-header-gradient', `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`);
    }
  }, []);

  return <>{children}</>;
}
