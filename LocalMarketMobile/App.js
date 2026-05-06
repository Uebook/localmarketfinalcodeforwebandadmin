import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { saveUserData, loadUserData, clearUserData, isUserAuthenticated } from './src/utils/userStorage';
import { ThemeProvider } from './src/components/ThemeProvider';
import { useThemeColors } from './src/hooks/useThemeColors';
import { getSavedVendorIds, clearSavedVendors } from './src/utils/savedVendors';

import COLORS_IMPORT from './src/constants/colors';

// Debug logging for COLORS import
console.log('[App] COLORS_IMPORT:', !!COLORS_IMPORT, 'Type:', typeof COLORS_IMPORT);

const DEFAULT_FALLBACK = {
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

// Extremely safe initialization to prevent "Property 'COLORS' doesn't exist"
const COLORS = (function() {
  try {
    if (!COLORS_IMPORT) return DEFAULT_FALLBACK;
    // Handle both default export and named export if present
    const base = COLORS_IMPORT.COLORS || COLORS_IMPORT.default || COLORS_IMPORT;
    return { ...DEFAULT_FALLBACK, ...base };
  } catch (e) {
    console.error('[App] Error initializing COLORS fallback:', e);
    return DEFAULT_FALLBACK;
  }
})();

// Import screens
import SplashScreen from './src/components/SplashScreen';
import WelcomeAnimation from './src/components/WelcomeAnimation';
import LoginScreen from './src/components/LoginScreen';
import RegisterScreen from './src/components/RegisterScreen';
import ForgotPasswordScreen from './src/components/ForgotPasswordScreen';
import HomeScreen from './src/components/HomeScreen';
import SearchScreen from './src/components/SearchScreen';
import SearchResults from './src/components/SearchResults';
import VendorDetails from './src/components/VendorDetails';
import SettingsScreen from './src/components/SettingsScreen';
import HelpSupport from './src/components/HelpSupport';
import TermsPrivacy from './src/components/TermsPrivacy';
import Notifications from './src/components/Notifications';
import VendorRegistration from './src/components/VendorRegistration';
import VendorDashboard from './src/components/VendorDashboard';
import VendorAnalyticsScreen from './src/components/VendorAnalyticsScreen';
import VendorCatalogScreen from './src/components/VendorCatalogScreen';
import VendorEnquiriesScreen from './src/components/VendorEnquiriesScreen';
import VendorReviewsScreen from './src/components/VendorReviewsScreen';
import VendorProfileScreen from './src/components/VendorProfileScreen';
import VendorOffersScreen from './src/components/VendorOffersScreen';
import BulkPriceUpdate from './src/components/BulkPriceUpdate';
import PaymentManagement from './src/components/PaymentManagement';
import ServiceProviderRegistration from './src/components/ServiceProviderRegistration';
import Sidebar from './src/components/Sidebar';
import OffersScreen from './src/components/OffersScreen';
import SavedScreen from './src/components/SavedScreen';
import CategoriesScreen from './src/components/CategoriesScreen';
import ProductDetailsScreen from './src/components/ProductDetailsScreen';
import AIServiceFlow from './src/components/AIServiceFlow';
import MarketScreen from './src/components/MarketScreen';
import CartScreen from './src/components/CartScreen';
import Header from './src/components/Header';
import { setVendorSidebarControl } from './src/utils/vendorSidebarControl';

import { setSidebarControl } from './src/utils/sidebarControl';
import { getVendorProfile } from './src/services/api';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Vendor-specific tabs
function VendorTabs({ vendorData, setVendorData, initialRouteName = 'Analytics' }) {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => {
        let iconName;
        if (route.name === 'Analytics') iconName = 'activity';
        else if (route.name === 'Catalogue') iconName = 'package';
        else if (route.name === 'Enquiries') iconName = 'message-square';
        else if (route.name === 'Reviews') iconName = 'star';
        else if (route.name === 'Profile') iconName = 'user';

        return {
          tabBarIcon: ({ focused, color, size }) => (
            <View style={[
              styles.premiumTabIconContainer,
              focused && { backgroundColor: '#FFF4EC' }
            ]}>
              <Icon 
                name={iconName} 
                size={20} 
                color={focused ? '#F97316' : '#94A3B8'} 
              />
              {focused && <View style={styles.tabActiveIndicator} />}
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={[
              styles.premiumTabLabel,
              { color: focused ? '#F97316' : '#94A3B8', fontWeight: focused ? '800' : '600' }
            ]}>
              {route.name}
            </Text>
          ),
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 20,
            left: 16,
            right: 16,
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            height: 64,
            paddingBottom: 0,
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
          },
          tabBarItemStyle: {
            height: 64,
            paddingVertical: 8,
          },
          tabBarActiveTintColor: '#F97316',
          tabBarInactiveTintColor: '#94A3B8',
        };
      }}
    >
      <Tab.Screen name="Analytics">
        {(props) => <VendorAnalyticsScreen {...props} vendorData={vendorData} />}
      </Tab.Screen>
      <Tab.Screen name="Catalogue">
        {(props) => <VendorCatalogScreen {...props} vendorData={vendorData} setVendorData={setVendorData} />}
      </Tab.Screen>
      <Tab.Screen name="Enquiries">
        {(props) => <VendorEnquiriesScreen {...props} vendorData={vendorData} />}
      </Tab.Screen>
      <Tab.Screen name="Reviews">
        {(props) => <VendorReviewsScreen {...props} vendorData={vendorData} setVendorData={setVendorData} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => <VendorProfileScreen {...props} vendorData={vendorData} setVendorData={setVendorData} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function MainTabs({ route, userRole, vendorData, setVendorData, userData, setUserData, savedBusinessIds, setSavedBusinessIds, locationState, onLocationChange, onRedetect, onMenuClick, onProfileClick, onNotificationClick, handleLogout, initialRouteName = 'Home' }) {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const activeRouteName = getFocusedRouteNameFromRoute(route) || initialRouteName;
  const showGlobalHeader = activeRouteName !== 'Profile';
  
  return (
    <View style={{ flex: 1 }}>
      {showGlobalHeader && (
        <Header 
          locationState={locationState}
          onMenuClick={onMenuClick}
          onProfileClick={onProfileClick}
          onNotificationClick={onNotificationClick}
          onLocationChange={onLocationChange}
          onRedetect={onRedetect}
        />
      )}
      <Tab.Navigator
        initialRouteName={initialRouteName}
        screenOptions={({ route }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Categories') {
            iconName = 'grid';
          } else if (route.name === 'Compare') {
            iconName = 'shuffle';
          } else if (route.name === 'Saved') {
            iconName = 'bookmark';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }

          return {
            tabBarIcon: ({ focused }) => {
              return <Icon name={iconName} size={22} color={focused ? themeColors.orange : themeColors.textMuted} />;
            },
            tabBarLabel: route.name,
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '700',
              marginTop: 2,
            },
            tabBarActiveTintColor: themeColors.orange,
            tabBarInactiveTintColor: themeColors.textMuted,
            headerShown: false,
            tabBarStyle: [
              styles.tabBar,
              {
                paddingBottom: Math.max(insets.bottom, 8),
                height: 56 + Math.max(insets.bottom, 8),
                backgroundColor: themeColors.white,
                borderTopWidth: 1,
                borderTopColor: themeColors.divider,
              }
            ],
            tabBarItemStyle: styles.tabBarItem,
          };
        }}
      >
        <Tab.Screen name="Home">
          {(props) => <HomeScreen {...props} locationState={locationState} setLocationState={onLocationChange} />}
        </Tab.Screen>
        <Tab.Screen name="Categories">
          {(props) => <CategoriesScreen {...props} locationState={locationState} />}
        </Tab.Screen>
        <Tab.Screen name="Compare">
          {(props) => <SearchScreen {...props} locationState={locationState} />}
        </Tab.Screen>
        <Tab.Screen name="Saved">
          {(props) => (
            <SavedScreen
              {...props}
              savedIds={savedBusinessIds}
              onToggleSave={(id) => {
                setSavedBusinessIds(prev =>
                  prev.includes(id) ? prev.filter(savedId => savedId !== id) : [...prev, id]
                );
              }}
            />
          )}
        </Tab.Screen>
         <Tab.Screen name="Profile">
            {(props) => (
               <SettingsScreen
                  {...props}
                  currentTheme="default"
                  userRole={userRole}
                  profileData={userRole === 'vendor' ? vendorData : (userData || { name: 'User', mobile: '', location: '', email: '' })}
                  savedBusinessIds={savedBusinessIds}
                  onUpdateProfile={(data) => {
                     if (userRole === 'vendor') {
                        setVendorData(data);
                     } else {
                        setUserData(prev => ({ ...prev, ...data }));
                     }
                  }}
                  onLogout={handleLogout}
               />
            )}
         </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUserRegistering, setIsUserRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [userData, setUserData] = useState(null);
  const [savedBusinessIds, setSavedBusinessIds] = useState([]);
  const [initialRoute, setInitialRoute] = useState('Home');
  const [locationState, setLocationState] = useState({
    lat: 31.6340,
    lng: 74.8723,
    displayLabel: 'Amritsar, India',
    city: 'Amritsar',
    circle: '',
    town: '',
    fullAddress: 'Amritsar, India',
    loading: false,
    error: null,
  });
  const navigationRef = useRef(null);

  // Set sidebar control for all screens - set immediately
  useEffect(() => {
    setSidebarControl(setIsSidebarOpen);
    setVendorSidebarControl(setIsSidebarOpen);
  }, []);

  // Update sidebar control when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      setSidebarControl(setIsSidebarOpen);
      setVendorSidebarControl(setIsSidebarOpen);
    }
  }, [isAuthenticated]);

  // Load saved user data and saved vendors on app start
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load saved vendors
        const savedIds = await getSavedVendorIds();
        setSavedBusinessIds(savedIds);

        // Load saved user data
        const isAuth = await isUserAuthenticated();
        if (isAuth) {
          const savedUserData = await loadUserData();
          if (savedUserData && savedUserData.id) {
            setUserData(savedUserData);
            setIsAuthenticated(true);
            setUserRole(savedUserData.role || 'customer');

            if (savedUserData.role === 'vendor') {
              setInitialRoute('Analytics');
              // Fetch full vendor profile
              try {
                const fullProfile = await getVendorProfile(savedUserData.id);
                if (fullProfile && fullProfile.vendor) {
                  setVendorData({
                    ...fullProfile.vendor,
                    products: fullProfile.products || [],
                    enquiries: fullProfile.enquiries || [],
                    reviews: fullProfile.reviews || [],
                  });
                } else {
                  console.warn('Vendor profile not found for ID:', savedUserData.id);
                  setVendorData(null);
                }
              } catch (profileError) {
                console.error('Error fetching vendor profile on boot:', profileError);
                setVendorData(null);
              }
            } else {
              setInitialRoute('Home');
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, []);


  const handleLogin = async (role, userDataParam = null) => {
    setUserRole(role);
    setIsAuthenticated(true);

    // Save user data to AsyncStorage
    if (userDataParam) {
      try {
        await saveUserData(userDataParam, role);
        setUserData(userDataParam);
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    }

    // Set initial route based on role
    if (role === 'vendor') {
      setInitialRoute('Analytics');
      // Fetch full vendor profile
      try {
        const fullProfile = await getVendorProfile(userDataParam.id);
        if (fullProfile && fullProfile.vendor) {
          setVendorData({
            ...fullProfile.vendor,
            products: fullProfile.products || [],
            enquiries: fullProfile.enquiries || [],
            reviews: fullProfile.reviews || [],
          });
        } else {
          console.warn('Vendor profile not found for login ID:', userDataParam.id);
          setVendorData(null);
        }
      } catch (profileError) {
        console.error('Error fetching vendor profile on login:', profileError);
        setVendorData(null);
      }
    } else {
      setInitialRoute('Home');
    }
  };

  const handleUserRegister = async (userDataParam) => {
    // After user registration, automatically log them in
    setIsUserRegistering(false);

    // Save user data to AsyncStorage
    if (userDataParam) {
      try {
        await saveUserData(userDataParam, 'customer');
        setUserData(userDataParam);
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    }

    handleLogin('customer', userDataParam);
  };

  const handleLogout = async () => {
    // Clear all persistent data from AsyncStorage
    try {
      await clearUserData();
      await clearSavedVendors();
      // Clear any other app-level async data if needed

      setUserData(null);
      setVendorData(null);
      setSavedBusinessIds([]);
    } catch (error) {
      console.error('Error clearing data on logout:', error);
    }

    setIsAuthenticated(false);
    setUserRole(null);
    setIsSidebarOpen(false);
    setInitialRoute('Home');
  };

  const handleSidebarNavigation = (tab) => {
    console.log('Sidebar navigation:', tab, 'User role:', userRole);
    setIsSidebarOpen(false);

    if (tab === 'logout') {
      handleLogout();
      return;
    }

    if (tab === 'register-business') {
      setIsRegistering(true);
      return;
    }

    if (tab === 'settings') {
      navigationRef.current?.navigate('Settings');
      return;
    }

    if (tab === 'help') {
      navigationRef.current?.navigate('HelpSupport');
      return;
    }

    if (tab === 'terms') {
      navigationRef.current?.navigate('TermsPrivacy');
      return;
    }

    if (userRole === 'vendor') {
      // Vendor navigation
      if (tab === 'business-analytics') {
        navigationRef.current?.navigate('VendorTabs', { screen: 'Analytics' });
      } else if (tab === 'business-products' || tab === 'business-add-product' || tab === 'business-add-service') {
        navigationRef.current?.navigate('VendorTabs', { screen: 'Catalogue' });
      } else if (tab === 'business-enquiries') {
        navigationRef.current?.navigate('VendorTabs', { screen: 'Enquiries' });
      } else if (tab === 'business-offers') {
        navigationRef.current?.navigate('VendorTabs', { screen: 'Analytics' });
      } else if (tab === 'business-details') {
        navigationRef.current?.navigate('VendorTabs', { screen: 'Profile' });
      } else if (tab === 'payment-management') {
        navigationRef.current?.navigate('PaymentManagement');
      }
    } else {
      // Customer navigation - navigate to nested tab navigator
      if (tab === 'home') {
        navigationRef.current?.navigate('MainTabs', {
          screen: 'Home',
        });
      } else if (tab === 'saved') {
        navigationRef.current?.navigate('MainTabs', {
          screen: 'Saved',
        });
      } else if (tab === 'categories') {
        navigationRef.current?.navigate('MainTabs', {
          screen: 'Categories',
        });
      }
    }
  };

  const handleRegistrationComplete = (newVendor) => {
    setVendorData(newVendor);
    setIsRegistering(false);
  };

  if (showSplash) {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          <WelcomeAnimation onComplete={() => setShowSplash(false)} />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }


  if (isUserRegistering) {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          <RegisterScreen
            onRegister={handleUserRegister}
            onBack={() => setIsUserRegistering(false)}
          />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  if (isRegistering) {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <VendorRegistration
            onComplete={handleRegistrationComplete}
            onCancel={() => setIsRegistering(false)}
          />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    if (isForgotPassword) {
      return (
        <ThemeProvider>
          <SafeAreaProvider>
            <StatusBar barStyle="light-content" />
            <ForgotPasswordScreen 
              onBack={() => setIsForgotPassword(false)} 
            />
          </SafeAreaProvider>
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          <LoginScreen
            onLogin={handleLogin}
            onForgotPassword={() => setIsForgotPassword(true)}
            onRegister={(isVendor) => {
              if (isVendor) {
                setIsRegistering(true);
              } else {
                setIsUserRegistering(true);
              }
            }}
          />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userRole === 'vendor' ? (
              <Stack.Screen name="VendorTabs">
                {(props) => (
                  <VendorTabs
                    {...props}
                    vendorData={vendorData}
                    setVendorData={setVendorData}
                    initialRouteName={initialRoute}
                  />
                )}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="MainTabs">
                {(props) => (
                  <MainTabs
                    {...props}
                    userRole={userRole}
                    vendorData={vendorData}
                    setVendorData={setVendorData}
                    savedBusinessIds={savedBusinessIds}
                    setSavedBusinessIds={setSavedBusinessIds}
                     locationState={locationState}
                     onLocationChange={setLocationState}
                     onRedetect={() => {
                       // Safe re-detect: set loading state, then trigger GPS
                       setLocationState(prev => ({ ...prev, loading: true }));
                       import('./src/services/locationApi').then(({ detectLocation }) => {
                         import('react-native').then(({ PermissionsAndroid, Platform }) => {
                           const doDetect = async () => {
                             try {
                               let hasPermission = true;
                               if (Platform.OS === 'android') {
                                 const granted = await PermissionsAndroid.request(
                                   PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                                 );
                                 hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
                               }
                               if (hasPermission) {
                                 const Geolocation = require('@react-native-community/geolocation').default;
                                 Geolocation.getCurrentPosition(
                                   async (pos) => {
                                     try {
                                       const data = await detectLocation(pos.coords.latitude, pos.coords.longitude);
                                       if (data && data.success) {
                                         setLocationState({
                                           lat: pos.coords.latitude,
                                           lng: pos.coords.longitude,
                                           displayLabel: data.displayLabel || 'Your Area',
                                           city: data.address?.city || data.address?.town || '',
                                           circle: data.matchedCircle || '',
                                           town: data.address?.village || '',
                                           fullAddress: data.address?.display_name || data.displayLabel || '',
                                           loading: false,
                                           error: null,
                                           state: data.address?.state || '',
                                         });
                                         return;
                                       }
                                     } catch (e) {}
                                     // GPS geocoding failed, try IP
                                     try {
                                       const ipData = await detectLocation();
                                       if (ipData && ipData.success) {
                                         setLocationState(prev => ({ ...prev, displayLabel: ipData.displayLabel || prev.displayLabel, city: ipData.city || prev.city, loading: false }));
                                       } else {
                                         setLocationState(prev => ({ ...prev, loading: false }));
                                       }
                                     } catch(e) { setLocationState(prev => ({ ...prev, loading: false })); }
                                   },
                                   async () => {
                                     // GPS signal failed, try IP
                                     try {
                                       const ipData = await detectLocation();
                                       if (ipData && ipData.success) {
                                         setLocationState(prev => ({ ...prev, displayLabel: ipData.displayLabel || prev.displayLabel, city: ipData.city || prev.city, loading: false }));
                                       } else {
                                         setLocationState(prev => ({ ...prev, loading: false }));
                                       }
                                     } catch(e) { setLocationState(prev => ({ ...prev, loading: false })); }
                                   },
                                   { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
                                 );
                               } else {
                                 // No permission, try IP
                                 const ipData = await detectLocation().catch(() => null);
                                 if (ipData && ipData.success) {
                                   setLocationState(prev => ({ ...prev, displayLabel: ipData.displayLabel || prev.displayLabel, city: ipData.city || prev.city, loading: false }));
                                 } else {
                                   setLocationState(prev => ({ ...prev, loading: false }));
                                 }
                               }
                             } catch(e) {
                               setLocationState(prev => ({ ...prev, loading: false }));
                             }
                           };
                           doDetect();
                         });
                       }).catch(() => setLocationState(prev => ({ ...prev, loading: false })));
                     }}
                     onMenuClick={() => setIsSidebarOpen(true)}
                     onProfileClick={() => navigationRef.current?.navigate('Settings')}
                     onNotificationClick={() => navigationRef.current?.navigate('Notifications')}
                     userData={userData}
                     setUserData={setUserData}
                     handleLogout={handleLogout}
                     initialRouteName={initialRoute}
                  />
                )}
              </Stack.Screen>
            )}
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="SearchResults">
              {(props) => (
                <SearchResults
                  {...props}
                  savedBusinessIds={savedBusinessIds}
                  setSavedBusinessIds={setSavedBusinessIds}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="MarketScreen" component={MarketScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AIServiceFlow" component={AIServiceFlow} options={{ headerShown: false }} />
            <Stack.Screen name="VendorDetails" options={{ headerShown: false }}>
              {(props) => {
                const business = props.route.params?.business || props.route.params?.vendor;
                return (
                  <VendorDetails
                    {...props}
                    business={business}
                    savedBusinessIds={savedBusinessIds}
                    setSavedBusinessIds={setSavedBusinessIds}
                  />
                );
              }}
            </Stack.Screen>
            <Stack.Screen name="VendorOffers">
              {(props) => (
                <VendorOffersScreen
                  {...props}
                  vendorData={vendorData}
                  setVendorData={setVendorData}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="BulkPriceUpdate">
              {(props) => (
                <BulkPriceUpdate
                  {...props}
                  route={{
                    ...props.route,
                    params: {
                      ...props.route?.params,
                      vendorProducts: vendorData?.products || [],
                    }
                  }}
                  vendorProducts={vendorData?.products || []}
                  onUpdatePrices={() => {
                    // In production, this would refresh vendor data from backend
                    console.log('Prices updated');
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="PaymentManagement">
              {(props) => (
                <PaymentManagement
                  {...props}
                  vendorData={vendorData}
                  onUpdateVendor={setVendorData}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Settings">
              {(props) => (
                <SettingsScreen
                   {...props}
                   currentTheme="default"
                  userRole={userRole}
                  profileData={userRole === 'vendor' ? vendorData : (userData || { name: 'User', mobile: '', location: '', email: '' })}
                  onUpdateProfile={(data) => {
                    if (userRole === 'vendor') {
                      setVendorData(data);
                    } else if (userData) {
                      setUserData({ ...userData, ...data });
                    }
                  }}
                  onLogout={handleLogout}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="HelpSupport" component={HelpSupport} />
            <Stack.Screen name="TermsPrivacy" component={TermsPrivacy} />
            <Stack.Screen name="Notifications">
              {(props) => (
                <Notifications
                  {...props}
                  onClose={() => navigationRef.current?.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
            <Stack.Screen name="VendorRegistration">
              {(props) => (
                <VendorRegistration
                  {...props}
                  onComplete={handleRegistrationComplete}
                  onCancel={() => setIsRegistering(false)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ServiceProviderRegistration">
              {(props) => (
                <ServiceProviderRegistration
                  {...props}
                  onComplete={handleRegistrationComplete}
                  onCancel={() => setIsRegistering(false)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="VendorDashboard">
              {(props) => (
                <VendorDashboard
                  {...props}
                  vendor={vendorData}
                  onUpdateVendor={setVendorData}
                  isVendor={userRole === 'vendor'}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigate={handleSidebarNavigation}
          userRole={userRole}
          userName={userRole === 'vendor' ? (vendorData?.name || 'Vendor') : (userData?.name || userData?.full_name || 'User')}
          userEmail={userRole === 'vendor' ? (vendorData?.email || '') : (userData?.email || '')}
          userLocation={userRole === 'vendor' ? (vendorData?.address || '') : (locationState.displayLabel || locationState.fullAddress || 'Amritsar, India')}
        />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  premiumTabIconContainer: {
    width: 44,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  premiumTabLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabActiveIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F97316',
  },
  activeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.orange,
    marginTop: 2,
  },
  percentageIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.orange,
  },
  percentageIconInactive: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});

export default App;

