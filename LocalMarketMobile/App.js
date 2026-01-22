import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { saveUserData, loadUserData, clearUserData, isUserAuthenticated } from './src/utils/userStorage';
import { ThemeProvider } from './src/components/ThemeProvider';
import { getSavedVendorIds } from './src/utils/savedVendors';

// Import COLORS with safe fallback - use require to avoid Metro bundler issues
let COLORS_SAFE = {};
try {
  const colorsModule = require('./src/constants/colors');
  COLORS_SAFE = colorsModule.COLORS || colorsModule.default || {};
} catch (error) {
  console.error('Error loading COLORS in App.js:', error);
  // Fallback colors if import fails
  COLORS_SAFE = {
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
}

// Import screens
import SplashScreen from './src/components/SplashScreen';
import LoginScreen from './src/components/LoginScreen';
import RegisterScreen from './src/components/RegisterScreen';
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
import { INITIAL_VENDOR_DATA } from './src/constants';
import { setVendorSidebarControl } from './src/utils/vendorSidebarControl';
import { setSidebarControl } from './src/utils/sidebarControl';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Vendor-specific tabs
function VendorTabs({ vendorData, setVendorData, initialRouteName = 'Analytics' }) {
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => {
        let iconName;
        if (route.name === 'Analytics') {
          iconName = 'activity';
        } else if (route.name === 'Catalog') {
          iconName = 'package';
        } else if (route.name === 'Enquiries') {
          iconName = 'message-square';
        } else if (route.name === 'Reviews') {
          iconName = 'star';
        } else if (route.name === 'Profile') {
          iconName = 'user';
        }

        return {
          tabBarIcon: ({ focused }) => {
            return <Icon name={iconName} size={22} color={focused ? COLORS_SAFE.orange : COLORS_SAFE.textMuted} />;
          },
          tabBarLabel: route.name,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarActiveTintColor: COLORS_SAFE.textPrimary,
          tabBarInactiveTintColor: COLORS_SAFE.textMuted,
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
          tabBarButton: (props) => {
            const { children, onPress } = props;

            return (
              <TouchableOpacity
                {...props}
                onPress={onPress}
                style={[styles.tabButton, props.style]}
                activeOpacity={0.7}
              >
                {children}
              </TouchableOpacity>
            );
          },
        };
      }}
    >
      <Tab.Screen name="Analytics">
        {(props) => (
          <VendorAnalyticsScreen {...props} vendorData={vendorData} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Catalog">
        {(props) => (
          <VendorCatalogScreen {...props} vendorData={vendorData} setVendorData={setVendorData} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Enquiries">
        {(props) => (
          <VendorEnquiriesScreen {...props} vendorData={vendorData} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Reviews">
        {(props) => (
          <VendorReviewsScreen {...props} vendorData={vendorData} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => (
          <VendorProfileScreen {...props} vendorData={vendorData} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function MainTabs({ userRole, vendorData, setVendorData, savedBusinessIds, setSavedBusinessIds, initialRouteName = 'Home' }) {
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Categories') {
          iconName = 'grid';
        } else if (route.name === 'Search') {
          iconName = 'search';
        } else if (route.name === 'Offers') {
          iconName = 'tag';
        } else if (route.name === 'Saved') {
          iconName = 'bookmark';
        } else if (route.name === 'Business') {
          iconName = 'briefcase';
        }

        return {
          tabBarIcon: ({ focused }) => {
            // Special handling for Offers tab with percentage symbol
            if (route.name === 'Offers') {
              return <Text style={focused ? styles.percentageIcon : styles.percentageIconInactive}>%</Text>;
            }
            return <Icon name={iconName} size={22} color={focused ? COLORS_SAFE.orange : COLORS_SAFE.textMuted} />;
          },
          tabBarLabel: route.name,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarActiveTintColor: COLORS_SAFE.textPrimary,
          tabBarInactiveTintColor: COLORS_SAFE.textMuted,
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
          tabBarButton: (props) => {
            const { children, onPress } = props;

            return (
              <TouchableOpacity
                {...props}
                onPress={onPress}
                style={[styles.tabButton, props.style]}
                activeOpacity={0.7}
              >
                {children}
              </TouchableOpacity>
            );
          },
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      {userRole === 'vendor' && (
        <Tab.Screen name="Business">
          {(props) => {
            const routeParams = props.route?.params || {};
            return (
              <VendorDashboard
                {...props}
                vendor={vendorData}
                onUpdateVendor={setVendorData}
                isVendor={true}
                targetTab={routeParams.targetTab}
                launchAddProduct={routeParams.launchAddProduct}
                launchAddProductType={routeParams.launchAddProductType}
              />
            );
          }}
        </Tab.Screen>
      )}
      <Tab.Screen name="Offers">
        {(props) => (
          <OffersScreen
            {...props}
            locationState={{ city: 'Delhi, India', lat: null, lng: null, loading: false, error: null }}
          />
        )}
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
    </Tab.Navigator>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [vendorData, setVendorData] = useState(INITIAL_VENDOR_DATA);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUserRegistering, setIsUserRegistering] = useState(false);
  const [savedBusinessIds, setSavedBusinessIds] = useState([]);
  const [initialRoute, setInitialRoute] = useState('Home');
  const [userData, setUserData] = useState(null);
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

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
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
    // Clear user data from AsyncStorage
    try {
      await clearUserData();
      setUserData(null);
    } catch (error) {
      console.error('Error clearing user data:', error);
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
        navigationRef.current?.navigate('VendorTabs', { screen: 'Catalog' });
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
          <SplashScreen />
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
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          <LoginScreen
            onLogin={handleLogin}
            vendorActivationStatus={vendorData.activationStatus}
            onSimulateAdminApproval={() =>
              setVendorData((prev) => ({ ...prev, activationStatus: 'Active' }))
            }
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
            <Stack.Screen name="VendorDetails">
              {(props) => {
                const business = props.route.params?.business || props.route.params?.vendor;
                return (
                  <VendorDetails
                    {...props}
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
          userName={userRole === 'vendor' ? vendorData.name : 'User'}
          userLocation={userRole === 'vendor' ? vendorData.address : 'Delhi, India'}
        />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS_SAFE.white,
    borderTopWidth: 0,
    height: 65,
    paddingTop: 6,
    paddingBottom: 6,
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
  activeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS_SAFE.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS_SAFE.orange,
    shadowColor: COLORS_SAFE.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS_SAFE.orange,
    marginTop: 2,
  },
  percentageIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS_SAFE.orange,
  },
  percentageIconInactive: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS_SAFE.textMuted,
  },
});

export default App;

