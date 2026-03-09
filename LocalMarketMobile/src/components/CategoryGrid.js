import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { ALL_CATEGORIES } from '../constants/categories';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';

// Map categories to themed color pairs {bg: pastel, main: vibrant}
const colorMap = {
  'Supermarket': { bg: '#FFF7ED', main: '#F97316' },
  'Groceries': { bg: '#FFF7ED', main: '#F97316' },
  'Electronics': { bg: '#FAF5FF', main: '#9333EA' },
  'Clothing': { bg: '#EFF6FF', main: '#3B82F6' },
  'Fashion': { bg: '#EFF6FF', main: '#3B82F6' },
  'Medicines': { bg: '#FDF2F8', main: '#EC4899' },
  'Health': { bg: '#FDF2F8', main: '#EC4899' },
  'Medical': { bg: '#FDF2F8', main: '#EC4899' },
  'Hospitals': { bg: '#FDF2F8', main: '#EC4899' },
  'Doctors': { bg: '#FDF2F8', main: '#EC4899' },
  'Pharmacy': { bg: '#FDF2F8', main: '#EC4899' },
  'Pharmacies': { bg: '#FDF2F8', main: '#EC4899' },
  'Appliances': { bg: '#FEFCE8', main: '#EAB308' },
  'Home': { bg: '#F0FDF4', main: '#22C55E' },
  'Accessories': { bg: '#ECFEFF', main: '#06B6D4' },
  'Sports': { bg: '#F5F3FF', main: '#7C3AED' },
  'Fitness': { bg: '#F5F3FF', main: '#7C3AED' },
  'Gyms': { bg: '#F5F3FF', main: '#7C3AED' },
  'Fruits': { bg: '#F0FDF4', main: '#22C55E' },
  'Dairy': { bg: '#EFF6FF', main: '#3B82F6' },
  'Sweets': { bg: '#FDF2F8', main: '#EC4899' },
  'Meat': { bg: '#FEF2F2', main: '#DC2626' },
  'Fish': { bg: '#ECFEFF', main: '#06B6D4' },
  'Cosmetics': { bg: '#FDF2F8', main: '#EC4899' },
  'Beauty': { bg: '#FDF2F8', main: '#EC4899' },
  'Salon': { bg: '#FDF2F8', main: '#EC4899' },
  'Jewellery': { bg: '#FEFCE8', main: '#EAB308' },
  'Gift': { bg: '#FDF2F8', main: '#EC4899' },
  'Toys': { bg: '#FEFCE8', main: '#EAB308' },
  'Restaurants': { bg: '#FFF7ED', main: '#EA580C' },
  'Food': { bg: '#FFF7ED', main: '#EA580C' },
  'Cafes': { bg: '#F0FDF4', main: '#16A34A' },
  'Bakeries': { bg: '#FAF5FF', main: '#9333EA' },
  'Hotels': { bg: '#EFF6FF', main: '#2563EB' },
  'Travel': { bg: '#ECFEFF', main: '#0891B2' },
  'Automotive': { bg: '#F8FAFC', main: '#475569' },
  'Car': { bg: '#F8FAFC', main: '#475569' },
  'Bike': { bg: '#F8FAFC', main: '#475569' },
  'Schools': { bg: '#F0FDF4', main: '#16A34A' },
  'Colleges': { bg: '#F0FDF4', main: '#16A34A' },
  'Real': { bg: '#F8FAFC', main: '#0F172A' },
  'Property': { bg: '#F8FAFC', main: '#0F172A' },
  'Banks': { bg: '#F1F5F9', main: '#334155' },
  'Finance': { bg: '#F1F5F9', main: '#334155' },
};

// Generate a deterministic color pair based on string
const getDeterministicTheme = (str) => {
  const pairs = [
    { bg: '#FFF7ED', main: '#EA580C' },
    { bg: '#FAF5FF', main: '#9333EA' },
    { bg: '#EFF6FF', main: '#2563EB' },
    { bg: '#FDF2F8', main: '#EC4899' },
    { bg: '#FEFCE8', main: '#EAB308' },
    { bg: '#F0FDF4', main: '#16A34A' },
    { bg: '#ECFEFF', main: '#0891B2' },
    { bg: '#F5F3FF', main: '#7C3AED' },
    { bg: '#FEF2F2', main: '#DC2626' },
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return pairs[Math.abs(hash) % pairs.length];
};

// Map icon names - use the utility function
const getCategoryIcon = (iconName) => {
  return getIconName(iconName);
};

const CategoryGrid = ({ categories, onCategorySelect, variant = 'light' }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const displayCategories = categories && categories.length > 0 ? categories : ALL_CATEGORIES;

  const renderCategory = ({ item, index }) => {
    // Get theme from category name or use default
    const words = item.name.split(' ');
    let theme = null;

    // Try to find a match for any word in the name
    for (const word of words) {
      if (colorMap[word]) {
        theme = colorMap[word];
        break;
      }
    }

    // If still null, use deterministic theme
    if (!theme) {
      theme = getDeterministicTheme(item.name);
    }

    const iconName = getCategoryIcon(item.iconName || item.icon_name);
    const textColor = '#0F172A'; // Dark navy for text

    // Strict image check - must be a valid URL starting with http
    const hasValidIconUrl = (item.iconUrl || item.icon_url) &&
      (item.iconUrl || item.icon_url).startsWith('http');

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => onCategorySelect && onCategorySelect(item.name)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconSquare, { backgroundColor: theme.bg }]}>
          {hasValidIconUrl ? (
            <Image
              source={{ uri: item.iconUrl || item.icon_url }}
              style={{ width: '100%', height: '100%', borderRadius: 12 }}
              resizeMode="cover"
            />
          ) : (
            <Icon name={iconName} size={28} color={theme.main} />
          )}
        </View>
        <Text style={[styles.categoryName, { color: textColor }]} numberOfLines={2} ellipsizeMode="tail">
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={displayCategories}
        renderItem={renderCategory}
        keyExtractor={(item, index) => item.id || `category-${index}`}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  grid: {
    gap: 12,
    paddingHorizontal: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9', // Very subtle border
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconSquare: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 14,
    color: '#0F172A',
  },
});

export default CategoryGrid;

