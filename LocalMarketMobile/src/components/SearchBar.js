import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { COLORS } from '../constants/colors';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim() && onSearch) {
      onSearch(query);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {/* Search Icon */}
        <View style={styles.iconContainer}>
          <Icon name={getIconName('Search')} size={20} color={COLORS.textLight} />
        </View>

        {/* Input Field */}
        <TextInput
          style={styles.input}
          placeholder="Search for the lowest price..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        {/* Mic Icon */}
        <TouchableOpacity style={styles.micContainer} activeOpacity={0.7}>
          <Icon name={getIconName('Mic')} size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.darkBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  micContainer: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchBar;




