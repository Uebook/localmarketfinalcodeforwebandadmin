import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './Header';
import { useThemeColors } from '../hooks/useThemeColors';

// Import sidebar control from shared utility
import { setSidebarControl, getSidebarControl } from '../utils/sidebarControl';
import { loadUserData } from '../utils/userStorage';
import SearchBar from './SearchBar';
import TopCategoriesGrid from './TopCategoriesGrid';
import NearbySection from './NearbySection';
import HorizontalSection from './HorizontalSection';
import PromoCarousel from './PromoCarousel';
import { getCategories, reverseGeocode } from '../services/api';
import DraggableAIButton from './DraggableAIButton';

// New LOKALL sections
import CheapestMarketCard from './CheapestMarketCard';
import FindCheapestButton from './FindCheapestButton';
import PopularSearches from './PopularSearches';
import NearbyMarketsSection from './NearbyMarketsSection';
import TodayDeals from './TodayDeals';
import PriceDropAlerts from './PriceDropAlerts';

import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

const HomeScreen = ({ navigation, route }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [locationState, setLocationState] = useState({
    lat: null,
    lng: null,
    city: '',
    loading: true,
    error: null,
  });
  const [categories, setCategories] = useState([]);

  const fetchLocation = async (forceRedetect = false) => {
    if (forceRedetect) {
      setLocationState(prev => ({ ...prev, loading: true }));
    }

    const getFallbackFromUser = async () => {
      try {
        const userData = await loadUserData();
        if (userData && (userData.location || userData.city)) {
          const cityStr = userData.location || [userData.city, userData.state].filter(Boolean).join(', ');
          setLocationState({
            lat: userData.lat || null,
            lng: userData.lng || null,
            city: cityStr,
            fullAddress: cityStr,
            loading: false,
            error: null,
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
        city: 'Amritsar, Punjab',
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

    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const data = await reverseGeocode(latitude, longitude);
            if (data && data.address) {
              const addr = data.address;
              const mainArea = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || addr.city_district || addr.city || addr.town || 'Your Area';
              const city = addr.city || addr.town || addr.city_district || '';

              let displayLabel = mainArea;
              if (city && city !== mainArea && !displayLabel.includes(city)) {
                displayLabel = `${displayLabel}, ${city}`;
              }

              const fullAddress = data.display_name || Object.values(addr).filter(Boolean).join(', ');

              setLocationState({
                lat: latitude,
                lng: longitude,
                city: displayLabel,
                fullAddress: fullAddress,
                loading: false,
                error: null,
              });
              return;
            }
          } catch (geocodeErr) {
            console.warn("Geocoding failed", geocodeErr);
          }

          setLocationState({
            lat: latitude,
            lng: longitude,
            city: 'Current Location',
            fullAddress: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
            loading: false,
            error: null,
          });
        },
        (error) => {
          console.warn("Geolocation failed", error);
          handleFallback();
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: forceRedetect ? 0 : 60000 }
      );
    } else {
      handleFallback();
    }
  };

  useEffect(() => {
    fetchLocation();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      if (data && data.categories) {
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
        onLocationRedetect={() => fetchLocation(true)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Today's Cheapest Market — Hero Intelligence Card */}
        <CheapestMarketCard navigation={navigation} />

        {/* 2. Large Smart Search Bar (with popular chips built in) */}
        <SearchBar onSearch={handleSearch} navigation={navigation} />

        {/* 3. Quick Category Icons */}
        <TopCategoriesGrid
          categories={categories.length > 0 ? categories.slice(0, 8) : []}
          onCategorySelect={handleCategorySelect}
          onViewAll={handleViewAllCategories}
        />

        {/* 4. Find Cheapest Near You — Hero Feature Button */}
        <FindCheapestButton navigation={navigation} />

        {/* 5. Popular Searches */}
        <PopularSearches onSearchClick={handleSearch} />

        {/* 6. Nearby Markets */}
        <NearbyMarketsSection navigation={navigation} />

        {/* 7. Trending Deals */}
        <TodayDeals navigation={navigation} />

        {/* 8. Promo Carousel */}
        <PromoCarousel />

        {/* 9. Verified Nearby Shops */}
        <NearbySection
          onBusinessClick={handleBusinessClick}
          onSeeAll={() => navigation.navigate('SearchResults', { query: 'Verified Shops' })}
          locationState={locationState}
        />

        {/* 10. Price Drop Alerts */}
        <PriceDropAlerts navigation={navigation} />
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
