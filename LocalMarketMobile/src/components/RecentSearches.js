import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { RECENT_SEARCHES } from '../constants';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getRecentSearches } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecentSearches = ({ onSearchClick }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      setLoading(true);
      // Try to get user ID for personalized searches
      const userId = await AsyncStorage.getItem('userId');
      const filters = { limit: 10 };
      if (userId) {
        filters.userId = userId;
      }

      const recentSearches = await getRecentSearches(filters);

      if (recentSearches && recentSearches.length > 0) {
        setSearches(recentSearches.map(s => s.query));
      } else {
        // Fallback to constants
        setSearches(RECENT_SEARCHES);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
      // Fallback to constants
      setSearches(RECENT_SEARCHES);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = (searchQuery) => {
    if (onSearchClick) {
      onSearchClick(searchQuery);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon name={getIconName('Clock')} size={16} color={COLORS.orange} />
          <Text style={styles.title}>YOUR RECENT SEARCHES</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.orange} />
        </View>
      </View>
    );
  }

  if (searches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name={getIconName('Clock')} size={16} color={COLORS.orange} />
        <Text style={styles.title}>YOUR RECENT SEARCHES</Text>
      </View>
      <View style={styles.tagsContainer}>
        {searches.map((search, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tag}
            activeOpacity={0.7}
            onPress={() => handleSearchClick(search)}
          >
            <Text style={styles.tagText}>{search}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    paddingVertical: 20,
    marginVertical: 12,
    marginHorizontal: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary, // Dark text for white background
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.9,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecentSearches;




