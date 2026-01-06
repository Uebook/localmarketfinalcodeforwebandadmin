import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FESTIVAL_THEMES } from '../constants/festivalThemes';
import { COLORS } from '../constants/colors';

export const ThemeContext = React.createContext({
  theme: 'default',
  themeColors: COLORS,
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('default');
  const [themeColors, setThemeColors] = useState(COLORS);

  useEffect(() => {
    // Load saved theme
    AsyncStorage.getItem('selectedFestivalTheme').then((savedTheme) => {
      if (savedTheme && FESTIVAL_THEMES[savedTheme]) {
        applyTheme(savedTheme);
      }
    });
  }, []);

  const applyTheme = (themeId) => {
    if (themeId === 'default') {
      setThemeColors(COLORS);
      setThemeState('default');
      return;
    }

    const festivalTheme = FESTIVAL_THEMES[themeId];
    if (!festivalTheme) return;

    // Apply theme colors
    const newThemeColors = {
      ...COLORS,
      orange: festivalTheme.colors.primary,
      blue: festivalTheme.colors.secondary,
      primaryGradient: [festivalTheme.colors.primary, festivalTheme.colors.secondary],
    };

    setThemeColors(newThemeColors);
    setThemeState(themeId);
    AsyncStorage.setItem('selectedFestivalTheme', themeId);
  };

  const setTheme = (themeId) => {
    applyTheme(themeId);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeColors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    return { theme: 'default', themeColors: COLORS, setTheme: () => {} };
  }
  return context;
};
