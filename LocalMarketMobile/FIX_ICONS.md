# Fix Vector Icons - Step by Step Guide

## The Problem
Icons are showing as red squares with X's because the font files aren't properly linked to the app.

## Quick Fix (Choose One Method)

### Method 1: Auto-link Assets (Recommended)

```bash
cd /Users/vansh/ReactProject/LocalMarket/LocalMarketMobile

# Link assets automatically
npx react-native-asset

# For Android - Clean and rebuild
cd android
./gradlew clean
cd ..

# Rebuild the app
npm run android
```

### Method 2: Manual Font Copy (If Method 1 doesn't work)

**For Android:**

```bash
cd /Users/vansh/ReactProject/LocalMarket/LocalMarketMobile

# Create fonts directory
mkdir -p android/app/src/main/assets/fonts

# Copy fonts (adjust path if needed)
cp node_modules/react-native-vector-icons/Fonts/*.ttf android/app/src/main/assets/fonts/

# Or if Fonts folder doesn't exist, try:
cp node_modules/@react-native-vector-icons/fonts/*.ttf android/app/src/main/assets/fonts/ 2>/dev/null || \
cp node_modules/react-native-vector-icons/fonts/*.ttf android/app/src/main/assets/fonts/ 2>/dev/null || \
echo "Please find and copy .ttf files manually"

# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

**For iOS:**

```bash
cd /Users/vansh/ReactProject/LocalMarket/LocalMarketMobile

# Install pods (this should link fonts automatically)
cd ios
pod install
cd ..

# Rebuild
npm run ios
```

### Method 3: Use react-native link (Older method)

```bash
cd /Users/vansh/ReactProject/LocalMarket/LocalMarketMobile

# Link the package
npx react-native link react-native-vector-icons

# Rebuild
npm run android  # or npm run ios
```

## After Linking - Important Steps

1. **Stop Metro bundler** if it's running (Ctrl+C)

2. **Clear cache and restart:**
   ```bash
   npm start -- --reset-cache
   ```

3. **In a new terminal, rebuild:**
   ```bash
   # For Android
   cd android && ./gradlew clean && cd .. && npm run android
   
   # For iOS
   cd ios && pod install && cd .. && npm run ios
   ```

## Verify Fonts Are Linked

**Android:**
Check that fonts exist:
```bash
ls -la android/app/src/main/assets/fonts/
```
You should see Feather.ttf and other .ttf files.

**iOS:**
1. Open Xcode
2. Check that fonts appear in the project navigator under "Fonts" or in "Info.plist" → "Fonts provided by application"

## If Icons Still Don't Show

1. **Check icon names** - Make sure you're using valid Feather icon names
2. **Restart Metro bundler** with cache cleared
3. **Uninstall and reinstall the app** on your device/emulator
4. **Check console for errors** - Look for font loading errors

## Test Icon

Add this test component to verify icons work:

```javascript
import Icon from 'react-native-vector-icons/Feather';

// Test - this should show a checkmark
<Icon name="check" size={24} color="#000" />
```

If this shows correctly, your fonts are working!



