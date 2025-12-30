import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { NEARBY_BUSINESSES, INITIAL_VENDOR_DATA } from '../constants';

const OffersScreen = ({ navigation, vendorData = INITIAL_VENDOR_DATA }) => {
  // Collect all offers from vendor and nearby businesses
  const allOffers = useMemo(() => {
    const offers = [];
    
    // Add vendor offers
    if (vendorData?.offers) {
      vendorData.offers.forEach(o => {
        offers.push({ 
          offer: o, 
          businessName: vendorData.name, 
          businessId: vendorData.id 
        });
      });
    }
    
    // Add nearby business offers
    NEARBY_BUSINESSES.forEach(b => {
      if (b.offers) {
        b.offers.forEach(o => {
          offers.push({ 
            offer: o, 
            businessName: b.name, 
            businessId: b.id 
          });
        });
      }
    });
    
    return offers;
  }, [vendorData]);

  const handleOfferClick = (businessId) => {
    // Find the business and navigate to its details
    const business = NEARBY_BUSINESSES.find(b => b.id === businessId) || 
                     (businessId === vendorData?.id ? vendorData : null);
    if (business && navigation) {
      navigation.navigate('VendorDetails', { vendor: business });
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

  const renderOffer = ({ item: { offer, businessName, businessId } }) => (
    <TouchableOpacity
      style={[styles.offerCard, { backgroundColor: getOfferColor(offer.color) }]}
      onPress={() => handleOfferClick(businessId)}
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
        <View style={styles.offerCodeContainer}>
          <Icon name={getIconName('Tag')} size={16} color="#ffffff" />
          <Text style={styles.offerCode}>{offer.code}</Text>
        </View>
        <TouchableOpacity 
          style={styles.redeemButton}
          onPress={() => handleOfferClick(businessId)}
          activeOpacity={0.8}
        >
          <Text style={styles.redeemButtonText}>Redeem Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
        {allOffers.length > 0 ? (
          <>
            <FlatList
              data={allOffers}
              renderItem={renderOffer}
              keyExtractor={(item, index) => `${item.offer.id}-${index}`}
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
            <Text style={styles.emptyText}>No active offers found nearby.</Text>
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
});

export default OffersScreen;




