import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator,  StatusBar, ScrollView } from 'react-native';
import Image from './ImageWithFallback';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getMarketDetails } from '../services/api';
import { useThemeColors } from '../hooks/useThemeColors';

const MarketScreen = ({ navigation, route }) => {
  const { circle } = route.params;
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
  }, [circle]);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      // The dedicated /api/market endpoint handles fuzzy matching and returns both vendors + products
      const data = await getMarketDetails(circle);
      setVendors(data.vendors || []);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading market vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderVendor = ({ item }) => {
    const rating = parseFloat(item.rating) || 4.2;
    const isVerified = item.is_verified || item.kyc_status === 'Verified' || item.kycStatus === 'Verified';

    return (
      <TouchableOpacity
        style={styles.vendorCard}
        onPress={() => navigation.navigate('VendorDetails', { business: item })}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: item.imageUrl || item.image_url }}
          style={styles.vendorImage}
        />
        <View style={styles.vendorInfo}>
          <View style={styles.vendorHeader}>
            <Text style={styles.vendorName} numberOfLines={1}>{item.shop_name || item.name}</Text>
            {isVerified && (
              <Icon name="check-circle" size={14} color="#10B981" style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.vendorCategory} numberOfLines={1}>{item.category_name || item.category || 'General Store'}</Text>

          <View style={styles.vendorFooter}>
            <View style={styles.ratingRow}>
              <Icon name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
            <View style={styles.distanceRow}>
              <Icon name="map-pin" size={12} color="#94A3B8" />
              <Text style={styles.distanceText}>Market Hub</Text>
            </View>
          </View>
        </View>
        <View style={styles.arrowButton}>
          <Icon name="chevron-right" size={20} color="#0F172A" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderProductItem = (product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => navigation.navigate('VendorDetails', { business: product.vendors || product.vendor })}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.productImage} />
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
        {product.vendors?.shop_name?.toUpperCase() || 'LOCAL SHOP'}
      </Text>
    </TouchableOpacity>
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
              <Text style={styles.headerTitle}>{circle.toUpperCase()}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* Stats Bar */}
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: '#FF6B00' }]}>
              <Icon name="shopping-bag" size={16} color="#FFF" />
              <Text style={styles.statValue}>{vendors.length}</Text>
              <Text style={styles.statLabel}>VENDORS</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#0F172A' }]}>
              <Icon name="package" size={16} color="#FFF" />
              <Text style={styles.statValue}>{products.length}</Text>
              <Text style={styles.statLabel}>TRENDING PRODUCTS</Text>
            </View>
            <View style={styles.statBoxWhite}>
              <Icon name="info" size={16} color="#FF6B00" />
              <Text style={styles.statValueTitle}>Top Deals</Text>
              <Text style={styles.statLabelMuted}>Lower Prices</Text>
            </View>
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingContent}
              >
                {products.map(renderProductItem)}
              </ScrollView>
            </View>
          )}

          {/* Vendors Listing */}
          <View style={[styles.section, { marginBottom: 40 }]}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>🏪 Popular Shops</Text>
                <Text style={styles.sectionSubtitle}>Top rated stores in this hub</Text>
              </View>
            </View>
            <View style={styles.vendorList}>
              {vendors.map((vendor) => (
                <View key={vendor.id}>
                  {renderVendor({ item: vendor })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
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
    paddingBottom: 32,
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
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statBoxWhite: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 4,
  },
  statValueTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  statLabelMuted: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  trendingContent: {
    gap: 12,
    paddingRight: 16,
  },
  productCard: {
    width: 130,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  productMrp: {
    fontSize: 9,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '700',
  },
  productVendor: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FF6B00',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 4,
  },
  vendorList: {
    gap: 12,
  },
  vendorCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  vendorImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  vendorInfo: {
    flex: 1,
    marginLeft: 14,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  vendorCategory: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
  },
  vendorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  arrowButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  backHomeBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderRadius: 12,
  },
  backHomeText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default MarketScreen;
