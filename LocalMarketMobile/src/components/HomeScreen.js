import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import { COLORS } from '../constants/colors';

// Import sidebar control from shared utility
import { setSidebarControl, getSidebarControl } from '../utils/sidebarControl';
import SearchBar from './SearchBar';
import CategoryGrid from './CategoryGrid';
import NearbySection from './NearbySection';
import HorizontalSection from './HorizontalSection';
import RecentSearches from './RecentSearches';
import PromoCarousel from './PromoCarousel';
import {
  HOME_SERVICES,
  EDUCATION_SERVICES,
  DAILY_ESSENTIALS,
  HEALTH_FITNESS,
  BEAUTY_SPA,
} from '../constants';

const HomeScreen = ({ navigation, route }) => {
  const [locationState, setLocationState] = useState({
    lat: null,
    lng: null,
    city: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Mock geolocation - in real app, use @react-native-community/geolocation
    setTimeout(() => {
      setLocationState({
        lat: 28.6139,
        lng: 77.2090,
        city: 'Connaught Place, Delhi',
        loading: false,
        error: null,
      });
    }, 1500);
  }, []);

  const handleCategorySelect = (categoryName) => {
    // Navigate to search results with category as query
    if (navigation) {
      navigation.navigate('SearchResults', { query: categoryName });
    }
  };

  const handleSearch = (query) => {
    if (navigation) {
      navigation.navigate('Search', { query });
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
      {/* Gradient Background */}
      <LinearGradient
        colors={COLORS.homeBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      />
      
      <Header
        locationState={locationState}
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
        onNotificationClick={handleNotificationClick}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SearchBar onSearch={handleSearch} />
        
        <CategoryGrid onCategorySelect={handleCategorySelect} />

        <HorizontalSection
          title="Home Services"
          items={HOME_SERVICES}
          onItemClick={handleCategorySelect}
          containerClass="bg-black/60"
        />

        <RecentSearches />

        <HorizontalSection
          title="Education"
          items={EDUCATION_SERVICES}
          onItemClick={handleCategorySelect}
          containerClass="bg-black/60"
        />

        <HorizontalSection
          title="Daily Essentials"
          items={DAILY_ESSENTIALS}
          onItemClick={handleCategorySelect}
          containerClass="bg-black/60"
        />

        <HorizontalSection
          title="Health & Fitness"
          items={HEALTH_FITNESS}
          onItemClick={handleCategorySelect}
          containerClass="bg-black/60"
        />

        <NearbySection onBusinessClick={handleBusinessClick} />

        <HorizontalSection
          title="Beauty & Spa"
          items={BEAUTY_SPA}
          onItemClick={handleCategorySelect}
          containerClass="bg-black/60"
          isCircular={true}
        />

        <PromoCarousel />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
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
