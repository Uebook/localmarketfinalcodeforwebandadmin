import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
// Static vendor data removed - using database only
import { useThemeColors } from '../hooks/useThemeColors';
import { getVendors, getVendorProducts } from '../services/api';

const CategoryBusinessSection = ({ categoryId, categoryName, onBusinessClick, onViewAll }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendorsByCategory();
  }, [categoryId, categoryName]);

  const loadVendorsByCategory = async () => {
    try {
      setLoading(true);

      // Use categoryId if available, otherwise fallback to category name search
      let vendorsData = { vendors: [] };

      if (categoryId) {
        // Fetch all active vendors first
        const allVendorsData = await getVendors({
          status: 'Active',
          limit: 100,
        });

        if (allVendorsData?.vendors && allVendorsData.vendors.length > 0) {
          // Filter vendors that have products in this category
          const vendorsWithCategoryProducts = await Promise.all(
            allVendorsData.vendors.map(async (vendor) => {
              try {
                const vendorProductsData = await getVendorProducts(vendor.id);
                const hasCategoryProducts = vendorProductsData?.products?.some(
                  product => product.category_id === categoryId || product.category_id === String(categoryId)
                );
                return hasCategoryProducts ? vendor : null;
              } catch (error) {
                console.error(`Error checking products for vendor ${vendor.id}:`, error);
                return null;
              }
            })
          );
          vendorsData.vendors = vendorsWithCategoryProducts.filter(v => v !== null).slice(0, 10);
        }
      } else {
        // Fallback to category name search if no categoryId
        vendorsData = await getVendors({
          status: 'Active',
          q: categoryName,
          limit: 10,
        });
      }

      const data = vendorsData;

      if (data && data.vendors && data.vendors.length > 0) {
        // Transform vendors to business format
        const transformedBusinesses = data.vendors.map(vendor => ({
          id: vendor.id,
          name: vendor.name,
          category: vendor.category || categoryName,
          rating: vendor.rating || 4.0,
          reviewCount: vendor.reviewCount || 0,
          distance: vendor.city ? `${vendor.city}` : 'Nearby',
          imageUrl: vendor.imageUrl || 'https://via.placeholder.com/160x120',
          address: vendor.address || '',
        }));
        setBusinesses(transformedBusinesses);
      } else {
        // No fallback - show empty state if no vendors found
        setBusinesses([]);
      }
    } catch (error) {
      console.error('Error loading vendors by category:', error);
      // No fallback - show empty state on error
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{categoryName}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.orange} />
        </View>
      </View>
    );
  }

  if (!businesses || businesses.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{categoryName}</Text>
        {onViewAll && (
          <TouchableOpacity onPress={() => onViewAll(categoryId)} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {businesses.map((business) => (
          <TouchableOpacity
            key={business.id}
            style={styles.businessCard}
            onPress={() => onBusinessClick && onBusinessClick(business)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: business.imageUrl }}
              style={styles.businessImage}
              resizeMode="cover"
            />
            <View style={styles.businessInfo}>
              <Text style={styles.businessName} numberOfLines={1}>
                {business.name}
              </Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>⭐ {business.rating}</Text>
                <Text style={styles.reviews}>({business.reviewCount})</Text>
              </View>
              <Text style={styles.distance}>{business.distance}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    paddingVertical: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary, // Dark text for white background
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.orange,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  businessCard: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.divider,
  },
  businessInfo: {
    padding: 12,
  },
  businessName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 4,
  },
  reviews: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  distance: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CategoryBusinessSection;
