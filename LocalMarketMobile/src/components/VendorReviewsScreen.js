import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import ExitConfirmModal from './ExitConfirmModal';
import Image from './ImageWithFallback';
import { BackHandler } from 'react-native';
import { getVendorSidebarControl } from '../utils/vendorSidebarControl';
import { getSidebarControl } from '../utils/sidebarControl';
import { handleShare, handlePreview } from '../utils/vendorActions';

import { submitReviewReply, getVendorProfile } from '../services/api';
import { ActivityIndicator, Alert } from 'react-native';

const VendorReviewsScreen = ({ navigation, vendorData, setVendorData }) => {
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

  const [locationState] = React.useState({
    lat: vendorData?.location?.lat || null,
    lng: vendorData?.location?.lng || null,
    city: vendorData?.location?.city || vendorData?.city || 'Amritsar, India',
    loading: false,
    error: null,
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

  const profileCompletion = 85;
  const reviews = vendorData?.reviews || [];

  const [replyTexts, setReplyTexts] = useState({});
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [submittingReply, setSubmittingReply] = useState({});

  const handleReplyUpdate = (reviewId, text) => {
    setReplyTexts(prev => ({ ...prev, [reviewId]: text }));
  };

  const handleReplySubmit = async (reviewId) => {
    const replyText = replyTexts[reviewId];
    if (!replyText || !replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply message.');
      return;
    }

    try {
      setSubmittingReply(prev => ({ ...prev, [reviewId]: true }));
      const response = await submitReviewReply(reviewId, replyText);

      if (response && response.success) {
        // Clear reply text
        setReplyTexts(prev => {
          const newState = { ...prev };
          delete newState[reviewId];
          return newState;
        });

        // Refresh vendor data
        if (setVendorData && vendorData?.id) {
          const freshData = await getVendorProfile(vendorData.id);
          if (freshData) {
            setVendorData(freshData);
          }
        }

        Alert.alert('Success', 'Reply submitted successfully.');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      Alert.alert('Error', 'Failed to submit reply. Please try again.');
    } finally {
      setSubmittingReply(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
        hideCart={true}
        profileImage={vendorData?.profile_image_url || vendorData?.profileImageUrl || vendorData?.imageUrl || vendorData?.image_url}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Shop Profile Section - Premium Redesign */}
        <View style={styles.profileSectionWrapper}>
          <LinearGradient
            colors={['#1E293B', '#334155']}
            style={styles.premiumCover}
          >
            {(vendorData?.profile_image_url || vendorData?.profileImageUrl || vendorData?.image_url || vendorData?.imageUrl) && (
              <Image 
                source={{ uri: vendorData.profile_image_url || vendorData.profileImageUrl || vendorData.image_url || vendorData.imageUrl }} 
                style={StyleSheet.absoluteFill} 
                opacity={0.6}
              />
            )}
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
                  {(vendorData?.profile_image_url || vendorData?.profileImageUrl || vendorData?.imageUrl || vendorData?.image_url) ? (
                    <Image 
                      source={{ uri: vendorData.profile_image_url || vendorData.profileImageUrl || vendorData.imageUrl || vendorData.image_url }} 
                      style={styles.avatarImage} 
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
              <TouchableOpacity style={styles.qActionItem} onPress={() => handleShare(vendorData)}>
                <View style={[styles.qActionIcon, { backgroundColor: '#F0F9FF' }]}>
                  <Icon name="share-2" size={18} color="#0EA5E9" />
                </View>
                <Text style={styles.qActionLabel}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.qActionItem} onPress={() => handlePreview(navigation, vendorData)}>
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

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>

          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewUser}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>{getInitials(review.user_name || review.userName || 'Customer')}</Text>
                  </View>
                  <View>
                    <Text style={styles.reviewName}>{review.user_name || review.userName || 'Customer'}</Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          name={getIconName('Star')}
                          size={14}
                          color={star <= review.rating ? '#fbbf24' : '#E5E7EB'}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewDate}>{review.created_at ? new Date(review.created_at).toLocaleDateString() : (review.date || '')}</Text>
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>

              <Text style={styles.reviewComment}>{review.comment}</Text>

              {review.reply ? (
                <View style={styles.replyCard}>
                  <View style={styles.replyHeader}>
                    <Icon name={getIconName('ArrowLeft')} size={12} color={COLORS.textMuted} />
                    <Text style={styles.replyLabel}>You replied:</Text>
                  </View>
                  <Text style={styles.replyText}>{review.reply}</Text>
                </View>
              ) : (
                <View style={styles.replyInputContainer}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Write a reply..."
                    placeholderTextColor={COLORS.textMuted}
                    value={replyTexts[review.id] || ''}
                    onChangeText={(text) => handleReplyUpdate(review.id, text)}
                    editable={!submittingReply[review.id]}
                  />
                  <TouchableOpacity
                    style={[styles.replyButton, submittingReply[review.id] && { opacity: 0.7 }]}
                    onPress={() => handleReplySubmit(review.id)}
                    disabled={submittingReply[review.id]}
                  >
                    {submittingReply[review.id] ? (
                      <ActivityIndicator size="small" color={COLORS.orange} />
                    ) : (
                      <Text style={styles.replyButtonText}>Reply</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <ExitConfirmModal 
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => BackHandler.exitApp()}
      />
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
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
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
  reviewsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F97316',
  },
  reviewName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  reviewComment: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
  },
  replyCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  replyText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    fontWeight: '500',
  },
  replyInputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  replyButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  replyButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
});

export default VendorReviewsScreen;

