import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { COLORS } from '../constants/colors';
import { getStates, getCities, getTowns, getTehsils, getSubTehsils, CIRCLES } from '../constants/locations';

const LocationSelector = ({
  navigation,
  onBack,
  onSelect,
  initialLocation = {},
  showCircle = false
}) => {
  const [location, setLocation] = useState({
    state: initialLocation.state || '',
    city: initialLocation.city || '',
    town: initialLocation.town || '',
    tehsil: initialLocation.tehsil || '',
    subTehsil: initialLocation.subTehsil || '',
    circle: initialLocation.circle || '',
  });

  const [activeStep, setActiveStep] = useState('state');

  const states = getStates();
  const cities = location.state ? getCities(location.state) : [];
  const towns = location.state && location.city ? getTowns(location.state, location.city) : [];
  const tehsils = location.state && location.city && location.town 
    ? getTehsils(location.state, location.city, location.town) 
    : [];
  const subTehsils = location.state && location.city && location.town && location.tehsil
    ? getSubTehsils(location.state, location.city, location.town, location.tehsil)
    : [];

  const handleSelect = (key, value) => {
    const newLocation = { ...location, [key]: value };
    
    // Reset dependent fields
    if (key === 'state') {
      newLocation.city = '';
      newLocation.town = '';
      newLocation.tehsil = '';
      newLocation.subTehsil = '';
      setActiveStep('city');
    } else if (key === 'city') {
      newLocation.town = '';
      newLocation.tehsil = '';
      newLocation.subTehsil = '';
      setActiveStep('town');
    } else if (key === 'town') {
      newLocation.tehsil = '';
      newLocation.subTehsil = '';
      setActiveStep('tehsil');
    } else if (key === 'tehsil') {
      newLocation.subTehsil = '';
      setActiveStep('subTehsil');
    } else if (key === 'subTehsil') {
      if (showCircle) {
        setActiveStep('circle');
      } else {
        handleConfirm(newLocation);
        return;
      }
    } else if (key === 'circle') {
      handleConfirm(newLocation);
      return;
    }

    setLocation(newLocation);
  };

  const handleConfirm = (finalLocation) => {
    if (onSelect) {
      onSelect(finalLocation);
    }
    if (onBack) {
      onBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const getCurrentOptions = () => {
    switch (activeStep) {
      case 'state':
        return states;
      case 'city':
        return cities;
      case 'town':
        return towns;
      case 'tehsil':
        return tehsils;
      case 'subTehsil':
        return subTehsils;
      case 'circle':
        return CIRCLES;
      default:
        return [];
    }
  };

  const getStepLabel = () => {
    switch (activeStep) {
      case 'state':
        return 'Select State';
      case 'city':
        return 'Select City';
      case 'town':
        return 'Select Town';
      case 'tehsil':
        return 'Select Tehsil';
      case 'subTehsil':
        return 'Select Sub-Tehsil';
      case 'circle':
        return 'Select Circle';
      default:
        return 'Select Location';
    }
  };

  const getStepKey = () => {
    switch (activeStep) {
      case 'state':
        return 'state';
      case 'city':
        return 'city';
      case 'town':
        return 'town';
      case 'tehsil':
        return 'tehsil';
      case 'subTehsil':
        return 'subTehsil';
      case 'circle':
        return 'circle';
      default:
        return 'state';
    }
  };

  const canGoBack = () => {
    return activeStep !== 'state';
  };

  const handleBack = () => {
    if (activeStep === 'city') {
      setActiveStep('state');
      setLocation({ ...location, city: '', town: '', tehsil: '', subTehsil: '', circle: '' });
    } else if (activeStep === 'town') {
      setActiveStep('city');
      setLocation({ ...location, town: '', tehsil: '', subTehsil: '', circle: '' });
    } else if (activeStep === 'tehsil') {
      setActiveStep('town');
      setLocation({ ...location, tehsil: '', subTehsil: '', circle: '' });
    } else if (activeStep === 'subTehsil') {
      setActiveStep('tehsil');
      setLocation({ ...location, subTehsil: '', circle: '' });
    } else if (activeStep === 'circle') {
      setActiveStep('subTehsil');
      setLocation({ ...location, circle: '' });
    }
  };

  const options = getCurrentOptions();

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          {canGoBack() ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
              <Icon name={getIconName('ArrowLeft')} size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                if (onBack) onBack();
                else if (navigation) navigation.goBack();
              }}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Icon name={getIconName('ArrowLeft')} size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{getStepLabel()}</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      {/* Location Breadcrumb */}
      {location.state && (
        <View style={styles.breadcrumb}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.breadcrumbContent}>
              {location.state && (
                <View style={styles.breadcrumbItem}>
                  <Text style={styles.breadcrumbText}>{location.state}</Text>
                  {location.city && <Icon name="chevron-right" size={14} color={COLORS.textMuted} />}
                </View>
              )}
              {location.city && (
                <View style={styles.breadcrumbItem}>
                  <Text style={styles.breadcrumbText}>{location.city}</Text>
                  {location.town && <Icon name="chevron-right" size={14} color={COLORS.textMuted} />}
                </View>
              )}
              {location.town && (
                <View style={styles.breadcrumbItem}>
                  <Text style={styles.breadcrumbText}>{location.town}</Text>
                  {location.tehsil && <Icon name="chevron-right" size={14} color={COLORS.textMuted} />}
                </View>
              )}
              {location.tehsil && (
                <View style={styles.breadcrumbItem}>
                  <Text style={styles.breadcrumbText}>{location.tehsil}</Text>
                  {location.subTehsil && <Icon name="chevron-right" size={14} color={COLORS.textMuted} />}
                </View>
              )}
              {location.subTehsil && (
                <View style={styles.breadcrumbItem}>
                  <Text style={styles.breadcrumbText}>{location.subTehsil}</Text>
                  {location.circle && <Icon name="chevron-right" size={14} color={COLORS.textMuted} />}
                </View>
              )}
              {location.circle && (
                <View style={styles.breadcrumbItem}>
                  <Text style={styles.breadcrumbText}>{location.circle}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {options.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="alert-circle" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyStateText}>
              Please select {activeStep === 'city' ? 'a state' : activeStep === 'town' ? 'a city' : 'previous options'} first
            </Text>
          </View>
        ) : (
          <View style={styles.optionsList}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionItem}
                onPress={() => handleSelect(getStepKey(), option)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>{option}</Text>
                <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  breadcrumb: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  breadcrumbContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  breadcrumbText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  optionsList: {
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default LocationSelector;
