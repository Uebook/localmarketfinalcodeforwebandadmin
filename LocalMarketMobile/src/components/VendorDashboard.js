import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import BulkPriceUpdate from './BulkPriceUpdate';
import FeedbackForm from './FeedbackForm';
import { submitReviewReply } from '../services/api';

const VendorDashboard = ({
  navigation,
  vendor,
  onUpdateVendor,
  onBecomeVendor,
  isVendor,
  onPreview,
  targetTab,
  launchAddProduct,
  launchAddProductType
}) => {
  const [activeTab, setActiveTab] = useState(targetTab || 'overview');
  const [replyInputActive, setReplyInputActive] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    if (targetTab) {
      setActiveTab(targetTab);
    }
  }, [targetTab]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'activity' },
    { id: 'products', label: 'Products', icon: 'package' },
    { id: 'enquiries', label: 'Enquiries', icon: 'message-square' },
    { id: 'reviews', label: 'Reviews', icon: 'star' },
    { id: 'profile', label: 'Profile', icon: 'settings' },
    { id: 'offers', label: 'Offers', icon: 'tag' },
    { id: 'bulk-update', label: 'Bulk Update', icon: 'upload' },
    { id: 'feedback', label: 'Feedback', icon: 'message-circle' },
  ];

  const profileCompletion = 85;

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
            <Icon name="activity" size={16} color="#16a34a" />
          </View>
          <Text style={styles.statLabel}>Store Views</Text>
          <Text style={styles.statValue}>{vendor?.profileViews || 0}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
            <Icon name={getIconName('Search')} size={16} color="#2563eb" />
          </View>
          <Text style={styles.statLabel}>Appearances</Text>
          <Text style={styles.statValue}>{vendor?.searchAppearances || 0}</Text>
        </View>
      </View>

      <View style={styles.detailedStats}>
        <View style={styles.detailedStatItem}>
          <Text style={styles.detailedStatLabel}>Items</Text>
          <Text style={styles.detailedStatValue}>{vendor?.products?.length || 0}</Text>
        </View>
        <View style={styles.detailedStatItem}>
          <Text style={styles.detailedStatLabel}>Enquiries</Text>
          <Text style={styles.detailedStatValue}>{vendor?.enquiries?.length || 0}</Text>
        </View>
        <View style={styles.detailedStatItem}>
          <Text style={styles.detailedStatLabel}>Reviews</Text>
          <Text style={styles.detailedStatValue}>{vendor?.reviews?.length || 0}</Text>
        </View>
        <View style={styles.detailedStatItem}>
          <Text style={styles.detailedStatLabel}>Rating</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.detailedStatValue}>{vendor?.rating || 0}</Text>
            <Icon name={getIconName('Star')} size={12} color="#fbbf24" />
          </View>
        </View>
      </View>

      <View style={styles.accountStatusCard}>
        <View style={styles.accountStatusHeader}>
          <Icon name={getIconName('Shield')} size={16} color="#6b7280" />
          <Text style={styles.accountStatusTitle}>Account Status</Text>
        </View>
        <View style={styles.accountStatusGrid}>
          <View style={styles.accountStatusItem}>
            <Text style={styles.accountStatusLabel}>KYC Status</Text>
            <View style={[
              styles.statusBadge,
              vendor?.kycStatus === 'Approved' && styles.statusBadgeGreen,
              vendor?.kycStatus === 'Rejected' && styles.statusBadgeRed,
            ]}>
              <Text style={styles.statusBadgeText}>{vendor?.kycStatus || 'Pending'}</Text>
            </View>
          </View>
          <View style={styles.accountStatusItem}>
            <Text style={styles.accountStatusLabel}>Activation</Text>
            <View style={[
              styles.statusBadge,
              vendor?.activationStatus === 'Active' && styles.statusBadgeGreen,
            ]}>
              <Text style={styles.statusBadgeText}>{vendor?.activationStatus || 'Pending'}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderProducts = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Catalog ({vendor?.products?.length || 0})</Text>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
          <Icon name={getIconName('Plus')} size={12} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>
      {vendor?.products && vendor.products.length > 0 ? (
        <FlatList
          data={vendor.products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
                <Text style={styles.productCategory}>{item.category}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name={getIconName('Package')} size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No products yet</Text>
        </View>
      )}
    </View>
  );

  const renderEnquiries = () => (
    <View style={styles.tabContent}>
      {vendor?.enquiries && vendor.enquiries.length > 0 ? (
        <FlatList
          data={vendor.enquiries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.enquiryCard}>
              <View style={styles.enquiryHeader}>
                <Text style={styles.enquiryName}>{item.senderName}</Text>
                <Text style={styles.enquiryDate}>{item.date}</Text>
              </View>
              <Text style={styles.enquiryMessage}>{item.message}</Text>
              <View style={styles.enquiryStatus}>
                <Text style={styles.enquiryStatusText}>{item.status}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name={getIconName('MessageSquare')} size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No enquiries yet</Text>
        </View>
      )}
    </View>
  );

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim() || !reviewId) return;
    try {
      setIsReplying(true);
      const res = await submitReviewReply(reviewId, replyText.trim());
      if (res && res.success) {
        if (onUpdateVendor) {
          // Triggers a refresh so new replies show up
          onUpdateVendor();
        }
        setReplyInputActive(null);
        setReplyText('');
      } else {
        console.error('Failed to submit reply');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const renderReviews = () => (
    <View style={styles.tabContent}>
      {vendor?.reviews && vendor.reviews.length > 0 ? (
        <FlatList
          data={vendor.reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const customerName = item.user_name || item.userName || item.reviewer_name || item.customer_name || 'Customer';

            return (
              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>{customerName}</Text>
                  <View style={styles.reviewRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name={getIconName('Star')}
                        size={12}
                        color={star <= item.rating ? '#fbbf24' : '#e5e7eb'}
                      />
                    ))}
                  </View>
                </View>
                {item.created_at || item.date ? (
                  <Text style={styles.reviewDate}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : item.date}
                  </Text>
                ) : null}
                <Text style={styles.reviewComment}>{item.comment}</Text>
                {item.reply ? (
                  <View style={styles.reviewReply}>
                    <Text style={styles.reviewReplyText}>Reply: {item.reply}</Text>
                  </View>
                ) : (
                  <View style={styles.reviewReplyContainer}>
                    {replyInputActive === item.id ? (
                      <View style={{ marginTop: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' }}>
                          <TextInput
                            style={{ flex: 1, padding: 10, fontSize: 13, color: '#1f2937' }}
                            placeholder="Write your reply..."
                            value={replyText}
                            onChangeText={setReplyText}
                            multiline
                          />
                          <TouchableOpacity
                            onPress={() => handleReplySubmit(item.id)}
                            disabled={isReplying || !replyText.trim()}
                            style={{ backgroundColor: (isReplying || !replyText.trim()) ? '#d1d5db' : '#dc2626', paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center' }}
                          >
                            <Icon name="send" size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => { setReplyInputActive(null); setReplyText(''); }} style={{ marginTop: 6, alignSelf: 'flex-start' }}>
                          <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}
                        onPress={() => setReplyInputActive(item.id)}
                      >
                        <Icon name="corner-up-left" size={14} color="#dc2626" />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#dc2626' }}>Reply to Review</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name={getIconName('Star')} size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No reviews yet</Text>
        </View>
      )}
    </View>
  );

  const renderOffers = () => (
    <View style={styles.tabContent}>
      {vendor?.offers && vendor.offers.length > 0 ? (
        <FlatList
          data={vendor.offers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.offerCard}>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerDescription}>{item.description}</Text>
              <View style={styles.offerCode}>
                <Icon name={getIconName('Tag')} size={12} color="#ffffff" />
                <Text style={styles.offerCodeText}>{item.code}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name={getIconName('Tag')} size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No offers yet</Text>
        </View>
      )}
    </View>
  );

  const renderProfile = () => (
    <View style={styles.tabContent}>
      <View style={styles.profileInfoCard}>
        <Text style={styles.profileLabel}>Shop Name</Text>
        <Text style={styles.profileValue}>{vendor?.name}</Text>
      </View>
      <View style={styles.profileInfoCard}>
        <Text style={styles.profileLabel}>Owner Name</Text>
        <Text style={styles.profileValue}>{vendor?.ownerName}</Text>
      </View>
      <View style={styles.profileInfoCard}>
        <Text style={styles.profileLabel}>Contact</Text>
        <Text style={styles.profileValue}>{vendor?.contactNumber}</Text>
      </View>
      <View style={styles.profileInfoCard}>
        <Text style={styles.profileLabel}>Address</Text>
        <Text style={styles.profileValue}>{vendor?.address}</Text>
      </View>
    </View>
  );

  if (!isVendor) {
    return (
      <View style={styles.container}>
        <View style={styles.becomeVendorCard}>
          <Icon name={getIconName('Store')} size={48} color="#dc2626" />
          <Text style={styles.becomeVendorTitle}>Become a Local+ Vendor</Text>
          <Text style={styles.becomeVendorText}>
            Register your business and reach more customers in your area
          </Text>
          <TouchableOpacity
            style={styles.becomeVendorButton}
            onPress={() => navigation?.navigate('VendorRegistration')}
            activeOpacity={0.7}
          >
            <Text style={styles.becomeVendorButtonText}>Register Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{vendor?.name || 'My Business'}</Text>
            {vendor?.isVerified && (
              <Icon name={getIconName('CheckCircle')} size={16} color="#2563eb" />
            )}
          </View>
          <TouchableOpacity
            onPress={() => navigation?.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Icon name={getIconName('Settings')} size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Profile Completion */}
      <View style={styles.completionBar}>
        <View style={styles.completionHeader}>
          <Text style={styles.completionLabel}>Profile Completion</Text>
          <Text style={styles.completionPercent}>{profileCompletion}%</Text>
        </View>
        <View style={styles.completionTrack}>
          <View style={[styles.completionFill, { width: `${profileCompletion}%` }]} />
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive
            ]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Icon
              name={getIconName(tab.icon) || tab.icon}
              size={20}
              color={activeTab === tab.id ? '#dc2626' : '#6b7280'}
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.tabLabelActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView style={styles.contentScroll}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'enquiries' && renderEnquiries()}
        {activeTab === 'reviews' && renderReviews()}
        {activeTab === 'offers' && renderOffers()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'bulk-update' && (
          <BulkPriceUpdate
            navigation={navigation}
            onBack={() => setActiveTab('overview')}
            vendorProducts={vendor?.products || []}
            onUpdatePrices={() => {
              // Refresh products after update
              setActiveTab('products');
            }}
          />
        )}
        {activeTab === 'feedback' && (
          <FeedbackForm
            navigation={navigation}
            onBack={() => setActiveTab('overview')}
            userRole="vendor"
            onSubmit={(feedbackData) => {
              // Handle feedback submission
              console.log('Feedback submitted:', feedbackData);
              setActiveTab('overview');
            }}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  completionBar: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  completionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  completionPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  completionTrack: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 3,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#fee2e2',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
  },
  tabLabelActive: {
    color: '#dc2626',
  },
  contentScroll: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  detailedStats: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 16,
  },
  detailedStatItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f3f4f6',
  },
  detailedStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailedStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  accountStatusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 16,
  },
  accountStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  accountStatusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  accountStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  accountStatusItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  accountStatusLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#fef3c7',
    alignSelf: 'flex-start',
  },
  statusBadgeGreen: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeRed: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  enquiryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 16,
    marginBottom: 12,
  },
  enquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  enquiryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  enquiryDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  enquiryMessage: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  enquiryStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#dbeafe',
  },
  enquiryStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'capitalize',
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  reviewReply: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  reviewReplyText: {
    fontSize: 14,
    color: '#475569',
  },
  offerCard: {
    backgroundColor: '#9333ea',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: '#f3f4f6',
    marginBottom: 12,
  },
  offerCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  offerCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  profileInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 16,
    marginBottom: 12,
  },
  profileLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  becomeVendorCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  becomeVendorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 12,
  },
  becomeVendorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  becomeVendorButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  becomeVendorButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default VendorDashboard;




