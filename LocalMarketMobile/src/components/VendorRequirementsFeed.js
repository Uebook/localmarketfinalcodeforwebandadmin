import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
import api from '../services/api';

export default function VendorRequirementsFeed({ navigation, route }) {
  const themeColors = useThemeColors();
  const { vendorData, locationState } = route.params || {};

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'my_bids'
  const [requirements, setRequirements] = useState([]);
  const [myQuotations, setMyQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const lat = locationState?.lat || 31.6340;
      const lng = locationState?.lng || 74.8723;
      
      const promises = [
        api.getRequirements({ lat, lng, radius: 5 }),
      ];

      if (vendorData?.id) {
        promises.push(api.getQuotations({ vendor_id: vendorData.id }));
      }

      const [reqsRes, quotesRes] = await Promise.all(promises);

      if (reqsRes && reqsRes.success) {
        let activeReqs = reqsRes.requirements || [];
        
        if (quotesRes && quotesRes.success) {
          const biddedIds = (quotesRes.quotations || []).map(q => q.requirement_id);
          // Filter out requirements the vendor already bid on
          activeReqs = activeReqs.filter(req => !biddedIds.includes(req.id));
        }
        
        setRequirements(activeReqs);
      }
      
      if (quotesRes && quotesRes.success) {
        setMyQuotations(quotesRes.quotations || []);
      }
    } catch (err) {
      console.warn('Failed to fetch vendor data', err);
    } finally {
      setLoading(false);
    }
  };

  const renderRequirement = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: themeColors.white, borderColor: themeColors.divider }]}
      onPress={() => navigation.navigate('SubmitQuotation', { requirement: item, vendorData })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: themeColors.success + '1A' }]}>
          <Text style={[styles.statusText, { color: themeColors.success }]}>NEW LEAD</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: themeColors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Icon name="tag" size={14} color={themeColors.textMuted} />
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>{item.category}</Text>
        </View>
        <View style={styles.footerItem}>
          <Icon name="map-pin" size={14} color={themeColors.textMuted} />
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>{item.location_text || 'Nearby'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return themeColors.success;
      case 'rejected': return themeColors.danger;
      default: return themeColors.textMuted;
    }
  };

  const renderQuotation = ({ item }) => (
    <View style={[styles.card, { backgroundColor: themeColors.white, borderColor: themeColors.divider }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={1}>
          {item.custom_requirements?.title || 'Requirement'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '1A' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.quoteDetails}>
        <Text style={[styles.quotePrice, { color: themeColors.primaryOrange }]}>₹{item.price}</Text>
        <Text style={[styles.quoteTime, { color: themeColors.textSecondary }]}>Delivery: {item.delivery_time}</Text>
      </View>
      
      {item.status === 'accepted' && item.custom_requirements?.users && (
        <View style={[styles.buyerInfo, { backgroundColor: themeColors.backgroundSoft }]}>
          <Text style={[styles.buyerInfoTitle, { color: themeColors.textPrimary }]}>Buyer Contact</Text>
          <Text style={{ color: themeColors.textSecondary }}>{item.custom_requirements.users.name || 'Buyer'}</Text>
          <Text style={{ color: themeColors.primaryBlue }}>{item.custom_requirements.users.phone || 'No phone'}</Text>
        </View>
      )}

      <View style={[styles.actionButtons, { borderTopColor: themeColors.divider }]}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('SubmitQuotation', { 
            requirement: item.custom_requirements, 
            vendorData, 
            existingQuotation: item,
            isViewOnly: true
          })}
        >
          <Icon name="eye" size={16} color={themeColors.textSecondary} />
          <Text style={[styles.actionBtnText, { color: themeColors.textSecondary }]}>View</Text>
        </TouchableOpacity>

        {item.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.actionBtnRight]}
            onPress={() => navigation.navigate('SubmitQuotation', { 
              requirement: item.custom_requirements, 
              vendorData, 
              existingQuotation: item,
              isViewOnly: false
            })}
          >
            <Icon name="edit-2" size={16} color={themeColors.primaryOrange} />
            <Text style={[styles.actionBtnText, { color: themeColors.primaryOrange }]}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSoft }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: themeColors.white, borderBottomColor: themeColors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Local Leads</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.tabContainer, { backgroundColor: themeColors.white, borderBottomColor: themeColors.divider }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'feed' && { borderBottomColor: themeColors.primaryOrange }]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'feed' ? themeColors.primaryOrange : themeColors.textMuted }]}>New Leads</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'my_bids' && { borderBottomColor: themeColors.primaryOrange }]}
          onPress={() => setActiveTab('my_bids')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'my_bids' ? themeColors.primaryOrange : themeColors.textMuted }]}>My Bids</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={themeColors.primaryOrange} />
        </View>
      ) : activeTab === 'feed' ? (
        <FlatList
          data={requirements}
          keyExtractor={(item) => item.id}
          renderItem={renderRequirement}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="map" size={48} color={themeColors.divider} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No new leads nearby right now.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={myQuotations}
          keyExtractor={(item) => item.id}
          renderItem={renderQuotation}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="inbox" size={48} color={themeColors.divider} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>You haven't submitted any bids yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 14, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  listContainer: { padding: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  footerItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginTop: 4 },
  footerText: { fontSize: 12, marginLeft: 4 },
  quoteDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  quotePrice: { fontSize: 18, fontWeight: '700' },
  quoteTime: { fontSize: 13 },
  buyerInfo: { marginTop: 12, padding: 12, borderRadius: 8 },
  buyerInfoTitle: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  actionButtons: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 6 },
  actionBtnRight: { borderLeftWidth: 1, borderLeftColor: '#E0E0E0' },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
});
