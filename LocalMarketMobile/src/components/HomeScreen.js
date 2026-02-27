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
import CategoryBusinessSection from './CategoryBusinessSection';
import HorizontalSection from './HorizontalSection';
import RecentSearches from './RecentSearches';
import PromoCarousel from './PromoCarousel';
import { getCategories } from '../services/api';
import DraggableAIButton from './DraggableAIButton';

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
        lat: 28.6139,
        lng: 77.2090,
        city: 'Delhi, India',
        fullAddress: 'Delhi, India (Fallback)',
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
            const res = await fetch(`https://admin-panel-rho-sepia-57.vercel.app/api/geocode?lat=${latitude}&lng=${longitude}`);
            if (res.ok) {
              const data = await res.json();
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
      // No fallback - show empty state if categories fail to load
      setCategories([]);
    }
  };

  const handleCategorySelect = (categoryName, categoryId) => {
    // Navigate to search results with category as query - show vendors only
    if (navigation) {
      navigation.navigate('SearchResults', {
        query: categoryName,
        categoryId: categoryId, // Pass category ID for filtering
        isCategorySearch: true // Flag to show only vendors
      });
    }
  };

  const handleViewAllCategories = () => {
    // Navigate to Categories screen
    if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Categories' });
    }
  };

  const handleSearch = (query) => {
    if (navigation && query) {
      // Navigate directly to SearchResults
      navigation.navigate('SearchResults', { query });
    }
  };

  const handleBusinessClick = (business) => {
    if (navigation) {
      navigation.navigate('VendorDetails', { business });
    }
  };

  const handleMenuClick = () => {
    // Use global sidebar control
    const control = getSidebarControl();
    if (control) {
      control(true);
    } else {
      console.warn('Sidebar control not available in HomeScreen');
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
      {/* White Background */}
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
        <SearchBar onSearch={handleSearch} navigation={navigation} />

        <TopCategoriesGrid
          categories={categories.length > 0 ? categories.slice(0, 8) : []}
          onCategorySelect={handleCategorySelect}
          onViewAll={handleViewAllCategories}
        />

        <PromoCarousel />

        {/* Category-based Business Sections */}
        {categories.length > 0 && categories.slice(0, 4).map((category) => (
          <CategoryBusinessSection
            key={category.id}
            categoryId={category.id}
            categoryName={category.name}
            onBusinessClick={(business) => {
              // Convert to full business object format
              const fullBusiness = {
                ...business,
                category: category.name,
                address: business.address || 'Nearby',
                openTime: 'Open Now',
                about: `${category.name} store in your area`,
                isVerified: true,
              };
              handleBusinessClick(fullBusiness);
            }}
            onViewAll={(catId) => {
              // Navigate to Categories screen
              if (navigation) {
                navigation.navigate('MainTabs', { screen: 'Categories' });
              }
            }}
          />
        ))}

        <HorizontalSection
          title="Home Services"
          onItemClick={handleCategorySelect}
          onVendorClick={handleBusinessClick}
          containerClass="bg-black/60"
        />

        <RecentSearches onSearchClick={handleSearch} />

        <HorizontalSection
          title="Education"
          onItemClick={handleCategorySelect}
          onVendorClick={handleBusinessClick}
          containerClass="bg-black/60"
        />

        <HorizontalSection
          title="Daily Essentials"
          onItemClick={handleCategorySelect}
          onVendorClick={handleBusinessClick}
          containerClass="bg-black/60"
        />

        <HorizontalSection
          title="Health & Fitness"
          onItemClick={handleCategorySelect}
          onVendorClick={handleBusinessClick}
          containerClass="bg-black/60"
        />

        <NearbySection onBusinessClick={handleBusinessClick} locationState={locationState} />

        <HorizontalSection
          title="Beauty & Spa"
          onItemClick={handleCategorySelect}
          onVendorClick={handleBusinessClick}
          containerClass="bg-black/60"
          isCircular={true}
        />
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
    paddingBottom: 100, // Space for bottom tab navigation
    backgroundColor: 'transparent',
  },
});

export default HomeScreen;
