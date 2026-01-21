import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FESTIVAL_THEMES } from '../constants/festivalThemes';
import { COLORS } from '../constants/colors';
import { getActiveTheme, getUserTheme, updateUserTheme } from '../services/api';

export const ThemeContext = React.createContext({
  theme: 'default',
  themeColors: COLORS,
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('default');
  const [themeColors, setThemeColors] = useState(COLORS);
  const [themesCache, setThemesCache] = useState({}); // Cache themes from DB

  useEffect(() => {
    loadAndApplyTheme();
  }, []);

  const loadAndApplyTheme = async () => {
    try {
      let themeToApply = 'default';

      // 1. First, try to get the globally active theme from database (set by admin)
      try {
        const activeTheme = await getActiveTheme();
        if (activeTheme && activeTheme.id) {
          themeToApply = activeTheme.id;
          // Cache the theme data
          setThemesCache(prev => ({
            ...prev,
            [activeTheme.id]: activeTheme,
          }));
          console.log('Applied global active theme from DB:', themeToApply);
        }
      } catch (error) {
        console.error('Error fetching global active theme:', error);
      }

      // 2. If no global theme, try to get user's theme preference
      if (themeToApply === 'default') {
        try {
          const userId = await AsyncStorage.getItem('userId');
          const phone = await AsyncStorage.getItem('userPhone');
          const email = await AsyncStorage.getItem('userEmail');

          if (userId || phone || email) {
            const userThemeData = await getUserTheme({ userId, phone, email });
            if (userThemeData && userThemeData.theme && userThemeData.theme !== 'default') {
              themeToApply = userThemeData.theme;
              console.log('Applied user theme from DB:', themeToApply);
            }
          }
        } catch (error) {
          console.error('Error fetching user theme:', error);
        }
      }

      // 3. Fallback to localStorage if no DB theme found
      if (themeToApply === 'default') {
        const savedTheme = await AsyncStorage.getItem('selectedFestivalTheme');
        if (savedTheme) {
          themeToApply = savedTheme;
          console.log('Applied theme from localStorage:', themeToApply);
        }
      }

      // Apply the theme
      applyTheme(themeToApply);
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fallback to default
      applyTheme('default');
    }
  };

  const applyTheme = async (themeId) => {
    if (themeId === 'default') {
      setThemeColors(COLORS);
      setThemeState('default');
      AsyncStorage.setItem('selectedFestivalTheme', 'default');
      return;
    }

    // Try to get theme from cache first, then from constants
    let festivalTheme = themesCache[themeId] || FESTIVAL_THEMES[themeId];

    // If not in cache or constants, try to fetch from API
    if (!festivalTheme) {
      try {
        const { getThemes } = await import('../services/api');
        const allThemes = await getThemes();
        if (Array.isArray(allThemes)) {
          const dbTheme = allThemes.find(t => t.id === themeId);
          if (dbTheme) {
            festivalTheme = dbTheme;
            setThemesCache(prev => ({
              ...prev,
              [themeId]: dbTheme,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching theme from API:', error);
      }
    }

    // If still no theme found, return
    if (!festivalTheme) {
      console.warn(`Theme ${themeId} not found, falling back to default`);
      applyTheme('default');
      return;
    }

    // Apply theme colors
    const colors = festivalTheme.colors || (FESTIVAL_THEMES[themeId]?.colors);
    if (!colors) {
      console.warn(`Theme ${themeId} has no colors, falling back to default`);
      applyTheme('default');
      return;
    }

    const newThemeColors = {
      ...COLORS,
      orange: colors.primary || COLORS.orange,
      blue: colors.secondary || COLORS.blue,
      primaryGradient: [colors.primary || COLORS.orange, colors.secondary || COLORS.blue],
    };

    setThemeColors(newThemeColors);
    setThemeState(themeId);
    AsyncStorage.setItem('selectedFestivalTheme', themeId);
  };

  const setTheme = async (themeId) => {
    await applyTheme(themeId);
    
    // Update user's theme preference in the database
    try {
      const userId = await AsyncStorage.getItem('userId');
      const phone = await AsyncStorage.getItem('userPhone');
      const email = await AsyncStorage.getItem('userEmail');

      if (userId || phone || email) {
        await updateUserTheme({
          userId,
          phone,
          email,
          themeId: themeId,
        });
        console.log('User theme saved to DB:', themeId);
      }
    } catch (error) {
      console.error('Error saving user theme to DB:', error);
      // Continue even if save fails - theme is still applied locally
    }
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
