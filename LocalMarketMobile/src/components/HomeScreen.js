import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import { useThemeColors } from '../hooks/useThemeColors';

// Import sidebar control from shared utility
import { setSidebarControl, getSidebarControl } from '../utils/sidebarControl';
import SearchBar from './SearchBar';
import TopCategoriesGrid from './TopCategoriesGrid';
import NearbySection from './NearbySection';
import CategoryBusinessSection from './CategoryBusinessSection';
import { TOP_8_CATEGORIES } from '../constants/categories';
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
import { getCategories } from '../services/api';

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

    // Load categories from API
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
      // Fallback to constants
      setCategories(TOP_8_CATEGORIES);
    }
  };

  const handleCategorySelect = (categoryName) => {
    // Navigate to search results with category as query - show vendors only
    if (navigation) {
      navigation.navigate('SearchResults', { 
        query: categoryName,
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
      {/* White Background */}
      <View style={styles.whiteBackground} />
      
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
        
        <TopCategoriesGrid 
          categories={categories.length > 0 ? categories.slice(0, 8) : TOP_8_CATEGORIES}
          onCategorySelect={handleCategorySelect}
          onViewAll={handleViewAllCategories}
        />

        <PromoCarousel />

        {/* Category-based Business Sections */}
        {(categories.length > 0 ? categories : TOP_8_CATEGORIES).slice(0, 4).map((category) => (
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
          items={HOME_SERVICES}
          onItemClick={handleCategorySelect}
          containerClass="bg-black/60"
        />

        <RecentSearches onSearchClick={handleSearch} />

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

        <NearbySection onBusinessClick={handleBusinessClick} locationState={locationState} />

        <HorizontalSection
          title="Beauty & Spa"
          items={BEAUTY_SPA}
          onItemClick={handleCategorySelect}
          containerClass="bg-black/60"
          isCircular={true}
        />
      </ScrollView>
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
    backgroundColor: '#FFFFFF',
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
