import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import SearchBar from './SearchBar';
import RecentSearches from './RecentSearches';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';

const SearchScreen = ({ navigation, route, locationState }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [searchQuery, setSearchQuery] = useState(route?.params?.query || null);
  const [savedIds, setSavedIds] = useState([]);

  const handleSearch = (query) => {
    if (query && query.trim()) {
      // Navigate to SearchResults instead of rendering it as child
      navigation.navigate('SearchResults', { query: query.trim() });
    }
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

  // Remove the conditional rendering - SearchResults is now a separate screen
  // This prevents double header issue

  return (
    <View style={styles.container}>




      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SearchBar onSearch={handleSearch} navigation={navigation} />

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

const createStyles = (COLORS) => StyleSheet.create({
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



