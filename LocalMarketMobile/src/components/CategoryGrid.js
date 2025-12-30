import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { CATEGORIES } from '../constants';
import { getIconName } from '../utils/iconMapping';
import { COLORS } from '../constants/colors';

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
};

// Map icon names - some need special handling
const getCategoryIcon = (iconName) => {
  const iconMap = {
    'ShoppingBag': 'shopping-bag',
    'Smartphone': 'smartphone',
    'Shirt': 'shirt',
    'Pill': 'activity', // Feather doesn't have pill, using activity
    'Zap': 'zap',
    'Home': 'home',
    'Headphones': 'headphones',
    'Trophy': 'award', // Trophy -> award
  };
  return iconMap[iconName] || 'circle';
};

const CategoryGrid = ({ onCategorySelect, variant = 'light' }) => {
  const renderCategory = ({ item, index }) => {
    const backgroundColor = colorMap[item.name] || '#9ca3af';
    const iconName = getCategoryIcon(item.iconName);
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
        <Text style={[styles.categoryName, { color: textColor }]} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
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
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default CategoryGrid;

