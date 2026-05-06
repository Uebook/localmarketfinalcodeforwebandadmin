import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Share, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Feather';
import Image from './ImageWithFallback';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getVendorSidebarControl } from '../utils/vendorSidebarControl';
import { getSidebarControl } from '../utils/sidebarControl';
import { getVendorProfile } from '../services/api';

const VendorEnquiriesScreen = ({ navigation, vendorData, setVendorData }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [locationState] = React.useState({
    lat: null,
    lng: null,
    city: 'Amritsar, India',
    loading: false,
    error: null,
  });

  const [enquiries, setEnquiries] = useState(vendorData?.enquiries || []);
  const [refreshing, setRefreshing] = useState(false);

  // Sync enquiries when vendorData changes
  useEffect(() => {
    if (vendorData?.enquiries) {
      setEnquiries(vendorData.enquiries);
    }
  }, [vendorData]);

  const fetchLatestData = useCallback(async () => {
    if (!vendorData?.id) return;
    
    setRefreshing(true);
    try {
      const fullProfile = await getVendorProfile(vendorData.id);
      if (fullProfile && fullProfile.vendor) {
        const updatedVendor = {
          ...fullProfile.vendor,
          products: fullProfile.products || [],
          enquiries: fullProfile.enquiries || [],
          reviews: fullProfile.reviews || [],
        };
        
        setEnquiries(updatedVendor.enquiries);
        if (setVendorData) {
          setVendorData(updatedVendor);
        }
      }
    } catch (err) {
      console.error('Failed to fetch latest enquiries:', err);
    } finally {
      setRefreshing(false);
    }
  }, [vendorData?.id, setVendorData]);

  // Fetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchLatestData();
    }, [fetchLatestData])
  );

  const onRefresh = useCallback(() => {
    fetchLatestData();
  }, [fetchLatestData]);


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

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out ${vendorData?.name || 'My Awesome Shop'} on Local Market!`,
        title: 'Share Shop',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share');
    }
  };

  const handlePreview = () => {
    if (navigation && vendorData) {
      const fullAddress = [
        vendorData.address || 'Shop 12, Main Market',
        vendorData.landmark || 'Near Clock Tower',
        `${vendorData.city || 'New Delhi'} - ${vendorData.pincode || '110001'}`
      ].filter(Boolean).join(' / ');

      const businessData = {
        ...vendorData,
        id: vendorData.id || 'v1',
        name: vendorData.name || 'My Awesome Shop',
        category: vendorData.category || 'Grocery',
        rating: vendorData.rating || 4.8,
        reviewCount: vendorData.reviewCount || 12,
        address: fullAddress,
        contactNumber: vendorData.contactNumber || '9876543210',
        whatsappNumber: vendorData.whatsappNumber || vendorData.contactNumber || '9876543210',
        openTime: vendorData.openTime || '09:00 AM - 09:00 PM',
        about: vendorData.about || 'Welcome to our shop! We provide high quality products.',
        products: vendorData.products || [],
        isVerified: vendorData.isVerified !== false,
      };

      navigation.navigate('VendorDetails', { business: businessData });
    }
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleMessage = (phone) => {
    if (phone) {
      Linking.openURL(`whatsapp://send?phone=${phone.replace(/[^0-9]/g, '')}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleMarkAsReplied = (enquiryId) => {
    setEnquiries(enquiries.map(e =>
      e.id === enquiryId ? { ...e, status: 'REPLIED' } : e
    ));
  };

  const profileCompletion = 85;

  const getStatusStyle = (status) => {
    if (status === 'REPLIED') return { backgroundColor: '#DCFCE7', color: '#166534' };
    if (status === 'READ') return { backgroundColor: '#E5E7EB', color: COLORS.textSecondary };
    return { backgroundColor: COLORS.orange, color: COLORS.white };
  };

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

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                  {vendorData?.profile_image_url || vendorData?.profileImageUrl ? (
                    <Image 
                      source={{ uri: vendorData.profile_image_url || vendorData.profileImageUrl }} 
                      style={styles.circleImage} 
                    />
                  ) : (
                    <Icon name="user" size={32} color={COLORS.textMuted} />
                  )}
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
              <TouchableOpacity style={styles.qActionItem} onPress={handleShare}>
                <View style={[styles.qActionIcon, { backgroundColor: '#F0F9FF' }]}>
                  <Icon name="share-2" size={18} color="#0EA5E9" />
                </View>
                <Text style={styles.qActionLabel}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.qActionItem} onPress={handlePreview}>
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
          </View>
        </View>

        {/* Enquiries Section */}
        <View style={styles.enquiriesSection}>
          <Text style={styles.sectionTitle}>Customer Enquiries</Text>

          {enquiries.length > 0 ? (
            enquiries.map((enquiry) => {
              const statusStyle = getStatusStyle(enquiry.status);
              return (
                <View key={enquiry.id} style={styles.enquiryCard}>
                  <View style={styles.enquiryHeader}>
                    <View style={styles.enquiryUser}>
                      <View style={styles.userAvatar}>
                        <Icon name={getIconName('User')} size={20} color={COLORS.textMuted} />
                      </View>
                      <View style={styles.userInfo}>
                        <View style={styles.nameDateRow}>
                          <Text style={styles.enquiryName}>{enquiry.customerName}</Text>
                          <Text style={styles.enquiryDate}>{enquiry.date}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.enquiryActions}>
                      <TouchableOpacity
                        style={styles.actionButtonSmall}
                        onPress={() => handleCall(enquiry.phone)}
                      >
                        <Icon name={getIconName('Phone')} size={20} color="#16a34a" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButtonSmall}
                        onPress={() => handleMessage(enquiry.phone)}
                      >
                        <Icon name={getIconName('MessageCircle')} size={20} color="#16a34a" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.enquiryMessage}>"{enquiry.message}"</Text>

                  <View style={styles.enquiryFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                      <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>
                        {enquiry.status}
                      </Text>
                    </View>

                    {enquiry.status === 'READ' && (
                      <TouchableOpacity
                        style={styles.replyButton}
                        onPress={() => handleMarkAsReplied(enquiry.id)}
                      >
                        <Icon name={getIconName('Clock')} size={14} color={COLORS.blue} />
                        <Text style={styles.replyButtonText}>Mark as Replied</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Icon name={getIconName('MessageSquare')} size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No enquiries yet</Text>
              <Text style={styles.emptySubText}>Pull down to check for new messages</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
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
  enquiriesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 20,
  },
  enquiryCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  enquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  enquiryUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userInfo: {
    flex: 1,
  },
  enquiryName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  enquiryDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  enquiryActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enquiryMessage: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
    lineHeight: 20,
    fontStyle: 'italic',
    paddingLeft: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#E2E8F0',
  },
  enquiryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  replyButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center', 
    paddingVertical: 60,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default VendorEnquiriesScreen;

