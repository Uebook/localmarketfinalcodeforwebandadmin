import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useThemeColors } from '../hooks/useThemeColors';
import api from '../services/api';

export default function PostRequirementScreen(props) {
  const { navigation, route } = props;
  const themeColors = useThemeColors();
  const userData = route?.params?.userData || props.userData || {};
  const locationState = route?.params?.locationState || props.locationState || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [radius, setRadius] = useState(5); // Default 5 km
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New states for Modal selection
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationName, setLocationName] = useState(locationState?.fullAddress || locationState?.displayLabel || 'Amritsar, India');
  const [locationCoords, setLocationCoords] = useState({ lat: locationState?.lat || 31.6340, lng: locationState?.lng || 74.8723 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.getCategories();
      if (res && res.categories) {
        setCategories(res.categories);
        if (res.categories.length > 0) {
          setCategory(res.categories[0].name || res.categories[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert('Error', 'Please fill in all mandatory fields (Title, Description, Category)');
      return;
    }

    if (!userData?.id) {
      Alert.alert('Error', 'You must be logged in to post a requirement');
      return;
    }

    try {
      setSubmitting(true);
      const requirementData = {
        buyer_id: userData.id,
        title: title.trim(),
        description: description.trim(),
        category,
        quantity: parseInt(quantity) || 1,
        unit,
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        lat: locationCoords.lat,
        lng: locationCoords.lng,
        location_text: locationName,
        radius_km: radius,
        photos: []
      };

      const res = await api.postRequirement(requirementData);
      if (res.success || res.requirement) {
        setTitle('');
        setDescription('');
        setCategory('');
        setQuantity('1');
        setUnit('pcs');
        setBudgetMin('');
        setBudgetMax('');
        setRadius(5);
        Alert.alert('Success', 'Your requirement has been posted! Nearby vendors will be notified.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(res.error || 'Failed to post requirement');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSoft }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: themeColors.white, borderBottomColor: themeColors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Post Requirement</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        
        <View style={[styles.card, { backgroundColor: themeColors.white, borderColor: themeColors.divider }]}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Title *</Text>
          <TextInput
            style={[styles.input, { borderColor: themeColors.divider, color: themeColors.textPrimary }]}
            placeholder="e.g., Need 50 custom printed t-shirts"
            placeholderTextColor={themeColors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />
          <Text style={[styles.hint, { color: themeColors.textMuted }]}>{title.length}/80 characters</Text>

          <Text style={[styles.label, { color: themeColors.textSecondary, marginTop: 16 }]}>Category *</Text>
          <TouchableOpacity 
            style={[styles.input, styles.dropdownInput, { borderColor: themeColors.divider }]}
            onPress={() => setShowCategoryModal(true)}
            activeOpacity={0.7}
          >
            <Text style={{ color: category ? themeColors.textPrimary : themeColors.textMuted, fontSize: 14 }}>
              {loading ? 'Loading...' : (category || 'Select Category')}
            </Text>
            <Icon name="chevron-down" size={18} color={themeColors.textMuted} />
          </TouchableOpacity>

          <Text style={[styles.label, { color: themeColors.textSecondary, marginTop: 16 }]}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { borderColor: themeColors.divider, color: themeColors.textPrimary }]}
            placeholder="Describe your requirement in detail..."
            placeholderTextColor={themeColors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={[styles.hint, { color: themeColors.textMuted }]}>{description.length}/500 characters</Text>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.white, borderColor: themeColors.divider }]}>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Quantity</Text>
              <TextInput
                style={[styles.input, { borderColor: themeColors.divider, color: themeColors.textPrimary }]}
                placeholder="1"
                placeholderTextColor={themeColors.textMuted}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Unit</Text>
              <TextInput
                style={[styles.input, { borderColor: themeColors.divider, color: themeColors.textPrimary }]}
                placeholder="pcs, kg, liters..."
                placeholderTextColor={themeColors.textMuted}
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </View>

          <Text style={[styles.label, { color: themeColors.textSecondary, marginTop: 16 }]}>Budget Range (Optional)</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <TextInput
                style={[styles.input, { borderColor: themeColors.divider, color: themeColors.textPrimary }]}
                placeholder="Min ₹"
                placeholderTextColor={themeColors.textMuted}
                value={budgetMin}
                onChangeText={setBudgetMin}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TextInput
                style={[styles.input, { borderColor: themeColors.divider, color: themeColors.textPrimary }]}
                placeholder="Max ₹"
                placeholderTextColor={themeColors.textMuted}
                value={budgetMax}
                onChangeText={setBudgetMax}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.white, borderColor: themeColors.divider }]}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Location</Text>
          <TouchableOpacity 
            style={[styles.locationBox, { backgroundColor: themeColors.backgroundSoft, borderColor: themeColors.divider }]}
            onPress={() => setShowLocationModal(true)}
            activeOpacity={0.7}
          >
            <Icon name="map-pin" size={16} color={themeColors.primaryOrange} />
            <Text style={[styles.locationText, { color: themeColors.textPrimary }]} numberOfLines={1}>
              {locationName}
            </Text>
            <Icon name="edit-2" size={14} color={themeColors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.row, { justifyContent: 'space-between', marginTop: 16, marginBottom: 8 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary, marginBottom: 0 }]}>Search Radius</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: themeColors.primaryOrange }}>{radius} KM</Text>
          </View>
          <View style={{ paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 }}>
              <Text style={{ fontSize: 12, color: themeColors.textMuted, marginRight: 8 }}>1 km</Text>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {[1, 5, 10, 15, 20].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: themeColors.divider },
                      radius === val && { backgroundColor: themeColors.primaryOrange, borderColor: themeColors.primaryOrange }
                    ]}
                    onPress={() => setRadius(val)}
                  >
                    <Text style={[
                      { fontSize: 12, fontWeight: '600', color: themeColors.textPrimary },
                      radius === val && { color: '#FFF' }
                    ]}>{val}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ fontSize: 12, color: themeColors.textMuted, marginLeft: 8 }}>20 km</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      <View style={[styles.footer, { backgroundColor: themeColors.white, borderTopColor: themeColors.divider }]}>
        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: themeColors.primaryOrange }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Post Requirement</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Dropdown Modal */}
      <Modal visible={showCategoryModal} transparent animationType="fade" onRequestClose={() => setShowCategoryModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)} activeOpacity={1}>
          <View style={[styles.bottomSheet, { backgroundColor: themeColors.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Icon name="x" size={24} color={themeColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12 }}>
                <Icon name="search" size={18} color={themeColors.textMuted} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, color: themeColors.textPrimary }}
                  placeholder="Search categories..."
                  placeholderTextColor={themeColors.textMuted}
                  value={categorySearch}
                  onChangeText={setCategorySearch}
                />
              </View>
            </View>
            <ScrollView style={{ padding: 16, maxHeight: 300 }}>
              {categories
                .filter(cat => (cat.name || cat.id).toLowerCase().includes(categorySearch.toLowerCase()))
                .map((cat, idx) => {
                const catName = cat.name || cat.id;
                const isSelected = category === catName;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dropdownOption, 
                      isSelected && { backgroundColor: themeColors.primaryOrange + '15', borderColor: themeColors.primaryOrange }
                    ]}
                    onPress={() => {
                      setCategory(catName);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownOptionText, 
                      { color: themeColors.textPrimary },
                      isSelected && { color: themeColors.primaryOrange, fontWeight: '700' }
                    ]}>{catName}</Text>
                    {isSelected && <Icon name="check" size={18} color={themeColors.primaryOrange} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Location Selection Modal */}
      <Modal visible={showLocationModal} animationType="slide" onRequestClose={() => setShowLocationModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.backgroundSoft }}>
          <View style={[styles.header, { backgroundColor: themeColors.white, borderBottomColor: themeColors.divider }]}>
            <TouchableOpacity onPress={() => setShowLocationModal(false)} style={styles.backButton}>
              <Icon name="x" size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Select Location</Text>
            <View style={{ width: 40 }} />
          </View>

          <TouchableOpacity
            style={[styles.currentLocBtn, { backgroundColor: themeColors.white, borderBottomColor: themeColors.divider }]}
            onPress={() => {
              setLocationName(locationState?.fullAddress || locationState?.displayLabel || 'Current Location');
              setLocationCoords({ lat: locationState?.lat || 31.6340, lng: locationState?.lng || 74.8723 });
              setShowLocationModal(false);
            }}
          >
            <View style={[styles.iconWrap, { backgroundColor: themeColors.primaryBlue + '15' }]}>
              <Icon name="crosshair" size={18} color={themeColors.primaryBlue} />
            </View>
            <Text style={[styles.currentLocText, { color: themeColors.primaryBlue }]}>Use Current Location</Text>
          </TouchableOpacity>

          <View style={{ flex: 1, padding: 16 }}>
            <Text style={[styles.label, { color: themeColors.textSecondary, marginBottom: 8 }]}>Search Location</Text>
            <GooglePlacesAutocomplete
              placeholder="Search for a place (e.g. City, Area)"
              fetchDetails={true}
              onPress={(data, details = null) => {
                setLocationName(data.description);
                if (details?.geometry?.location) {
                  setLocationCoords({
                    lat: details.geometry.location.lat,
                    lng: details.geometry.location.lng
                  });
                }
                setShowLocationModal(false);
              }}
              query={{
                key: 'AIzaSyAonK15hotzDslX4ePjIbmizRii-7Ng4QE',
                language: 'en',
                components: 'country:in', // restrict to India for LocalMarket
              }}
              styles={{
                container: { flex: 1 },
                textInputContainer: {
                  width: '100%',
                },
                textInput: {
                  height: 48,
                  color: themeColors.textPrimary,
                  fontSize: 15,
                  backgroundColor: themeColors.white,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: themeColors.divider,
                  paddingHorizontal: 16,
                },
                listView: {
                  backgroundColor: themeColors.white,
                  borderRadius: 8,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: themeColors.divider,
                  elevation: 2,
                },
                row: {
                  padding: 13,
                  flexDirection: 'row',
                },
                separator: {
                  height: 1,
                  backgroundColor: themeColors.divider,
                },
                description: {
                  color: themeColors.textPrimary,
                }
              }}
              enablePoweredByContainer={false}
              textInputProps={{
                placeholderTextColor: themeColors.textMuted
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  hint: { fontSize: 12, marginTop: 4, textAlign: 'right' },
  row: { flexDirection: 'row', alignItems: 'center' },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  locationText: { flex: 1, marginLeft: 8, fontSize: 14 },
  footer: { padding: 16, borderTopWidth: 1 },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  dropdownOptionText: { fontSize: 15, fontWeight: '500' },
  
  // Location Modal styles
  currentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentLocText: {
    fontSize: 15,
    fontWeight: '600',
  }
});
