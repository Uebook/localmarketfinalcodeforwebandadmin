import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, } from 'react-native';
import Image from './ImageWithFallback';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
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

const TopCategoriesGrid = ({ categories, onCategorySelect, onViewAll }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const allCategories = categories && categories.length > 0 ? categories : [];
  
  // Show only 8 items total (including View All)
  const displayCategories = allCategories.slice(0, 7);

  const handleCategoryPress = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category.name, category.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {displayCategories.map((category, index) => {
          const color = iconColors[index % iconColors.length];
          return (
            <TouchableOpacity
              key={category.id || index}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: color.bg }]}>
                {category.iconUrl || category.icon_url ? (
                  <Image
                    source={{ uri: category.iconUrl || category.icon_url }}
                    style={styles.categoryImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Icon name={getIconName(category.iconName || category.icon_name || 'grid')} size={22} color={color.text} />
                )}
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {onViewAll && displayCategories.length > 0 && (
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={onViewAll}
            activeOpacity={0.7}
          >
            <View style={styles.viewAllIconContainer}>
              <Icon name={getIconName('ChevronRight')} size={22} color={COLORS.orange} />
            </View>
            <Text style={styles.viewAllCategoryText} numberOfLines={1}>
              More
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '23%', // Slightly less than 25% for spacing
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 16, // Square with rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  categoryImage: {
    width: 32,
    height: 32,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  viewAllIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewAllCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    textAlign: 'center',
  },
});

export default TopCategoriesGrid;
