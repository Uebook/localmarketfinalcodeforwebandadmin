/**
 * useThemeColors Hook
 * Provides easy access to theme colors throughout the app
 * This hook ensures all components use the current theme colors
 */

import { useTheme } from '../components/ThemeProvider';

import COLORS_IMPORT from '../constants/colors';

// Debug logging
console.log('[useThemeColors] COLORS_IMPORT:', !!COLORS_IMPORT);

const DEFAULT_FALLBACK = {
  orange: '#E86A2C',
  blue: '#4A6CF7',
  white: '#FFFFFF',
  textPrimary: '#0F172A',
  textMuted: '#9CA3AF',
};

const DEFAULT_COLORS = (function() {
  try {
    if (!COLORS_IMPORT) return DEFAULT_FALLBACK;
    const base = COLORS_IMPORT.COLORS || COLORS_IMPORT.default || COLORS_IMPORT;
    return { ...DEFAULT_FALLBACK, ...base };
  } catch (e) {
    console.error('[useThemeColors] Error initializing DEFAULT_COLORS:', e);
    return DEFAULT_FALLBACK;
  }
})();

/**
 * Hook to get theme colors
 * Returns themeColors from context, with fallback to default COLORS
 * @returns {Object} Theme colors object
 */
export const useThemeColors = () => {
  const { themeColors } = useTheme();
  
  // Return theme colors if available, otherwise fallback to default
  return themeColors || DEFAULT_COLORS;
};

export default useThemeColors;
