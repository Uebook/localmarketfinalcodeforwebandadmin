// Define COLORS object - use CommonJS for Metro bundler compatibility
const COLORS = {
  // Brand
  orange: '#E86A2C',
  blue: '#4A6CF7',

  // Gradients
  primaryGradient: ['#E86A2C', '#4A6CF7'],
  homeBackground: ['#7A3B1D', '#2B1A14'],

  // Backgrounds
  white: '#FFFFFF',
  darkBg: '#0B1324',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#9CA3AF',
  textLight: '#CBD5E1',

  // Borders
  divider: '#E5E7EB',

  // Highlights
  highlightBg: '#FFF4EC',

  // Legacy support (for backward compatibility)
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

// Pure CommonJS export - Metro bundler compatible
// DO NOT mix CommonJS and ES6 exports - Metro bundler has issues with this
module.exports = COLORS;
module.exports.COLORS = COLORS;
module.exports.default = COLORS;
