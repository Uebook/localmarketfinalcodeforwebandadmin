/**
 * useThemeColors Hook
 * Provides easy access to theme colors throughout the app
 * This hook ensures all components use the current theme colors
 */

import { useTheme } from '../components/ThemeProvider';

// Import COLORS with safe fallback
let DEFAULT_COLORS = {};
try {
  const colorsModule = require('../constants/colors');
  DEFAULT_COLORS = colorsModule.COLORS || colorsModule.default || {};
} catch (error) {
  console.error('Error loading DEFAULT_COLORS:', error);
  // Fallback colors if import fails
  DEFAULT_COLORS = {
    orange: '#E86A2C',
    blue: '#4A6CF7',
    white: '#FFFFFF',
    textPrimary: '#0F172A',
    textMuted: '#9CA3AF',
  };
}

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
