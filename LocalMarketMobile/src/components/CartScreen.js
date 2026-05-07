import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
import { useCart } from '../context/CartContext';
import { getVendorProfile } from '../services/api';
import LinearGradient from 'react-native-linear-gradient';

const CartScreen = ({ navigation }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [vendorDetails, setVendorDetails] = useState({});
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Fetch vendor details for all unique vendors in cart
  useEffect(() => {
    if (cartItems.length === 0) return;

    const uniqueVendorIds = Array.from(new Set(cartItems.map(item => item.vendorId)));
    const missingIds = uniqueVendorIds.filter(id => id && !vendorDetails[id]);

    if (missingIds.length === 0) return;

    const fetchVendors = async () => {
      setLoadingVendors(true);
      const details = { ...vendorDetails };
      
      await Promise.all(missingIds.map(async (id) => {
        try {
          const profile = await getVendorProfile(id);
          if (profile) {
            details[id] = profile;
          }
        } catch (err) {
          console.error(`Failed to fetch vendor ${id}:`, err);
        }
      }));
      
      setVendorDetails(details);
      setLoadingVendors(false);
    };

    fetchVendors();
  }, [cartItems]);

  const groupedItems = useMemo(() => {
    const groups = {};
    cartItems.forEach(item => {
      const vId = item.vendorId || 'unknown';
      if (!groups[vId]) {
        groups[vId] = {
          vendorId: vId,
          vendorName: item.vendorName || 'Local Vendor',
          items: []
        };
      }
      groups[vId].items.push(item);
    });
    return Object.values(groups);
  }, [cartItems]);

  const handleUpdateQuantity = async (id, delta) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    
    const newQty = item.quantity + delta;
    await updateQuantity(id, newQty);
  };

  const handleRemoveItem = (id) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            await removeFromCart(id);
          }
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Basket',
      'Remove all items from your basket?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            await clearCart();
          }
        },
      ]
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handleWhatsApp = (vendor) => {
    let phone = vendor?.whatsapp_number || vendor?.phone || vendor?.contact_number;
    if (!phone) {
      Alert.alert('Not Available', 'WhatsApp number not provided by vendor');
      return;
    }
    let cleanPhone = phone.toString().replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    
    const url = `whatsapp://send?phone=${cleanPhone}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed on your device');
    });
  };

  const handleCall = (vendor) => {
    const phone = vendor?.phone || vendor?.contact_number;
    if (!phone) {
      Alert.alert('Not Available', 'Phone number not provided by vendor');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (vendor) => {
    const name = vendor?.business_name || vendor?.name;
    const address = vendor?.address || '';
    const city = vendor?.city || '';
    const query = encodeURIComponent(`${name} ${address} ${city}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    Linking.openURL(url);
  };

  if (loadingVendors && cartItems.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={22} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Your Basket</Text>
            <Text style={styles.headerSubtitle}>Direct Vendor Connect</Text>
          </View>
          {cartItems.length > 0 ? (
            <TouchableOpacity onPress={handleClearCart}>
              <Text style={styles.clearAllText}>Clear</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
        </View>
      </SafeAreaView>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon name="shopping-bag" size={48} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyTitle}>Your basket is empty</Text>
          <Text style={styles.emptySubtitle}>Start adding items from your local vendors to build your basket!</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          >
            <LinearGradient
              colors={['#0F172A', '#1E293B']}
              style={styles.gradientButton}
            >
              <Text style={styles.browseButtonText}>GO SHOPPING</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            {groupedItems.map((group) => {
              const vendor = vendorDetails[group.vendorId];
              return (
                <View key={group.vendorId} style={styles.vendorGroup}>
                  {/* Vendor Header */}
                  <View style={styles.vendorHeader}>
                    <View style={styles.vendorInfo}>
                      <View style={styles.vendorIconBox}>
                        {(vendor?.image_url || vendor?.imageUrl || vendor?.image) ? (
                          <Image 
                            source={{ uri: vendor.image_url || vendor.imageUrl || vendor.image }} 
                            style={styles.vendorThumb} 
                          />
                        ) : (
                          <Icon name="shopping-bag" size={18} color="#FF6B00" />
                        )}
                      </View>
                      <View>
                        <Text style={styles.vendorNameText}>{group.vendorName}</Text>
                        <Text style={styles.vendorCityText}>{vendor?.city || vendor?.address || 'Local Shop'}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('VendorDetails', { vendorId: group.vendorId })}>
                      <Text style={styles.viewStoreText}>Store →</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Items list */}
                  <View style={styles.itemsList}>
                    {group.items.map((item) => (
                      <View key={item.id} style={styles.cartItem}>
                        {item.image ? (
                          <Image source={{ uri: item.image }} style={styles.itemImage} />
                        ) : (
                          <View style={[styles.itemImage, { backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' }]}>
                            <Icon name="image" size={24} color="#E2E8F0" />
                          </View>
                        )}
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                          <View style={styles.itemPriceRow}>
                            <Text style={styles.unitPrice}>₹{item.price} × {item.quantity}</Text>
                            <Text style={styles.totalPrice}>₹{item.price * item.quantity}</Text>
                          </View>
                        </View>
                        <View style={styles.rightActions}>
                          <View style={styles.quantityControls}>
                            <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, -1)} style={styles.qtyBtn}>
                              <Icon name="minus" size={12} color="#64748B" />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{item.quantity}</Text>
                            <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, 1)} style={styles.qtyBtn}>
                              <Icon name="plus" size={12} color="#64748B" />
                            </TouchableOpacity>
                          </View>
                          <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                            <Text style={styles.removeText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Vendor Direct Actions */}
                  <View style={styles.vendorActions}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.waBtn]}
                      onPress={() => handleWhatsApp(vendor)}
                    >
                      <Icon name="message-circle" size={14} color="#FFF" />
                      <Text style={styles.actionBtnText}>WHATSAPP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.callBtn]}
                      onPress={() => handleCall(vendor)}
                    >
                      <Icon name="phone" size={14} color="#FFF" />
                      <Text style={styles.actionBtnText}>CALL NOW</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.directionBtn}
                      onPress={() => handleDirections(vendor)}
                    >
                      <Icon name="map-pin" size={14} color="#475569" />
                      <Text style={styles.directionBtnText}>GET DIRECTION</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Price Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Basket Breakdown</Text>
                <View style={styles.itemCountBadge}>
                   <Text style={styles.itemCountText}>{cartItems.length} ITEMS</Text>
                </View>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValueText}>₹{calculateTotal()}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Platform Fee</Text>
                <Text style={styles.freeText}>FREE</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery/Pickup</Text>
                <Text style={styles.savingsLabel}>LOCAL PRICE</Text>
              </View>

              <View style={styles.divider} />
              
              <View style={styles.totalRow}>
                <View>
                   <Text style={styles.totalLabel}>Grand Total</Text>
                   <Text style={styles.taxNote}>Inclusive of all taxes</Text>
                </View>
                <Text style={styles.totalValueText}>₹{calculateTotal()}</Text>
              </View>

              <View style={styles.infoBox}>
                <Icon name="shield-check" size={18} color="#16A34A" />
                <Text style={styles.infoText}>
                  Pay directly to vendors at the shop. LOKALL helps you build your basket for a faster local shopping experience.
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.addMoreBtn}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
              >
                <Text style={styles.addMoreText}>CONTINUE SHOPPING</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom Sticky Bar */}
          <View style={styles.footerBar}>
            <View>
              <Text style={styles.footerLabel}>Total Value</Text>
              <Text style={styles.footerTotal}>₹{calculateTotal()}</Text>
            </View>
            <TouchableOpacity 
              style={styles.contactVendorsBtn}
              onPress={() => Alert.alert('Connect with Vendor', 'Click the Call or WhatsApp buttons above to talk to individual shop owners.')}
            >
              <Text style={styles.contactVendorsText}>PROCEED</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 1,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
    textTransform: 'uppercase',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  vendorGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  vendorThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  vendorNameText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  vendorCityText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  viewStoreText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF6B00',
    textTransform: 'uppercase',
  },
  itemsList: {
    paddingVertical: 4,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  unitPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF6B00',
  },
  rightActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    minWidth: 18,
    textAlign: 'center',
  },
  removeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vendorActions: {
    padding: 16,
    backgroundColor: '#FCFDFF',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    gap: 6,
  },
  waBtn: {
    backgroundColor: '#22C55E',
  },
  callBtn: {
    backgroundColor: '#0F172A',
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  directionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF',
  },
  directionBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 40,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  itemCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  freeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#16A34A',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  summaryValueText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  savingsLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#16A34A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  taxNote: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  totalValueText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  infoBox: {
    backgroundColor: '#FFF7ED',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#9A3412',
    lineHeight: 16,
  },
  addMoreBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  browseButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 10,
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerTotal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  contactVendorsBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactVendorsText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
});

export default CartScreen;
