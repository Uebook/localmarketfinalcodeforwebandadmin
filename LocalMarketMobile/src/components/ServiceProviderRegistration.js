import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { COLORS } from '../constants/colors';
import { launchImageLibrary } from 'react-native-image-picker';
import LocationPicker from './LocationPicker';
import { formatLocation } from '../constants/locations';
import { generateVendorId } from '../utils/paymentUtils';

const SERVICE_TYPES = ['Carpenter', 'Plumber', 'Electrician', 'Painter', 'Mechanic', 'AC Repair', 'Other'];

const ServiceProviderRegistration = ({ navigation, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    name: '',
    contactNumber: '',
    alternateMobile: '',
    whatsappNumber: '',
    email: '',
    address: '',
    location: null,
    pincode: '',
    experience: '',
    photoUrl: '',
    idProofType: '',
    idProofUrl: '',
  });

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        updateField('photoUrl', response.assets[0].uri);
      }
    });
  };

  const handleIdProofPicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        updateField('idProofUrl', response.assets[0].uri);
      }
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.serviceType || !formData.name || !formData.contactNumber) {
        Alert.alert('Error', 'Please fill required fields (Service Type, Name, Mobile)');
        return;
      }
    }
    if (step === 2) {
      if (!formData.address || !formData.pincode) {
        Alert.alert('Error', 'Please fill required address fields');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = () => {
    if (!formData.photoUrl || !formData.idProofUrl) {
      Alert.alert('Error', 'Please upload photo and ID proof');
      return;
    }

    const vendorId = generateVendorId(formData);
    const finalData = {
      ...formData,
      id: `sp${Date.now()}`,
      vendorId: vendorId,
      category: formData.serviceType,
      rating: 0,
      reviewCount: 0,
      isServiceProvider: true,
      activationStatus: 'Pending',
      kycStatus: 'Pending',
    };

    if (onComplete) {
      onComplete(finalData);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      />
      
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onCancel} style={styles.backButton}>
            <Icon name={getIconName('ArrowLeft')} size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Provider Registration</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* STEP 1: SERVICE TYPE & BASIC INFO */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Service Details</Text>
            <Text style={styles.stepSubtitle}>Step 1 of 3</Text>

            <View style={styles.serviceTypesGrid}>
              {SERVICE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.serviceTypeCard,
                    formData.serviceType === type && styles.serviceTypeCardSelected
                  ]}
                  onPress={() => updateField('serviceType', type)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.serviceTypeText,
                    formData.serviceType === type && styles.serviceTypeTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(v) => updateField('name', v)}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.contactNumber}
                onChangeText={(v) => updateField('contactNumber', v)}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alternate Mobile (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.alternateMobile}
                onChangeText={(v) => updateField('alternateMobile', v)}
                placeholder="Enter alternate mobile"
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>WhatsApp Number</Text>
              <TextInput
                style={styles.input}
                value={formData.whatsappNumber}
                onChangeText={(v) => updateField('whatsappNumber', v)}
                placeholder="Enter WhatsApp number"
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(v) => updateField('email', v)}
                placeholder="Enter email address"
                keyboardType="email-address"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
        )}

        {/* STEP 2: LOCATION */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Location Details</Text>
            <Text style={styles.stepSubtitle}>Step 2 of 3</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(v) => updateField('address', v)}
                placeholder="Enter your address"
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setShowLocationPicker(true)}
              activeOpacity={0.7}
            >
              <Icon name={getIconName('MapPin')} size={20} color={COLORS.orange} />
              <View style={styles.locationButtonContent}>
                <Text style={styles.locationButtonLabel}>Location (State/City/Town/Tehsil/Sub-Tehsil)</Text>
                <Text style={styles.locationButtonValue}>
                  {formData.location ? formatLocation(formData.location) : 'Tap to select location'}
                </Text>
              </View>
              <Icon name={getIconName('ChevronRight')} size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pincode *</Text>
              <TextInput
                style={styles.input}
                value={formData.pincode}
                onChangeText={(v) => updateField('pincode', v)}
                placeholder="Enter pincode"
                keyboardType="number-pad"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Years of Experience</Text>
              <TextInput
                style={styles.input}
                value={formData.experience}
                onChangeText={(v) => updateField('experience', v)}
                placeholder="e.g., 5 years"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
        )}

        {/* STEP 3: DOCUMENTS */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Documents & Verification</Text>
            <Text style={styles.stepSubtitle}>Step 3 of 3</Text>

            <View style={styles.uploadSection}>
              <Text style={styles.label}>Your Photo *</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
                {formData.photoUrl ? (
                  <Image source={{ uri: formData.photoUrl }} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Icon name={getIconName('Camera')} size={32} color={COLORS.textMuted} />
                    <Text style={styles.uploadText}>Tap to upload photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.uploadSection}>
              <Text style={styles.label}>ID Proof (Aadhaar/PAN) *</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleIdProofPicker}>
                {formData.idProofUrl ? (
                  <Image source={{ uri: formData.idProofUrl }} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Icon name={getIconName('File')} size={32} color={COLORS.textMuted} />
                    <Text style={styles.uploadText}>Tap to upload ID proof</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButtonNav}
              onPress={() => setStep(prev => prev - 1)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={step === 3 ? handleSubmit : handleNext}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {step === 3 ? 'Submit & Register' : 'Next Step'}
              </Text>
              {step === 3 ? (
                <Icon name={getIconName('CheckCircle')} size={18} color="#ffffff" />
              ) : (
                <Icon name={getIconName('ArrowRight')} size={18} color="#ffffff" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Location Picker */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(location) => {
          updateField('location', location);
        }}
        initialLocation={formData.location || {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  header: {
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 64,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stepContent: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  serviceTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  serviceTypeCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.divider,
  },
  serviceTypeCardSelected: {
    borderColor: COLORS.orange,
    backgroundColor: '#FFF4EC',
  },
  serviceTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  serviceTypeTextSelected: {
    color: COLORS.orange,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 16,
    gap: 12,
  },
  locationButtonContent: {
    flex: 1,
  },
  locationButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  locationButtonValue: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.divider,
    borderStyle: 'dashed',
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  backButtonNav: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.divider,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  nextButton: {
    flex: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default ServiceProviderRegistration;
