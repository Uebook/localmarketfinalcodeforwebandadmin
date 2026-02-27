import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { register } from '../services/api';
import { getAllStates, getCitiesByState, searchStates, searchCities } from '../constants/indianStatesCities';
import { saveUserData } from '../utils/userStorage';

const RegisterScreen = ({ onRegister, onBack }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    state: '',
    city: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successUserData, setSuccessUserData] = useState(null);

  const allStates = getAllStates();
  const filteredStates = searchStates(stateSearchQuery);
  const allCities = formData.state ? getCitiesByState(formData.state) : [];
  const filteredCities = formData.state ? searchCities(formData.state, citySearchQuery) : [];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }

    const phoneNumber = formData.phone.replace(/\D/g, '');
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    // Password is always required
    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Validate email format if provided
    if (formData.email.trim() && !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const registrationData = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email.trim() || null,
        password: formData.password, // Password is always required now
        state: formData.state || null,
        city: formData.city || null,
      };

      const response = await register(registrationData);

      if (response.success && response.user) {
        // Save user data to AsyncStorage
        try {
          await saveUserData(response.user, 'customer');
        } catch (error) {
          console.error('Error saving user data:', error);
        }

        setSuccessUserData(response.user);
        setShowSuccessModal(true);
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Dynamic gradient background */}
      <LinearGradient
        colors={COLORS.homeBackground || COLORS.primaryGradient || ['#7A3B1D', '#581c87']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Light pinkish-beige card */}
        <View style={styles.card}>
          {/* Icon overlapping the card */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconContainer}>
              <Icon name="user-plus" size={48} color={COLORS.orange} />
            </View>
          </View>

          {/* Header */}
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitleText}>Register to access your local market</Text>

          {/* Error message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>FULL NAME *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textMuted}
                value={formData.full_name}
                onChangeText={(text) => handleChange('full_name', text)}
              />
              <Icon name={getIconName('User')} size={18} color={COLORS.orange} />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>PHONE NUMBER *</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 10 digit number"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
              />
              <Icon name={getIconName('Phone')} size={18} color={COLORS.orange} />
            </View>
          </View>

          {/* Email (Optional) */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS (Optional)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
              />
              <Icon name={getIconName('Mail')} size={18} color={COLORS.orange} />
            </View>
          </View>

          {/* Password (Always Required) */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>PASSWORD *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter password (min 6 characters)"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={COLORS.orange}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icon
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={COLORS.orange}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* State Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>STATE (Optional)</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setShowStatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.input, !formData.state && styles.placeholderText]}>
                {formData.state || 'Select State'}
              </Text>
              <Icon name={getIconName('ChevronDown')} size={18} color={COLORS.orange} />
            </TouchableOpacity>
          </View>

          {/* City Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>CITY (Optional)</Text>
            <TouchableOpacity
              style={[styles.inputWrapper, !formData.state && styles.inputWrapperDisabled]}
              onPress={() => formData.state && setShowCityPicker(true)}
              disabled={!formData.state}
              activeOpacity={0.7}
            >
              <Text style={[styles.input, !formData.city && styles.placeholderText]}>
                {formData.city || (formData.state ? 'Select City' : 'Select State first')}
              </Text>
              <Icon
                name={getIconName('ChevronDown')}
                size={18}
                color={formData.state ? COLORS.orange : COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Register button */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.primaryGradient || ['#fb923c', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" style={styles.buttonContent} />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.registerButtonText}>Register</Text>
                  <Icon name={getIconName('ArrowRight')} size={18} color={COLORS.white} />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Back to login */}
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Icon name={getIconName('ArrowLeft')} size={16} color={COLORS.textSecondary} />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Icon name={getIconName('Shield')} size={14} color={COLORS.textMuted} />
            <Text style={styles.footerText}>SECURE & TRUSTED MARKETPLACE</Text>
          </View>
        </View>
      </ScrollView>

      {/* State Picker Modal */}
      <Modal
        visible={showStatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowStatePicker(false);
          setStateSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowStatePicker(false);
                  setStateSearchQuery('');
                }}
                style={styles.modalCloseButton}
              >
                <Icon name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon name={getIconName('Search')} size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search state..."
                placeholderTextColor={COLORS.textMuted}
                value={stateSearchQuery}
                onChangeText={setStateSearchQuery}
                autoCapitalize="none"
              />
              {stateSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setStateSearchQuery('')}>
                  <Icon name="x" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    formData.state === item && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleChange('state', item);
                    handleChange('city', ''); // Reset city when state changes
                    setShowStatePicker(false);
                    setStateSearchQuery('');
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      formData.state === item && styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {formData.state === item && (
                    <Icon name="check" size={20} color={COLORS.orange} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>No states found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          if (onRegister && successUserData) {
            onRegister(successUserData);
          }
        }}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <Icon name="check" size={48} color={COLORS.white} />
              </View>
            </View>

            {/* Success Title */}
            <Text style={styles.successTitle}>Registration Successful!</Text>

            {/* Success Message */}
            <Text style={styles.successMessage}>
              Your account has been created successfully. Welcome to Local Market!
            </Text>

            {/* User Info (optional) */}
            {successUserData && (
              <View style={styles.successUserInfo}>
                <View style={styles.successUserInfoRow}>
                  <Icon name={getIconName('User')} size={16} color={COLORS.textMuted} />
                  <Text style={styles.successUserInfoText}>{successUserData.name}</Text>
                </View>
                {successUserData.phone && (
                  <View style={styles.successUserInfoRow}>
                    <Icon name={getIconName('Phone')} size={16} color={COLORS.textMuted} />
                    <Text style={styles.successUserInfoText}>+91 {successUserData.phone}</Text>
                  </View>
                )}
              </View>
            )}

            {/* OK Button */}
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                if (onRegister && successUserData) {
                  onRegister(successUserData);
                }
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.primaryGradient || ['#fb923c', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.successButtonGradient}
              >
                <Text style={styles.successButtonText}>Get Started</Text>
                <Icon name={getIconName('ArrowRight')} size={18} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* City Picker Modal */}
      <Modal
        visible={showCityPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCityPicker(false);
          setCitySearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select City {formData.state ? `(${formData.state})` : ''}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCityPicker(false);
                  setCitySearchQuery('');
                }}
                style={styles.modalCloseButton}
              >
                <Icon name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon name={getIconName('Search')} size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search city..."
                placeholderTextColor={COLORS.textMuted}
                value={citySearchQuery}
                onChangeText={setCitySearchQuery}
                autoCapitalize="none"
              />
              {citySearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setCitySearchQuery('')}>
                  <Icon name="x" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            {allCities.length > 0 ? (
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      formData.city === item && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      handleChange('city', item);
                      setShowCityPicker(false);
                      setCitySearchQuery('');
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        formData.city === item && styles.modalItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {formData.city === item && (
                      <Icon name="check" size={20} color={COLORS.orange} />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.modalEmpty}>
                    <Text style={styles.modalEmptyText}>No cities found</Text>
                  </View>
                }
              />
            ) : (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>No cities available</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#faf5f0',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -48,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.orange,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    gap: 12,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    padding: 0,
  },
  registerButton: {
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 8,
    overflow: 'hidden',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    gap: 6,
  },
  footerText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  placeholderText: {
    color: COLORS.textMuted,
  },
  inputWrapperDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalItemSelected: {
    backgroundColor: '#fff7ed',
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalItemTextSelected: {
    color: COLORS.orange,
    fontWeight: '700',
  },
  modalEmpty: {
    padding: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    padding: 0,
  },
  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10b981', // Green color for success
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  successUserInfo: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  successUserInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successUserInfoText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  successButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  successButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default RegisterScreen;
