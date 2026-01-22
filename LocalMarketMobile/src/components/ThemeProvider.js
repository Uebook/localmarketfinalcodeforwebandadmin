import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FESTIVAL_THEMES } from '../constants/festivalThemes';
import { getActiveTheme, getUserTheme, updateUserTheme } from '../services/api';

// Import COLORS with safe fallback
let COLORS;
let defaultColors = {};
try {
  const colorsModule = require('../constants/colors');
  COLORS = colorsModule.COLORS || colorsModule.default || {};
  defaultColors = COLORS;
} catch (error) {
  console.error('Error loading COLORS:', error);
  // Fallback colors if import fails
  defaultColors = {
    orange: '#E86A2C',
    blue: '#4A6CF7',
    white: '#FFFFFF',
    textPrimary: '#0F172A',
    textMuted: '#9CA3AF',
    textSecondary: '#475569',
    textLight: '#CBD5E1',
    divider: '#E5E7EB',
    darkBg: '#0B1324',
    primaryGradient: ['#E86A2C', '#4A6CF7'],
    homeBackground: ['#7A3B1D', '#2B1A14'],
    highlightBg: '#FFF4EC',
    primaryOrange: '#E86A2C',
    primaryOrangeDark: '#E86A2C',
    primaryBlue: '#4A6CF7',
    primaryBlueDark: '#4A6CF7',
    gradientStart: '#E86A2C',
    gradientEnd: '#4A6CF7',
    accentRed: '#DC2626',
    accentOrangeSoft: '#FFF4EC',
    textWhite: '#FFFFFF',
    background: '#FFFFFF',
    backgroundSoft: '#F8FAFC',
    danger: '#DC2626',
    success: '#16A34A',
  };
  COLORS = defaultColors;
}

export const ThemeContext = React.createContext({
  theme: 'default',
  themeColors: defaultColors,
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('default');
  const [themeColors, setThemeColors] = useState(COLORS || defaultColors);
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

      // 2. Check AsyncStorage FIRST (user's local selection takes priority)
      // This ensures the theme selected in Settings is used immediately
      if (themeToApply === 'default') {
        const savedTheme = await AsyncStorage.getItem('selectedFestivalTheme');
        if (savedTheme && savedTheme !== 'default') {
          themeToApply = savedTheme;
          console.log('✅ Applied theme from AsyncStorage (user selection):', themeToApply);
        }
      }

      // 3. If no local selection, try to get user's theme preference from database
      if (themeToApply === 'default') {
        try {
          const userId = await AsyncStorage.getItem('userId');
          const phone = await AsyncStorage.getItem('userPhone');
          const email = await AsyncStorage.getItem('userEmail');

          if (userId || phone || email) {
            const userThemeData = await getUserTheme({ userId, phone, email });
            if (userThemeData && userThemeData.theme && userThemeData.theme !== 'default') {
              themeToApply = userThemeData.theme;
              // Also save to AsyncStorage for consistency
              await AsyncStorage.setItem('selectedFestivalTheme', userThemeData.theme);
              console.log('✅ Applied user theme from DB:', themeToApply);
            }
          }
        } catch (error) {
          console.error('Error fetching user theme:', error);
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
      setThemeColors(COLORS || defaultColors);
      setThemeState('default');
      AsyncStorage.setItem('selectedFestivalTheme', 'default');
      return;
    }

    // PRIORITIZE API THEMES OVER STATIC CONSTANTS
    // 1. First check cache (contains API themes)
    let festivalTheme = themesCache[themeId];

    // 2. If not in cache, fetch from API (prioritize API over constants)
    if (!festivalTheme) {
      try {
        const { getThemes } = await import('../services/api');
        const allThemes = await getThemes();
        if (Array.isArray(allThemes)) {
          const dbTheme = allThemes.find(t => t.id === themeId);
          if (dbTheme) {
            festivalTheme = dbTheme;
            // Cache the API theme (with colors from database)
            setThemesCache(prev => ({
              ...prev,
              [themeId]: dbTheme,
            }));
            console.log('✅ Loaded theme from API:', themeId, 'Colors:', dbTheme.colors);
          }
        }
      } catch (error) {
        console.error('Error fetching theme from API:', error);
      }
    }

    // 3. Fallback to constants ONLY if API doesn't have the theme
    if (!festivalTheme) {
      festivalTheme = FESTIVAL_THEMES[themeId];
      if (festivalTheme) {
        console.log('⚠️ Using fallback theme from constants:', themeId);
      }
    }

    // If still no theme found, return
    if (!festivalTheme) {
      console.warn(`Theme ${themeId} not found, falling back to default`);
      applyTheme('default');
      return;
    }

    // Apply theme colors - USE COLORS FROM API THEME, NOT STATIC COLORS
    const colors = festivalTheme.colors;
    if (!colors || !colors.primary || !colors.secondary) {
      console.warn(`Theme ${themeId} has no valid colors, falling back to default`);
      applyTheme('default');
      return;
    }

    const baseColors = COLORS || defaultColors;
    // Apply ALL colors from API theme (primary, secondary, accent, background, text)
    // This ensures the app uses colors from the database, not static constants
    const newThemeColors = {
      ...baseColors,
      // PRIMARY COLORS FROM API
      orange: colors.primary, // Always use API primary color
      blue: colors.secondary, // Always use API secondary color
      primaryGradient: [colors.primary, colors.secondary], // API gradient
      
      // ADDITIONAL COLORS FROM API (if available)
      accentRed: colors.accent || baseColors.accentRed,
      background: colors.background || baseColors.background,
      textPrimary: colors.text || baseColors.textPrimary,
      
      // UPDATE ALL GRADIENT/LEGACY COLORS TO USE API COLORS
      gradientStart: colors.primary,
      gradientEnd: colors.secondary,
      primaryOrange: colors.primary,
      primaryOrangeDark: colors.primary,
      primaryBlue: colors.secondary,
      primaryBlueDark: colors.secondary,
      
      // Update home background gradient if available
      ...(colors.background && colors.primary && {
        homeBackground: [colors.primary, colors.secondary],
      }),
    };
    
    console.log('🎨 Applied theme colors from API:', {
      themeId,
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      text: colors.text,
    });

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
          theme: themeId, // Use 'theme' instead of 'themeId' to match API
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
    return { theme: 'default', themeColors: COLORS || defaultColors, setTheme: () => {} };
  }
  return context;
};
