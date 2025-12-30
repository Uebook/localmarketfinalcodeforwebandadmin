import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { RECENT_SEARCHES } from '../constants';
import { getIconName } from '../utils/iconMapping';
import { COLORS } from '../constants/colors';

const RecentSearches = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name={getIconName('Clock')} size={16} color={COLORS.orange} />
        <Text style={styles.title}>YOUR RECENT SEARCHES</Text>
      </View>
      <View style={styles.tagsContainer}>
        {RECENT_SEARCHES.map((search, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tag}
            activeOpacity={0.7}
          >
            <Text style={styles.tagText}>{search}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    marginVertical: 12,
    marginHorizontal: 16,
    backgroundColor: '#3d2817', // Dark brown/red card background
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    color: COLORS.white,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
});

export default RecentSearches;




