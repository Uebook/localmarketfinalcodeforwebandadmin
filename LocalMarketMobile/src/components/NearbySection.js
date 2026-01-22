import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { NEARBY_BUSINESSES } from '../constants';
import { getIconName } from '../utils/iconMapping';
import { getVendors } from '../services/api';

const NearbySection = ({ onBusinessClick, locationState }) => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNearbyVendors();
  }, [locationState?.city]);

  const loadNearbyVendors = async () => {
    try {
      setLoading(true);
      // Fetch active vendors, optionally filtered by city
      const filters = {
        status: 'Active',
        limit: 10,
      };

      if (locationState?.city) {
        // Extract city name from locationState.city (e.g., "Connaught Place, Delhi" -> "Delhi")
        const cityParts = locationState.city.split(',');
        if (cityParts.length > 1) {
          filters.city = cityParts[cityParts.length - 1].trim();
        } else {
          filters.city = locationState.city;
        }
      }

      const data = await getVendors(filters);

      if (data && data.vendors && data.vendors.length > 0) {
        // Transform vendors to business format
        const transformedBusinesses = data.vendors.map(vendor => ({
          id: vendor.id,
          name: vendor.name,
          category: vendor.category || 'General',
          rating: vendor.rating || 4.0,
          reviewCount: vendor.reviewCount || 0,
          distance: vendor.city ? `${vendor.city}` : 'Nearby',
          imageUrl: vendor.imageUrl || 'https://via.placeholder.com/288x160',
          address: vendor.address || '',
        }));
        setBusinesses(transformedBusinesses);
      } else {
        // Fallback to constants
        setBusinesses(NEARBY_BUSINESSES);
      }
    } catch (error) {
      console.error('Error loading nearby vendors:', error);
      // Fallback to constants
      setBusinesses(NEARBY_BUSINESSES);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shops Near You</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <View style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <Icon name={getIconName('ChevronRight')} size={16} color="#fbbf24" />
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#fbbf24" />
          <Text style={styles.loadingText}>Loading nearby shops...</Text>
        </View>
      ) : businesses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No shops found nearby</Text>
        </View>
      ) : (
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
              activeOpacity={0.8}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: business.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.ratingBadge}>
                  <Icon name={getIconName('Star')} size={12} color="#fbbf24" />
                  <Text style={styles.ratingText}>{business.rating}</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.businessHeader}>
                  <View style={styles.businessInfo}>
                    <Text style={styles.businessName} numberOfLines={1}>{business.name}</Text>
                    <Text style={styles.businessCategory} numberOfLines={1}>{business.category}</Text>
                  </View>
                  <View style={styles.distanceBadge}>
                    <Icon name={getIconName('MapPin')} size={14} color="#ea580c" />
                    <Text style={styles.distanceText}>{business.distance}</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.viewButton} activeOpacity={0.7}>
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.callButton} activeOpacity={0.7}>
                    <Icon name={getIconName('Phone')} size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A', // Dark text for white background
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ea580c', // Orange color
    marginRight: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  businessCard: {
    width: 288,
    backgroundColor: 'transparent', // Removed brown background
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Changed from brown to semi-transparent black
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff', // Keep white for rating badge (dark background)
    marginLeft: 4,
  },
  cardContent: {
    padding: 12,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessInfo: {
    flex: 1,
    marginRight: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A', // Dark text for white background
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 12,
    color: '#9ca3af',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A', // Dark text for white background
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A', // Dark text for white background
  },
  callButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e', // Green
    borderRadius: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#475569', // Dark text for white background
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#475569', // Dark text for white background
    opacity: 0.7,
  },
});

export default NearbySection;




