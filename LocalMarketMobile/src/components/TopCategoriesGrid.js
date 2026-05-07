import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allCategories.map((category, index) => {
          const color = iconColors[index % iconColors.length];
          return (
            <TouchableOpacity
              key={category.id || index}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                {category.iconUrl || category.icon_url ? (
                  <Image
                    source={{ uri: category.iconUrl || category.icon_url }}
                    style={styles.categoryImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Icon name={getIconName(category.iconName || category.icon_name || 'grid')} size={28} color={color.text} />
                )}
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: 86,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 20, // Rounded square as per image
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryImage: {
    width: 40,
    height: 40,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
});

export default TopCategoriesGrid;
