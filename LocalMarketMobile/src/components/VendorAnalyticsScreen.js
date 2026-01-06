import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { COLORS } from '../constants/colors';
import { getVendorSidebarControl } from '../utils/vendorSidebarControl';
import { getSidebarControl } from '../utils/sidebarControl';
import { handleShare, handlePreview } from '../utils/vendorActions';

const VendorAnalyticsScreen = ({ navigation, vendorData }) => {
  const [locationState] = useState({
    lat: null,
    lng: null,
    city: 'Delhi, India',
    loading: false,
    error: null,
  });

  // Mock performance data
  const performanceData = {
    totalUsers1KM: 1240,
    activeUsersSearching: 820,
    searchesInCategory: 410,
    shopViews: 56,
    usersComparedPrices: 38,
    usersClickedContact: 7,
    conversionEstimate: '1-3 sales',
    pricePosition: 'Higher',
    rating: '4.0',
    priceUpdates: 1,
  };

  // Competition analysis data
  const competitionData = [
    {
      item: 'Basmati Rice 5kg',
      userSearches: 120,
      avgMarketPrice: 720,
      lowestPriceNearby: 680,
      yourPrice: 760,
      status: 'Higher',
      isReasonable: false,
    },
    {
      item: 'Mustard Oil 1L',
      userSearches: 96,
      avgMarketPrice: 155,
      lowestPriceNearby: 148,
      yourPrice: 150,
      status: 'Reasonable',
      isReasonable: true,
    },
    {
      item: 'Atta 10kg',
      userSearches: 88,
      avgMarketPrice: 480,
      lowestPriceNearby: 450,
      yourPrice: 520,
      status: 'Higher',
      isReasonable: false,
    },
    {
      item: 'Mobile Charger',
      userSearches: 54,
      avgMarketPrice: 210,
      lowestPriceNearby: 180,
      yourPrice: 190,
      status: 'Competitive',
      isReasonable: true,
    },
  ];

  // Motivation graph data
  const motivationData = [
    { month: 'Month 1', users: 800, searches: 300, views: 15, clicks: 2 },
    { month: 'Month 2', users: 1200, searches: 450, views: 38, clicks: 7 },
  ];

  // Auto recommendations based on interpretation guidance
  const recommendations = [
    {
      type: 'pricing',
      title: 'Pricing Suggestion',
      message: 'Your price is ₹40 higher than market average. Try reducing to ₹720 for Basmati Rice 5kg',
      icon: 'dollar-sign',
      color: COLORS.orange,
    },
    {
      type: 'product',
      title: 'Product Suggestion',
      message: 'Users are searching for "Toor Dal 1kg". Add this product to increase visibility.',
      icon: 'package',
      color: COLORS.blue,
    },
    {
      type: 'engagement',
      title: 'Engagement Tip',
      message: 'Shops with weekly price updates get 4x more views. Update your prices regularly.',
      icon: 'trending-up',
      color: '#16a34a',
    },
    {
      type: 'visibility',
      title: 'Visibility Improvement',
      message: 'Upload shop photo to improve listing trust and get more views.',
      icon: 'camera',
      color: COLORS.orange,
    },
  ];

  // High demand products
  const highDemandProducts = [
    'Basmati Rice 5kg',
    'Mustard Oil 1L',
    'Atta 10kg',
    'Toor Dal 1kg',
    'Sugar 1kg',
    'Tea 500g',
    'Biscuits',
    'Soap',
  ];

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

  const handleProfileClick = () => {
    if (navigation) {
      navigation.navigate('Settings');
    }
  };

  const handleNotificationClick = () => {
    if (navigation) {
      navigation.navigate('Notifications');
    }
  };

  const profileCompletion = 85;

  const renderPerformanceTable = () => (
    <View style={styles.performanceCard}>
      <Text style={styles.sectionTitle}>VENDOR PERFORMANCE INSIGHT REPORT</Text>
      <View style={styles.reportHeader}>
        <Text style={styles.reportHeaderText}>Market: {locationState.city}</Text>
        <Text style={styles.reportHeaderText}>Vendor: {vendorData?.name || 'My Shop'}</Text>
        <Text style={styles.reportHeaderText}>Date Range: Last 30 Days</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellMetric}>Total Users Within 1 KM Radius</Text>
          <Text style={styles.tableCellValue}>{performanceData.totalUsers1KM.toLocaleString()}</Text>
          <Text style={styles.tableCellMeaning}>Real users near your shop</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellMetric}>Active Users Searching in This Area</Text>
          <Text style={styles.tableCellValue}>{performanceData.activeUsersSearching.toLocaleString()}</Text>
          <Text style={styles.tableCellMeaning}>Users actually browsing</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellMetric}>Searches in Your Category</Text>
          <Text style={styles.tableCellValue}>{performanceData.searchesInCategory.toLocaleString()}</Text>
          <Text style={styles.tableCellMeaning}>Users interested in your category</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellMetric}>Your Shop Views</Text>
          <Text style={styles.tableCellValue}>{performanceData.shopViews}</Text>
          <Text style={styles.tableCellMeaning}>Users who opened your listing</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellMetric}>Users Who Compared Prices</Text>
          <Text style={styles.tableCellValue}>{performanceData.usersComparedPrices}</Text>
          <Text style={styles.tableCellMeaning}>Users shortlisted shops</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellMetric}>Users Who Clicked "Navigate / Contact"</Text>
          <Text style={styles.tableCellValue}>{performanceData.usersClickedContact}</Text>
          <Text style={styles.tableCellMeaning}>Potential conversions</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellMetric}>Conversion Estimate</Text>
          <Text style={styles.tableCellValue}>{performanceData.conversionEstimate}</Text>
          <Text style={styles.tableCellMeaning}>Expected offline visits</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellMetric}>Your Price Position</Text>
          <Text style={[styles.tableCellValue, { color: performanceData.pricePosition === 'Higher' ? '#dc2626' : '#16a34a' }]}>
            {performanceData.pricePosition}
          </Text>
          <Text style={styles.tableCellMeaning}>Compared to competitors</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellMetric}>Rating / Feedback</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.tableCellValue}>{performanceData.rating}</Text>
            <Icon name="star" size={14} color="#fbbf24" />
          </View>
          <Text style={styles.tableCellMeaning}>If applicable</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellMetric}>Price Updates</Text>
          <Text style={styles.tableCellValue}>{performanceData.priceUpdates} time in 30 days</Text>
          <Text style={styles.tableCellMeaning}>Vendor activity level</Text>
        </View>
      </View>
    </View>
  );

  const renderCompetitionTable = () => (
    <View style={styles.competitionCard}>
      <Text style={styles.sectionTitle}>USER CHOICE & COMPETITION ANALYSIS</Text>
      <Text style={styles.sectionSubtitle}>Shows vendor clearly why or why not users are choosing them</Text>

      <View style={styles.competitionTable}>
        <View style={styles.competitionTableHeader}>
          <Text style={[styles.competitionHeaderCell, { flex: 2 }]}>Item / Category</Text>
          <Text style={styles.competitionHeaderCell}>Searches</Text>
          <Text style={styles.competitionHeaderCell}>Avg Price</Text>
          <Text style={styles.competitionHeaderCell}>Lowest</Text>
          <Text style={styles.competitionHeaderCell}>Your Price</Text>
          <Text style={styles.competitionHeaderCell}>Status</Text>
        </View>

        {competitionData.map((item, index) => (
          <View key={index} style={styles.competitionTableRow}>
            <Text style={[styles.competitionTableCell, { flex: 2, fontWeight: '600' }]}>{item.item}</Text>
            <Text style={styles.competitionTableCell}>{item.userSearches}</Text>
            <Text style={styles.competitionTableCell}>₹{item.avgMarketPrice}</Text>
            <Text style={styles.competitionTableCell}>₹{item.lowestPriceNearby}</Text>
            <Text style={styles.competitionTableCell}>₹{item.yourPrice}</Text>
            <View style={styles.statusCell}>
              {item.isReasonable ? (
                <Icon name="check" size={14} color="#16a34a" />
              ) : (
                <View style={styles.checkbox} />
              )}
              <Text style={[styles.competitionTableCell, { 
                color: item.isReasonable ? '#16a34a' : '#dc2626',
                marginLeft: 4,
              }]}>
                {item.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMotivationGraph = () => (
    <View style={styles.motivationCard}>
      <Text style={styles.sectionTitle}>MOTIVATION GRAPH</Text>
      <Text style={styles.sectionSubtitle}>Vendor sees improvement → stays motivated instead of quitting</Text>

      <View style={styles.graphContainer}>
        <View style={styles.graphHeader}>
          <Text style={styles.graphHeaderText}>Metric</Text>
          <Text style={styles.graphHeaderText}>Month 1</Text>
          <Text style={styles.graphHeaderText}>Month 2</Text>
        </View>

        {Object.keys(motivationData[0]).filter(key => key !== 'month').map((metric) => (
          <View key={metric} style={styles.graphRow}>
            <Text style={[styles.graphCell, { flex: 1, textTransform: 'capitalize' }]}>{metric}</Text>
            <Text style={styles.graphCell}>{motivationData[0][metric]}</Text>
            <Text style={[styles.graphCell, { color: '#16a34a', fontWeight: '700' }]}>
              {motivationData[1][metric]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.recommendationsCard}>
      <Text style={styles.sectionTitle}>AUTO RECOMMENDATIONS</Text>
      <Text style={styles.sectionSubtitle}>System automatically suggests improvements</Text>

      {recommendations.map((rec, index) => (
        <View key={index} style={styles.recommendationItem}>
          <View style={[styles.recommendationIcon, { backgroundColor: `${rec.color}20` }]}>
            <Icon name={rec.icon} size={20} color={rec.color} />
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>{rec.title}</Text>
            <Text style={styles.recommendationMessage}>{rec.message}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderHighDemandProducts = () => (
    <View style={styles.highDemandCard}>
      <Text style={styles.sectionTitle}>HIGH DEMAND PRODUCTS</Text>
      <Text style={styles.sectionSubtitle}>Top searched items - Keep 10-20 key products</Text>

      <View style={styles.productsGrid}>
        {highDemandProducts.map((product, index) => (
          <View key={index} style={styles.productChip}>
            <Icon name="trending-up" size={12} color={COLORS.orange} />
            <Text style={styles.productChipText}>{product}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipText}>💡 Avoid rare/unpopular items initially</Text>
        <Text style={styles.tipText}>💡 Focus on products with high search volume</Text>
      </View>
    </View>
  );

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
                <Text style={styles.shopName}>{vendorData?.name || 'My Shop'}</Text>
                <Icon name={getIconName('CheckCircle')} size={20} color={COLORS.blue} />
              </View>
              <View style={styles.locationRow}>
                <Icon name={getIconName('MapPin')} size={14} color={COLORS.textMuted} />
                <Text style={styles.locationText}>{vendorData?.address || 'Shop Address'}</Text>
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
        </View>

        {/* Performance Insight Report */}
        {renderPerformanceTable()}

        {/* Competition Analysis */}
        {renderCompetitionTable()}

        {/* Motivation Graph */}
        {renderMotivationGraph()}

        {/* High Demand Products */}
        {renderHighDemandProducts()}

        {/* Auto Recommendations */}
        {renderRecommendations()}

        {/* Quick Stats */}
        <View style={styles.quickStatsCard}>
          <Text style={styles.sectionTitle}>QUICK STATS</Text>
          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{vendorData?.products?.length || 0}</Text>
              <Text style={styles.quickStatLabel}>Items</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{vendorData?.enquiries?.length || 0}</Text>
              <Text style={styles.quickStatLabel}>Enquiries</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{vendorData?.reviews?.length || 0}</Text>
              <Text style={styles.quickStatLabel}>Reviews</Text>
            </View>
            <View style={styles.quickStatItem}>
              <View style={styles.ratingRow}>
                <Text style={styles.quickStatValue}>{vendorData?.rating || '4.0'}</Text>
                <Icon name="star" size={16} color="#fbbf24" />
              </View>
              <Text style={styles.quickStatLabel}>Rating</Text>
            </View>
          </View>
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
  // Performance Table Styles
  performanceCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  reportHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  reportHeaderText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  table: {
    gap: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCellMetric: {
    flex: 2,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  tableCellValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  tableCellMeaning: {
    flex: 1.5,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  ratingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  // Competition Table Styles
  competitionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  competitionTable: {
    marginTop: 12,
  },
  competitionTableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.textPrimary,
    marginBottom: 8,
  },
  competitionHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
  },
  competitionTableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  competitionTableCell: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  statusCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    borderRadius: 2,
  },
  // Motivation Graph Styles
  motivationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  graphContainer: {
    marginTop: 12,
  },
  graphHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.textPrimary,
    marginBottom: 8,
  },
  graphHeaderText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
  },
  graphRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  graphCell: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  // High Demand Products Styles
  highDemandCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  productChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  productChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  tipsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  // Recommendations Styles
  recommendationsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  recommendationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  recommendationMessage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  // Quick Stats Styles
  quickStatsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    marginTop: 12,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default VendorAnalyticsScreen;
