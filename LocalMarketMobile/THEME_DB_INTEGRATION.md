# Theme Database Integration

## ✅ Complete Database Integration

The ThemeProvider component now loads and applies themes **entirely from the database**.

## 🔄 Theme Loading Priority

The app follows this priority order when loading themes:

1. **Global Active Theme** (Highest Priority)
   - Fetches from `/api/themes?active=true`
   - This is the theme set by admin as default for all users
   - Overrides all other preferences

2. **User's Theme Preference**
   - Fetches from `/api/user/theme` with user identifier
   - User's personal theme choice stored in database
   - Only used if no global active theme is set

3. **LocalStorage Fallback**
   - Uses `selectedFestivalTheme` from AsyncStorage
   - Last resort if database is unavailable

4. **Default Theme**
   - Falls back to default theme if nothing else is available

## 📊 Implementation Details

### ThemeProvider Component (`src/components/ThemeProvider.js`)

#### Features:
- ✅ Loads global active theme from database on app start
- ✅ Checks user's theme preference from database
- ✅ Caches themes from database for performance
- ✅ Falls back to constants if theme not found in DB
- ✅ Saves user theme selection to database
- ✅ Applies theme colors dynamically

#### Theme Loading Flow:
```
App Start
  ↓
Load Global Active Theme (DB)
  ↓ (if not found)
Load User Theme Preference (DB)
  ↓ (if not found)
Load from LocalStorage
  ↓ (if not found)
Use Default Theme
```

### SettingsScreen Component (`src/components/SettingsScreen.js`)

#### Features:
- ✅ Loads all themes from database
- ✅ Shows themes from `festival_themes` table
- ✅ Displays user's current theme selection
- ✅ Updates user theme in database when changed
- ✅ Shows loading indicator while fetching

## 🔌 API Endpoints Used

1. **GET** `/api/themes?active=true`
   - Fetches the globally active theme
   - Returns single theme object or array

2. **GET** `/api/themes`
   - Fetches all themes
   - Used for theme selection in settings

3. **GET** `/api/user/theme?userId=...` or `?phone=...` or `?email=...`
   - Fetches user's theme preference
   - Returns `{ theme: 'themeId' }`

4. **PATCH** `/api/user/theme`
   - Updates user's theme preference
   - Body: `{ userId, phone, email, themeId }`

## 📱 Database Schema

### `festival_themes` Table
- `id` (TEXT) - Theme identifier
- `name` (TEXT) - Theme name
- `description` (TEXT) - Theme description
- `icon` (TEXT) - Theme icon emoji
- `colors` (JSONB) - Theme colors object
  - `primary` - Primary color
  - `secondary` - Secondary color
  - `accent` - Accent color
  - `background` - Background color
  - `text` - Text color
- `is_default` (BOOLEAN) - Default theme flag
- `is_active` (BOOLEAN) - Active theme flag (global default)
- `created_at` (TIMESTAMPTZ)

### `users` Table
- `selected_theme` (TEXT) - User's theme preference
- References `festival_themes.id`

## 🎨 Theme Application

When a theme is applied:

1. **Color Mapping**:
   - `colors.primary` → `themeColors.orange`
   - `colors.secondary` → `themeColors.blue`
   - `[primary, secondary]` → `themeColors.primaryGradient`

2. **Storage**:
   - Saved to AsyncStorage for offline access
   - Saved to database for persistence across devices

3. **Context Update**:
   - Updates ThemeContext with new theme and colors
   - All components using `useTheme()` get updated automatically

## 🔄 Theme Change Flow

```
User Selects Theme in Settings
  ↓
setTheme(themeId) called
  ↓
applyTheme(themeId) - Applies theme locally
  ↓
updateUserTheme() - Saves to database
  ↓
Theme applied across app via Context
```

## 🚀 Features

### ✅ Global Theme Override
- Admin can set a global active theme
- All users see the admin-selected theme
- User preferences are overridden by global theme

### ✅ User Theme Persistence
- User's theme choice saved to database
- Persists across devices and sessions
- Syncs with admin panel

### ✅ Theme Caching
- Themes fetched from DB are cached
- Reduces API calls
- Faster theme switching

### ✅ Fallback Support
- Falls back to constants if DB theme not found
- Falls back to localStorage if DB unavailable
- Always has a theme to apply

### ✅ Dynamic Theme Loading
- Loads theme data on-demand if not cached
- Supports custom themes from database
- Works with both predefined and custom themes

## 📝 Usage Example

```javascript
import { useTheme } from '../components/ThemeProvider';

function MyComponent() {
  const { theme, themeColors, setTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: themeColors.orange }}>
      <Text>Current theme: {theme}</Text>
      <Button onPress={() => setTheme('diwali')} title="Switch to Diwali" />
    </View>
  );
}
```

## 🔧 Configuration

### Default Theme
- ID: `'default'`
- Colors: Red & Orange (from COLORS constant)
- Always available as fallback

### Custom Themes
- Can be created in admin panel
- Stored in `festival_themes` table
- Automatically available in mobile app
- Supports custom colors and icons

---

**Last Updated**: January 2024
**Status**: ✅ Themes fully integrated with database
