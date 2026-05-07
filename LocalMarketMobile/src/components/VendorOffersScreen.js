import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getVendorSidebarControl } from '../utils/vendorSidebarControl';
import { getSidebarControl } from '../utils/sidebarControl';
import { getFestiveOffers, createOffer, updateOffer, deleteOffer } from '../services/api';

const VendorOffersScreen = ({ navigation, vendorData, setVendorData }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [locationState] = React.useState({
    lat: null,
    lng: null,
    city: 'Amritsar, India',
    loading: false,
    error: null,
  });

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [savingOffer, setSavingOffer] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    discountAmount: '',
    validUntil: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    fetchOffers();
  }, [vendorData?.id]);

  const fetchOffers = async () => {
    if (!vendorData?.id) return;
    try {
      setLoading(true);
      const data = await getFestiveOffers({ vendorId: vendorData.id });
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
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

  const handleDeleteOffer = async (offerId) => {
    Alert.alert(
      'Delete Offer',
      'Are you sure you want to delete this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOffer(offerId);
              setOffers(offers.filter(o => o.id !== offerId));
              Alert.alert('Success', 'Offer deleted successfully');
            } catch (error) {
              console.error('Error deleting offer:', error);
              Alert.alert('Error', 'Failed to delete offer');
            }
          },
        },
      ]
    );
  };

  const handleSaveOffer = async () => {
    if (!formData.title || !formData.code || !formData.discountAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Basic date validation (YYYY-MM-DD or DD/MM/YYYY)
    let endDate = formData.validUntil;
    if (endDate && endDate.includes('/')) {
      const [d, m, y] = endDate.split('/');
      endDate = `${y}-${m}-${d}`;
    } else if (!endDate) {
      endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default 30 days
    }

    const offerPayload = {
      title: formData.title,
      description: formData.description,
      type: 'vendor',
      target: 'specific',
      vendor_ids: [vendorData.id],
      start_date: new Date().toISOString().split('T')[0],
      end_date: endDate,
      discount_percent: parseFloat(formData.discountAmount.replace('%', '')) || null,
      status: 'active',
    };

    try {
      setSavingOffer(true);
      let res;
      if (editingOffer) {
        res = await updateOffer({ id: editingOffer.id, ...offerPayload });
      } else {
        res = await createOffer(offerPayload);
      }

      if (res) {
        await fetchOffers();
        setShowCreateForm(false);
        setEditingOffer(null);
        setFormData({
          title: '',
          description: '',
          code: '',
          discountAmount: '',
          validUntil: '',
        });
        Alert.alert('Success', `Offer ${editingOffer ? 'updated' : 'created'} successfully`);
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      Alert.alert('Error', 'Failed to save offer');
    } finally {
      setSavingOffer(false);
    }
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

  const handleDateSelect = (day) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    const dateStr = `${dayStr}/${monthStr}/${selectedYear}`;
    setFormData({ ...formData, validUntil: dateStr });
    setShowDatePicker(false);
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(
        <TouchableOpacity
          key={d}
          style={styles.calendarDay}
          onPress={() => handleDateSelect(d)}
        >
          <Text style={styles.calendarDayText}>{d}</Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Shop Profile Section - Premium Redesign */}
        <View style={styles.profileSectionWrapper}>
          <LinearGradient
            colors={['#1E293B', '#334155']}
            style={styles.premiumCover}
          >
            <View style={styles.coverOverlay} />
            <TouchableOpacity style={styles.editCoverBtn} onPress={() => navigation.navigate('Profile')}>
              <Icon name="camera" size={14} color="#FFF" />
              <Text style={styles.editCoverText}>Change Cover</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.profileCard}>
            <View style={styles.profileHeaderRow}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarInner}>
                  <Icon name="user" size={32} color={COLORS.textMuted} />
                </View>
                <View style={styles.onlineBadge} />
              </View>

              <View style={styles.shopMainDetails}>
                <View style={styles.nameBadgeRow}>
                  <Text style={styles.shopNameText}>{vendorData?.name || 'My Shop'}</Text>
                  <View style={styles.verifiedBadge}>
                    <Icon name="check" size={10} color="#FFF" />
                  </View>
                </View>
                <View style={styles.subDetailRow}>
                  <Icon name="map-pin" size={12} color="#64748B" />
                  <Text style={styles.subDetailText}>{vendorData?.address || 'Shop Address'}</Text>
                </View>
              </View>

              <View style={styles.ratingBadgeTop}>
                <Icon name="star" size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingValueText}>{vendorData?.rating || '4.8'}</Text>
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
              <TouchableOpacity style={styles.qActionItem} onPress={() => {}}>
                <View style={[styles.qActionIcon, { backgroundColor: '#F0F9FF' }]}>
                  <Icon name="share-2" size={18} color="#0EA5E9" />
                </View>
                <Text style={styles.qActionLabel}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.qActionItem} onPress={() => {
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
                <View style={[styles.qActionIcon, { backgroundColor: '#F5F3FF' }]}>
                  <Icon name="eye" size={18} color="#8B5CF6" />
                </View>
                <Text style={styles.qActionLabel}>Preview</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.qActionItem} onPress={() => {}}>
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
                  <TouchableOpacity
                    style={styles.dateInputContainer}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <TextInput
                      style={[styles.input, styles.dateInput]}
                      value={formData.validUntil}
                      placeholder="dd/mm/yyyy"
                      placeholderTextColor={COLORS.textMuted}
                      editable={false}
                      pointerEvents="none"
                    />
                    <Icon name={getIconName('Calendar')} size={20} color={COLORS.textMuted} style={styles.calendarIcon} />
                  </TouchableOpacity>
                </View>

                {/* Date Picker Modal */}
                <Modal
                  visible={showDatePicker}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.datePickerContainer}>
                      <View style={styles.datePickerHeader}>
                        <TouchableOpacity onPress={() => {
                          if (selectedMonth === 0) {
                            setSelectedMonth(11);
                            setSelectedYear(selectedYear - 1);
                          } else {
                            setSelectedMonth(selectedMonth - 1);
                          }
                        }}>
                          <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.datePickerTitle}>{months[selectedMonth]} {selectedYear}</Text>
                        <TouchableOpacity onPress={() => {
                          if (selectedMonth === 11) {
                            setSelectedMonth(0);
                            setSelectedYear(selectedYear + 1);
                          } else {
                            setSelectedMonth(selectedMonth + 1);
                          }
                        }}>
                          <Icon name="chevron-right" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.calendarGrid}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                          <Text key={d} style={styles.calendarWeekday}>{d}</Text>
                        ))}
                        {renderCalendar()}
                      </View>
                      <TouchableOpacity
                        style={styles.closeDatePickerButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.closeDatePickerButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                <View style={styles.formButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCloseForm}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveOfferButton, savingOffer && styles.disabledButton]}
                    onPress={handleSaveOffer}
                    disabled={savingOffer}
                  >
                    {savingOffer ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.saveOfferButtonText}>{editingOffer ? 'Update Offer' : 'Create Offer'}</Text>
                    )}
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
  offersSection: {
    padding: 16,
  },
  offersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  offersTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  offerForm: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingRight: 12,
    backgroundColor: '#F8FAFC',
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
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
  },
  saveOfferButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F97316',
  },
  saveOfferButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  offerCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
  disabledButton: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    width: '85%',
    elevation: 5,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarWeekday: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayEmpty: {
    width: '14.28%',
    height: 40,
  },
  calendarDayText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  closeDatePickerButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeDatePickerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.orange,
  },
});

export default VendorOffersScreen;

