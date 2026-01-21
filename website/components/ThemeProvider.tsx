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
    // Load theme from database (global default first, then user-specific)
    const loadTheme = async () => {
      let themeToUse = localStorage.getItem('selectedFestivalTheme') || 'default';

      // Step 1: Check for global default theme (set by admin)
      try {
        const globalThemeRes = await fetch('/api/themes?active=true');
        if (globalThemeRes.ok) {
          const globalThemes = await globalThemeRes.json();
          if (Array.isArray(globalThemes) && globalThemes.length > 0) {
            const activeTheme = globalThemes.find((t: any) => t.is_active);
            if (activeTheme && activeTheme.id) {
              themeToUse = activeTheme.id;
              // Sync localStorage with global default
              localStorage.setItem('selectedFestivalTheme', themeToUse);
            }
          }
        }
      } catch (error) {
        console.error('Error loading global default theme:', error);
      }

      // Note: Admin's global default theme always takes precedence
      // When admin changes theme, all users' selected_theme is updated in the database
      // So we only need to check the global default theme

      // Apply the theme
      if (themeToUse && FESTIVAL_THEMES[themeToUse as keyof typeof FESTIVAL_THEMES]) {
        applyTheme(themeToUse);
      } else {
        applyTheme('default');
      }
    };

    loadTheme();
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

  const setTheme = async (themeId: string) => {
    applyTheme(themeId);
    
    // Save to database if user is logged in
    const userId = localStorage.getItem('userId');
    const userPhone = localStorage.getItem('userPhone');
    const userEmail = localStorage.getItem('userEmail');

    if (userId || userPhone || userEmail) {
      try {
        const body: any = { theme: themeId };
        if (userId) body.userId = userId;
        else if (userPhone) body.phone = userPhone;
        else if (userEmail) body.email = userEmail;

        await fetch('/api/user/theme', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch (error) {
        console.error('Error saving theme to database:', error);
        // Continue anyway - localStorage is already saved
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
