import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { getFestiveOffers, getVendors } from '../services/api';

const OffersScreen = ({ navigation, locationState }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllOffers();
  }, []);

  const loadAllOffers = async () => {
    try {
      setLoading(true);
      
      // Load festive offers from database
      const festiveOffersData = await getFestiveOffers({ status: 'active' });
      
      // Transform and filter festive offers
      const now = new Date();
      const activeFestiveOffers = festiveOffersData
        .filter(offer => {
          // Check status
          if (offer.status !== 'active') return false;
          
          // Check date range
          const startDate = offer.start_date ? new Date(offer.start_date) : null;
          const endDate = offer.end_date ? new Date(offer.end_date) : null;
          
          if (startDate && now < startDate) return false;
          if (endDate && now > endDate) return false;
          
          return true;
        })
        .map(offer => ({
          id: offer.id,
          title: offer.title || 'Special Offer',
          description: offer.description || `Get ${offer.discount_percent || 0}% off`,
          discount: offer.discount_percent || 0,
          code: offer.code || `OFFER${offer.discount_percent || ''}`,
          color: 'purple', // Default color for festive offers
          startDate: offer.start_date,
          endDate: offer.end_date,
          type: offer.type,
          target: offer.target,
          circle: offer.circle,
          vendorIds: offer.vendor_ids,
          isFestive: true,
          businessName: 'Festive Offer',
          businessId: 'festive',
        }));

      // If offers are vendor-specific, fetch vendor details
      const vendorSpecificOffers = activeFestiveOffers.filter(o => o.target === 'specific' && o.vendorIds);
      let vendorsMap = {};
      
      if (vendorSpecificOffers.length > 0) {
        try {
          // Fetch all vendors to get names
          const vendorsData = await getVendors({ status: 'Active', limit: 100 });
          if (vendorsData && vendorsData.vendors) {
            vendorsData.vendors.forEach(v => {
              vendorsMap[v.id] = v;
            });
          }
        } catch (error) {
          console.error('Error loading vendors for offers:', error);
        }
      }

      // Transform offers with vendor information
      const transformedOffers = activeFestiveOffers.map(offer => {
        // If vendor-specific, update business name
        if (offer.target === 'specific' && offer.vendorIds && offer.vendorIds.length > 0) {
          const vendorId = offer.vendorIds[0]; // Use first vendor
          const vendor = vendorsMap[vendorId];
          if (vendor) {
            return {
              ...offer,
              businessName: vendor.name || 'Vendor Offer',
              businessId: vendor.id,
              isFestive: false,
            };
          }
        }
        return offer;
      });

      setOffers(transformedOffers);
    } catch (error) {
      console.error('Error loading offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferClick = async (businessId, offer) => {
    // If it's a vendor-specific offer, navigate to vendor details
    if (businessId && businessId !== 'festive') {
      try {
        // Fetch vendor details if needed
        const vendorsData = await getVendors({ status: 'Active', limit: 100 });
        if (vendorsData && vendorsData.vendors) {
          const vendor = vendorsData.vendors.find(v => v.id === businessId);
          if (vendor && navigation) {
            navigation.navigate('VendorDetails', { vendor });
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching vendor for offer:', error);
      }
    }
    
    // For festive offers or if vendor not found, just show offer details
    if (navigation) {
      // Could navigate to offer details page or show modal
      console.log('Offer clicked:', offer);
    }
  };

  const getOfferColor = (color) => {
    // Map color classes to hex values
    if (!color) return '#2563eb'; // Default blue
    if (color.includes('purple')) return '#9333ea';
    if (color.includes('blue')) return '#2563eb';
    if (color.includes('red')) return '#dc2626';
    if (color.includes('green')) return '#16a34a';
    if (color.includes('orange')) return '#ea580c';
    return '#2563eb';
  };

  const renderOffer = ({ item: offer }) => {
    const businessName = offer.businessName || 'Special Offer';
    const businessId = offer.businessId || offer.id;
    const discountText = offer.discount > 0 ? `${offer.discount}% OFF` : 'Special Offer';
    
    return (
      <TouchableOpacity
        style={[styles.offerCard, { backgroundColor: getOfferColor(offer.color) }]}
        onPress={() => handleOfferClick(businessId, offer)}
        activeOpacity={0.9}
      >
        <View style={styles.offerBlur} />
        <View style={styles.offerContent}>
          <View style={styles.offerHeader}>
            <Text style={styles.offerTitle}>{offer.title}</Text>
            <View style={styles.businessBadge}>
              <Icon name={getIconName('Store')} size={12} color="#ffffff" />
              <Text style={styles.businessBadgeText}>{businessName}</Text>
            </View>
          </View>
          <Text style={styles.offerDescription}>{offer.description}</Text>
          {offer.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountText}</Text>
            </View>
          )}
          {offer.code && (
            <View style={styles.offerCodeContainer}>
              <Icon name={getIconName('Tag')} size={16} color="#ffffff" />
              <Text style={styles.offerCode}>{offer.code}</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.redeemButton}
            onPress={() => handleOfferClick(businessId, offer)}
            activeOpacity={0.8}
          >
            <Text style={styles.redeemButtonText}>Redeem Now</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name={getIconName('Gift')} size={24} color="#dc2626" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Festive Offers for You</Text>
            <Text style={styles.headerSubtitle}>Curated offers from local vendors nearby</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ea580c" />
            <Text style={styles.loadingText}>Loading offers...</Text>
          </View>
        ) : offers.length > 0 ? (
          <>
            <FlatList
              data={offers}
              renderItem={renderOffer}
              keyExtractor={(item, index) => `${item.id || index}-${index}`}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <View style={styles.footer}>
              <Text style={styles.footerText}>More offers coming soon...</Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Icon name={getIconName('Gift')} size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Active Offers</Text>
            <Text style={styles.emptyText}>No active offers found. Check back later for new deals!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    paddingTop: 8,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  separator: {
    height: 16,
  },
  offerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  offerBlur: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  offerContent: {
    position: 'relative',
    zIndex: 10,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  offerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#ffffff',
    marginRight: 8,
  },
  businessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  businessBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  offerDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  offerCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  offerCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  redeemButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  redeemButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  discountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  discountText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
});

export default OffersScreen;




