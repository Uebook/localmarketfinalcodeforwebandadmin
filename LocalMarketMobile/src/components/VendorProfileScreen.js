import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput } from 'react-native';
import Image from './ImageWithFallback';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getVendorSidebarControl } from '../utils/vendorSidebarControl';
import { getSidebarControl } from '../utils/sidebarControl';
import { handleShare, handlePreview } from '../utils/vendorActions';
import WriteReview from './WriteReview';
import LocationPicker from './LocationPicker';
import { formatLocation } from '../constants/locations';
import { shouldBlockVendor, VENDOR_STATUS } from '../utils/paymentUtils';
import ExitConfirmModal from './ExitConfirmModal';
import { BackHandler } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadFile, updateVendorProfile, getVendorProfile, getCategories } from '../services/api';
import { ActivityIndicator, } from 'react-native';
// import Image from './ImageWithFallback';
const VendorProfileScreen = ({ navigation, vendorData, setVendorData }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);

  React.useEffect(() => {
    const backAction = () => {
      if (navigation.isFocused()) {
        setShowExitModal(true);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      backHandler.remove();
    };
  }, [navigation]);
  const [locationState] = useState({
    lat: vendorData?.location?.lat || null,
    lng: vendorData?.location?.lng || null,
    city: vendorData?.location?.city || vendorData?.city || 'Amritsar, India',
    loading: false,
    error: null,
  });

  // ─── Data Normalization Layer ──────────────────────────────────────────
  // Ensures both snake_case (DB) and camelCase (UI) keys work interchangeably
  const getVal = (key) => vendorData?.[key];
  
  const normalizedVendor = {
    ...vendorData,
    imageUrl: getVal('imageUrl') || getVal('image_url') || getVal('image'),
    profileImageUrl: getVal('profileImageUrl') || getVal('profile_image_url') || getVal('imageUrl') || getVal('image_url') || getVal('image') || getVal('profilePhotoUrl'),
    ownerName: getVal('ownerName') || getVal('owner_name'),
    contactNumber: getVal('contactNumber') || getVal('contact_number') || getVal('phone'),
    openTime: getVal('openTime') || getVal('open_time'),
    closeTime: getVal('closeTime') || getVal('close_time'),
    about: getVal('about') || getVal('description') || '',
  };

  const [priceAlerts, setPriceAlerts] = useState(false);
  const [bulkUploads, setBulkUploads] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [location, setLocation] = useState(vendorData?.location || null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: normalizedVendor.name || '',
    category: normalizedVendor.category || '',
    ownerName: normalizedVendor.ownerName || '',
    contactNumber: normalizedVendor.contactNumber || '',
    address: normalizedVendor.address || '',
    openTime: normalizedVendor.openTime || '',
    closeTime: normalizedVendor.closeTime || '',
    about: normalizedVendor.about || '',
  });

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const DUMMY_CATEGORIES = ['Grocery', 'Electronics', 'Clothing', 'Footwear', 'Home Decor', 'Food & Cafe', 'Beauty & Salon', 'Automobiles', 'Others'];

  // Load categories on mount
  React.useEffect(() => {
    getCategories()
      .then(data => {
        const cats = data?.categories || [];
        if (cats.length > 0) {
          setCategories(cats.map(c => c.name));
        } else {
          setCategories(DUMMY_CATEGORIES);
        }
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setCategories(DUMMY_CATEGORIES);
      })
      .finally(() => setLoadingCats(false));
  }, []);

  const handleEditClick = () => {
    console.log('[VendorProfile] Edit clicked, showing modal...');
    setEditFormData({
      name: normalizedVendor.name || '',
      category: normalizedVendor.category || '',
      ownerName: normalizedVendor.ownerName || '',
      contactNumber: normalizedVendor.contactNumber || '',
      address: normalizedVendor.address || '',
      openTime: normalizedVendor.openTime || '',
      closeTime: normalizedVendor.closeTime || '',
      about: normalizedVendor.about || '',
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!vendorData?.id) return;
    try {
      setSavingProfile(true);
      // Map camelCase form keys → snake_case DB columns
      const payload = {
        name: editFormData.name,
        category: editFormData.category,
        owner_name: editFormData.ownerName,
        contact_number: editFormData.contactNumber,
        address: editFormData.address,
        open_time: editFormData.openTime,
        close_time: editFormData.closeTime,
        description: editFormData.about,
      };
      const res = await updateVendorProfile(vendorData.id, payload);
      if (res && res.success !== false) {
        // Refresh vendor data
        if (setVendorData) {
          try {
            const freshData = await getVendorProfile(vendorData.id);
            if (freshData && freshData.vendor) {
              // Normalize data before setting
              const v = freshData.vendor;
              setVendorData({
                ...v,
                imageUrl: v.imageUrl || v.image_url || v.image,
                profileImageUrl: v.profileImageUrl || v.profile_image_url,
                ownerName: v.ownerName || v.owner_name,
                contactNumber: v.contactNumber || v.contact_number || v.phone,
                openTime: v.openTime || v.open_time,
                closeTime: v.closeTime || v.close_time,
              });
            }
          } catch (refreshError) {
            console.error('Error refreshing vendor data:', refreshError);
          }
        }
        setShowEditModal(false);
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImagePick = async (type) => {
    const options = {
      mediaType: 'photo',
      includeBase64: true, // Crucial: Get the base64 string
      maxHeight: 1200,
      maxWidth: 1200,
      quality: 0.6, // Compressed quality
    };

    Alert.alert(
      'Upload Photo',
      'Choose an option to upload your photo',
      [
        {
          text: 'Camera',
          onPress: () => {
            // Using setTimeout to avoid "Activity error" on some Android devices
            setTimeout(async () => {
              try {
                const { launchCamera } = require('react-native-image-picker');
                const result = await launchCamera(options);
                processImageResult(result, type);
              } catch (err) {
                console.error('[Camera] Error:', err);
              }
            }, 100);
          }
        },
        {
          text: 'Gallery',
          onPress: () => {
            setTimeout(async () => {
              try {
                const result = await launchImageLibrary(options);
                processImageResult(result, type);
              } catch (err) {
                console.error('[Library] Error:', err);
              }
            }, 100);
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const processImageResult = async (result, type) => {
    if (result.didCancel) {
      console.log('[ImagePick] User cancelled');
      return;
    }
    if (result.errorCode) {
      console.error('[ImagePick] Error Code:', result.errorCode, result.errorMessage);
      Alert.alert('Error', result.errorMessage || 'Image picker error');
      return;
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      console.log('[ImagePick] Success, starting upload...');
      await handleUpload(asset, type); // Pass the whole asset object
    }
  };

  const handleUpload = async (asset, type) => {
    if (!vendorData?.id) return;

    const isCover = type === 'cover';
    const setUploading = isCover ? setUploadingCover : setUploadingProfile;

    try {
      setUploading(true);

      // 1. Upload file to VPS (now uses Base64)
      const uploadedUrl = await uploadFile(asset, isCover ? 'shop-photos' : 'id-proofs');

      if (uploadedUrl) {
        // 2. Update vendor profile in DB
        const updateField = isCover ? 'image_url' : 'profile_image_url';
        await updateVendorProfile(vendorData.id, { [updateField]: uploadedUrl });

        // 3. Refresh vendor data
        if (setVendorData) {
          try {
            const freshData = await getVendorProfile(vendorData.id);
            if (freshData && freshData.vendor) {
              const v = freshData.vendor;
              setVendorData({
                ...v,
                imageUrl: v.imageUrl || v.image_url || v.image,
                profileImageUrl: v.profileImageUrl || v.profile_image_url,
                ownerName: v.ownerName || v.owner_name,
                contactNumber: v.contactNumber || v.contact_number || v.phone,
                openTime: v.openTime || v.open_time,
                closeTime: v.closeTime || v.close_time,
              });
            }
          } catch (refreshError) {
            console.error('Error refreshing vendor data after upload:', refreshError);
          }
        }

        Alert.alert('Success', `${isCover ? 'Cover' : 'Profile'} image updated successfully.`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleMenuClick = () => {
    const vendorControl = getVendorSidebarControl();
    const customerControl = getSidebarControl();
    const control = vendorControl || customerControl;
    if (control) {
      control(true);
    } else {
      console.warn('Sidebar control not available');
    }
  };

  const handleWriteReview = (reviewData) => {
    Alert.alert(
      'Review Submitted',
      `Thank you for your review! Your ${reviewData.rating}-star review has been submitted.`,
      [{ text: 'OK' }]
    );
    // In a real app, this would send the review to the backend
    console.log('Review submitted:', reviewData);
  };
  const handleProfileClick = () => navigation?.navigate('Settings');
  const handleNotificationClick = () => navigation?.navigate('Notifications');

  const profileCompletion = 85;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      />

      <Header
        locationState={locationState}
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
        onNotificationClick={handleNotificationClick}
        hideCart={true}
        profileImage={vendorData?.imageUrl || vendorData?.image || vendorData?.image_url || vendorData?.profilePhotoUrl || vendorData?.profile_image_url}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Shop Profile Section - Premium Redesign */}
        <View style={styles.profileSectionWrapper}>
          <LinearGradient
            colors={['#1E293B', '#334155']}
            style={styles.premiumCover}
          >
            <View style={styles.coverOverlay} />
            <TouchableOpacity 
              style={styles.editCoverBtn} 
              onPress={() => handleImagePick('cover')}
              disabled={uploadingCover}
            >
              {uploadingCover ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Icon name="camera" size={14} color="#FFF" />
                  <Text style={styles.editCoverText}>Change Cover</Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.profileCard}>
            <View style={styles.profileHeaderRow}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarInner}>
                  {normalizedVendor.profileImageUrl ? (
                    <Image source={{ uri: normalizedVendor.profileImageUrl }} style={styles.circleImage} />
                  ) : (
                    <Icon name="user" size={32} color={COLORS.textMuted} />
                  )}
                </View>
                <TouchableOpacity
                  style={styles.profileCameraButton}
                  onPress={() => handleImagePick('profile')}
                  disabled={uploadingProfile}
                >
                  {uploadingProfile ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Icon name="camera" size={10} color="#FFF" />
                  )}
                </TouchableOpacity>
                <View style={styles.onlineBadge} />
              </View>

              <View style={styles.shopMainDetails}>
                <View style={styles.nameBadgeRow}>
                  <Text style={styles.shopNameText}>{normalizedVendor.name || 'My Shop'}</Text>
                  <View style={styles.verifiedBadge}>
                    <Icon name="check" size={10} color="#FFF" />
                  </View>
                </View>
                <View style={styles.subDetailRow}>
                  <Icon name="map-pin" size={12} color="#64748B" />
                  <Text style={styles.subDetailText}>{normalizedVendor.address || 'Shop Address'}</Text>
                </View>
              </View>

              <View style={styles.ratingBadgeTop}>
                <Icon name="star" size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingValueText}>{normalizedVendor.rating || '4.8'}</Text>
              </View>
            </View>

            <View style={styles.completionContainer}>
              <View style={styles.completionHeader}>
                <Text style={styles.completionTitle}>Profile Strength</Text>
                <Text style={styles.completionValue}>{profileCompletion}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[COLORS.orange, '#F97316']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${profileCompletion}%` }]}
                />
              </View>
            </View>

            <View style={styles.quickActionsRow}>
              <TouchableOpacity style={styles.qActionItem} onPress={() => handleShare(normalizedVendor)}>
                <View style={[styles.qActionIcon, { backgroundColor: '#F0F9FF' }]}>
                  <Icon name="share-2" size={18} color="#0EA5E9" />
                </View>
                <Text style={styles.qActionLabel}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.qActionItem} onPress={() => handlePreview(navigation, normalizedVendor)}>
                <View style={[styles.qActionIcon, { backgroundColor: '#F5F3FF' }]}>
                  <Icon name="eye" size={18} color="#8B5CF6" />
                </View>
                <Text style={styles.qActionLabel}>Preview</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.qActionItem} onPress={() => navigation?.navigate('VendorOffers')}>
                <View style={[styles.qActionIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Icon name="tag" size={18} color="#10B981" />
                </View>
                <Text style={styles.qActionLabel}>Offers</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.qActionItem} onPress={() => navigation?.navigate('Settings')}>
                <View style={[styles.qActionIcon, { backgroundColor: '#F8FAFC' }]}>
                  <Icon name="settings" size={18} color="#64748B" />
                </View>
                <Text style={styles.qActionLabel}>Settings</Text>
              </TouchableOpacity>
            </View>

            {/* Payment Status Alert */}
            {normalizedVendor && shouldBlockVendor(normalizedVendor) && (
              <View style={styles.paymentAlert}>
                <View style={styles.alertIconBg}>
                  <Icon name="alert-circle" size={18} color="#EF4444" />
                </View>
                <View style={styles.paymentAlertContent}>
                  <Text style={styles.paymentAlertTitle}>Payment Overdue</Text>
                  <Text style={styles.paymentAlertText}>
                    Complete payment to avoid account suspension.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.paymentButton}
                  onPress={() => navigation?.navigate('PaymentManagement')}
                >
                  <Text style={styles.paymentButtonText}>Pay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>



        {/* Business Profile Section */}
        <View style={styles.businessProfileSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Business Profile</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditClick}>
              <Icon name={getIconName('Edit')} size={16} color={COLORS.textPrimary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileFields}>
            <View style={styles.profileField}>
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('Store')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>SHOP NAME</Text>
                <Text style={styles.fieldValue}>{normalizedVendor.name || 'Not Set'}</Text>
              </View>
            </View>

            <View style={styles.profileField}>
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('Tag')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>CATEGORY</Text>
                <Text style={styles.fieldValue}>{normalizedVendor.category || 'Not Set'}</Text>
              </View>
            </View>

            <View style={styles.profileField}>
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('User')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>OWNER NAME</Text>
                <Text style={styles.fieldValue}>{normalizedVendor.ownerName || 'Not Set'}</Text>
              </View>
            </View>

            <View style={styles.profileField}>
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('Phone')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>CONTACT</Text>
                <Text style={styles.fieldValue}>{normalizedVendor.contactNumber || 'Not Set'}</Text>
              </View>
            </View>

            <View style={styles.profileField}>
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('MapPin')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>ADDRESS</Text>
                <Text style={styles.fieldValue}>{normalizedVendor.address || 'Not Set'}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.profileField}
              onPress={() => setShowLocationPicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('MapPin')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>LOCATION (State/City/Town/Tehsil/Sub-Tehsil)</Text>
                <Text style={styles.fieldValue}>
                  {location ? formatLocation(location) : 'Tap to select location'}
                </Text>
              </View>
              <Icon name={getIconName('ChevronRight')} size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.profileField}>
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('Clock')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>OPEN TIME</Text>
                <Text style={styles.fieldValue}>{normalizedVendor.openTime || 'Not Set'}</Text>
              </View>
            </View>

            <View style={styles.profileField}>
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('Clock')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>CLOSE TIME</Text>
                <Text style={styles.fieldValue}>{normalizedVendor.closeTime || 'Not Set'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shop Preferences */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>SHOP PREFERENCES</Text>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Receive Price Alerts</Text>
            <Switch
              value={priceAlerts}
              onValueChange={setPriceAlerts}
              trackColor={{ false: '#E5E7EB', true: COLORS.orange }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Allow Bulk Uploads</Text>
            <Switch
              value={bulkUploads}
              onValueChange={setBulkUploads}
              trackColor={{ false: '#E5E7EB', true: COLORS.orange }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>
      </ScrollView>

      <ExitConfirmModal 
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => BackHandler.exitApp()}
      />

      {/* Write Review Modal */}
      <WriteReview
        visible={showWriteReview}
        onClose={() => setShowWriteReview(false)}
        onSubmit={handleWriteReview}
        vendorName={normalizedVendor.name || 'My Awesome Shop'}
      />

      {/* Location Picker */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={async (selectedLocation) => {
          setLocation(selectedLocation);
          if (vendorData?.id) {
            try {
              setSavingProfile(true);
              // Sync to backend
              const payload = {
                state: selectedLocation.state,
                city: selectedLocation.city,
                area: selectedLocation.area || selectedLocation.town,
                circle: selectedLocation.circle || selectedLocation.market,
                pincode: selectedLocation.pincode,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              };
              
              const res = await updateVendorProfile(vendorData.id, payload);
              if (res && res.success !== false) {
                // Refresh vendor data
                if (setVendorData) {
                  const freshData = await getVendorProfile(vendorData.id);
                  if (freshData?.vendor) {
                    const v = freshData.vendor;
                    setVendorData({
                      ...v,
                      imageUrl: v.imageUrl || v.image_url || v.image,
                      profileImageUrl: v.profileImageUrl || v.profile_image_url,
                      ownerName: v.ownerName || v.owner_name,
                      contactNumber: v.contactNumber || v.contact_number || v.phone,
                      openTime: v.openTime || v.open_time,
                      closeTime: v.closeTime || v.close_time,
                    });
                  }
                }
              }
            } catch (error) {
              console.error('Error saving picked location:', error);
              Alert.alert('Error', 'Failed to save location update.');
            } finally {
              setSavingProfile(false);
            }
          }
        }}
        initialLocation={location || {}}
      />

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Business Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name={getIconName('X')} size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SHOP NAME</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                  placeholder="Enter shop name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CATEGORY</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dropdownInput]}
                  onPress={() => setShowCategoryPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.inputValue, !editFormData.category && { color: COLORS.textMuted }]}>
                    {loadingCats ? 'Loading...' : (editFormData.category || 'Select category')}
                  </Text>
                  <Icon name="chevron-down" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* Category Selection Modal */}
                <Modal
                  visible={showCategoryPicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowCategoryPicker(false)}
                >
                  <TouchableOpacity 
                    style={styles.sheetOverlay} 
                    activeOpacity={1} 
                    onPress={() => setShowCategoryPicker(false)}
                  >
                    <View style={styles.bottomSheet}>
                      <View style={styles.sheetHandle} />
                      <Text style={styles.sheetTitle}>Select Category</Text>
                      <ScrollView style={styles.sheetList}>
                        {categories.map((cat, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.sheetOption,
                              editFormData.category === cat && styles.sheetOptionActive
                            ]}
                            onPress={() => {
                              setEditFormData({ ...editFormData, category: cat });
                              setShowCategoryPicker(false);
                            }}
                          >
                            <Text style={[
                              styles.sheetOptionText,
                              editFormData.category === cat && styles.sheetOptionTextActive
                            ]}>
                              {cat}
                            </Text>
                            {editFormData.category === cat && (
                              <Icon name="check" size={18} color={COLORS.orange} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>OWNER NAME</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.ownerName}
                  onChangeText={(text) => setEditFormData({ ...editFormData, ownerName: text })}
                  placeholder="Enter owner name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CONTACT NUMBER</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.contactNumber}
                  onChangeText={(text) => setEditFormData({ ...editFormData, contactNumber: text })}
                  placeholder="Enter contact number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ADDRESS</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={editFormData.address}
                  onChangeText={(text) => setEditFormData({ ...editFormData, address: text })}
                  placeholder="Enter full address"
                  multiline
                  wrapperStyle={{ alignItems: 'flex-start' }}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>OPEN TIME</Text>
                  <TextInput
                    style={styles.input}
                    value={editFormData.openTime}
                    onChangeText={(text) => setEditFormData({ ...editFormData, openTime: text })}
                    placeholder="e.g. 09:00 AM"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CLOSE TIME</Text>
                  <TextInput
                    style={styles.input}
                    value={editFormData.closeTime}
                    onChangeText={(text) => setEditFormData({ ...editFormData, closeTime: text })}
                    placeholder="e.g. 09:00 PM"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ABOUT SHOP</Text>
                <TextInput
                  style={[styles.input, { height: 100 }]}
                  value={editFormData.about}
                  onChangeText={(text) => setEditFormData({ ...editFormData, about: text })}
                  placeholder="Tell us about your shop"
                  multiline
                  wrapperStyle={{ alignItems: 'flex-start' }}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveButton, savingProfile && styles.disabledButton]}
              onPress={handleEditSave}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  // Premium Profile Styles
  profileSectionWrapper: {
    backgroundColor: '#F8FAFC',
    marginBottom: 24,
  },
  premiumCover: {
    height: 160,
    justifyContent: 'flex-end',
    padding: 20,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  editCoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 6,
  },
  editCoverText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  profileCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -50,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarInner: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  circleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileCameraButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.orange,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  shopMainDetails: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  shopNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subDetailText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  ratingBadgeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 4,
  },
  ratingValueText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  completionContainer: {
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  completionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  completionValue: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.orange,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  qActionItem: {
    alignItems: 'center',
    gap: 8,
  },
  qActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qActionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  paymentAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 12,
  },
  alertIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentAlertContent: {
    flex: 1,
  },
  paymentAlertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  paymentAlertText: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '500',
  },
  paymentButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paymentButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  businessProfileSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    marginRight: -8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  profileFields: {
    gap: 16,
  },
  profileField: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  preferencesSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  writeReviewSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  writeReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  writeReviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  writeReviewHeaderText: {
    flex: 1,
  },
  writeReviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  writeReviewSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  writeReviewButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  writeReviewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  writeReviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalForm: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: '#F9FAFB',
  },
  saveButton: {
    backgroundColor: COLORS.orange,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.7,
  },
  // Dropdown & Sheet Styles
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetList: {
    padding: 10,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  sheetOptionActive: {
    backgroundColor: '#FFF4EC',
  },
  sheetOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
  },
  sheetOptionTextActive: {
    fontWeight: '800',
    color: '#F97316',
  },
});

export default VendorProfileScreen;

