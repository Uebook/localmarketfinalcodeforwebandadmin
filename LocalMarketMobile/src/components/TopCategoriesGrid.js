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
  // Show only 7 categories + View All button (8 items total)
  const displayCategories = allCategories.slice(0, 7);

  const handleCategoryPress = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category.name, category.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.orangeLine} />
          <View>
            <Text style={styles.title}>All Categories</Text>
            <Text style={styles.subtitle}>Explore all available categories</Text>
          </View>
        </View>
      </View>
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
                  <Icon name={getIconName(category.iconName || category.icon_name || 'grid')} size={24} color={color.text} />
                )}
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        {/* View All button as 8th item in grid */}
        {onViewAll && (
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={onViewAll}
            activeOpacity={0.7}
          >
            <View style={styles.viewAllIconContainer}>
              <Icon name={getIconName('ChevronRight')} size={24} color={COLORS.orange} />
            </View>
            <Text style={styles.viewAllCategoryText} numberOfLines={2}>
              View All
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
    marginVertical: 12,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orangeLine: {
    width: 4,
    height: 24,
    backgroundColor: COLORS.orange,
    borderRadius: 2,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryImage: {
    width: 32,
    height: 32,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 14,
  },
  viewAllIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: COLORS.orange,
    borderStyle: 'dashed',
  },
  viewAllCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.orange,
    textAlign: 'center',
  },
});

export default TopCategoriesGrid;
