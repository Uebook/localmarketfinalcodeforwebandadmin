import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { ALL_CATEGORIES } from '../constants/categories';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';

// Map categories to solid colors matching the design
const colorMap = {
  'Groceries': '#F97316', // Orange
  'Electronics': '#9333EA', // Purple
  'Clothing': '#3B82F6', // Blue
  'Medicines': '#EC4899', // Pink
  'Appliances': '#FACC15', // Yellow
  'Home': '#22C55E', // Green
  'Accessories': '#06B6D4', // Light blue/Cyan
  'Sports': '#7C3AED', // Dark purple
  'Fruits': '#22C55E', // Green
  'Dairy': '#3B82F6', // Blue
  'Sweets': '#EC4899', // Pink
  'Meat': '#DC2626', // Red
  'Fish': '#06B6D4', // Cyan
  'Cosmetics': '#EC4899', // Pink
  'Perfume': '#9333EA', // Purple
  'Jewellery': '#FACC15', // Yellow
  'Footwear': '#7C3AED', // Dark purple
  'Bags': '#3B82F6', // Blue
  'Watches': '#F97316', // Orange
  'Gift': '#EC4899', // Pink
  'Toys': '#FACC15', // Yellow
  'Fitness': '#22C55E', // Green
  'Music': '#9333EA', // Purple
  'CCTV': '#3B82F6', // Blue
  'Computer': '#9333EA', // Purple
  'Gaming': '#7C3AED', // Dark purple
  'Car': '#DC2626', // Red
  'Bike': '#F97316', // Orange
  'Tyre': '#6B7280', // Gray
  'Paint': '#FACC15', // Yellow
  'Tiles': '#06B6D4', // Cyan
  'Furniture': '#7C3AED', // Dark purple
  'Mattress': '#22C55E', // Green
  'Curtains': '#EC4899', // Pink
  'Lighting': '#FACC15', // Yellow
  'Utensils': '#F97316', // Orange
  'Steel': '#6B7280', // Gray
  'Crockery': '#3B82F6', // Blue
  'Pooja': '#FACC15', // Yellow
  'Stationery': '#9333EA', // Purple
  'Packaging': '#6B7280', // Gray
  'Plastic': '#06B6D4', // Cyan
  'Pet': '#EC4899', // Pink
  'Aquarium': '#06B6D4', // Cyan
  'Seeds': '#22C55E', // Green
  'Agriculture': '#F97316', // Orange
  'Hardware': '#6B7280', // Gray
  'Electrical': '#FACC15', // Yellow
  'Building': '#7C3AED', // Dark purple
  'Water': '#06B6D4', // Cyan
  'Solar': '#FACC15', // Yellow
  'Medical': '#EC4899', // Pink
  'Optical': '#3B82F6', // Blue
  'Hearing': '#9333EA', // Purple
  'Ayurvedic': '#22C55E', // Green
  'Cleaning': '#06B6D4', // Cyan
  'Seasonal': '#F97316', // Orange
};

// Map icon names - use the utility function
const getCategoryIcon = (iconName) => {
  return getIconName(iconName);
};

const CategoryGrid = ({ categories, onCategorySelect, variant = 'light' }) => {
  const COLORS = useThemeColors();
  const displayCategories = categories && categories.length > 0 ? categories : ALL_CATEGORIES;

  const renderCategory = ({ item, index }) => {
    // Get color from category name or use default
    const categoryNameKey = item.name.split(' ')[0] || item.name;
    const backgroundColor = colorMap[categoryNameKey] || colorMap[item.name] || '#9ca3af';
    const iconName = getCategoryIcon(item.iconName || item.icon_name);
    const textColor = variant === 'dark' ? COLORS.textPrimary : COLORS.white;

    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => onCategorySelect && onCategorySelect(item.name)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor }]}>
          <Icon name={iconName} size={32} color="#ffffff" />
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
        numColumns={4}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  grid: {
    gap: 20,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    maxWidth: '22%',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
    maxWidth: '100%',
    paddingHorizontal: 4,
  },
});

export default CategoryGrid;

