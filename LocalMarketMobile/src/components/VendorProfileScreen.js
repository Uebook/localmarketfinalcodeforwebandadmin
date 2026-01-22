import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
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

const VendorProfileScreen = ({ navigation, vendorData }) => {
  const COLORS = useThemeColors();
  const [locationState] = useState({
    lat: null,
    lng: null,
    city: 'Delhi, India',
    loading: false,
    error: null,
  });

  const [priceAlerts, setPriceAlerts] = useState(false);
  const [bulkUploads, setBulkUploads] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [location, setLocation] = useState(vendorData?.location || null);

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
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Shop Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.coverImage}>
            <Text style={styles.coverText}>Cover</Text>
            <TouchableOpacity style={styles.cameraButton}>
              <Icon name={getIconName('Camera')} size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Icon name={getIconName('User')} size={40} color={COLORS.textMuted} />
              </View>
            </View>
            
            <View style={styles.shopInfo}>
              <View style={styles.shopNameRow}>
                <Text style={styles.shopName}>My Awesome Shop</Text>
                <Icon name={getIconName('CheckCircle')} size={20} color={COLORS.blue} />
              </View>
              <View style={styles.locationRow}>
                <Icon name={getIconName('MapPin')} size={14} color={COLORS.textMuted} />
                <Text style={styles.locationText}>Shop 12, Main Market</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Open</Text>
              </View>
            </View>
          </View>

          <View style={styles.completionSection}>
            <Text style={styles.completionLabel}>Profile Completion</Text>
            <View style={styles.completionBarContainer}>
              <LinearGradient
                colors={['#dc2626', '#9333ea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.completionBar, { width: `${profileCompletion}%` }]}
              />
            </View>
            <Text style={styles.completionPercent}>{profileCompletion}%</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(vendorData)}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.orange }]}>
                <Icon name={getIconName('Share2')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handlePreview(navigation, vendorData)}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.orange }]}>
                <Icon name={getIconName('Eye')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation?.navigate('VendorOffers')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.blue }]}>
                <Icon name={getIconName('Tag')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Offers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation?.navigate('Settings')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.textMuted }]}>
                <Icon name={getIconName('Settings')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Payment Status Alert */}
          {vendorData && shouldBlockVendor(vendorData) && (
            <View style={styles.paymentAlert}>
              <Icon name={getIconName('AlertCircle')} size={20} color="#dc2626" />
              <View style={styles.paymentAlertContent}>
                <Text style={styles.paymentAlertTitle}>Payment Overdue</Text>
                <Text style={styles.paymentAlertText}>
                  Your account will be blocked. Please complete payment to continue.
                </Text>
                <TouchableOpacity
                  style={styles.paymentButton}
                  onPress={() => navigation?.navigate('PaymentManagement')}
                >
                  <Text style={styles.paymentButtonText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Vendor ID Display */}
          {vendorData?.vendorId && (
            <View style={styles.vendorIdCard}>
              <Text style={styles.vendorIdLabel}>Vendor ID</Text>
              <Text style={styles.vendorIdValue}>{vendorData.vendorId}</Text>
            </View>
          )}
        </View>

        {/* Write Review Section */}
        <View style={styles.writeReviewSection}>
          <View style={styles.writeReviewHeader}>
            <View style={styles.writeReviewHeaderLeft}>
              <Icon name={getIconName('Star')} size={24} color={COLORS.orange} />
              <View style={styles.writeReviewHeaderText}>
                <Text style={styles.writeReviewTitle}>Customer Reviews</Text>
                <Text style={styles.writeReviewSubtitle}>Share your experience</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.writeReviewButton}
              onPress={() => setShowWriteReview(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.writeReviewButtonGradient}
              >
                <Icon name={getIconName('Edit')} size={16} color={COLORS.white} />
                <Text style={styles.writeReviewButtonText}>Write Review</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Profile Section */}
        <View style={styles.businessProfileSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Business Profile</Text>
            <TouchableOpacity style={styles.editButton}>
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
                <Text style={styles.fieldValue}>Not Set</Text>
              </View>
            </View>

            <View style={styles.profileField}>
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('Tag')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>CATEGORY</Text>
                <Text style={styles.fieldValue}>Not Set</Text>
              </View>
            </View>

            <View style={styles.profileField}>
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('User')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>OWNER NAME</Text>
                <Text style={styles.fieldValue}>Not Set</Text>
              </View>
            </View>

            <View style={styles.profileField}>
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('Phone')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>CONTACT</Text>
                <Text style={styles.fieldValue}>Not Set</Text>
              </View>
            </View>

            <View style={styles.profileField}>
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('MapPin')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>ADDRESS</Text>
                <Text style={styles.fieldValue}>Not Set</Text>
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
                <Text style={styles.fieldValue}>Not Set</Text>
              </View>
            </View>

            <View style={styles.profileField}>
              <View style={styles.fieldIcon}>
                <Icon name={getIconName('Clock')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>CLOSE TIME</Text>
                <Text style={styles.fieldValue}>Not Set</Text>
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

      {/* Write Review Modal */}
      <WriteReview
        visible={showWriteReview}
        onClose={() => setShowWriteReview(false)}
        onSubmit={handleWriteReview}
        vendorName={vendorData?.name || 'My Awesome Shop'}
      />

      {/* Location Picker */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(selectedLocation) => {
          setLocation(selectedLocation);
          // In production, this would save to backend
          if (vendorData) {
            // Update vendor data with new location
            console.log('Location updated:', selectedLocation);
          }
        }}
        initialLocation={location || {}}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  coverImage: {
    height: 120,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  coverText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  cameraButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.textPrimary,
    padding: 8,
    borderRadius: 8,
  },
  profileInfo: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    marginTop: -40,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  shopInfo: {
    flex: 1,
    paddingTop: 40,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  completionSection: {
    padding: 16,
    paddingTop: 0,
  },
  completionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  completionBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  completionBar: {
    height: '100%',
    borderRadius: 4,
  },
  completionPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.orange,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
});

export default VendorProfileScreen;

