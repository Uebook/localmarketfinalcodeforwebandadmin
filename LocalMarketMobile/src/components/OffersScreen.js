import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { getFestiveOffers, getVendors } from '../services/api';
import { useThemeColors } from '../hooks/useThemeColors';

const OffersScreen = ({ navigation, locationState }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
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
    const offerTitle = (offer.title || 'Special Offer').toLowerCase();

    return (
      <TouchableOpacity
        style={[styles.offerCard, { backgroundColor: getOfferColor(offer.color) }]}
        onPress={() => handleOfferClick(businessId, offer)}
        activeOpacity={0.9}
      >
        <View style={styles.offerBlur} />
        <View style={styles.offerContent}>
          {/* Top Right Badge */}
          <View style={styles.festiveBadge}>
            <Icon name={getIconName('Gift')} size={12} color="#ffffff" />
            <Text style={styles.festiveBadgeText}>Festive Offer</Text>
          </View>

          {/* Top Left Section */}
          <View style={styles.offerTopSection}>
            <View style={styles.offerTitleSection}>
              <Text style={styles.offerTitle}>{offerTitle}</Text>
              <Text style={styles.offerDescription}>{offer.description || `Get ${offer.discount || 0}% off`}</Text>
            </View>
          </View>

          {/* Bottom Section with Badges and Button */}
          <View style={styles.offerBottomSection}>
            <View style={styles.badgesContainer}>
              {offer.discount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>{discountText}</Text>
                </View>
              )}
              {offer.code && (
                <View style={styles.offerCodeContainer}>
                  <Icon name={getIconName('Tag')} size={14} color="#ffffff" />
                  <Text style={styles.offerCode}>{offer.code}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.redeemButton}
              onPress={() => handleOfferClick(businessId, offer)}
              activeOpacity={0.8}
            >
              <Text style={styles.redeemButtonText}>Redeem Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name={getIconName('Gift')} size={24} color={COLORS.white} />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Festive Offers for You</Text>
              <Text style={styles.headerSubtitle}>Curated offers from local vendors nearby</Text>
            </View>
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
            <ActivityIndicator size="large" color={COLORS.orange} />
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
            <Icon name={getIconName('Gift')} size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Active Offers</Text>
            <Text style={styles.emptyText}>No active offers found. Check back later for new deals!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 80,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
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
    padding: 20,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 200,
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
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 200,
  },
  festiveBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  festiveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  offerTopSection: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  offerTitleSection: {
    marginBottom: 8,
  },
  offerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
    textTransform: 'lowercase',
  },
  offerDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  offerBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  discountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  discountBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  offerCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  offerCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  redeemButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginLeft: 12,
  },
  redeemButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9333ea', // Purple color for redeem button text
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textMuted,
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
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
});

export default OffersScreen;




