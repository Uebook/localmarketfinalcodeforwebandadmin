import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  Share,
  Alert,
  Linking,
  ToastAndroid,
  Modal,
  Pressable
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import Image from './ImageWithFallback';
import { useThemeColors } from '../hooks/useThemeColors';
import { getIconName } from '../utils/iconMapping';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width;

const ProductDetailsScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const COLORS = useThemeColors();
  const { addToCart, cartItems, updateQuantity } = useCart();
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const { product, business } = route.params || {};
  const [quantity, setQuantity] = useState(1);
  const [showFullImage, setShowFullImage] = useState(false);

  // Parse price and MRP safely
  const currentPrice = parseFloat(product?.price?.toString().replace(/[^0-9.]/g, '')) || 0;
  const comparisonPrice = Math.max(product?.mrp || 0, product?.online_price || 0);
  const savings = comparisonPrice > currentPrice ? comparisonPrice - currentPrice : 0;
  const savingsPercent = savings > 0 ? Math.round((savings / comparisonPrice) * 100) : 0;

  const isInCart = useMemo(() => {
    return cartItems.find(item => item.id === product?.id);
  }, [cartItems, product?.id]);

  useEffect(() => {
    if (isInCart) {
      setQuantity(isInCart.quantity);
    }
  }, [isInCart]);

  const handleShare = async () => {
    try {
      const message = `Check out ${product.name} at ${business?.shop_name || business?.name || 'Local Store'} on LOKALL!\nPrice: ₹${currentPrice}\n\nDownload LOKALL app for best local deals.`;
      await Share.share({
        message,
        title: product.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleWhatsApp = () => {
    const phone = business?.whatsappNumber || business?.contactNumber || business?.phone;
    if (phone) {
      const message = encodeURIComponent(`Hi, I'm interested in "${product.name}" at your shop "${business?.shop_name || business?.name}". Is it available?`);
      Linking.openURL(`whatsapp://send?phone=${phone}&text=${message}`).catch(() => {
        Alert.alert('Error', 'WhatsApp not installed');
      });
    } else {
      Alert.alert('Error', 'Contact number not available');
    }
  };

  const handleAddToCart = () => {
    addToCart(product, business?.id, business?.shop_name || business?.name);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Added to cart', ToastAndroid.SHORT);
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [IMAGE_HEIGHT - 100, IMAGE_HEIGHT - 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  if (!product) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Product not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: COLORS.orange }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Dynamic Header */}
      <Animated.View style={[styles.header, { paddingTop: insets.top, opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
            <Icon name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
          <TouchableOpacity onPress={handleShare} style={styles.headerIconBtn}>
            <Icon name="share-2" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Transparent Back Button (Floating) */}
      <View style={[styles.floatingHeader, { top: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.floatingIconBtn}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.floatingIconBtn}>
          <Icon name="share-2" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Large Hero Image */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => setShowFullImage(true)}
          style={styles.imageContainer}
        >
          <Animated.View style={{ transform: [{ scale: imageScale }] }}>
            <Image
              source={{ uri: product.image_url || product.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </Animated.View>
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.05)']}
            style={StyleSheet.absoluteFill}
          />
          {savingsPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{savingsPercent}% OFF</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Product Information */}
        <View style={styles.contentCard}>
          <View style={styles.mainInfo}>
            <View style={styles.categoryRow}>
              <View style={[styles.typeBadge, product.type === 'service' ? styles.serviceBadge : styles.productBadge]}>
                <Text style={[styles.typeText, product.type === 'service' ? styles.serviceText : styles.productText]}>
                  {product.type?.toUpperCase() || 'PRODUCT'}
                </Text>
              </View>
              <Text style={styles.categoryText}>{product.category_name || business?.category}</Text>
              
              <View style={styles.headerBadges}>
                {(product.is_active !== false && product.status !== 'Inactive') ? (
                  <View style={styles.inStockBadgeSmall}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.inStockTextSmall}>In Stock</Text>
                  </View>
                ) : (
                  <View style={styles.outOfStockBadgeSmall}>
                    <Text style={styles.outOfStockTextSmall}>Out of Stock</Text>
                  </View>
                )}
                
                {(product.is_featured || product.bestSeller) && (
                  <View style={styles.bestSellerBadge}>
                    <Icon name="award" size={10} color="#F59E0B" />
                    <Text style={styles.bestSellerText}>BEST SELLER</Text>
                  </View>
                )}
              </View>
            </View>
            
            <Text style={styles.productName}>{product.name}</Text>
            
            <View style={styles.priceRow}>
              <View style={styles.priceCol}>
                <Text style={styles.currency}>₹</Text>
                <Text style={styles.priceValue}>{currentPrice}</Text>
                {(product.uom || product.unit) && (
                  <Text style={styles.unitText}> / {product.uom || product.unit}</Text>
                )}
              </View>
              {savings > 0 && (
                <View style={styles.mrpContainer}>
                  <Text style={styles.mrpLabel}>MRP</Text>
                  <Text style={styles.mrpValue}>₹{comparisonPrice}</Text>
                  <Text style={styles.savingsText}>Save ₹{savings}</Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Vendor Info Section */}
            <TouchableOpacity 
              style={styles.vendorCard}
              onPress={() => navigation.navigate('VendorDetails', { business })}
            >
              <View style={styles.vendorAvatar}>
                <Text style={styles.vendorInitial}>{(business?.shop_name || business?.name || 'L')?.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.vendorInfo}>
                <View style={styles.vendorNameRow}>
                  <Text style={styles.vendorName}>{business?.shop_name || business?.name || 'Local Store'}</Text>
                  {business?.is_verified && (
                    <Icon name="check-circle" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
                  )}
                </View>
                <Text style={styles.vendorLocation} numberOfLines={1}>
                  <Icon name="map-pin" size={12} color="#64748B" /> {business?.address || 'Near you'}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Product Specifications (Matches the Form) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Specifications</Text>
              <View style={styles.specGrid}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Category</Text>
                  <Text style={styles.specValue}>{product.category_name || business?.category || 'General'}</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Unit</Text>
                  <Text style={styles.specValue}>{product.uom || product.unit || 'Piece'}</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Listing Type</Text>
                  <Text style={styles.specValue}>{product.type === 'service' ? 'Service' : 'Product'}</Text>
                </View>
                {(product.is_featured || product.bestSeller) && (
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Status</Text>
                    <Text style={[styles.specValue, { color: '#D97706', fontWeight: '700' }]}>Best Seller</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>
                {product.description || 'No description available for this product.'}
              </Text>
            </View>

          </View>
        </View>

        {/* Similar Items Placeholder or Suggestions */}
        <View style={styles.extraSpace} />
      </Animated.ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        <View style={styles.footerInner}>
          {isInCart ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.qtyBtn}
                onPress={() => updateQuantity(product.id, quantity - 1)}
              >
                <Icon name="minus" size={18} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.qtyBtn}
                onPress={() => updateQuantity(product.id, quantity + 1)}
              >
                <Icon name="plus" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addCartBtn}
              onPress={handleAddToCart}
            >
              <Icon name="shopping-bag" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.addCartText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Full Screen Image Modal */}
      <Modal
        visible={showFullImage}
        transparent={true}
        onRequestClose={() => setShowFullImage(false)}
        animationType="fade"
      >
        <Pressable 
          style={styles.fullScreenModal}
          onPress={() => setShowFullImage(false)}
        >
          <View style={[styles.modalCloseBtn, { top: insets.top + 10 }]}>
            <Icon name="x" size={30} color="#FFF" />
          </View>
          <Image
            source={{ uri: product.image_url || product.imageUrl }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginHorizontal: 12,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 90,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  floatingIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    width: width,
    height: IMAGE_HEIGHT,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  heroImage: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  discountBadge: {
    position: 'absolute',
    top: 60,
    left: 0,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  discountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  contentCard: {
    marginTop: -24,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  mainInfo: {
    marginBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productBadge: {
    backgroundColor: '#F0FDF4',
  },
  serviceBadge: {
    backgroundColor: '#F0F9FF',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  productText: {
    color: '#15803D',
  },
  serviceText: {
    color: '#0369A1',
  },
  categoryText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  productName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  inStockBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  outOfStockBadgeSmall: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inStockTextSmall: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  outOfStockTextSmall: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B91C1C',
  },
  unitText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 2,
    marginBottom: 6,
    alignSelf: 'flex-end',
  },
  bestSellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    gap: 4,
  },
  bestSellerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  mrpContainer: {
    justifyContent: 'center',
  },
  mrpLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  mrpValue: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  savingsText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
  },
  vendorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorInitial: {
    fontSize: 20,
    fontWeight: '900',
    color: '#64748B',
  },
  vendorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  vendorLocation: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '400',
  },
  specGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  specLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  specValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  whatsappBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  addCartBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCartText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  quantityContainer: {
    flex: 1,
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  buyNowBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#F97316',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  backBtn: {
    padding: 10,
  },
  extraSpace: {
    height: 50,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: width * 1.5,
  },
  modalCloseBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    padding: 10,
  }
});

export default ProductDetailsScreen;
