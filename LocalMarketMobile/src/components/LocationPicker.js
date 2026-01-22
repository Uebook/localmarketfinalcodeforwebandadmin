import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getStates, getCities, getTowns, getTehsils, getSubTehsils } from '../constants/locations';

const LocationPicker = ({ visible, onClose, onSelect, initialLocation = {} }) => {
  const COLORS = useThemeColors();
  const [selectedState, setSelectedState] = useState(initialLocation.state || '');
  const [selectedCity, setSelectedCity] = useState(initialLocation.city || '');
  const [selectedTown, setSelectedTown] = useState(initialLocation.town || '');
  const [selectedTehsil, setSelectedTehsil] = useState(initialLocation.tehsil || '');
  const [selectedSubTehsil, setSelectedSubTehsil] = useState(initialLocation.subTehsil || '');
  const [currentLevel, setCurrentLevel] = useState('state'); // state, city, town, tehsil, subTehsil

  const states = getStates();
  const cities = selectedState ? getCities(selectedState) : [];
  const towns = selectedState && selectedCity ? getTowns(selectedState, selectedCity) : [];
  const tehsils = selectedState && selectedCity && selectedTown ? getTehsils(selectedState, selectedCity, selectedTown) : [];
  const subTehsils = selectedState && selectedCity && selectedTown && selectedTehsil ? getSubTehsils(selectedState, selectedCity, selectedTown, selectedTehsil) : [];

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedCity('');
    setSelectedTown('');
    setSelectedTehsil('');
    setSelectedSubTehsil('');
    setCurrentLevel('city');
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSelectedTown('');
    setSelectedTehsil('');
    setSelectedSubTehsil('');
    setCurrentLevel('town');
  };

  const handleTownSelect = (town) => {
    setSelectedTown(town);
    setSelectedTehsil('');
    setSelectedSubTehsil('');
    setCurrentLevel('tehsil');
  };

  const handleTehsilSelect = (tehsil) => {
    setSelectedTehsil(tehsil);
    setSelectedSubTehsil('');
    setCurrentLevel('subTehsil');
  };

  const handleSubTehsilSelect = (subTehsil) => {
    setSelectedSubTehsil(subTehsil);
    handleConfirm();
  };

  const handleConfirm = () => {
    const location = {
      state: selectedState,
      city: selectedCity,
      town: selectedTown,
      tehsil: selectedTehsil,
      subTehsil: selectedSubTehsil,
    };
    onSelect(location);
    handleClose();
  };

  const handleClose = () => {
    setSelectedState(initialLocation.state || '');
    setSelectedCity(initialLocation.city || '');
    setSelectedTown(initialLocation.town || '');
    setSelectedTehsil(initialLocation.tehsil || '');
    setSelectedSubTehsil(initialLocation.subTehsil || '');
    setCurrentLevel('state');
    onClose();
  };

  const handleBack = () => {
    if (currentLevel === 'subTehsil') {
      setCurrentLevel('tehsil');
      setSelectedSubTehsil('');
    } else if (currentLevel === 'tehsil') {
      setCurrentLevel('town');
      setSelectedTehsil('');
    } else if (currentLevel === 'town') {
      setCurrentLevel('city');
      setSelectedTown('');
    } else if (currentLevel === 'city') {
      setCurrentLevel('state');
      setSelectedCity('');
    }
  };

  const renderItem = ({ item, index }) => {
    let onPress;
    let isSelected = false;

    if (currentLevel === 'state') {
      onPress = () => handleStateSelect(item);
      isSelected = selectedState === item;
    } else if (currentLevel === 'city') {
      onPress = () => handleCitySelect(item);
      isSelected = selectedCity === item;
    } else if (currentLevel === 'town') {
      onPress = () => handleTownSelect(item);
      isSelected = selectedTown === item;
    } else if (currentLevel === 'tehsil') {
      onPress = () => handleTehsilSelect(item);
      isSelected = selectedTehsil === item;
    } else if (currentLevel === 'subTehsil') {
      onPress = () => handleSubTehsilSelect(item);
      isSelected = selectedSubTehsil === item;
    }

    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.listItemSelected]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>
          {item}
        </Text>
        {isSelected && (
          <Icon name={getIconName('Check')} size={20} color={COLORS.orange} />
        )}
        {!isSelected && currentLevel !== 'subTehsil' && (
          <Icon name={getIconName('ChevronRight')} size={20} color={COLORS.textMuted} />
        )}
      </TouchableOpacity>
    );
  };

  const getCurrentData = () => {
    if (currentLevel === 'state') return states;
    if (currentLevel === 'city') return cities;
    if (currentLevel === 'town') return towns;
    if (currentLevel === 'tehsil') return tehsils;
    if (currentLevel === 'subTehsil') return subTehsils;
    return [];
  };

  const getTitle = () => {
    const titles = {
      state: 'Select State',
      city: 'Select City',
      town: 'Select Town',
      tehsil: 'Select Tehsil',
      subTehsil: 'Select Sub-Tehsil',
    };
    return titles[currentLevel] || 'Select Location';
  };

  const getBreadcrumb = () => {
    const parts = [];
    if (selectedState) parts.push(selectedState);
    if (selectedCity) parts.push(selectedCity);
    if (selectedTown) parts.push(selectedTown);
    if (selectedTehsil) parts.push(selectedTehsil);
    return parts.join(' > ');
  };

  const canConfirm = selectedState && selectedCity && selectedTown;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name={getIconName('X')} size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{getTitle()}</Text>
              {getBreadcrumb() && (
                <Text style={styles.breadcrumb} numberOfLines={1}>{getBreadcrumb()}</Text>
              )}
            </View>
            {currentLevel !== 'state' && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Icon name={getIconName('ArrowLeft')} size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
            {!canConfirm && <View style={styles.placeholder} />}
          </View>

          {/* List */}
          <FlatList
            data={getCurrentData()}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${currentLevel}-${index}-${item}`}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />

          {/* Footer */}
          {canConfirm && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Confirm Selection</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  closeButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  breadcrumb: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  listItemSelected: {
    backgroundColor: '#FFF4EC',
  },
  listItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  listItemTextSelected: {
    fontWeight: '600',
    color: COLORS.orange,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  confirmButton: {
    backgroundColor: COLORS.orange,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default LocationPicker;
