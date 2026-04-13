import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, } from 'react-native';
import Image from './ImageWithFallback';
import Icon from 'react-native-vector-icons/Feather';
import { ALL_CATEGORIES } from '../constants/categories';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';

// Subtle colored icon backgrounds per category index (Synced with Website)
const iconColors = [
  { bg: '#FFF7ED', text: '#F97316' }, // orange
  { bg: '#EFF6FF', text: '#3B82F6' }, // blue
  { bg: '#F0FDF4', text: '#16A34A' }, // green
  { bg: '#FAF5FF', text: '#9333EA' }, // purple
  { bg: '#FFF1F2', text: '#E11D48' }, // rose
  { bg: '#FEFCE8', text: '#CA8A04' }, // amber
  { bg: '#F0FDFA', text: '#0D9488' }, // teal
  { bg: '#EEF2FF', text: '#4F46E5' }, // indigo
];

const CategoryGrid = ({ categories, onCategorySelect, variant = 'light' }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const displayCategories = categories && categories.length > 0 ? categories : ALL_CATEGORIES;

  const renderCategory = ({ item, index }) => {
    const color = iconColors[index % iconColors.length];
    const iconName = getIconName(item.iconName || item.icon_name);
    
    // Check for images
    const iconUrl = item.iconUrl || item.icon_url;

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => onCategorySelect && onCategorySelect(item.name)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: color.bg }]}>
          {iconUrl ? (
            <Image
              source={{ uri: iconUrl }}
              style={styles.categoryImage}
              resizeMode="contain"
            />
          ) : (
            <Icon name={iconName} size={24} color={color.text} />
          )}
        </View>
        <Text style={styles.categoryName} numberOfLines={2}>
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
    paddingHorizontal: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    minHeight: 120,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryImage: {
    width: 36,
    height: 36,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
    color: '#334155',
  },
});

export default CategoryGrid;

