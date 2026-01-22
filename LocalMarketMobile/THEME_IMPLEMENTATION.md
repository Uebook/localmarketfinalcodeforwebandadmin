# Theme Implementation Guide

## Overview
The app now supports dynamic theme selection that applies across all screens. Themes are managed through a centralized `ThemeProvider` component.

## Architecture

### 1. ThemeProvider (`src/components/ThemeProvider.js`)
- Wraps the entire app
- Manages theme state and colors
- Loads theme from database (global active theme or user preference)
- Falls back to AsyncStorage if database is unavailable
- Provides theme context to all components

### 2. useThemeColors Hook (`src/hooks/useThemeColors.js`)
- Easy-to-use hook for accessing theme colors
- Returns `themeColors` from context with fallback to default COLORS
- Use this instead of importing COLORS directly

## How to Update Components

### Pattern for Updating Components:

**Before:**
```javascript
import { COLORS } from '../constants/colors';

const MyComponent = () => {
  return <View style={{ backgroundColor: COLORS.orange }} />;
};
```

**After:**
```javascript
import { useThemeColors } from '../hooks/useThemeColors';

const MyComponent = () => {
  const COLORS = useThemeColors();
  return <View style={{ backgroundColor: COLORS.orange }} />;
};
```

### Key Points:
1. Replace `import { COLORS } from '../constants/colors'` with `import { useThemeColors } from '../hooks/useThemeColors'`
2. Add `const COLORS = useThemeColors();` inside the component function
3. All existing `COLORS` references will automatically use theme colors

## Components Already Updated:
- ✅ App.js (wrapped with ThemeProvider)
- ✅ HomeScreen.js
- ✅ Header.js
- ✅ SettingsScreen.js (uses theme context for selection)

## Components That Need Updates:
Run `node scripts/update-components-theme.js` to see the full list.

Key components to update:
- LoginScreen.js
- RegisterScreen.js
- SearchBar.js
- Sidebar.js
- SearchResults.js
- CategoriesScreen.js
- VendorDetails.js
- OffersScreen.js
- SavedScreen.js
- And all other components importing COLORS

## Theme Selection

Users can select themes in SettingsScreen:
1. Theme selection updates ThemeProvider context
2. ThemeProvider updates all components using `useThemeColors`
3. Theme preference is saved to database and AsyncStorage
4. Theme persists across app restarts

## Theme Colors Structure

Theme colors include:
- `orange` / `blue` - Primary/secondary colors
- `primaryGradient` - Array of gradient colors
- `white`, `textPrimary`, `textSecondary`, etc. - Standard colors

All colors are dynamically updated based on selected theme.
