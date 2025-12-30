import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import CategoryGrid from './CategoryGrid';
import { COLORS } from '../constants/colors';

const CategoriesScreen = ({ navigation, route }) => {
  const [locationState] = React.useState({
    lat: null,
    lng: null,
    city: 'Delhi, India',
    loading: false,
    error: null,
  });

  const handleCategorySelect = (categoryName) => {
    // Navigate to SearchResults with category as query
    if (navigation) {
      navigation.navigate('SearchResults', { query: categoryName });
    }
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* All Categories Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.orangeLine} />
          <Text style={styles.sectionTitle}>All Categories</Text>
        </View>

        <CategoryGrid onCategorySelect={handleCategorySelect} variant="dark" />
        
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>Can't find what you're looking for?</Text>
          <TouchableOpacity
            onPress={() => navigation?.navigate('MainTabs', { screen: 'Search' })}
            activeOpacity={0.7}
          >
            <Text style={styles.searchLink}>Search for it</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingLeft: 4,
  },
  orangeLine: {
    width: 4,
    height: 24,
    backgroundColor: COLORS.orange,
    borderRadius: 2,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 48,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  searchLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.orange,
    textDecorationLine: 'underline',
  },
});

export default CategoriesScreen;



