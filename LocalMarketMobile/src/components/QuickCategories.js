import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';

const quickCats = [
  { id: 'milk', name: 'Milk', icon: 'droplet', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'charger', name: 'Charger', icon: 'zap', color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'shampoo', name: 'Shampoo', icon: 'pocket', color: '#9333EA', bg: '#FAF5FF' },
  { id: 'atta', name: 'Atta', icon: 'archive', color: '#CA8A04', bg: '#FEFCE8' },
  { id: 'more', name: 'More', icon: 'grid', color: '#64748B', bg: '#F1F5F9' },
];

const QuickCategories = ({ onSelect }) => {
  const COLORS = useThemeColors();
  
  return (
    <View style={styles.container}>
      {quickCats.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={styles.item}
          onPress={() => onSelect && onSelect(cat.name)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: cat.bg }]}>
            <Icon name={cat.icon} size={24} color={cat.color} />
          </View>
          <Text style={styles.label}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  item: {
    alignItems: 'center',
    width: '18%',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
});

export default QuickCategories;
