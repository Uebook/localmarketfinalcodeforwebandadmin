import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './Header';
import { useThemeColors } from '../hooks/useThemeColors';

// Import sidebar control from shared utility
import { setSidebarControl, getSidebarControl } from '../utils/sidebarControl';
import { loadUserData, updateUserData } from '../utils/userStorage';
import SearchBar from './SearchBar';
import TopCategoriesGrid from './TopCategoriesGrid';
import NearbySection from './NearbySection';
import HorizontalSection from './HorizontalSection';
import PromoCarousel from './PromoCarousel';
import { getCategories, detectLocation, getMegaSavings, getPriceDrops } from '../services/api';

import DraggableAIButton from './DraggableAIButton';

import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

// New LOKALL sections
import CheapestMarketCard from './CheapestMarketCard';
import NearbyCirclesSection from './NearbyCirclesSection';
import TodayDeals from './TodayDeals';
import PriceDropAlerts from './PriceDropAlerts';
import MegaSavingsSection from './MegaSavingsSection';
import SalesSection from './SalesSection';




const HomeScreen = ({ navigation, route }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [locationState, setLocationState] = useState({
    lat: null,
    lng: null,
    displayLabel: '', // UI string
    city: '', // Technical city name
    circle: '', // Technical circle name
    town: '', // Technical town name
    fullAddress: '',
    loading: true,
    error: null,
  });
  const [categories, setCategories] = useState([]);
  const [megaSavingsData, setMegaSavingsData] = useState([]);
  const [priceDropsData, setPriceDropsData] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // --- Fallback helpers defined at component scope so all functions can access them ---
  const getFallbackFromUser = async () => {
    try {
      const userData = await loadUserData();
      if (userData && (userData.city || userData.location)) {
        const cityStr = userData.location || [userData.city, userData.state].filter(Boolean).join(', ');
        setLocationState({
          lat: userData.lat || null,
          lng: userData.lng || null,
          displayLabel: userData.displayLabel || userData.city || 'Your Area',
          city: userData.city || '',
          circle: userData.circle || '',
          town: userData.town || '',
          fullAddress: cityStr,
          loading: false,
          error: null,
          state: userData.state || '',
        });
        return true;
      }
    } catch (err) {
      console.warn('Could not load user location fallback:', err);
    }
    return false;
  };

  const setAbsoluteFallback = () => {
    setLocationState({
      lat: 31.6340,
      lng: 74.8723,
      displayLabel: 'Amritsar',
      city: 'Amritsar',
      circle: '',
      town: '',
      fullAddress: 'Amritsar, Punjab, India',
      loading: false,
      error: null,
    });
  };

  const handleFallback = async () => {
    const userFallbackSuccess = await getFallbackFromUser();
    if (!userFallbackSuccess) {
      setAbsoluteFallback();
    }
  };


  const fetchLocation = async (manualLocation = null, forceRedetect = false) => {
    if (manualLocation) {
      // Manual selection from Picker
      const displayLabel = manualLocation.circle || manualLocation.town || manualLocation.city || 'Your Area';
      const fullAddress = [
        manualLocation.circle,
        manualLocation.subTehsil,
        manualLocation.tehsil,
        manualLocation.town,
        manualLocation.city,
        manualLocation.state
      ].filter(Boolean).join(', ');

      setLocationState({
        lat: null,
        lng: null,
        displayLabel: displayLabel,
        city: manualLocation.city || '',
        circle: manualLocation.circle || '',
        town: manualLocation.town || '',
        fullAddress: fullAddress,
        loading: false,
        error: null,
        state: manualLocation.state || '',
      });

      // Persist manual choice
      try {
        await updateUserData({
          city: manualLocation.city || '',
          circle: manualLocation.circle || '',
          town: manualLocation.town || '',
          state: manualLocation.state || '',
          location: fullAddress,
          displayLabel: displayLabel
        });
      } catch (err) {
        console.warn('Failed to persist manual location:', err);
      }
      return;
    }

    // Auto-detection logic
    if (forceRedetect) {
      setLocationState(prev => ({ ...prev, loading: true }));
    }

    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    };

    // PRIORITIZE SAVED DATA (Unless forceRedetect is true)
    if (!forceRedetect) {
      const userFallbackSuccess = await getFallbackFromUser();
      if (userFallbackSuccess) {
        return; // Saved data found and used, stop here
      }
    }

    // START AUTO-DETECTION (GPS -> IP Fallback)
    const hasPermission = await requestLocationPermission();
    
    if (hasPermission) {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            console.log('Detecting via GPS...', latitude, longitude);
            const data = await detectLocation(latitude, longitude);
            if (data && data.success) {
              const displayLabel = data.displayLabel || 'Your Area';
              const city = data.address?.city || data.address?.town || '';
              
              setLocationState({
                lat: latitude,
                lng: longitude,
                displayLabel: displayLabel,
                city: city || displayLabel.split(',')[0],
                circle: data.matchedCircle || '',
                town: data.address?.village || data.address?.suburb || '',
                fullAddress: data.address?.display_name || displayLabel,
                loading: false,
                error: null,
                state: data.address?.state || '',
              });
              return;
            }
          } catch (geocodeErr) {
            console.warn("GPS Geocoding failed, trying IP fallback...", geocodeErr);
            handleIpOnlyFallback();
          }
        },
        (error) => {
          console.warn("Geolocation signal failed, trying IP fallback...", error);
          handleIpOnlyFallback();
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      console.log('No GPS permission, trying IP fallback...');
      handleIpOnlyFallback();
    }
  };

  const handleIpOnlyFallback = async () => {
    try {
      const data = await detectLocation(); // No lat/lng triggers IP logic
      if (data && data.success) {
        setLocationState({
          lat: null,
          lng: null,
          displayLabel: data.displayLabel || 'Your Area',
          city: data.city || data.displayLabel?.split(',')[0] || '',
          circle: data.matchedCircle || '',
          town: '',
          fullAddress: data.displayLabel || 'Detected via IP',
          loading: false,
          error: null,
          state: data.state || '',
        });
        return;
      }
    } catch (err) {
      console.warn('IP Fallback detection failed:', err);
    }
    
    handleFallback(); // Ultimate fallback (saved or absolute)
  };


  useEffect(() => {
    fetchLocation();
    loadCategories();
  }, []);

  useEffect(() => {
    if (locationState.city || locationState.circle || locationState.town) {
      loadSectionsData(locationState.city, locationState.circle || locationState.town);
    }
  }, [locationState.city, locationState.circle, locationState.town]);

  const loadSectionsData = async (city, circle) => {
    setLoadingSections(true);
    try {
      const [mega, drops] = await Promise.all([
        getMegaSavings(city, circle).catch(() => []),
        getPriceDrops(city, circle).catch(() => []),
      ]);
      // Guard: always store arrays to prevent .length crashes in child components
      setMegaSavingsData(Array.isArray(mega) ? mega : []);
      setPriceDropsData(Array.isArray(drops) ? drops : []);
    } catch (error) {
      console.error('Error loading sections data:', error);
      setMegaSavingsData([]);
      setPriceDropsData([]);
    } finally {
      setLoadingSections(false);
    }
  };


  const loadCategories = async () => {
    try {
      const data = await getCategories();
      if (data && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleCategorySelect = (categoryName, categoryId) => {
    if (navigation) {
      navigation.navigate('SearchResults', {
        query: categoryName,
        categoryId: categoryId,
        isCategorySearch: true,
      });
    }
  };

  const handleViewAllCategories = () => {
    if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Categories' });
    }
  };

  const handleSearch = (query) => {
    if (navigation && query) {
      navigation.navigate('SearchResults', { query });
    }
  };

  const handleBusinessClick = (business) => {
    if (navigation) {
      navigation.navigate('VendorDetails', { business });
    }
  };

  const handleMenuClick = () => {
    const control = getSidebarControl();
    if (control) {
      control(true);
    }
  };

  const handleProfileClick = () => {
    if (navigation) {
      navigation.navigate('Settings');
    }
  };

  const handleNotificationClick = () => {
    if (navigation) {
      navigation.navigate('Notifications');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.whiteBackground} />

      <Header
        locationState={locationState}
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
        onNotificationClick={handleNotificationClick}
        onLocationRedetect={(manualResult) => {
           if (manualResult && manualResult.city) {
              fetchLocation(manualResult);
           } else {
              fetchLocation(null, true);
           }
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Today's Cheapest Market — Hero Intelligence Card */}
        <CheapestMarketCard 
          navigation={navigation} 
          city={locationState.city} 
          circle={locationState.circle} 
        />

        {/* 2. Large Smart Search Bar */}
        <SearchBar onSearch={handleSearch} navigation={navigation} currentCity={locationState.city} />

        {/* 3. Nearby Circles */}
        <NearbyCirclesSection locationState={locationState} navigation={navigation} />

        {/* 4. Quick Category Icons */}
        <TopCategoriesGrid
          categories={categories.length > 0 ? categories.slice(0, 8) : []}
          onCategorySelect={handleCategorySelect}
          onViewAll={handleViewAllCategories}
        />

        {/* 5. Active Offer & Sale */}
        <SalesSection locationState={locationState} navigation={navigation} />

        {/* 6. Trending Deals */}
        <TodayDeals navigation={navigation} />

        {/* 7. Promo Carousel */}
        <PromoCarousel />

        {/* 8. Verified Nearby Shops */}
        <NearbySection
          onBusinessClick={handleBusinessClick}
          onSeeAll={() => navigation.navigate('SearchResults', { query: 'Verified Shops' })}
          locationState={locationState}
        />

        {/* 9. Price Drop Alerts */}
        <PriceDropAlerts data={priceDropsData} navigation={navigation} />

        {/* 10. Mega Savings: Local vs Online */}
        <MegaSavingsSection data={megaSavingsData} navigation={navigation} />
      </ScrollView>


      <DraggableAIButton onPress={() => navigation.navigate('AIServiceFlow')} />
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  whiteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 100,
    backgroundColor: 'transparent',
  },
});

export default HomeScreen;
