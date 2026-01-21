import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import SearchBar from './SearchBar';
import SearchHeader from './SearchHeader';
import SearchResults from './SearchResults';
import RecentSearches from './RecentSearches';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { COLORS } from '../constants/colors';

const SearchScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState(route?.params?.query || null);
  const [savedIds, setSavedIds] = useState([]);
  const [locationState] = useState({
    lat: null,
    lng: null,
    city: 'Delhi, India',
    loading: false,
    error: null,
  });

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleBack = () => {
    setSearchQuery(null);
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleBusinessClick = (business) => {
    navigation.navigate('VendorDetails', { business });
  };

  const toggleSave = (id) => {
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(savedId => savedId !== id) : [...prev, id]
    );
  };

  const handleMenuClick = () => {
    // Use global sidebar control
    const { getSidebarControl } = require('../utils/sidebarControl');
    const control = getSidebarControl();
    if (control) {
      control(true);
    } else {
      console.warn('Sidebar control not available');
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

  if (searchQuery) {
    return (
      <View style={styles.container}>
        <SearchHeader query={searchQuery} onBack={handleBack} />
        <SearchResults
          query={searchQuery}
          onBusinessClick={handleBusinessClick}
          savedIds={savedIds}
          onToggleSave={toggleSave}
          locationState={locationState}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
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
        
        <RecentSearches />

        {/* Empty State */}
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Icon name={getIconName('ShoppingBag')} size={48} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>What are you looking for?</Text>
          <Text style={styles.emptyDescription}>
            Search for products, services, or local businesses nearby.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyState: {
    backgroundColor: '#E5E7EB', // Light gray card
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D1D5DB', // Light gray circle
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151', // Dark gray
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280', // Medium gray
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});

export default SearchScreen;



