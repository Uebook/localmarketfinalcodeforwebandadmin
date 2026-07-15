import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  Pressable,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { launchImageLibrary } from 'react-native-image-picker';
import { registerVendor, uploadFile, getCategories, getDynamicLocations, searchPlaces, reverseGeocode } from '../services/api';
import Geolocation from '@react-native-community/geolocation';
import Image from './ImageWithFallback';
import Logo from './Logo';

const ORANGE = '#EA580C';
const BLUE = '#4A6CF7';

// ─── Reusable Focused Input ────────────────────────────────────────────────
const FocusedInput = ({ label, required, placeholder, value, onChangeText, keyboardType, multiline, numberOfLines, prefix, secureTextEntry, rightElement, onFocus, onBlur }) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  return (
    <View style={fieldStyles.fieldContainer}>
      <Text style={fieldStyles.label}>
        {label}{required && <Text style={fieldStyles.required}> *</Text>}
      </Text>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[fieldStyles.inputRow, focused && fieldStyles.inputFocused, multiline && { alignItems: 'flex-start', paddingTop: 12 }]}
      >
        {prefix && <Text style={fieldStyles.prefix}>{prefix}</Text>}
        <TextInput
          ref={inputRef}
          style={[fieldStyles.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
          value={value || ''}
          onChangeText={onChangeText}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType || 'default'}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          underlineColorAndroid="transparent"
          secureTextEntry={secureTextEntry}
        />
        {rightElement}
      </Pressable>
    </View>
  );
};


