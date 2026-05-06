import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Linking, FlatList } from 'react-native';
import Image from './ImageWithFallback';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
import { getVendors } from '../services/api';

const NearbySection = ({ vendors, onBusinessClick, onSeeAll, locationState }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(!vendors);

  useEffect(() => {
    if (vendors) {
      const transformedBusinesses = vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.shop_name || vendor.name,
        category: vendor.category_name || vendor.category || 'General',
        rating: parseFloat(vendor.rating) || 4.2,
        reviewCount: vendor.reviewCount || 48,
        distance: 'Near you',
        imageUrl: vendor.imageUrl || vendor.image_url || (vendor.images && vendor.images[0]),
        address: vendor.address || '',
        phone: vendor.contactNumber || vendor.phone || '',
      }));
      setBusinesses(transformedBusinesses);
      setLoading(false);
    } else {
      loadNearbyVendors();
    }
  }, [vendors, locationState?.city]);

  const loadNearbyVendors = async () => {
    try {
      setLoading(true);
      // Try fetching verified vendors by city first
      let filters = { status: 'Active', limit: 12, verified: true };
      
      // Handle "All Punjab" or similar by stripping "All " prefix
      let searchCity = locationState?.city;
      if (searchCity && searchCity.startsWith('All ')) {
        // If it's "All [State]", we might want to fetch everything in that state or just use as is
        // For now, let's try without a city filter if "All " is selected to show global verified shops
        searchCity = null; 
      }

      if (searchCity) {
        filters.city = searchCity;
      }

      let data = await getVendors(filters);

      // If no vendors in city, try without city filter as fallback
      if ((!data || !data.vendors || data.vendors.length === 0) && locationState?.city) {
        console.log('No vendors in city, falling back to all active vendors');
        data = await getVendors({ status: 'Active', limit: 12 });
      }

      if (data && data.vendors) {
        const transformedBusinesses = data.vendors.map(vendor => ({
          id: vendor.id,
          name: vendor.shop_name || vendor.name,
          category: vendor.category_name || vendor.category || 'General',
          rating: parseFloat(vendor.rating) || 4.2,
          reviewCount: vendor.reviewCount || 48,
          distance: 'Near you',
          imageUrl: vendor.imageUrl || vendor.image_url || (vendor.images && vendor.images[0]),
          address: vendor.address || '',
          phone: vendor.contactNumber || vendor.phone || '',
        }));
        setBusinesses(transformedBusinesses);
      } else {
        setBusinesses([]);
      }
    } catch (error) {
      console.error('Error loading nearby vendors:', error);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const renderBusinessCard = ({ item: business }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onBusinessClick && onBusinessClick(business)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {business.imageUrl ? (
          <Image
            source={{ uri: business.imageUrl }}
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholderImg}>
            <Icon name="shopping-bag" size={24} color="#CBD5E1" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryLabel}>{business.category.toUpperCase()}</Text>
          <View style={styles.ratingBox}>
            <Icon name="star" size={10} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{business.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.businessName} numberOfLines={1}>{business.name}</Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="map-pin" size={10} color="#94A3B8" />
            <Text style={styles.metaText}>{business.distance}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaText}>{business.reviewCount} Reviews</Text>
          </View>
        </View>
      </View>

      <View style={styles.arrowContainer}>
        <Icon name="chevron-right" size={16} color="#E2E8F0" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.orange} />
      </View>
    );
  }

  if (businesses.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={businesses}
        renderItem={renderBusinessCard}
        keyExtractor={item => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={280 + 16}
        decelerationRate="fast"
      />
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  card: {
    width: 280,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 12,
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImg: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.orange,
    letterSpacing: 0.5,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  businessName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NearbySection;




