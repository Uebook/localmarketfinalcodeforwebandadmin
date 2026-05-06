import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  ActivityIndicator, StatusBar, ScrollView, Share, Modal, PanResponder 
} from 'react-native';
import Image from './ImageWithFallback';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getMarketDetails } from '../services/api';
import { useThemeColors } from '../hooks/useThemeColors';

const MarketScreen = ({ navigation, route }) => {
  const { circle, locationState } = route.params;
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [sortBy, setSortBy] = useState('default');
  const [maxDistance, setMaxDistance] = useState(25);
  const [filterTopRated, setFilterTopRated] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(locationState);
  
  const sliderTrackRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(0);

  useEffect(() => {
    loadMarketData();
  }, [circle]);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const data = await getMarketDetails(circle);
      setVendors(data.vendors || []);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading market vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredVendors = useMemo(() => {
    let results = vendors.map(v => {
      let dist = 0;
      if (currentLocation?.lat && currentLocation?.lng && (v.latitude || v.lat) && (v.longitude || v.lng)) {
        dist = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          parseFloat(v.latitude || v.lat),
          parseFloat(v.longitude || v.lng)
        );
      } else {
        // Mock distance if location missing
        dist = (parseInt(String(v.id || 0).replace(/\D/g, '')) % 15) + 0.5;
      }
      return { ...v, distanceValue: dist, distance: `${dist.toFixed(1)} km` };
    });

    // Apply distance filter
    results = results.filter(v => v.distanceValue <= maxDistance);

    // Apply Top Rated filter
    if (filterTopRated) {
      results = results.filter(v => parseFloat(v.rating) >= 4.0);
    }

    // Apply Verified filter
    if (filterVerified) {
      results = results.filter(v => v.is_verified || v.kyc_status === 'Verified' || v.kycStatus === 'Verified');
    }

    // Apply Sorting
    if (sortBy === 'rating') {
      results.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (sortBy === 'distance') {
      results.sort((a, b) => a.distanceValue - b.distanceValue);
    }

    return results;
  }, [vendors, sortBy, maxDistance, filterTopRated, filterVerified, currentLocation]);

  const renderProductItem = ({ item: product }) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => navigation.navigate('VendorDetails', { business: product.vendors || product.vendor })}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        {product.image_url || product.imageUrl ? (
          <Image source={{ uri: product.image_url || product.imageUrl }} style={styles.productImage} />
        ) : (
          <Icon name="shopping-bag" size={20} color="#94A3B8" />
        )}
      </View>
      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
      <View style={styles.productPriceRow}>
        <Text style={styles.productPrice}>₹{product.price}</Text>
        {product.mrp > product.price && (
          <Text style={styles.productMrp}>₹{product.mrp}</Text>
        )}
      </View>
      <Text style={styles.productVendor} numberOfLines={1}>
        {product.vendors?.shop_name?.toUpperCase() || product.vendor?.name?.toUpperCase() || 'LOCAL SHOP'}
      </Text>
    </TouchableOpacity>
  );

  const handleShare = async (vendor) => {
    try {
      await Share.share({
        message: `Check out ${vendor.shop_name || vendor.name} on LOKALL!\nLocation: ${vendor.address}\n\nDownload LOKALL app for best local updates.`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderVendorItem = ({ item }) => {
    const rating = parseFloat(item.rating) || 4.2;
    const isVerified = item.is_verified || item.kyc_status === 'Verified' || item.kycStatus === 'Verified';

    return (
      <TouchableOpacity
        style={styles.vendorCard}
        onPress={() => navigation.navigate('VendorDetails', { business: item })}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.imageUrl || item.image_url || (item.images && item.images[0]) }} 
              style={styles.vendorImage} 
            />
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified Partner</Text>
              </View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.vendorName} numberOfLines={1}>{item.shop_name || item.name}</Text>
              <TouchableOpacity 
                style={styles.callButton} 
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  // Call logic here if needed
                }}
              >
                <Icon name="phone" size={10} color="#ffffff" fill="#ffffff" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.categoryText} numberOfLines={1}>
              {item.category_name || item.category || 'General Store'} • {item.address || item.city || 'Nearby'}
            </Text>

            <View style={styles.ratingRow}>
              <View style={styles.ratingBadgeGreen}>
                <Text style={styles.ratingTextGreen}>{rating.toFixed(1)}</Text>
                <Icon name="star" size={10} color="#16a34a" fill="#16a34a" />
              </View>
              <Text style={styles.reviewCount}>({item.reviewCount || 48} Ratings)</Text>
            </View>

            <View style={styles.footerRow}>
              <View style={styles.distanceContainer}>
                <Icon name="map-pin" size={10} color="#ef4444" />
                <Text style={styles.distanceText}>{item.distance}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={(e) => e.stopPropagation()}>
                  <Icon name="heart" size={16} color="#94A3B8" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    handleShare(item);
                  }}
                >
                  <Icon name="share-2" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'rating', label: 'Rating (High to Low)' },
    { value: 'distance', label: 'Distance (Near to Far)' },
  ];

  const ListHeader = () => (
    <View>
      {/* Filters Section */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterButton, sortBy !== 'default' && styles.filterButtonActive]}
            onPress={() => setShowSortMenu(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterButtonText, sortBy !== 'default' && styles.filterButtonTextActive]}>
              Sort by {sortBy !== 'default' ? `(${sortOptions.find(o => o.value === sortBy)?.label.split(' ')[0]})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButtonBlue}
            onPress={() => {}} // Could add distance range modal if needed
            activeOpacity={0.7}
          >
            <Icon name="map-pin" size={14} color="#FFF" />
            <Text style={styles.filterButtonTextWhite}>Within {maxDistance} km</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filterTopRated && styles.filterButtonActive]}
            onPress={() => setFilterTopRated(!filterTopRated)}
            activeOpacity={0.7}
          >
            <Icon name="star" size={14} color={filterTopRated ? "#FFF" : "#64748B"} />
            <Text style={[styles.filterButtonText, filterTopRated && styles.filterButtonTextActive]}>
              Top Rated
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filterVerified && styles.filterButtonActive]}
            onPress={() => setFilterVerified(!filterVerified)}
            activeOpacity={0.7}
          >
            <Icon name="check-circle" size={14} color={filterVerified ? "#FFF" : "#64748B"} />
            <Text style={[styles.filterButtonText, filterVerified && styles.filterButtonTextActive]}>
              Verified
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Trending Products Section */}
      {products.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🔥 Trending Products</Text>
              <Text style={styles.sectionSubtitle}>Best offers inside {circle}</Text>
            </View>
          </View>
          <FlatList
            horizontal
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingContent}
          />
        </View>
      )}

      {/* Vendors Section Header */}
      <View style={styles.sectionHeader}>
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Text style={styles.sectionTitle}>{circle} Vendors ({filteredVendors.length})</Text>
          <Text style={styles.sectionSubtitle}>Top rated stores in this hub</Text>
        </View>
      </View>

      {/* Sort Modal */}
      <Modal
        visible={showSortMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortMenu(false)}
        >
          <View style={styles.sortMenuContainer}>
            <View style={styles.sortMenuHeader}>
              <Text style={styles.sortMenuTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortMenu(false)}>
                <Icon name="x" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  sortBy === option.value && styles.sortOptionActive
                ]}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortMenu(false);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortBy === option.value && styles.sortOptionTextActive
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Icon name="check" size={18} color="#FF6B00" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerSubtitle}>EXPLORE MARKET</Text>
              <Text style={styles.headerTitle}>{circle.toUpperCase()}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading && vendors.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Connecting to {circle} Market...</Text>
        </View>
      ) : vendors.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="search" size={64} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Market Currently Empty</Text>
          <Text style={styles.emptyText}>We couldn't find any verified vendors in this area yet.</Text>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backHomeText}>Browse Other Markets</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredVendors}
          renderItem={renderVendorItem}
          keyExtractor={item => (item.id || item.vendor_id || Math.random()).toString()}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 60 }}
          onRefresh={loadMarketData}
          refreshing={loading}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  filterButtonBlue: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  filterButtonTextWhite: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  vendorCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  vendorImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    paddingVertical: 4,
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  callButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  categoryText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  ratingBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  ratingTextGreen: {
    fontSize: 11,
    fontWeight: '900',
    color: '#16a34a',
  },
  reviewCount: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortMenuContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  sortMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sortMenuTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sortOptionActive: {
    borderBottomColor: '#FF6B00',
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  sortOptionTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  section: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  trendingContent: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  productCard: {
    width: 160,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 12,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  productImageContainer: {
    width: '100%',
    height: 110,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF6B00',
  },
  productMrp: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  productVendor: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  placeholderImg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '600',
  },
  backHomeBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  backHomeText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  }
});

export default MarketScreen;