// ─── Dropdown (Sheet Modal) ────────────────────────────────────────────────
const DropdownPicker = ({ label, required, value, options, onSelect, loading, disabled, placeholder }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={fieldStyles.fieldContainer}>
      <Text style={fieldStyles.label}>
        {label}{required && <Text style={fieldStyles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[fieldStyles.inputRow, disabled && { opacity: 0.5 }]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[fieldStyles.input, !value && { color: '#94A3B8' }]}>
          {loading ? 'Loading...' : (value || placeholder || `Select ${label}`)}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={ORANGE} />
        ) : (
          <Icon name="chevron-down" size={18} color="#94A3B8" />
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dropStyles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={dropStyles.sheet}>
            <View style={dropStyles.handle} />
            <Text style={dropStyles.title}>{label}</Text>
            <ScrollView>
              {options.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[dropStyles.option, value === opt && dropStyles.optionActive]}
                  onPress={() => { onSelect(opt); setOpen(false); }}
                >
                  <Text style={[dropStyles.optionText, value === opt && dropStyles.optionTextActive]}>{opt}</Text>
                  {value === opt && <Icon name="check" size={18} color={ORANGE} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ─── Photo Upload Field ────────────────────────────────────────────────────
const PhotoUpload = ({ label, value, onPress }) => (
  <TouchableOpacity style={fieldStyles.photoBox} onPress={onPress} activeOpacity={0.7}>
    {value ? (
      <Image source={{ uri: typeof value === 'string' ? value : value.uri }} style={fieldStyles.photoImage} />
    ) : (
      <>
        <Icon name="camera" size={28} color="#94A3B8" />
        <Text style={fieldStyles.photoLabel}>{label}</Text>
      </>
    )}
  </TouchableOpacity>
);

// ─── Step Indicator (matches website) ─────────────────────────────────────
const StepBar = ({ step, total = 5 }) => (
  <View style={stepBarStyles.row}>
    {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
      <React.Fragment key={s}>
        <View style={[stepBarStyles.circle, step >= s && stepBarStyles.circleActive, step > s && stepBarStyles.circleDone]}>
          {step > s ? (
            <Icon name="check" size={14} color="#FFF" />
          ) : (
            <Text style={[stepBarStyles.circleText, step >= s && stepBarStyles.circleTextActive]}>{s}</Text>
          )}
        </View>
        {s < total && (
          <View style={[stepBarStyles.line, step > s && stepBarStyles.lineActive]} />
        )}
      </React.Fragment>
    ))}
  </View>
);

// ─── Main Component ────────────────────────────────────────────────────────
const VendorRegistration = ({ navigation, onComplete, onCancel }) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Location cascades
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [towns, setTowns] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingTowns, setLoadingTowns] = useState(false);
  const [loadingMarkets, setLoadingMarkets] = useState(false);

  // Address autocomplete & Pinning states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '', ownerName: '', category: '', subCategory: '',
    mobile: '', email: '', password: '', confirmPassword: '',
    address: '', state: '', city: '', area: '', circle: '', pincode: '',
    latitude: null, longitude: null,
    latitude: null, longitude: null,
    idProof: null, businessPhoto: null, shopDocument: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const update = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const DUMMY_CATEGORIES = ['Grocery', 'Electronics', 'Clothing', 'Footwear', 'Home Decor', 'Food & Cafe', 'Beauty & Salon', 'Automobiles', 'Others'];

  // Load categories
  useEffect(() => {
    getCategories().then(data => {
      const cats = data?.categories || [];
      if (cats.length > 0) {
        setCategories(cats.map(c => c.name).sort((a, b) => a.localeCompare(b)));
      } else {
        setCategories([...DUMMY_CATEGORIES].sort((a, b) => a.localeCompare(b)));
      }
    }).catch(() => {
      setCategories([...DUMMY_CATEGORIES].sort((a, b) => a.localeCompare(b)));
    }).finally(() => setLoadingCats(false));

    // Load states
    setLoadingStates(true);
    getDynamicLocations().then(data => {
      setStates(data?.data || []);
    }).catch(() => {}).finally(() => setLoadingStates(false));
  }, []);

  // Cascade: state → cities
  useEffect(() => {
    if (!formData.state) { setCities([]); return; }
    setLoadingCities(true);
    getDynamicLocations('state', formData.state)
      .then(data => setCities(data?.data || []))
      .catch(() => {}).finally(() => setLoadingCities(false));
  }, [formData.state]);

  // Cascade: city → towns
  useEffect(() => {
    if (!formData.city) { setTowns([]); return; }
    setLoadingTowns(true);
    getDynamicLocations('city', formData.city)
      .then(data => setTowns(data?.data || []))
      .catch(() => {}).finally(() => setLoadingTowns(false));
  }, [formData.city]);

  // Cascade: area → markets
  useEffect(() => {
    if (!formData.area) { setMarkets([]); return; }
    setLoadingMarkets(true);
    getDynamicLocations('town-circles', formData.area)
      .then(data => setMarkets(data?.data || []))
      .catch(() => {}).finally(() => setLoadingMarkets(false));
  }, [formData.area]);

  const handleSearchPlaces = async (query) => {
    setSearchQuery(query);
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsSearching(true);
      const res = await searchPlaces(query);
      setSuggestions(res || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Failed to search places:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc) => {
    const addr = loc.address || {};
    
    // Parse city
    const parsedCity = addr.city || addr.town || addr.village || '';
    
    setFormData(prev => ({
      ...prev,
      latitude: parseFloat(loc.lat),
      longitude: parseFloat(loc.lon),
      address: loc.display_name,
      state: addr.state || prev.state,
      city: parsedCity || prev.city,
      pincode: addr.postcode || prev.pincode,
      area: addr.suburb || addr.neighbourhood || prev.area,
    }));
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  const handlePinLocation = async () => {
    setIsPinning(true);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permissions are required to pin your current location.');
      setIsPinning(false);
      return;
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await reverseGeocode(latitude, longitude);
          if (res && res.address) {
            const addr = res.address;
            const parsedCity = addr.city || addr.town || addr.village || '';
            setFormData(prev => ({
              ...prev,
              latitude,
              longitude,
              address: res.display_name,
              state: addr.state || prev.state,
              city: parsedCity || prev.city,
              pincode: addr.postcode || prev.pincode,
              area: addr.suburb || addr.neighbourhood || prev.area,
            }));
          } else {
            setFormData(prev => ({ ...prev, latitude, longitude }));
          }
        } catch (err) {
          console.warn('Reverse geocode failed:', err);
          setFormData(prev => ({ ...prev, latitude, longitude }));
        } finally {
          setIsPinning(false);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        Alert.alert('Location Error', 'Failed to get your current location. Please make sure GPS is turned on.');
        setIsPinning(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const validate = () => {
    setError('');
    if (step === 1) {
      if (!formData.businessName?.trim()) { setError('Business Name is required'); return false; }
      if (!formData.ownerName?.trim()) { setError('Owner Name is required'); return false; }
      if (!formData.category) { setError('Please select a category'); return false; }
    } else if (step === 2) {
      if (!formData.mobile || formData.mobile.length < 10) { setError('Valid 10-digit mobile number is required'); return false; }
      if (!formData.password) { setError('Password is required'); return false; }
      if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return false; }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return false; }
    } else if (step === 3) {
      if (!formData.state) { setError('State is required'); return false; }
      if (!formData.city) { setError('City is required'); return false; }
      if (formData.city !== 'Amritsar') {
        setError('Services not available in your city');
        return false;
      }
      if (!formData.area) { setError('Circle / Area is required'); return false; }
      if (!formData.circle) { setError('Specific Market is required'); return false; }
    } else if (step === 4) {
      if (!formData.address?.trim()) { setError('Full address is required'); return false; }
      if (!formData.pincode || formData.pincode.length < 6) { setError('Valid 6-digit pincode is required'); return false; }
      if (!formData.latitude || !formData.longitude) { setError('Please pin your location or search for your address to set GPS coordinates'); return false; }
    } else if (step === 5) {
      if (!formData.idProof) { setError('ID Proof photo is required'); return false; }
      if (!formData.businessPhoto) { setError('Business Photo is required'); return false; }
      if (!formData.shopDocument) { setError('Shop Document is required'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (validate()) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(s => s - 1);
      setError('');
    }
    else if (onCancel) onCancel();
    else navigation?.goBack();
  };

  const pickImage = (field) => {
    launchImageLibrary({ 
      mediaType: 'photo', 
      quality: 0.7, 
      includeBase64: true 
    }, (res) => {
      if (res.assets?.[0]) {
        update(field, res.assets[0]);
      }
    });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      let idProofUrl = null;
      let profileImageUrl = null;
      let kycDocumentUrl = null;

      // Parallel uploads for better performance
      const [idRes, profileRes, kycRes] = await Promise.allSettled([
        formData.idProof ? uploadFile(formData.idProof, 'kyc-documents') : Promise.resolve(null),
        formData.businessPhoto ? uploadFile(formData.businessPhoto, 'vendor-profiles') : Promise.resolve(null),
        formData.shopDocument ? uploadFile(formData.shopDocument, 'kyc-documents') : Promise.resolve(null),
      ]);

      if (idRes.status === 'fulfilled') idProofUrl = idRes.value;
      if (profileRes.status === 'fulfilled') profileImageUrl = profileRes.value;
      if (kycRes.status === 'fulfilled') kycDocumentUrl = kycRes.value;

      const response = await registerVendor({
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        category: formData.category,
        subCategory: formData.subCategory,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        state: formData.state,
        city: formData.city,
        area: formData.area,
        circle: formData.circle,
        pincode: formData.pincode,
        latitude: formData.latitude,
        longitude: formData.longitude,
        password: formData.password,
        idProofUrl: idProofUrl,
        businessPhotoUrl: profileImageUrl,
        shopDocumentUrl: kycDocumentUrl,
      });

      if (response?.vendor) {
        setShowSuccessModal(true);
        // if (onComplete) onComplete(response.vendor); 
      } else {
        throw new Error('Registration failed. No vendor data returned.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      // Show actual error message if available
      setErrorMessage(err.message || 'Registration failed. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success Screen ─────────────────────────────────────────────────────
  if (step === 6) {
    return (
      <View style={styles.successBg}>
        <LinearGradient colors={[ORANGE, BLUE]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <Icon name="check-circle" size={48} color="#16A34A" />
          </View>
          <Text style={styles.successTitle}>Registration Successful!</Text>
          <Text style={styles.successSub}>
            Your business has been submitted for review. We will verify and activate your account within{' '}
            <Text style={{ fontWeight: '900', color: '#0F172A' }}>48-72 hours</Text>.
          </Text>
          <TouchableOpacity
            style={styles.successBtn}
            onPress={onCancel || (() => navigation?.goBack())}
            activeOpacity={0.8}
          >
            <Text style={styles.successBtnText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: ORANGE }}>
        {/* Gradient Hero Header (matches website) */}
        <LinearGradient colors={[ORANGE, BLUE]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
            <Icon name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.heroIconCircle}>
            <Icon name="briefcase" size={28} color={ORANGE} />
          </View>
          <Text style={styles.heroTitle}>Register Your Business</Text>
          <Text style={styles.heroSub}>Join LocalMarket and grow your business</Text>
        </LinearGradient>
      </SafeAreaView>

      {/* Step Bar */}
      <View style={styles.stepBarContainer}>
        <StepBar step={step} total={5} />
      </View>

      {/* Error Banner */}
      {!!error && (
        <View style={styles.errorBanner}>
          <Icon name="alert-circle" size={16} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* ── STEP 1: Business Info ──────────────────────────────────── */}
        {step === 1 && (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>Business Information</Text>
            <FocusedInput label="Business Name" required value={formData.businessName} onChangeText={v => update('businessName', v)} placeholder="Enter business name" />
            <FocusedInput label="Owner Name" required value={formData.ownerName} onChangeText={v => update('ownerName', v)} placeholder="Enter owner name" />
            <DropdownPicker
              label="Category" required
              value={formData.category}
              options={categories}
              loading={loadingCats}
              onSelect={v => update('category', v)}
              placeholder="Select category"
            />
          </View>
        )}

        {/* ── STEP 2: Contact Info ───────────────────────────────────── */}
        {step === 2 && (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>Contact Information</Text>
            <FocusedInput label="Mobile Number" required value={formData.mobile} onChangeText={v => update('mobile', v.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" placeholder="Enter 10-digit number" prefix="+91" />
            <FocusedInput label="Email Address" value={formData.email} onChangeText={v => update('email', v)} keyboardType="email-address" placeholder="Enter email address" />
            <FocusedInput
              label="Password"
              required
              value={formData.password}
              onChangeText={v => update('password', v)}
              secureTextEntry={!showPassword}
              placeholder="At least 6 characters"
              rightElement={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} color="#94A3B8" />
                </TouchableOpacity>
              }
            />
            <FocusedInput
              label="Confirm Password"
              required
              value={formData.confirmPassword}
              onChangeText={v => update('confirmPassword', v)}
              secureTextEntry={!showConfirmPassword}
              placeholder="Re-enter password"
              rightElement={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={18} color="#94A3B8" />
                </TouchableOpacity>
              }
            />
          </View>
        )}

        {/* ── STEP 3: Regional Selection ────────────────────────────── */}
        {step === 3 && (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>Service Region</Text>
            <Text style={styles.stepSub}>Select the area where your business is located</Text>
            <DropdownPicker label="State" required value={formData.state} options={states} loading={loadingStates} onSelect={v => { update('state', v); update('city', ''); update('area', ''); update('circle', ''); }} />
            <DropdownPicker label="City" required value={formData.city} options={cities} loading={loadingCities} disabled={!formData.state} onSelect={v => { update('city', v); update('area', ''); update('circle', ''); }} />
            <DropdownPicker label="Circle / Area" required value={formData.area} options={[...towns, towns.length > 0 ? 'Other' : null].filter(Boolean)} loading={loadingTowns} disabled={!formData.city} onSelect={v => { update('area', v); update('circle', ''); }} />
            <DropdownPicker label="Specific Market" required value={formData.circle} options={[...markets, markets.length > 0 ? 'Other' : null].filter(Boolean)} loading={loadingMarkets} disabled={!formData.area} onSelect={v => update('circle', v)} />
          </View>
        )}

        {/* ── STEP 4: Physical Storefront ────────────────────────────── */}
        {step === 4 && (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>Storefront Details</Text>
            <Text style={styles.stepSub}>Help customers find your exact shop location</Text>

            {/* Pin location header row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={fieldStyles.label}>Pin Your Business Location <Text style={fieldStyles.required}>*</Text></Text>
              <TouchableOpacity 
                onPress={handlePinLocation} 
                disabled={isPinning} 
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                activeOpacity={0.7}
              >
                {isPinning ? (
                  <ActivityIndicator size="small" color={ORANGE} />
                ) : (
                  <Icon name="navigation" size={12} color={ORANGE} />
                )}
                <Text style={{ fontSize: 12, fontWeight: '700', color: ORANGE }}>
                  {isPinning ? 'Detecting...' : 'Pin Current Location'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Places search autocomplete input */}
            <View style={[styles.searchContainer, { zIndex: 100 }]}>
              <FocusedInput
                label="Search Address"
                placeholder="Search for your shop address or area..."
                value={searchQuery}
                onChangeText={handleSearchPlaces}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                prefix={<Icon name="search" size={16} color="#94A3B8" />}
                rightElement={
                  isSearching ? (
                    <ActivityIndicator size="small" color={ORANGE} style={{ marginRight: 8 }} />
                  ) : searchQuery.length > 0 ? (
                    <TouchableOpacity onPress={() => handleSearchPlaces('')} style={{ marginRight: 8 }}>
                      <Icon name="x" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  ) : null
                }
              />
              
              {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionList}>
                  <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                    {suggestions.map((loc, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.suggestionItem}
                        onPress={() => handleSelectLocation(loc)}
                      >
                        <Icon name="map-pin" size={14} color="#64748B" />
                        <View style={styles.suggestionTextContainer}>
                          <Text style={styles.suggestionTitle} numberOfLines={1}>
                            {loc.display_name.split(',')[0]}
                          </Text>
                          <Text style={styles.suggestionSubtitle} numberOfLines={2}>
                            {loc.display_name.split(',').slice(1).join(',').trim()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Latitude and Longitude read-only boxes */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={[styles.coordinateCard, formData.latitude && styles.coordinateCardActive]}>
                <Icon name="map-pin" size={14} color={formData.latitude ? '#16A34A' : '#94A3B8'} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.coordinateLabel}>Latitude</Text>
                  <Text style={styles.coordinateValue}>
                    {formData.latitude ? formData.latitude.toFixed(6) : 'Not Pinned'}
                  </Text>
                </View>
              </View>
              <View style={[styles.coordinateCard, formData.longitude && styles.coordinateCardActive]}>
                <Icon name="map-pin" size={14} color={formData.longitude ? '#16A34A' : '#94A3B8'} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.coordinateLabel}>Longitude</Text>
                  <Text style={styles.coordinateValue}>
                    {formData.longitude ? formData.longitude.toFixed(6) : 'Not Pinned'}
                  </Text>
                </View>
              </View>
            </View>

            <FocusedInput label="Full Address (Will be auto-filled from pin)" required value={formData.address} onChangeText={v => update('address', v)} placeholder="Shop No, Building Name, Street..." multiline numberOfLines={3} />
            <FocusedInput label="Pincode" required value={formData.pincode} onChangeText={v => update('pincode', v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" placeholder="e.g. 110001" />
          </View>
        )}

        {/* ── STEP 5: Documents ──────────────────────────────────────── */}
        {step === 5 && (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>Documents & Photos</Text>
            <Text style={styles.stepSub}>Upload the required documents for verification</Text>
            <View style={styles.photoGrid}>
              <View style={styles.photoItem}>
                <PhotoUpload label="ID Proof *" value={formData.idProof} onPress={() => pickImage('idProof')} />
                <Text style={styles.photoCaption}>Aadhaar / PAN / Voter ID</Text>
              </View>
              <View style={styles.photoItem}>
                <PhotoUpload label="Business Photo *" value={formData.businessPhoto} onPress={() => pickImage('businessPhoto')} />
                <Text style={styles.photoCaption}>Shop front photo</Text>
              </View>
            </View>
            <PhotoUpload label="Shop Document / KYC *" value={formData.shopDocument} onPress={() => pickImage('shopDocument')} />
            <Text style={[styles.photoCaption, { marginTop: 4 }]}>GST / Shop License / Rent Agreement</Text>
          </View>
        )}
      </ScrollView>
      
      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          handleBack();
        }}
      >
        <View style={successModalStyles.overlay}>
          <View style={successModalStyles.content}>
            <View style={successModalStyles.iconCircle}>
              <Icon name="check-circle" size={48} color="#16A34A" />
            </View>
            <Text style={successModalStyles.title}>Success</Text>
            <Text style={successModalStyles.message}>
              Account created and under review
            </Text>
            <TouchableOpacity
              style={successModalStyles.button}
              onPress={() => {
                setShowSuccessModal(false);
                if (onCancel) onCancel();
                else navigation?.goBack();
              }}
              activeOpacity={0.8}
            >
              <Text style={successModalStyles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={successModalStyles.overlay}>
          <View style={successModalStyles.content}>
            <View style={[successModalStyles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Icon name="x-circle" size={48} color="#DC2626" />
            </View>
            <Text style={[successModalStyles.title, { color: '#991B1B' }]}>Registration Failed</Text>
            <Text style={successModalStyles.message}>{errorMessage}</Text>
            <TouchableOpacity
              style={[successModalStyles.button, { backgroundColor: '#DC2626' }]}
              onPress={() => setShowErrorModal(false)}
              activeOpacity={0.8}
            >
              <Text style={successModalStyles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {step > 1 && (
          <TouchableOpacity style={styles.btnBack} onPress={handleBack} activeOpacity={0.7}>
            <Text style={styles.btnBackText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.btnNext, step > 1 && { flex: 1 }, isLoading && { opacity: 0.7 }]}
          onPress={step === 5 ? handleSubmit : handleNext}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.btnNextText}>{step === 5 ? 'Submit & Register' : 'Next Step'}</Text>
              <Icon name={step === 5 ? 'check-circle' : 'arrow-right'} size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Field Styles ──────────────────────────────────────────────────────────
const fieldStyles = StyleSheet.create({
  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  required: { color: '#DC2626' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12,
    backgroundColor: '#FFF', paddingHorizontal: 14, minHeight: 50,
  },
  inputFocused: { borderColor: ORANGE, shadowColor: ORANGE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  prefix: { fontSize: 15, fontWeight: '700', color: '#64748B', marginRight: 8 },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0F172A', padding: 0 },
  photoBox: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: '#CBD5E1',
    borderRadius: 14, backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center',
    height: 130, gap: 8,
  },
  photoImage: { width: '100%', height: '100%', borderRadius: 12 },
  photoLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', textAlign: 'center' },
});

const dropStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: '70%' },
  handle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A', padding: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  optionActive: { backgroundColor: '#FFF7ED' },
  optionText: { fontSize: 15, fontWeight: '500', color: '#0F172A' },
  optionTextActive: { fontWeight: '800', color: ORANGE },
});

const stepBarStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  circle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  circleActive: { borderColor: ORANGE, backgroundColor: ORANGE },
  circleDone: { backgroundColor: ORANGE },
  circleText: { fontSize: 14, fontWeight: '800', color: '#94A3B8' },
  circleTextActive: { color: '#FFF' },
  line: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: 4 },
  lineActive: { backgroundColor: ORANGE },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  heroHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28, alignItems: 'center' },
  backBtn: { position: 'absolute', left: 16, top: 16, padding: 6 },
  heroIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  heroSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.85)' },
  stepBarContainer: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FFF' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 12, padding: 14, backgroundColor: '#FEF2F2', borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#DC2626' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  stepBlock: { gap: 4 },
  stepTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 20 },
  stepSub: { fontSize: 13, color: '#64748B', marginBottom: 16, marginTop: -10, fontWeight: '500' },
  photoGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  photoItem: { flex: 1 },
  photoCaption: { fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center', marginBottom: 12 },
  footer: {
    flexDirection: 'row', padding: 16, gap: 12,
    borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFF',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 8 } }),
  },
  btnBack: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  btnBackText: { fontSize: 15, fontWeight: '800', color: '#64748B' },
  btnNext: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: ORANGE },
  btnNextText: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  successBg: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 32, alignItems: 'center', width: '100%', maxWidth: 360, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8 },
  successIconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 12, textAlign: 'center' },
  successSub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  successBtn: { width: '100%', paddingVertical: 14, borderRadius: 14, backgroundColor: ORANGE, alignItems: 'center' },
  successBtnText: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  locationDetectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: ORANGE,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  locationDetectionText: {
    fontSize: 14,
    fontWeight: '700',
    color: ORANGE,
  },
  coordinateCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  coordinateCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  coordinateLabel: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  coordinateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
    zIndex: 100,
  },
  suggestionList: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 999,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  suggestionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});

const successModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: ORANGE,
    alignItems: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default VendorRegistration;
