import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getVendorSidebarControl } from '../utils/vendorSidebarControl';
import { getSidebarControl } from '../utils/sidebarControl';

const VendorEnquiriesScreen = ({ navigation, vendorData }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [locationState] = React.useState({
    lat: null,
    lng: null,
    city: 'Delhi, India',
    loading: false,
    error: null,
  });

  const [enquiries, setEnquiries] = useState([
    {
      id: '1',
      customerName: 'Rahul Kumar',
      date: '2024-05-20',
      message: 'Hi, do you have this item in stock?',
      status: 'REPLIED',
      phone: '+91 9898989898',
    },
    {
      id: '2',
      customerName: 'Priya Singh',
      date: '2024-05-19',
      message: 'What are your shop timings?',
      status: 'READ',
      phone: '+91 9797979797',
    },
    {
      id: '3',
      customerName: 'Amit Sharma',
      date: '2024-05-18',
      message: 'Can you deliver to Sector 18?',
      status: 'REPLIED',
      phone: '+91 9696969696',
    },
  ]);

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
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.orange }]}>
                <Icon name={getIconName('Share2')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handlePreview}>
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
        </View>

        {/* Enquiries Section */}
        <View style={styles.enquiriesSection}>
          <Text style={styles.sectionTitle}>Customer Enquiries</Text>
          
          {enquiries.map((enquiry) => {
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
          })}
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
  enquiriesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  enquiryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  enquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  enquiryUser: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  nameDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  enquiryName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  enquiryDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  enquiryActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButtonSmall: {
    padding: 8,
    borderRadius: 8,
  },
  enquiryMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
    paddingLeft: 4,
  },
  enquiryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
  },
});

export default VendorEnquiriesScreen;

