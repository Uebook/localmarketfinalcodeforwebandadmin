# React Native Conversion Notes

## What Has Been Converted

### ✅ Completed
1. **Project Setup**
   - React Native CLI project initialized
   - Dependencies installed (React Navigation, Vector Icons, etc.)

2. **Core Files**
   - `src/types.js` - Type definitions (JSDoc)
   - `src/constants.js` - All constants and data (converted from TypeScript)

3. **Components**
   - `SplashScreen.js` - Fully converted to React Native
   - `LoginScreen.js` - Fully converted to React Native
   - `HomeScreen.js` - Basic home screen structure

4. **Main App**
   - `App.js` - Main navigation structure with React Navigation
   - Bottom tab navigation setup
   - Stack navigation for screens
   - Authentication flow (Splash → Login → Main App)

## What Still Needs Conversion

### Components to Convert
The following components from the web version need to be converted:

1. **Core Components**
   - `Header.js` - Convert div/className to View/StyleSheet
   - `SearchBar.js` - Convert to React Native TextInput
   - `BottomNav.js` - Already handled by React Navigation tabs
   - `CategoryGrid.js` - Convert to FlatList/ScrollView
   - `Sidebar.js` - Convert to Modal or Drawer Navigation

2. **Section Components**
   - `NearbySection.js`
   - `FeaturedSection.js`
   - `HorizontalSection.js`
   - `PromoCarousel.js`
   - `RecentSearches.js`

3. **Screen Components**
   - `SearchResults.js`
   - `VendorDetails.js`
   - `SettingsScreen.js`
   - `VendorRegistration.js`
   - `VendorDashboard.js` (in MyBusiness folder)
   - `HelpSupport.js`
   - `TermsPrivacy.js`
   - `Notifications.js`

4. **Other Components**
   - `EnquiryModal.js`
   - `Chatbot.js`
   - `ThemeController.js`
   - `ListBusinessCTA.js`
   - `Footer.js`

## Key Conversion Patterns

### 1. HTML to React Native
```javascript
// Web (HTML)
<div className="container">
  <h1>Title</h1>
</div>

// React Native
<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
</View>
```

### 2. CSS to StyleSheet
```javascript
// Web (CSS classes)
className="bg-red-500 p-4 rounded-lg"

// React Native (StyleSheet)
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
  },
});
```

### 3. Icons
```javascript
// Web (lucide-react)
import { Store } from 'lucide-react';
<Store className="w-6 h-6" />

// React Native (react-native-vector-icons)
import Icon from 'react-native-vector-icons/Feather';
<Icon name="shopping-bag" size={24} color="#000" />
```

### 4. Navigation
```javascript
// Web (state-based)
const [activeTab, setActiveTab] = useState('home');

// React Native (React Navigation)
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
const Tab = createBottomTabNavigator();
```

### 5. Images
```javascript
// Web
<img src={imageUrl} alt="..." />

// React Native
import { Image } from 'react-native';
<Image source={{ uri: imageUrl }} style={styles.image} />
```

## Next Steps

1. **Convert Remaining Components**
   - Start with simpler components (SearchBar, CategoryGrid)
   - Then move to complex screens (VendorDetails, VendorDashboard)

2. **Add Missing Features**
   - Geolocation (already in package.json)
   - Image picker for vendor registration
   - Proper navigation between screens

3. **Testing**
   - Test on iOS simulator
   - Test on Android emulator
   - Fix any platform-specific issues

4. **Styling Refinement**
   - Match web design as closely as possible
   - Ensure responsive layouts
   - Add proper animations

## Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Notes

- The app uses React Navigation for navigation instead of state-based routing
- Icons use react-native-vector-icons (Feather icons) instead of lucide-react
- All styling uses StyleSheet instead of Tailwind CSS classes
- The app structure follows React Native best practices

