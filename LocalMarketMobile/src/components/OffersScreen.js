import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator, Animated, Dimensions, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Header from './Header';
import SearchBar from './SearchBar';
import { getIconName } from '../utils/iconMapping';
import { getFestiveOffers, getVendors } from '../services/api';
import { useThemeColors } from '../hooks/useThemeColors';

const OffersScreen = ({ navigation, locationState }) => {
  const { width } = Dimensions.get('window');
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    loadAllOffers();
  }, []);

  const loadAllOffers = async () => {
    try {
      setLoading(true);
      const festiveOffersData = await getFestiveOffers({ status: 'active' });
      const now = new Date();
      const activeFestiveOffers = festiveOffersData
        .filter(offer => {
          if (offer.status !== 'active') return false;
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
          color: offer.color || 'purple',
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

      const vendorSpecificOffers = activeFestiveOffers.filter(o => o.target === 'specific' && o.vendorIds);
      let vendorsMap = {};

      if (vendorSpecificOffers.length > 0) {
        try {
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

      const transformedOffers = activeFestiveOffers.map(offer => {
        if (offer.target === 'specific' && offer.vendorIds && offer.vendorIds.length > 0) {
          const vendorId = offer.vendorIds[0];
          const vendor = vendorsMap[vendorId];
          if (vendor) {
            return {
              ...offer,
              businessName: vendor.name || 'Vendor Offer',
              businessId: vendor.id,
              imageUrl: vendor.profileImageUrl || vendor.imageUrl || vendor.shopFrontPhotoUrl,
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
    if (businessId && businessId !== 'festive') {
      try {
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
    if (navigation) {
      console.log('Offer clicked:', offer);
    }
  };

  const handleSearch = (query) => {
    if (query && query.trim()) {
      navigation.navigate('SearchResults', { query: query.trim() });
    }
  };

  const handleMenuClick = () => {
    const { getSidebarControl } = require('../utils/sidebarControl');
    const control = getSidebarControl();
    if (control) {
      control(true);
    }
  };

  const handleProfileClick = () => {
    if (navigation) navigation.navigate('Settings');
  };

  const handleNotificationClick = () => {
    if (navigation) navigation.navigate('Notifications');
  };

  const getGradientColors = (color) => {
    if (!color) return ['#4F46E5', '#3B82F6']; // Indigo to Blue
    if (color.includes('purple')) return ['#9333ea', '#c084fc'];
    if (color.includes('blue')) return ['#2563eb', '#60a5fa'];
    if (color.includes('red')) return ['#dc2626', '#f87171'];
    if (color.includes('green')) return ['#059669', '#34d399'];
    if (color.includes('orange')) return ['#ea580c', '#fb923c'];
    return ['#4F46E5', '#3B82F6'];
  };

  const renderOffer = ({ item: offer, index }) => {
    const businessName = offer.businessName || 'Special Offer';
    const businessId = offer.businessId || offer.id;
    const discountText = offer.discount > 0 ? `${offer.discount}% OFF` : 'Special Offer';
    const offerTitle = (offer.title || 'Special Offer').toUpperCase();

    // Animation for card entrance
    const inputRange = [-1, 0, 180 * index, 180 * (index + 2)];
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0],
    });
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.95],
    });

    const gradientArray = getGradientColors(offer.color);

    return (
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <TouchableOpacity
          style={styles.offerCardWrapper}
          onPress={() => handleOfferClick(businessId, offer)}
          activeOpacity={0.95}
        >
          <LinearGradient
            colors={gradientArray}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.offerCard}
          >
            {/* Background Pattern Elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            {/* Header / Vendor Name */}
            <View style={styles.offerTopRow}>
              <View style={styles.vendorInfo}>
                <View style={styles.vendorAvatar}>
                  {offer.imageUrl ? (
                    <Image source={{ uri: offer.imageUrl }} style={styles.vendorAvatarImage} />
                  ) : (
                    <Icon name={getIconName('Store')} size={14} color={gradientArray[0]} />
                  )}
                </View>
                <Text style={styles.businessName} numberOfLines={1}>{businessName}</Text>
              </View>
              {offer.isFestive && (
                <View style={styles.festiveBadge}>
                  <Icon name={getIconName('Star')} size={10} color="#FFD700" />
                  <Text style={styles.festiveBadgeText}>FESTIVE</Text>
                </View>
              )}
            </View>

            {/* Middle Section: Title & Discount */}
            <View style={styles.offerMiddleSection}>
              <View style={styles.titleWrapper}>
                <Text style={styles.offerTitle} numberOfLines={2}>{offerTitle}</Text>
                <Text style={styles.offerDescription} numberOfLines={2}>{offer.description}</Text>
              </View>
              {offer.discount > 0 && (
                <View style={styles.discountBadgeWrapper}>
                  <Text style={styles.discountNumber}>{offer.discount}%</Text>
                  <Text style={styles.discountLabel}>OFF</Text>
                </View>
              )}
            </View>

            {/* Bottom Row / CTA */}
            <View style={styles.offerBottomSection}>
              {offer.code ? (
                <View style={styles.promoCodeBox}>
                  <Icon name={getIconName('Tag')} size={12} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.promoCodeText}>{offer.code}</Text>
                </View>
              ) : (
                <View style={styles.spacer} />
              )}
              <View style={styles.redeemButton}>
                <Text style={[styles.redeemButtonText, { color: gradientArray[0] }]}>Redeem Now</Text>
                <Icon name={getIconName('ChevronRight')} size={16} color={gradientArray[0]} />
              </View>
            </View>

          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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

      <Header
        locationState={locationState}
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
        onNotificationClick={handleNotificationClick}
      />

      <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
        <SearchBar onSearch={handleSearch} navigation={navigation} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.orange} />
          <Text style={styles.loadingText}>Curating your offers...</Text>
        </View>
      ) : offers.length > 0 ? (
        <Animated.FlatList
          data={offers}
          renderItem={renderOffer}
          keyExtractor={(item, index) => `${item.id || index}-${index}`}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          ListFooterComponent={<View style={styles.footer}><Text style={styles.footerText}>More offers dropping soon ✨</Text></View>}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Icon name={getIconName('Ticket')} size={48} color={COLORS.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No Active Offers</Text>
          <Text style={styles.emptyText}>Check back later for seasonal and vendor discounts!</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Light Slate Grey Background
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  offerCardWrapper: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  offerCard: {
    borderRadius: 24,
    padding: 24,
    minHeight: 200,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 0,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 0,
  },
  offerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
    marginBottom: 20,
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flex: 1,
    marginRight: 12,
  },
  vendorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  vendorAvatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  businessName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  festiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  festiveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  offerMiddleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
    marginBottom: 20,
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 16,
  },
  offerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 32,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  offerDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  discountBadgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    transform: [{ rotate: '3deg' }],
  },
  discountNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 24,
  },
  discountLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 1,
  },
  offerBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
    marginTop: 10,
  },
  promoCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  promoCodeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  spacer: {
    flex: 1,
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: '800',
    marginRight: 6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  }
});

export default OffersScreen;




