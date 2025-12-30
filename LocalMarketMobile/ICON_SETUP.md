# Vector Icons Setup Guide

## Issues Fixed

1. ✅ All direct icon name usages now go through `getIconName()` utility
2. ✅ Added missing icon mappings (Share2, MoreVertical, CheckCircle, etc.)
3. ✅ Added font configuration to iOS Info.plist

## Required Steps to Fix Icons

### For iOS:

1. **The Info.plist has been updated** with UIAppFonts array. Now you need to:

2. **Link the fonts** (if not auto-linked):
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Rebuild the app**:
   ```bash
   npm run ios
   ```

### For Android:

1. **The fonts should auto-link**, but if icons still don't show:

2. **Add to android/app/build.gradle** (if not already there):
   ```gradle
   apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
   ```

3. **Rebuild the app**:
   ```bash
   npm run android
   ```

### Alternative: Manual Font Linking

If auto-linking doesn't work, you can manually copy fonts:

**For iOS:**
1. Open Xcode
2. Right-click on your project → "Add Files to [ProjectName]"
3. Navigate to `node_modules/react-native-vector-icons/Fonts`
4. Select all `.ttf` files
5. Make sure "Copy items if needed" is checked
6. Add to target: LocalMarketMobile

**For Android:**
1. Copy fonts from `node_modules/react-native-vector-icons/Fonts/` to `android/app/src/main/assets/fonts/`
2. Rebuild the app

## Verification

After rebuilding, icons should display correctly. If they still don't show:

1. **Check icon names** - Make sure all icons use `getIconName()` utility
2. **Verify font files** - Check that font files exist in the project
3. **Clear cache and rebuild**:
   ```bash
   # Clear Metro cache
   npm start -- --reset-cache
   
   # For iOS
   cd ios && pod install && cd .. && npm run ios
   
   # For Android
   cd android && ./gradlew clean && cd .. && npm run android
   ```

## Icon Usage Pattern

Always use the `getIconName()` utility:

```javascript
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';

// ✅ Correct
<Icon name={getIconName('Menu')} size={24} color="#000" />

// ❌ Wrong - Don't use direct names
<Icon name="menu" size={24} color="#000" />
```

## Troubleshooting

If icons show as squares or question marks:

1. **Font not loaded**: Rebuild the app after adding fonts
2. **Wrong icon name**: Check Feather icon names at https://feathericons.com/
3. **Cache issue**: Clear Metro bundler cache and rebuild
4. **Platform-specific**: Some icons might render differently on iOS vs Android




