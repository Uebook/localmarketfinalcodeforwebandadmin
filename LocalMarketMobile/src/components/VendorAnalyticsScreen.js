import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getVendorTrending, getVendorPerformance } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getVendorSidebarControl } from '../utils/vendorSidebarControl';
import { getSidebarControl } from '../utils/sidebarControl';
import { handleShare, handlePreview } from '../utils/vendorActions';

const VendorAnalyticsScreen = ({ navigation, vendorData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceStats, setPerformanceStats] = useState({
    leads: 0,
    views: 0,
    enquiries: 0,
    calls: 0,
    whatsapp: 0,
    recentLeads: []
  });
  const [trendingData, setTrendingData] = useState([]);
  const [analyticsRecommendations, setAnalyticsRecommendations] = useState([]);

  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [locationState] = useState({
    lat: null,
    lng: null,
    city: 'Amritsar, India',
    loading: false,
    error: null,
  });

  React.useEffect(() => {
    const fetchAllAnalytics = async () => {
      if (!vendorData?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const vendorCity = vendorData.city || 'Amritsar';
        const vendorCategory = vendorData.category || '';

        // Parallel fetch for speed
        const [perfRes, trendRes] = await Promise.all([
          getVendorPerformance(vendorData.id),
          getVendorTrending(vendorCity, vendorCategory)
        ]);

        if (perfRes?.success) {
          setPerformanceStats(perfRes.stats);
        }

        if (trendRes?.success) {
          setTrendingData(trendRes.trending || []);
          setAnalyticsRecommendations(trendRes.recommendations || []);
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllAnalytics();
  }, [vendorData?.id]);

  // Performance data (mapping real stats)
  const performanceData = {
    totalUsers1KM: performanceStats.areaUsers || 450,
    activeUsersSearching: performanceStats.activeUsers || 120,
    searchesInCategory: performanceStats.categorySearches || 45,
    shopViews: performanceStats.views || 0,
    usersComparedPrices: performanceStats.leads || 0,
    usersClickedContact: (performanceStats.calls || 0) + (performanceStats.whatsapp || 0),
    conversionEstimate: `${performanceStats.enquiries || 0}-${(performanceStats.enquiries || 0) + 5} sales`,
    pricePosition: (performanceStats.enquiries || 0) > 5 ? 'Competitive' : 'Lower',
    rating: vendorData?.rating || '4.5',
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

  // Auto recommendations from API
  const recommendations = analyticsRecommendations.length > 0 
    ? analyticsRecommendations 
    : [
        {
          type: 'engagement',
          title: 'Welcome Note',
          message: 'Start updating your prices to see live market comparisons here.',
          icon: 'trending-up',
          color: COLORS.orange,
        }
      ];

  // High demand products from search logs
  const highDemandProducts = trendingData.length > 0 
    ? trendingData.map(t => t.query) 
    : ['Basmati Rice', 'Atta', 'Cooking Oil', 'Sugar'];

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

  const renderPerformanceDashboard = () => (
    <View style={styles.dashboardSection}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Performance Dashboard</Text>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>Last 30 Days</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { borderLeftColor: COLORS.orange }]}>
          <View style={styles.metricIconBox}>
            <Icon name="users" size={20} color={COLORS.orange} />
          </View>
          <Text style={styles.metricValue}>{performanceData.totalUsers1KM.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Users Nearby</Text>
          <Text style={styles.metricInsight}>Within 1 KM radius</Text>
        </View>

        <View style={[styles.metricCard, { borderLeftColor: '#3B82F6' }]}>
          <View style={styles.metricIconBox}>
            <Icon name="search" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.metricValue}>{performanceData.activeUsersSearching.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Active Searches</Text>
          <Text style={styles.metricInsight}>Searching in this area</Text>
        </View>

        <View style={[styles.metricCard, { borderLeftColor: '#10B981' }]}>
          <View style={styles.metricIconBox}>
            <Icon name="eye" size={20} color="#10B981" />
          </View>
          <Text style={styles.metricValue}>{performanceData.shopViews}</Text>
          <Text style={styles.metricLabel}>Shop Views</Text>
          <Text style={styles.metricInsight}>Opened your listing</Text>
        </View>

        <View style={[styles.metricCard, { borderLeftColor: '#8B5CF6' }]}>
          <View style={styles.metricIconBox}>
            <Icon name="phone-call" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.metricValue}>{performanceData.usersClickedContact}</Text>
          <Text style={styles.metricLabel}>Inquiries</Text>
          <Text style={styles.metricInsight}>Clicks to contact</Text>
        </View>
      </View>

      <View style={styles.secondaryStatsRow}>
        <View style={styles.secondaryStatItem}>
          <Text style={styles.secondaryStatValue}>{performanceData.searchesInCategory}</Text>
          <Text style={styles.secondaryStatLabel}>Category Interest</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.secondaryStatItem}>
          <Text style={styles.secondaryStatValue}>{performanceData.usersComparedPrices}</Text>
          <Text style={styles.secondaryStatLabel}>Shortlisted</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.secondaryStatItem}>
          <Text style={[styles.secondaryStatValue, { color: performanceData.pricePosition === 'Higher' ? '#EF4444' : '#10B981' }]}>
            {performanceData.pricePosition}
          </Text>
          <Text style={styles.secondaryStatLabel}>Price Status</Text>
        </View>
      </View>
    </View>
  );

  const renderCompetitionTable = () => (
    <View style={styles.competitionCard}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>User Choice & Competition</Text>
        <Icon name="help-circle" size={16} color={COLORS.textMuted} />
      </View>
      <Text style={styles.sectionSubtitle}>Why users are choosing (or skipping) your products</Text>

      <View style={styles.competitionTable}>
        <View style={styles.competitionTableHeader}>
          <Text style={[styles.competitionHeaderCell, { flex: 2 }]}>Item</Text>
          <Text style={styles.competitionHeaderCell}>Avg</Text>
          <Text style={styles.competitionHeaderCell}>Your Price</Text>
          <Text style={[styles.competitionHeaderCell, { textAlign: 'right' }]}>Status</Text>
        </View>

        {competitionData.map((item, index) => (
          <View key={index} style={styles.competitionTableRow}>
            <Text style={[styles.competitionTableCell, { flex: 2, fontWeight: '700' }]}>{item.item}</Text>
            <Text style={styles.competitionTableCell}>₹{item.avgMarketPrice}</Text>
            <Text style={[styles.competitionTableCell, { fontWeight: '700' }]}>₹{item.yourPrice}</Text>
            <View style={[styles.statusPill, { 
              backgroundColor: item.status === 'Higher' ? '#FEF2F2' : (item.status === 'Competitive' ? '#ECFDF5' : '#F0F9FF') 
            }]}>
              <Text style={[styles.statusPillText, { 
                color: item.status === 'Higher' ? '#EF4444' : (item.status === 'Competitive' ? '#10B981' : '#3B82F6') 
              }]}>
                {item.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMotivationDashboard = () => (
    <View style={styles.motivationCard}>
      <Text style={styles.sectionTitle}>Growth Trend</Text>
      <Text style={styles.sectionSubtitle}>Monthly improvement in shop visibility</Text>

      <View style={styles.trendRows}>
        {[
          { label: 'Active Users', key: 'users', icon: 'users' },
          { label: 'Search Visibility', key: 'searches', icon: 'zap' },
          { label: 'Listing Views', key: 'views', icon: 'eye' },
        ].map((item) => {
          const val1 = motivationData[0][item.key];
          const val2 = motivationData[1][item.key];
          const diff = val2 - val1;
          const percent = ((diff / val1) * 100).toFixed(0);

          return (
            <View key={item.key} style={styles.trendRow}>
              <View style={styles.trendInfo}>
                <View style={styles.trendIconBox}>
                  <Icon name={item.icon} size={16} color="#64748B" />
                </View>
                <Text style={styles.trendLabel}>{item.label}</Text>
              </View>
              <View style={styles.trendValues}>
                <Text style={styles.trendPrevValue}>{val1}</Text>
                <Icon name="arrow-right" size={12} color="#CBD5E1" style={{ marginHorizontal: 8 }} />
                <Text style={styles.trendCurrValue}>{val2}</Text>
                <View style={styles.percentBadge}>
                  <Icon name="trending-up" size={10} color="#10B981" />
                  <Text style={styles.percentText}>+{percent}%</Text>
                </View>
              </View>
            </View>
          );
        })}
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.orange} />
        <Text style={styles.loadingText}>Loading performance analytics...</Text>
      </View>
    );
  }

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
            <TouchableOpacity style={styles.editCoverBtn}>
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

        {/* Performance Dashboard */}
        {renderPerformanceDashboard()}

        {/* Competition Analysis */}
        {renderCompetitionTable()}

        {/* Motivation Dashboard */}
        {renderMotivationDashboard()}

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

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
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
  // New Dashboard Styles
  dashboardSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  metricInsight: {
    fontSize: 9,
    fontWeight: '500',
    color: '#94A3B8',
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 12,
  },
  secondaryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  secondaryStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  secondaryStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#CBD5E1',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  trendRows: {
    marginTop: 16,
    gap: 12,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
  },
  trendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  trendValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendPrevValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  trendCurrValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  percentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 12,
  },
  percentText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
});

export default VendorAnalyticsScreen;
