import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { getVendors, getVendorProducts, getCategories } from '../services/api';
import { useThemeColors } from '../hooks/useThemeColors';

const HorizontalSection = ({ title, items = [], onItemClick, onVendorClick, containerClass, isCircular = false }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const isBeautySpa = title.toLowerCase().includes('beauty') || title.toLowerCase().includes('spa');

  // Map section titles to category search terms
  const getCategorySearchTerms = (sectionTitle) => {
    const titleLower = sectionTitle.toLowerCase();
    if (titleLower.includes('home service')) {
      return ['Home Service', 'Home Services', 'Cleaning', 'Plumber', 'Electrician', 'Carpenter', 'Painting'];
    } else if (titleLower.includes('education')) {
      return ['Education', 'Tutor', 'Coaching', 'Music', 'Dance', 'Art'];
    } else if (titleLower.includes('daily essential')) {
      return ['Daily Essential', 'Grocery', 'Vegetables', 'Milk', 'Medicines'];
    } else if (titleLower.includes('health') || titleLower.includes('fitness')) {
      return ['Health', 'Fitness', 'Gym', 'Yoga', 'Doctor', 'Lab'];
    } else if (titleLower.includes('beauty') || titleLower.includes('spa')) {
      return ['Beauty', 'Spa', 'Salon', 'Massage', 'Makeup', 'Skincare'];
    }
    return [];
  };

  useEffect(() => {
    loadVendorsForCategory();
  }, [title]);

  const loadVendorsForCategory = async () => {
    try {
      setLoading(true);
      const searchTerms = getCategorySearchTerms(title);
      
      if (searchTerms.length === 0) {
        // Fallback to static items if no category match
        setVendors([]);
        setLoading(false);
        return;
      }

      // Try to find matching category IDs first
      let categoryIds = [];
      try {
        const categoriesData = await getCategories();
        if (categoriesData?.categories) {
          searchTerms.forEach(term => {
            const matchingCategory = categoriesData.categories.find(
              cat => cat.name.toLowerCase().includes(term.toLowerCase()) || 
                     term.toLowerCase().includes(cat.name.toLowerCase())
            );
            if (matchingCategory) {
              categoryIds.push(matchingCategory.id);
            }
          });
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }

      // Fetch vendors
      let allVendors = [];
      
      // Try fetching by category IDs first
      if (categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
          try {
            const vendorsData = await getVendors({ status: 'Active', limit: 50 });
            if (vendorsData?.vendors) {
              // Filter vendors that have products in this category
              const vendorsWithCategoryProducts = await Promise.all(
                vendorsData.vendors.map(async (vendor) => {
                  try {
                    const vendorProductsData = await getVendorProducts(vendor.id);
                    const hasCategoryProduct = vendorProductsData?.products?.some(
                      product => product.category_id === categoryId || 
                                product.category_id === String(categoryId)
                    );
                    return hasCategoryProduct ? vendor : null;
                  } catch (error) {
                    return null;
                  }
                })
              );
              allVendors.push(...vendorsWithCategoryProducts.filter(v => v !== null));
            }
          } catch (error) {
            console.error(`Error fetching vendors for category ${categoryId}:`, error);
          }
        }
      }

      // Also try searching by category name
      for (const term of searchTerms.slice(0, 2)) { // Limit to first 2 terms to avoid too many requests
        try {
          const vendorsData = await getVendors({ 
            status: 'Active', 
            q: term,
            limit: 10 
          });
          if (vendorsData?.vendors) {
            allVendors.push(...vendorsData.vendors);
          }
        } catch (error) {
          console.error(`Error searching vendors for ${term}:`, error);
        }
      }

      // Remove duplicates and limit to 10 vendors
      const uniqueVendors = Array.from(
        new Map(allVendors.map(v => [v.id, v])).values()
      ).slice(0, 10);

      setVendors(uniqueVendors);
    } catch (error) {
      console.error('Error loading vendors for category:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // If we have vendors, show vendors; otherwise fallback to static items
  const displayItems = vendors.length > 0 ? vendors : (items || []);

  if (loading && vendors.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title.toUpperCase()}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.orange} />
        </View>
      </View>
    );
  }

  if (displayItems.length === 0) {
    return null; // Don't show section if no items
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title.toUpperCase()}</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayItems.map((item, index) => {
          // Check if it's a vendor object or static item
          const isVendor = item.id && item.name && (item.imageUrl || item.shopFrontPhotoUrl);
          const itemName = isVendor ? item.name : item.name;
          const itemImage = isVendor 
            ? (item.imageUrl || item.shopFrontPhotoUrl || 'https://via.placeholder.com/96x96')
            : item.imageUrl;

          return (
            <TouchableOpacity
              key={item.id || index}
              style={styles.item}
              onPress={() => {
                if (isVendor && onVendorClick) {
                  // Convert vendor to business format for VendorDetails
                  const business = {
                    ...item,
                    category: item.category || title,
                    address: item.address || item.city || 'Nearby',
                    openTime: 'Open Now',
                    about: `${item.name} - ${title}`,
                    isVerified: true,
                  };
                  onVendorClick(business);
                } else if (onItemClick) {
                  onItemClick(itemName);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.imageContainer,
                (isCircular || isBeautySpa) && styles.circularImageContainer
              ]}>
                <Image 
                  source={{ uri: itemImage }} 
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.itemName} numberOfLines={2}>
                {itemName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    paddingVertical: 20,
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.white || '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary || '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.9,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  item: {
    width: 96,
    alignItems: 'center',
  },
  imageContainer: {
    width: 96,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  circularImageContainer: {
    borderRadius: 48, // Make it circular
    width: 96,
    height: 96,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary || '#0F172A',
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HorizontalSection;




