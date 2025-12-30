import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';

const SearchHeader = ({ query, onBack }) => {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Icon name={getIconName('ArrowLeft')} size={24} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Icon name={getIconName('Search')} size={20} color="rgba(255, 255, 255, 0.7)" style={styles.searchIcon} />
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchInput}>{query}</Text>
            <Text style={styles.locationText}>Haibatpur, Sector 4</Text>
          </View>
          <Icon name={getIconName('Mic')} size={20} color="#ffffff" style={styles.micIcon} />
        </View>

        <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
          <Icon name={getIconName('Share2')} size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    backgroundColor: '#ea580c', // Orange-600
    paddingHorizontal: 16,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  searchInput: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    padding: 0,
  },
  locationText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  micIcon: {
    marginLeft: 8,
  },
  shareButton: {
    padding: 8,
  },
});

export default SearchHeader;

