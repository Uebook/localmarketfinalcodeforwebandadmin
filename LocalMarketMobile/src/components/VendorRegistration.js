import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { launchImageLibrary } from 'react-native-image-picker';
import LocationPicker from './LocationPicker';
import { formatLocation } from '../constants/locations';

const VendorRegistration = ({ navigation, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showIdProofPicker, setShowIdProofPicker] = useState(false);
  const [showShopProofPicker, setShowShopProofPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    contactNumber: '',
    alternateMobile: '',
    whatsappNumber: '',
    email: '',
    referralCode: '',
    category: '',
    address: '',
    landmark: '',
    pincode: '',
    city: '',
    district: '',
    circle: '',
    location: null, // { state, city, town, tehsil, subTehsil }
    openingTime: '',
    closingTime: '',
    weeklyOff: '',
    ownerPhotoUrl: '',
    shopFrontPhotoUrl: '',
    insideShopPhotoUrl: '',
    idProofType: '',
    idProofUrl: '',
    shopProofType: '',
    shopProofUrl: '',
    gstNumber: '',
    panNumber: '',
  });

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.ownerName || !formData.contactNumber) {
        Alert.alert('Error', 'Please fill required fields (Shop Name, Owner Name, Mobile)');
        return;
      }
    }
    if (step === 2) {
      if (!formData.category || !formData.address || !formData.pincode) {
        Alert.alert('Error', 'Please fill required Shop Details');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else if (onCancel) {
      onCancel();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    if (!formData.ownerPhotoUrl || !formData.shopFrontPhotoUrl || !formData.idProofType || !formData.idProofUrl) {
      Alert.alert('Error', 'Please upload required photos and documents');
      return;
    }
    
    const finalData = {
      ...formData,
      id: `v${Date.now()}`,
      rating: 0,
      reviewCount: 0,
      distance: '0 km',
      imageUrl: formData.shopFrontPhotoUrl || 'https://placehold.co/400x300?text=New+Shop',
      isVerified: false,
      kycStatus: 'Pending',
      activationStatus: 'Pending',
      products: [],
      enquiries: [],
      reviews: [],
      offers: [],
    };
    
    setIsSubmitted(true);
    if (onComplete) {
      onComplete(finalData);
    }
  };

  const handleImagePicker = (fieldKey) => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        updateField(fieldKey, response.assets[0].uri);
      }
    });
  };

  const categories = ['Grocery', 'Fruits & Vegetables', 'Electronics', 'Mobile Accessories', 'Garments', 'Hardware', 'General Store', 'Others'];
  const idProofTypes = ['Aadhaar', 'PAN', 'Voter ID', 'Driving Licence'];
  const shopProofTypes = ['GST Certificate', 'Shop License', 'Rent Agreement', 'Utility Bill'];

  const PickerModal = ({ visible, onClose, items, onSelect, selectedValue, title }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name={getIconName('X')} size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {items.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.modalOption,
                  selectedValue === item && styles.modalOptionActive
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedValue === item && styles.modalOptionTextActive
                ]}>
                  {item}
                </Text>
                {selectedValue === item && (
                  <Icon name={getIconName('Check')} size={20} color="#ea580c" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const InputField = ({ label, iconName, value, onChange, required, placeholder, keyboardType, iconText }) => (
    <View style={styles.inputFieldContainer}>
      <Text style={styles.inputFieldLabel}>
        {label.toUpperCase()} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.inputFieldWrapper}>
        {iconText ? (
          <Text style={styles.inputIconText}>{iconText}</Text>
        ) : iconName ? (
          <Icon name={getIconName(iconName) || iconName?.toLowerCase()} size={20} color="#94a3b8" style={styles.inputIcon} />
        ) : null}
        <TextInput
          style={styles.inputField}
          value={value || ''}
          onChangeText={onChange}
          placeholder={placeholder || `Enter ${label}`}
          placeholderTextColor="#94a3b8"
          keyboardType={keyboardType || 'default'}
        />
      </View>
    </View>
  );

  const DropdownField = ({ label, value, onPress, iconName }) => (
    <View style={styles.inputFieldContainer}>
      <Text style={styles.inputFieldLabel}>{label.toUpperCase()}</Text>
      <TouchableOpacity style={styles.dropdownWrapper} onPress={onPress} activeOpacity={0.7}>
        <Icon name={getIconName(iconName)} size={20} color="#94a3b8" style={styles.inputIcon} />
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {value || `Select ${label}`}
        </Text>
        <Icon name={getIconName('ChevronDown')} size={20} color="#94a3b8" />
      </TouchableOpacity>
    </View>
  );

  const PhotoUploadField = ({ label, fieldKey, isSquare = true }) => {
    const hasImage = formData[fieldKey];
    return (
      <TouchableOpacity
        style={[styles.photoUploadField, isSquare ? styles.photoUploadSquare : styles.photoUploadRect]}
        onPress={() => handleImagePicker(fieldKey)}
        activeOpacity={0.7}
      >
        {hasImage ? (
          <Image source={{ uri: hasImage }} style={styles.photoUploadImage} />
        ) : (
          <>
            <Icon name="camera" size={32} color="#94a3b8" />
            <Text style={styles.photoUploadLabel}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  if (isSubmitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Icon name={getIconName('CheckCircle')} size={48} color="#16a34a" />
        </View>
        <Text style={styles.successTitle}>Registration Successful!</Text>
        <Text style={styles.successText}>
          Thank you for information, we will review and get back to you in{' '}
          <Text style={styles.bold}>48-72 hrs</Text>.
        </Text>
        <TouchableOpacity 
          style={styles.successButton}
          onPress={onCancel || (() => navigation?.goBack())}
          activeOpacity={0.7}
        >
          <Text style={styles.successButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.cancelButton} activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Local+ Registration</Text>
          <Text style={styles.stepIndicator}>Step {step}/3</Text>
        </View>
        <View style={styles.headerUnderline} />
      </SafeAreaView>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* STEP 1: BASIC INFORMATION */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeaderOrange}>
              <Text style={styles.stepHeaderTextOrange}>Basic Local+ Information</Text>
            </View>

            <View style={styles.fieldsContainer}>
              <InputField
                label="Shop Name"
                iconName="Store"
                value={formData.name}
                onChange={(v) => updateField('name', v)}
                required
              />
              <InputField
                label="Owner / Proprietor Name"
                iconName="User"
                value={formData.ownerName}
                onChange={(v) => updateField('ownerName', v)}
                required
              />
              <InputField
                label="Registered Mobile Number"
                iconName="Phone"
                value={formData.contactNumber}
                onChange={(v) => updateField('contactNumber', v)}
                keyboardType="phone-pad"
                required
              />
              <InputField
                label="Alternate Mobile Number (Optional)"
                iconName="Phone"
                value={formData.alternateMobile}
                onChange={(v) => updateField('alternateMobile', v)}
                keyboardType="phone-pad"
              />
              <InputField
                label="WhatsApp Number (Optional)"
                iconName="Phone"
                value={formData.whatsappNumber}
                onChange={(v) => updateField('whatsappNumber', v)}
                keyboardType="phone-pad"
              />
              <InputField
                label="Email Address (Optional)"
                iconName="Mail"
                value={formData.email}
                onChange={(v) => updateField('email', v)}
                keyboardType="email-address"
              />
              <InputField
                label="Referral Code (Optional)"
                iconName="Hash"
                iconText="#"
                value={formData.referralCode}
                onChange={(v) => updateField('referralCode', v)}
              />
            </View>
          </View>
        )}

        {/* STEP 2: SHOP DETAILS */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeaderOrange}>
              <Text style={styles.stepHeaderTextOrange}>Shop Details</Text>
            </View>

            <View style={styles.shopDetailsCard}>
              <View style={styles.fieldsContainer}>
                <DropdownField
                  label="Business Category"
                  value={formData.category}
                  onPress={() => setShowCategoryPicker(true)}
                  iconName="Store"
                />

                <InputField
                  label="Shop Address"
                  iconName="MapPin"
                  value={formData.address}
                  onChange={(v) => updateField('address', v)}
                  required
                />
                
                <InputField
                  label="Landmark"
                  iconName="MapPin"
                  value={formData.landmark}
                  onChange={(v) => updateField('landmark', v)}
                />

                <InputField
                  label="Pincode"
                  iconName="MapPin"
                  value={formData.pincode}
                  onChange={(v) => updateField('pincode', v)}
                  keyboardType="number-pad"
                  required
                />

                <DropdownField
                  label="Location (State/City/Town/Tehsil/Sub-Tehsil)"
                  value={formData.location ? formatLocation(formData.location) : ''}
                  onPress={() => setShowLocationPicker(true)}
                  iconName="MapPin"
                  placeholder="Select Location"
                />

                <InputField
                  label="City (Legacy)"
                  iconName="MapPin"
                  value={formData.city}
                  onChange={(v) => updateField('city', v)}
                />

                <InputField
                  label="District"
                  iconName="MapPin"
                  value={formData.district}
                  onChange={(v) => updateField('district', v)}
                  placeholder="Enter District"
                />

                <InputField
                  label="Circle (Micro-region)"
                  iconName="MapPin"
                  value={formData.circle}
                  onChange={(v) => updateField('circle', v)}
                  placeholder="e.g. Connaught Place"
                />

                <View style={styles.mapButtonContainer}>
                  <Text style={styles.inputFieldLabel}>SHOP LOCATION</Text>
                  <TouchableOpacity style={styles.mapButton} activeOpacity={0.7}>
                    <Icon name={getIconName('MapPin')} size={20} color="#ea580c" />
                    <Text style={styles.mapButtonText}>Drop Pin on Map</Text>
                  </TouchableOpacity>
                </View>

                <InputField
                  label="Opening Time"
                  iconName="Clock"
                  value={formData.openingTime}
                  onChange={(v) => updateField('openingTime', v)}
                  placeholder="--:--"
                />

                <InputField
                  label="Closing Time"
                  iconName="Clock"
                  value={formData.closingTime}
                  onChange={(v) => updateField('closingTime', v)}
                  placeholder="--:--"
                />

                <InputField
                  label="Weekly Off"
                  iconName="Clock"
                  value={formData.weeklyOff}
                  onChange={(v) => updateField('weeklyOff', v)}
                  placeholder="Enter Weekly Off"
                />
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: KYC & DOCUMENTS */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeaderGreen}>
              <Text style={styles.stepHeaderTextGreen}>KYC & Verification</Text>
            </View>

            {/* Photos */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="camera" size={20} color="#64748b" />
                <Text style={styles.sectionTitle}>Photos</Text>
              </View>
              <View style={styles.photosContainer}>
                <PhotoUploadField label="Owner Photo" fieldKey="ownerPhotoUrl" isSquare={true} />
                <PhotoUploadField label="Shop Front Photo" fieldKey="shopFrontPhotoUrl" isSquare={true} />
                <PhotoUploadField label="Inside Shop Photo (Optional)" fieldKey="insideShopPhotoUrl" isSquare={false} />
              </View>
            </View>

            {/* ID Proof */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name={getIconName('User')} size={20} color="#64748b" />
                <Text style={styles.sectionTitle}>Valid ID Proof</Text>
              </View>
              <View style={styles.fieldsContainer}>
                <DropdownField
                  label="ID Type"
                  value={formData.idProofType}
                  onPress={() => setShowIdProofPicker(true)}
                  iconName="User"
                />
                <PhotoUploadField label="Upload ID Proof" fieldKey="idProofUrl" isSquare={false} />
              </View>
            </View>

            {/* Shop Proof */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name={getIconName('Store')} size={20} color="#64748b" />
                <Text style={styles.sectionTitle}>Proof of Ownership</Text>
              </View>
              <View style={styles.fieldsContainer}>
                <DropdownField
                  label="Proof Type"
                  value={formData.shopProofType}
                  onPress={() => setShowShopProofPicker(true)}
                  iconName="Store"
                />
                <PhotoUploadField label="Upload Shop Proof" fieldKey="shopProofUrl" isSquare={false} />
              </View>
            </View>

            {/* Tax Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name={getIconName('FileText')} size={20} color="#64748b" />
                <Text style={styles.sectionTitle}>Tax Details</Text>
              </View>
              <View style={styles.fieldsContainer}>
                <InputField
                  label="GST Number (If applicable)"
                  iconName="Hash"
                  iconText="#"
                  value={formData.gstNumber}
                  onChange={(v) => updateField('gstNumber', v)}
                  placeholder="Enter GST Number (If applicable)"
                />
                <InputField
                  label="PAN Number (Optional)"
                  iconName="Hash"
                  iconText="#"
                  value={formData.panNumber}
                  onChange={(v) => updateField('panNumber', v)}
                  placeholder="Enter PAN Number (Optional)"
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Icon name={getIconName('ArrowLeft')} size={16} color="#475569" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, step === 3 && styles.submitButton]}
          onPress={step === 3 ? handleSubmit : handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {step === 3 ? 'Submit & Register' : 'Next Step'}
          </Text>
          {step === 3 ? (
            <Icon name={getIconName('CheckCircle')} size={18} color="#ffffff" />
          ) : (
            <Icon name={getIconName('ArrowRight')} size={18} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Pickers */}
      <PickerModal
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        items={categories}
        onSelect={(item) => updateField('category', item)}
        selectedValue={formData.category}
        title="Select Business Category"
      />
      <PickerModal
        visible={showIdProofPicker}
        onClose={() => setShowIdProofPicker(false)}
        items={idProofTypes}
        onSelect={(item) => updateField('idProofType', item)}
        selectedValue={formData.idProofType}
        title="Select ID Type"
      />
      <PickerModal
        visible={showShopProofPicker}
        onClose={() => setShowShopProofPicker(false)}
        items={shopProofTypes}
        onSelect={(item) => updateField('shopProofType', item)}
        selectedValue={formData.shopProofType}
        title="Select Proof Type"
      />

      {/* Location Picker */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(location) => {
          updateField('location', location);
          // Also update city field for backward compatibility
          if (location.city) {
            updateField('city', location.city);
          }
        }}
        initialLocation={formData.location || {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerUnderline: {
    height: 2,
    backgroundColor: '#ea580c',
    marginHorizontal: 20,
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ea580c',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#f3f4f6',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ea580c',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContent: {
    gap: 24,
  },
  stepHeaderOrange: {
    backgroundColor: '#fff7ed',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  stepHeaderGreen: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  stepHeaderTextOrange: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ea580c',
  },
  stepHeaderTextGreen: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16a34a',
  },
  shopDetailsCard: {
    backgroundColor: '#faf5f0',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  fieldsContainer: {
    gap: 16,
  },
  inputFieldContainer: {
    gap: 8,
  },
  inputFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  required: {
    color: '#dc2626',
  },
  inputFieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputIconText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
    padding: 0,
  },
  dropdownWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  dropdownPlaceholder: {
    color: '#94a3b8',
  },
  mapButtonContainer: {
    gap: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 12,
    paddingVertical: 14,
    minHeight: 48,
  },
  mapButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ea580c',
  },
  section: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoUploadField: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  photoUploadSquare: {
    width: '48%',
    aspectRatio: 1,
  },
  photoUploadRect: {
    width: '100%',
    height: 120,
  },
  photoUploadImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  photoUploadLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ea580c',
  },
  submitButton: {
    backgroundColor: '#ea580c',
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalOptionActive: {
    backgroundColor: '#fff7ed',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  modalOptionTextActive: {
    fontWeight: '700',
    color: '#ea580c',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 300,
  },
  bold: {
    fontWeight: '700',
    color: '#1e293b',
  },
  successButton: {
    width: '100%',
    maxWidth: 300,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ea580c',
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default VendorRegistration;
