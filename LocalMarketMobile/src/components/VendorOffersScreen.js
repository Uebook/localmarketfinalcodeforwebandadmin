import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getVendorSidebarControl } from '../utils/vendorSidebarControl';
import { getSidebarControl } from '../utils/sidebarControl';

const VendorOffersScreen = ({ navigation, vendorData, setVendorData }) => {
  const COLORS = useThemeColors();
  const [locationState] = React.useState({
    lat: null,
    lng: null,
    city: 'Delhi, India',
    loading: false,
    error: null,
  });

  const [offers, setOffers] = useState(vendorData?.offers || [
    { id: 'vo1', title: 'Grand Opening Sale', description: 'Flat 20% off on first purchase', code: 'WELCOME20', discountAmount: '20%', validUntil: '2025-12-31', isActive: true, color: 'bg-purple-600' }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    discountAmount: '',
    validUntil: '',
  });

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
  const handleProfileClick = () => navigation?.navigate('Settings');
  const handleNotificationClick = () => navigation?.navigate('Notifications');

  const handleCreateOffer = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      code: '',
      discountAmount: '',
      validUntil: '',
    });
    setShowCreateForm(true);
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title || '',
      description: offer.description || '',
      code: offer.code || '',
      discountAmount: offer.discountAmount || '',
      validUntil: offer.validUntil || '',
    });
    setShowCreateForm(true);
  };

  const handleDeleteOffer = (offerId) => {
    setOffers(offers.filter(o => o.id !== offerId));
    if (setVendorData) {
      setVendorData({
        ...vendorData,
        offers: offers.filter(o => o.id !== offerId),
      });
    }
  };

  const handleSaveOffer = () => {
    if (!formData.title || !formData.code || !formData.discountAmount) {
      return; // Validation
    }

    const newOffer = {
      id: editingOffer?.id || `vo${Date.now()}`,
      title: formData.title,
      description: formData.description,
      code: formData.code.toUpperCase(),
      discountAmount: formData.discountAmount,
      validUntil: formData.validUntil || '2025-12-31',
      isActive: true,
      color: 'bg-purple-600',
    };

    if (editingOffer) {
      setOffers(offers.map(o => o.id === editingOffer.id ? newOffer : o));
    } else {
      setOffers([...offers, newOffer]);
    }

    if (setVendorData) {
      setVendorData({
        ...vendorData,
        offers: editingOffer 
          ? offers.map(o => o.id === editingOffer.id ? newOffer : o)
          : [...offers, newOffer],
      });
    }

    setShowCreateForm(false);
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      code: '',
      discountAmount: '',
      validUntil: '',
    });
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      code: '',
      discountAmount: '',
      validUntil: '',
    });
  };

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
                <Text style={styles.shopName}>{vendorData?.name || 'My Awesome Shop'}</Text>
                <Icon name={getIconName('CheckCircle')} size={20} color={COLORS.blue} />
              </View>
              <View style={styles.locationRow}>
                <Icon name={getIconName('MapPin')} size={14} color={COLORS.textMuted} />
                <Text style={styles.locationText}>{vendorData?.address || 'Shop 12, Main Market'}</Text>
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
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.orange }]}>
                <Icon name={getIconName('Share2')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => {
              if (navigation) {
                const businessData = {
                  ...vendorData,
                  id: vendorData?.id || 'v1',
                  name: vendorData?.name || 'My Awesome Shop',
                  category: vendorData?.category || 'Grocery',
                  rating: vendorData?.rating || 4.8,
                  reviewCount: vendorData?.reviewCount || 12,
                  address: `${vendorData?.address || 'Shop 12, Main Market'} / ${vendorData?.landmark || 'Near Clock Tower'} / ${vendorData?.city || 'New Delhi'} - ${vendorData?.pincode || '110001'}`,
                  contactNumber: vendorData?.contactNumber || '9876543210',
                  whatsappNumber: vendorData?.whatsappNumber || vendorData?.contactNumber || '9876543210',
                  openTime: vendorData?.openTime || '09:00 AM - 09:00 PM',
                  about: vendorData?.about || 'Welcome to our shop! We provide high quality products.',
                  products: vendorData?.products || [],
                  isVerified: vendorData?.isVerified !== false,
                };
                navigation.navigate('VendorDetails', { business: businessData });
              }
            }}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.orange }]}>
                <Icon name={getIconName('Eye')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.blue }]}>
                <Icon name={getIconName('Tag')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Offers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation?.navigate('Settings')}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.textMuted }]}>
                <Icon name={getIconName('Settings')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Offers Section */}
        <View style={styles.offersSection}>
          <View style={styles.offersHeader}>
            <Text style={styles.offersTitle}>Active Offers ({offers.length})</Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateOffer}>
              <Icon name={getIconName('Plus')} size={16} color={COLORS.white} />
              <Text style={styles.createButtonText}>Create Offer</Text>
            </TouchableOpacity>
          </View>

          {/* Create/Edit Offer Form */}
          {showCreateForm && (
            <View style={styles.offerForm}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</Text>
                <TouchableOpacity onPress={handleCloseForm} style={styles.closeButton}>
                  <Icon name={getIconName('X')} size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.formContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>OFFER TITLE</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    placeholder="e.g. Diwali Sale"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>DESCRIPTION</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="e.g. Flat 20% off on all items"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>DISCOUNT CODE</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.code}
                    onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
                    placeholder="E.G. SAVE20"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>DISCOUNT VALUE</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.discountAmount}
                    onChangeText={(text) => setFormData({ ...formData, discountAmount: text })}
                    placeholder="e.g. 20%"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>VALID UNTIL</Text>
                  <View style={styles.dateInputContainer}>
                    <TextInput
                      style={[styles.input, styles.dateInput]}
                      value={formData.validUntil}
                      onChangeText={(text) => setFormData({ ...formData, validUntil: text })}
                      placeholder="dd/mm/yyyy"
                      placeholderTextColor={COLORS.textMuted}
                    />
                    <Icon name={getIconName('Calendar')} size={20} color={COLORS.textMuted} style={styles.calendarIcon} />
                  </View>
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCloseForm}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveOfferButton} onPress={handleSaveOffer}>
                    <Text style={styles.saveOfferButtonText}>Create Offer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Offers List */}
          {offers.map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteOffer(offer.id)}
              >
                <Icon name={getIconName('Trash')} size={18} color={COLORS.orange} />
              </TouchableOpacity>
              <View style={styles.offerCardContent}>
                <View style={styles.offerLeftBar} />
                <View style={styles.offerDetails}>
                  <Text style={styles.offerCardTitle}>{offer.title}</Text>
                  <Text style={styles.offerCardDescription}>{offer.description}</Text>
                  <View style={styles.offerTags}>
                    <View style={styles.codeTag}>
                      <Text style={styles.codeTagText}>{offer.code}</Text>
                    </View>
                    <View style={styles.discountTag}>
                      <Text style={styles.discountTagText}>{offer.discountAmount} OFF</Text>
                    </View>
                  </View>
                  <View style={styles.offerFooter}>
                    <Text style={styles.expiryText}>Exp: {offer.validUntil}</Text>
                    <TouchableOpacity onPress={() => handleEditOffer(offer)}>
                      <Icon name={getIconName('Edit')} size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  offersSection: {
    padding: 16,
  },
  offersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  offersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  offerForm: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  formContent: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    paddingRight: 12,
  },
  dateInput: {
    flex: 1,
    borderWidth: 0,
    paddingRight: 0,
  },
  calendarIcon: {
    marginLeft: 8,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  saveOfferButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.blue,
  },
  saveOfferButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  offerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  offerCardContent: {
    flexDirection: 'row',
  },
  offerLeftBar: {
    width: 4,
    backgroundColor: COLORS.blue,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  offerDetails: {
    flex: 1,
    padding: 16,
  },
  offerCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  offerCardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  offerTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  codeTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  codeTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  discountTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});

export default VendorOffersScreen;

