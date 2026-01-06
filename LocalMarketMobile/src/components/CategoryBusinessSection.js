import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { getBusinessesByCategory } from '../constants/categoryBusinesses';
import { COLORS } from '../constants/colors';

const CategoryBusinessSection = ({ categoryId, categoryName, onBusinessClick, onViewAll }) => {
  const businesses = getBusinessesByCategory(categoryId);

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

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    color: COLORS.white,
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
});

export default CategoryBusinessSection;
