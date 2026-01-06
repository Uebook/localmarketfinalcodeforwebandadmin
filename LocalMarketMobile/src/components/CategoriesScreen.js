import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import CategoryGrid from './CategoryGrid';
import { COLORS } from '../constants/colors';
import { TOP_8_CATEGORIES, ALL_CATEGORIES } from '../constants/categories';
import { getIconName } from '../utils/iconMapping';
import Icon from 'react-native-vector-icons/Feather';

const CategoriesScreen = ({ navigation, route }) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
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

  const handleTopCategoryPress = (category) => {
    if (navigation) {
      navigation.navigate('SearchResults', { query: category.name, categoryId: category.id });
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
        {/* Top 8 Priority Categories */}
        <View style={styles.sectionHeader}>
          <View style={styles.orangeLine} />
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <Text style={styles.sectionSubtitle}>Most frequent search, daily need, guaranteed usage</Text>
        </View>

        <View style={styles.topCategoriesGrid}>
          {TOP_8_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.topCategoryCard}
              onPress={() => handleTopCategoryPress(category)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={COLORS.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.topCategoryIcon}
              >
                <Icon name={getIconName(category.iconName)} size={24} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.topCategoryName} numberOfLines={2}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* View All Categories Button */}
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => setShowAllCategories(!showAllCategories)}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllButtonText}>
            {showAllCategories ? 'Hide All Categories' : 'View All Categories'}
          </Text>
          <Icon 
            name={getIconName(showAllCategories ? 'ChevronUp' : 'ChevronDown')} 
            size={20} 
            color={COLORS.orange} 
          />
        </TouchableOpacity>

        {/* Smart Personalization Section */}
        {!showAllCategories && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.orangeLine} />
              <Text style={styles.sectionTitle}>Popular in Your Area</Text>
            </View>
            <View style={styles.personalizationSection}>
              <Text style={styles.personalizationText}>
                • Groceries & General Store{'\n'}
                • Electronics & Mobile{'\n'}
                • Medicines / Pharmacy
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.orangeLine} />
              <Text style={styles.sectionTitle}>Trending Categories</Text>
            </View>
            <View style={styles.personalizationSection}>
              <Text style={styles.personalizationText}>
                • Home Appliances{'\n'}
                • Clothing & Fashion{'\n'}
                • Hardware & Electrical
              </Text>
            </View>
          </>
        )}

        {/* All Categories Section (when expanded) */}
        {showAllCategories && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.orangeLine} />
              <Text style={styles.sectionTitle}>All Categories ({ALL_CATEGORIES.length})</Text>
            </View>
            <CategoryGrid onCategorySelect={handleCategorySelect} variant="dark" />
          </>
        )}
        
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
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    marginLeft: 8,
  },
  topCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topCategoryCard: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 16,
  },
  topCategoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  topCategoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.orange,
    gap: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.orange,
  },
  personalizationSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  personalizationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
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



