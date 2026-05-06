import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import CategoryGrid from './CategoryGrid';
import { useThemeColors } from '../hooks/useThemeColors';
import { getIconName } from '../utils/iconMapping';
import Icon from 'react-native-vector-icons/Feather';
import { getCategories } from '../services/api';

const CategoriesScreen = ({ navigation, route, locationState }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      if (data && data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // No fallback - show empty state if API fails
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryName) => {
    // Navigate to SearchResults with category as query - show vendors only
    if (navigation) {
      navigation.navigate('SearchResults', {
        query: categoryName,
        isCategorySearch: true // Flag to show only vendors
      });
    }
  };

  const handleTopCategoryPress = (category) => {
    if (navigation) {
      navigation.navigate('SearchResults', {
        query: category.name,
        categoryId: category.id,
        isCategorySearch: true // Flag to show only vendors
      });
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


      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Discover Categories</Text>
          <Text style={styles.heroSubtitle}>Find the best local products and services near you</Text>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.orangeLine} />
          <Text style={styles.sectionTitle}>
            {searchQuery ? 'Search Results' : 'Explore All'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.orange} />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : (
          <>
            {categories.filter(cat =>
              (cat.name || '').toLowerCase().includes(searchQuery.toLowerCase())
            ).length > 0 ? (
              <CategoryGrid
                categories={categories.filter(cat =>
                  (cat.name || '').toLowerCase().includes(searchQuery.toLowerCase())
                )}
                onCategorySelect={handleCategorySelect}
                variant="dark"
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Icon name="search" size={48} color={COLORS.textLight} />
                <Text style={styles.noResultsText}>No categories found matching "{searchQuery}"</Text>
              </View>
            )}
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

const createStyles = (COLORS) => StyleSheet.create({
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
    paddingTop: 10,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  heroSection: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  orangeLine: {
    width: 4,
    height: 20,
    backgroundColor: '#F97316',
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default CategoriesScreen;



