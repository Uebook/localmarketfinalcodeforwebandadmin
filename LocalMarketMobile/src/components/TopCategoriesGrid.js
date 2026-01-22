import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { TOP_8_CATEGORIES } from '../constants/categories';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';

const TopCategoriesGrid = ({ categories, onCategorySelect, onViewAll }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const allCategories = categories && categories.length > 0 ? categories : TOP_8_CATEGORIES;
  // Show only 7 categories + View All button (8 items total)
  const displayCategories = allCategories.slice(0, 7);

  const handleCategoryPress = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category.name);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Top Categories</Text>
          <Text style={styles.subtitle}>Most frequent search, daily need, guaranteed usage</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {displayCategories.map((category, index) => (
          <TouchableOpacity
            key={category.id || index}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.iconContainer}
            >
              <Icon name={getIconName(category.iconName || category.icon_name || 'grid')} size={24} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.categoryName} numberOfLines={2}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
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
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  viewAllIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: COLORS.orange,
    borderStyle: 'dashed',
  },
  viewAllCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.orange,
    textAlign: 'center',
    lineHeight: 13,
    maxWidth: '100%',
    paddingHorizontal: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 100,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 13,
    maxWidth: '100%',
    paddingHorizontal: 2,
  },
});

export default TopCategoriesGrid;
