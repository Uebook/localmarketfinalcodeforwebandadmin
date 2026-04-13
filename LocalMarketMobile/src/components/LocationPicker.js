import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getDynamicLocations, getCircles } from '../services/api';

const LocationPicker = ({ visible, onClose, onSelect, initialLocation = {}, showCircle = true }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);

  const [location, setLocation] = useState({
    state: initialLocation.state || '',
    city: initialLocation.city || '',
    town: initialLocation.town || '',
    tehsil: initialLocation.tehsil || '',
    subTehsil: initialLocation.subTehsil || '',
    circle: initialLocation.circle || '',
  });

  const [activeStep, setActiveStep] = useState('state');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = useCallback(async (step, loc) => {
    setLoading(true);
    try {
      let parentType = '';
      let parentValue = '';

      if (step === 'city') {
        parentType = 'state';
        parentValue = loc.state || '';
      } else if (step === 'town') {
        parentType = 'city';
        parentValue = loc.city || '';
      } else if (step === 'tehsil') {
        parentType = 'town';
        parentValue = loc.town || '';
      } else if (step === 'subTehsil') {
        parentType = 'tehsil';
        parentValue = loc.tehsil || '';
      }

      // We handle circle manually if needed, or if API doesn't support it, we fall back to static
      if (step === 'circle') {
        const areaName = loc.city || loc.town || loc.state;
        const result = await getCircles(areaName);
        if (result && result.circles) {
          setOptions(result.circles.map(c => typeof c === 'string' ? c : c.name));
        } else {
          setOptions([]);
        }
        setLoading(false);
        return;
      }

      const result = await getDynamicLocations(parentType, parentValue);
      if (result && result.success) {
        let fetchedOptions = result.data || [];
        
        // Add "All in..." options for user convenience
        if (step === 'state') {
          setOptions(['India-wise (All of India)', ...fetchedOptions]);
        } else if (step === 'city') {
          setOptions([`All in ${loc.state}`, ...fetchedOptions]);
        } else if (step === 'town') {
           setOptions([`All in ${loc.city}`, ...fetchedOptions]);
        } else if (step === 'tehsil') {
           setOptions([`All in ${loc.town}`, ...fetchedOptions]);
        } else if (step === 'subTehsil') {
           setOptions([`All in ${loc.tehsil}`, ...fetchedOptions]);
        } else {
          setOptions(fetchedOptions);
        }
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error('Error fetching location options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // When modal becomes visible, start fetching states if options are empty
  useEffect(() => {
    if (visible && activeStep === 'state') {
      fetchOptions('state', location);
    }
  }, [visible, activeStep, fetchOptions]);

  const handleSelect = async (key, value) => {
    if (value === 'India-wise (All of India)') {
      onSelect({ ...location, circle: 'All India' });
      onClose();
      return;
    }

    if (value.startsWith('All in ')) {
      const area = value.replace('All in ', '');
      const finalLocation = { ...location };
      if (key === 'state') finalLocation.state = area;
      else if (key === 'city') finalLocation.city = area;
      else if (key === 'town') finalLocation.town = area;
      else if (key === 'tehsil') finalLocation.tehsil = area;
      else if (key === 'subTehsil') finalLocation.subTehsil = area;
      
      onSelect({ ...finalLocation, circle: `All ${area}` });
      onClose();
      return;
    }

    const newLocation = { ...location, [key]: value };

    if (key === 'state') {
      newLocation.city = '';
      newLocation.town = '';
      newLocation.tehsil = '';
      newLocation.subTehsil = '';
      newLocation.circle = '';
      setActiveStep('city');
      fetchOptions('city', newLocation);
    } else if (key === 'city') {
      newLocation.town = '';
      newLocation.tehsil = '';
      newLocation.subTehsil = '';
      newLocation.circle = '';
      setActiveStep('town');
      fetchOptions('town', newLocation);
    } else if (key === 'town') {
      newLocation.tehsil = '';
      newLocation.subTehsil = '';
      newLocation.circle = '';
      setActiveStep('tehsil');
      fetchOptions('tehsil', newLocation);
    } else if (key === 'tehsil') {
      newLocation.subTehsil = '';
      newLocation.circle = '';
      setActiveStep('subTehsil');
      fetchOptions('subTehsil', newLocation);
    } else if (key === 'subTehsil') {
      if (showCircle) {
        newLocation.circle = '';
        setActiveStep('circle');
        fetchOptions('circle', newLocation);
      } else {
        onSelect(newLocation);
        onClose();
        return;
      }
    } else if (key === 'circle') {
      onSelect(newLocation);
      onClose();
      return;
    }

    setLocation(newLocation);
  };

  const getStepLabel = () => {
    switch (activeStep) {
      case 'state': return 'Select State';
      case 'city': return 'Select City';
      case 'town': return 'Select Town';
      case 'tehsil': return 'Select Tehsil';
      case 'subTehsil': return 'Select Sub-Tehsil';
      case 'circle': return 'Select Circle';
      default: return 'Select Location';
    }
  };

  const handleBack = () => {
    if (activeStep === 'city') {
      setActiveStep('state');
      setLocation({ ...location, city: '', town: '', tehsil: '', subTehsil: '', circle: '' });
      fetchOptions('state', {});
    } else if (activeStep === 'town') {
      setActiveStep('city');
      setLocation({ ...location, town: '', tehsil: '', subTehsil: '', circle: '' });
      fetchOptions('city', location);
    } else if (activeStep === 'tehsil') {
      setActiveStep('town');
      setLocation({ ...location, tehsil: '', subTehsil: '', circle: '' });
      fetchOptions('town', location);
    } else if (activeStep === 'subTehsil') {
      setActiveStep('tehsil');
      setLocation({ ...location, subTehsil: '', circle: '' });
      fetchOptions('tehsil', location);
    } else if (activeStep === 'circle') {
      setActiveStep('subTehsil');
      setLocation({ ...location, circle: '' });
      fetchOptions('subTehsil', location);
    }
  };

  const handleModalClose = () => {
    // Reset to start
    setLocation({
      state: initialLocation.state || '',
      city: initialLocation.city || '',
      town: initialLocation.town || '',
      tehsil: initialLocation.tehsil || '',
      subTehsil: initialLocation.subTehsil || '',
      circle: initialLocation.circle || '',
    });
    setActiveStep('state');
    onClose();
  };

  // Build breadcrumb segments to map
  const breadcrumbSegments = [
    { key: 'state', value: location.state },
    { key: 'city', value: location.city },
    { key: 'town', value: location.town },
    { key: 'tehsil', value: location.tehsil },
    { key: 'subTehsil', value: location.subTehsil }
  ].filter(seg => seg.value);


  const renderItem = ({ item }) => {
    const isAll = item.startsWith('All in') || item === 'India-wise (All of India)';
    
    return (
      <TouchableOpacity
        style={[styles.listItem, isAll && styles.listItemSelected]}
        onPress={() => handleSelect(activeStep, item)}
        activeOpacity={0.7}
      >
        <View style={styles.listItemLeft}>
          <View style={[styles.itemIconContainer, isAll && { backgroundColor: 'rgba(232, 106, 44, 0.15)' }]}>
            <Icon name={getIconName('MapPin')} size={16} color={isAll ? COLORS.orange : COLORS.textMuted} />
          </View>
          <Text style={[styles.listItemText, isAll && styles.listItemTextSelected]}>
            {item}
          </Text>
        </View>
        <Icon name={getIconName('ChevronRight')} size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  };


  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            {activeStep !== 'state' ? (
              <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                <Icon name={getIconName('ArrowLeft')} size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleModalClose} style={styles.headerButton}>
                <Icon name={getIconName('X')} size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
            
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{getStepLabel()}</Text>
            </View>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Breadcrumb Trail */}
          {breadcrumbSegments.length > 0 && (
            <View style={styles.breadcrumbContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breadcrumbScroll}>
                {breadcrumbSegments.map((seg, idx) => (
                  <View key={idx} style={styles.breadcrumbItem}>
                    {idx > 0 && <Icon name={getIconName('ChevronRight')} size={14} color={COLORS.textMuted} style={styles.breadcrumbArrow} />}
                    <Text style={[styles.breadcrumbText, idx === breadcrumbSegments.length - 1 && styles.breadcrumbTextActive]}>
                      {seg.value}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* List Options */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.orange} />
              <Text style={styles.loadingText}>Fetching available locations...</Text>
            </View>
          ) : options.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                 <Icon name={getIconName('Map')} size={32} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyText}>No locations found</Text>
              <TouchableOpacity onPress={handleBack}>
                <Text style={styles.goBackText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${activeStep}-${index}-${item}`}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          )}

        </View>
      </View>
    </Modal>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerButton: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerPlaceholder: {
    width: 36, // balances out headerButton
  },
  breadcrumbContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingVertical: 12,
  },
  breadcrumbScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbArrow: {
    marginHorizontal: 4,
  },
  breadcrumbText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  breadcrumbTextActive: {
    color: COLORS.orange,
    fontWeight: '800',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 16,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  listItemSelected: {
    borderColor: COLORS.orange,
    backgroundColor: '#FFF7ED',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.highlightBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItemText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  listItemTextSelected: {
    color: COLORS.orange,
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  goBackText: {
    color: COLORS.orange,
    fontWeight: '800',
    marginTop: 8,
    fontSize: 15,
    textDecorationLine: 'underline',
  }
});

export default LocationPicker;
