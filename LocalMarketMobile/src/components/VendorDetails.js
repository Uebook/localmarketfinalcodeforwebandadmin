import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Linking, Alert, ActivityIndicator, ImageBackground,
  Dimensions, StatusBar, Platform, TextInput, Share, Modal, Pressable, Animated, ToastAndroid
} from 'react-native';
import Image from './ImageWithFallback';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
import { getVendorProducts, getVendorReviews, getVendorProfile, submitReview } from '../services/api';
import { isVendorSaved, removeSavedVendor, saveVendor } from '../utils/savedVendors';
import { useCart } from '../context/CartContext';
import MapView from './MapView';
import EnquiryModal from './EnquiryModal';
import WriteReview from './WriteReview';
import Logo from './Logo';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height / 2.8;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const HEADER_SCROLL_DISTANCE = HERO_HEIGHT - HEADER_MIN_HEIGHT;

const VendorDetails = ({ navigation, route }) => {
  const COLORS = useThemeColors();
  const { addToCart, cartItems, updateQuantity } = useCart();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const styles = createStyles(COLORS, scrollY);

  const business = route.params?.business || route.params?.vendor || {};
  const targetVendorId = business?.id || business?.vendor_id || business?.vendorId || business?.vendorId || business?.vendor_id || business?.v_id;

  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorInfo, setVendorInfo] = useState(business);
  const [productSearch, setProductSearch] = useState('');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (targetVendorId) {
      loadData(targetVendorId);
      checkSaveStatus(targetVendorId);
    }
  }, [targetVendorId]);

  const loadData = async (vid) => {
    try {
      setLoading(true);

      // Fetch full profile first (most robust data)
      const profileResponse = await getVendorProfile(vid);

      if (profileResponse && profileResponse.vendor) {
        console.log('Syncing full vendor profile for:', profileResponse.vendor.shop_name);
        setVendorInfo(profileResponse.vendor);
        setAllProducts(profileResponse.products || []);
        setReviews(profileResponse.reviews || []);
      } else {
        // Fallback to separate calls if full profile fails
        console.log('Full profile not found, falling back to separate calls');
        const [prodData, revData] = await Promise.all([
          getVendorProducts(vid),
          getVendorReviews(vid)
        ]);
        setAllProducts(prodData?.products || []);
        setReviews(revData?.reviews || []);
      }
    } catch (error) {
      console.error('Error loading vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle highlighted product from navigation
  useEffect(() => {
    const highlightId = route.params?.highlightProductId;
    if (highlightId && allProducts.length > 0) {
      const item = allProducts.find(p => p.id === highlightId);
      if (item) {
        const isService = item.type === 'service' || (item.name && item.name.toLowerCase().includes('service'));
        setActiveTab(isService ? 'services' : 'products');
      }
    }
  }, [route.params?.highlightProductId, allProducts]);

  const averageRating = useMemo(() => {
    // If we have real reviews, prioritize their average
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0);
      return (sum / reviews.length).toFixed(1);
    }
    // Fallback to vendor's stored rating
    return parseFloat(vendorInfo.rating || 0).toFixed(1);
  }, [reviews, vendorInfo.rating]);

  const checkSaveStatus = async (vid) => {
    const saved = await isVendorSaved(vid);
    setIsSaved(saved);
  };

  const handleSave = async () => {
    const vid = vendorInfo.id || business.id;
    if (isSaved) {
      await removeSavedVendor(vid);
      setIsSaved(false);
    } else {
      await saveVendor(vendorInfo);
      setIsSaved(true);
    }
  };

  const handleCall = () => {
    const phone = vendorInfo.contactNumber || vendorInfo.contact_number || vendorInfo.phone || vendorInfo.shop_phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Contact Unavailable', 'This vendor has not provided a contact number.');
    }
  };

  const handleWhatsApp = () => {
    const phone = vendorInfo.whatsappNumber || vendorInfo.whatsapp_number || vendorInfo.contactNumber || vendorInfo.contact_number || vendorInfo.phone;
    if (phone) {
      // Ensure phone format is clean (no spaces or plus for simplicity, or handle correctly)
      const cleanPhone = phone.replace(/[^\d]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}`;

      Linking.canOpenURL(waUrl).then(supported => {
        if (supported) {
          Linking.openURL(waUrl);
        } else {
          // Fallback to web link if app not installed or can't open custom scheme
          Linking.openURL(`https://api.whatsapp.com/send?phone=${cleanPhone}`);
        }
      });
    } else {
      Alert.alert('WhatsApp Unavailable', 'This vendor has not provided a WhatsApp number.');
    }
  };

  const handleShare = async () => {
    try {
      const message = `Check out ${vendorInfo.name || vendorInfo.shop_name} on LOKALL!\nLocation: ${vendorInfo.address || vendorInfo.city || 'Nearby'}\n\nDownload LOKALL app for best local deals.`;
      await Share.share({
        message,
        title: vendorInfo.name || vendorInfo.shop_name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await submitReview(reviewData);
      Alert.alert('Success', 'Your review has been submitted successfully.');
      // Refresh vendor data to show the new review
      loadData(targetVendorId);
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error; // Will be caught by WriteReview Modal's internal catch
    }
  };

  const products = useMemo(() => allProducts.filter(p => p.type !== 'service' && !(p.name && p.name?.toLowerCase().includes('service'))), [allProducts]);
  const services = useMemo(() => allProducts.filter(p => p.type === 'service' || (p.name && p.name?.toLowerCase().includes('service'))), [allProducts]);

  const filteredItems = useMemo(() => {
    const source = activeTab === 'services' ? services : (activeTab === 'products' ? products : allProducts);
    if (!productSearch) return source;
    return source.filter(p => p.name?.toLowerCase().includes(productSearch.toLowerCase()));
  }, [allProducts, products, services, productSearch, activeTab]);

  const tabs = useMemo(() => {
    const base = [{ id: 'overview', label: 'Overview' }];
    
    if (products.length > 0 || services.length === 0) {
      base.push({ id: 'products', label: `Products (${products.length})` });
    }
    
    if (services.length > 0) {
      base.push({ id: 'services', label: `Services (${services.length})` });
    }
    
    base.push({ id: 'reviews', label: `Reviews (${reviews.length})` });
    base.push({ id: 'info', label: 'Contact' });
    
    return base;
  }, [products.length, services.length, reviews.length]);

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* 4-Button Action Grid */}
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.gridActionItem} onPress={handleCall}>
          <View style={[styles.gridActionIcon, { backgroundColor: '#EFF6FF' }]}>
            <Icon name="phone" size={24} color="#2563EB" />
          </View>
          <Text style={styles.gridActionLabel}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridActionItem} onPress={handleWhatsApp}>
          <View style={[styles.gridActionIcon, { backgroundColor: '#F0FDF4' }]}>
            <Icon name="message-circle" size={24} color="#16A34A" />
          </View>
          <Text style={styles.gridActionLabel}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridActionItem} onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendorInfo.address)}`)}>
          <View style={[styles.gridActionIcon, { backgroundColor: '#EEF2FF' }]}>
            <Icon name="navigation" size={24} color="#4F46E5" />
          </View>
          <Text style={styles.gridActionLabel}>Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridActionItem} onPress={() => setShowEnquiryModal(true)}>
          <View style={[styles.gridActionIcon, { backgroundColor: '#FFF7ED' }]}>
            <Icon name="mail" size={24} color={COLORS.orange} />
          </View>
          <Text style={styles.gridActionLabel}>Enquiry</Text>
        </TouchableOpacity>
      </View>

      {/* Location & Map Section */}
      <View style={styles.locationSection}>
        <View style={styles.locationTextContainer}>
          <View style={styles.locationMainRow}>
            <Icon name="map-pin" size={18} color="#1E293B" />
            <Text style={styles.locationAddressText} numberOfLines={2}>
              {vendorInfo.address || 'Location information not available'}
            </Text>
          </View>
          <View style={styles.distanceRow}>
            <Icon name="map" size={12} color="#94A3B8" />
            <Text style={styles.distanceText}>0.6 km</Text>
          </View>
        </View>
        <View style={styles.mapPreviewMini}>
          <Image
            source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=30.7333,76.7794&zoom=14&size=400x400&markers=color:red%7C30.7333,76.7794&key=YOUR_API_KEY' }}
            style={styles.mapImageMini}
          />
          <View style={styles.mapMarkerOverlay}>
            <Icon name="map-pin" size={24} color="#EF4444" fill="#EF4444" />
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Store</Text>
        <Text style={styles.aboutText} numberOfLines={3}>
          {vendorInfo.about || `${vendorInfo.name || 'This store'} is a trusted name in ${vendorInfo.category || 'local market'}. We provide 100% genuine products with best after-sales service.`}
        </Text>
        <TouchableOpacity>
          <Text style={styles.moreLink}>More</Text>
        </TouchableOpacity>
      </View>

      {/* Top Deals & Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Top Deals & Products</Text>
          <TouchableOpacity onPress={() => setActiveTab('products')}>
            <Text style={styles.viewAllLink}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dealsScroll}>
          {allProducts.slice(0, 5).map((item) => (
            <TouchableOpacity key={item.id} style={styles.dealCard}>
              <Image source={{ uri: item.image_url || item.imageUrl }} style={styles.dealImage} />
              <View style={styles.dealInfo}>
                <Text style={styles.dealName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.dealPrice}>₹{item.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'products':
      case 'services':
        return (
          <View style={styles.tabContainer}>
            <View style={styles.innerSearchContainer}>
              <Icon name="search" size={20} color="#94A3B8" />
              <TextInput
                style={styles.innerSearchInput}
                placeholder={`Search in ${vendorInfo.shop_name || vendorInfo.name}...`}
                value={productSearch}
                onChangeText={setProductSearch}
                placeholderTextColor="#94A3B8"
                clearButtonMode="while-editing"
              />
            </View>

            <View style={styles.productGrid}>
              {filteredItems.length > 0 ? filteredItems.map((item) => {
                const comparisonPrice = Math.max(item.online_price || 0, item.mrp || 0);
                const savings = comparisonPrice > item.price ? comparisonPrice - item.price : 0;
                const savingsPercent = savings > 0 ? Math.round((savings / comparisonPrice) * 100) : 0;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.productGridCard,
                      route.params?.highlightProductId === item.id && { borderColor: COLORS.orange, borderWidth: 2, backgroundColor: '#FFF7ED' }
                    ]}
                    onPress={() => {
                      setSelectedProduct(item);
                      setShowEnquiryModal(true);
                    }}
                    activeOpacity={0.9}
                  >
                    <View style={styles.productImageContainer}>
                      <Image
                        source={{ uri: item.image_url || item.imageUrl }}
                        style={styles.gridProductImage}
                      />
                      {savingsPercent > 0 && (
                        <View style={styles.gridDiscountBadge}>
                          <Text style={styles.gridDiscountText}>{savingsPercent}% OFF</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.gridProductInfo}>
                      <Text style={styles.gridProductName} numberOfLines={2}>{item.name}</Text>
                      <View style={styles.typeBadgeRow}>
                        {item.type === 'service' || (item.name && item.name.toLowerCase().includes('service')) ? (
                          <View style={[styles.typeBadge, { backgroundColor: '#F0F9FF' }]}>
                            <Text style={[styles.typeBadgeText, { color: '#0369A1' }]}>SERVICE</Text>
                          </View>
                        ) : (
                          <View style={[styles.typeBadge, { backgroundColor: '#F0FDF4' }]}>
                            <Text style={[styles.typeBadgeText, { color: '#15803D' }]}>PRODUCT</Text>
                          </View>
                        )}
                        <Text style={styles.gridProductCategory}>{item.category_name || vendorInfo.category}</Text>
                      </View>

                      <View style={styles.gridPriceRow}>
                        <View style={styles.priceColumn}>
                          <Text style={styles.gridPriceValue}>₹{item.price}</Text>
                          {savings > 0 && (
                            <Text style={styles.gridMrpPrice}>₹{comparisonPrice}</Text>
                          )}
                        </View>
                        
                        {(() => {
                          const cartItem = cartItems.find(ci => ci.id === item.id);
                          if (cartItem) {
                            return (
                              <View style={styles.qtySelectorGrid}>
                                <TouchableOpacity 
                                  style={styles.qtyBtnGrid}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, cartItem.quantity - 1);
                                  }}
                                >
                                  <Icon name="minus" size={12} color="#0F172A" />
                                </TouchableOpacity>
                                <Text style={styles.gridQtyText}>{cartItem.quantity}</Text>
                                <TouchableOpacity 
                                  style={styles.qtyBtnGrid}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, cartItem.quantity + 1);
                                  }}
                                >
                                  <Icon name="plus" size={12} color="#0F172A" />
                                </TouchableOpacity>
                              </View>
                            );
                          }
                          return (
                            <TouchableOpacity
                              style={styles.gridAddBtn}
                              onPress={(e) => {
                                e.stopPropagation();
                                addToCart(item, targetVendorId, vendorInfo.shop_name || vendorInfo.name);
                                if (Platform.OS === 'android') {
                                  ToastAndroid.show('Added to cart', ToastAndroid.SHORT);
                                }
                              }}
                            >
                              <Text style={styles.gridAddBtnText}>Add</Text>
                              <Icon name="plus" size={14} color="#FFF" />
                            </TouchableOpacity>
                          );
                        })()}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }) : (
                <View style={styles.emptySearchContainer}>
                  <Icon name="search" size={64} color="#CBD5E1" />
                  <Text style={styles.emptyTitle}>No products found</Text>
                  <Text style={styles.emptyText}>Try searching for something else in this store.</Text>
                </View>
              )}
            </View>
          </View>
        );
      case 'reviews':
        return (
          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setShowWriteReview(true)}>
              <Text style={styles.writeReviewText}>Write a Review</Text>
            </TouchableOpacity>

            {reviews.length > 0 ? reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.avatar}>
                    <Text style={{ color: '#FFF', fontWeight: '900' }}>{rev.user_name?.charAt(0).toUpperCase() || 'U'}</Text>
                  </View>
                  <View>
                    <Text style={styles.reviewerName}>{rev.user_name || 'Anonymous'}</Text>
                    <View style={styles.starRowSmall}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon key={star} name="star" size={12} color={star <= rev.rating ? "#F59E0B" : "#E2E8F0"} fill={star <= rev.rating ? "#F59E0B" : "transparent"} />
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={styles.commentText}>{rev.comment}</Text>
                {rev.vendor_reply && (
                  <View style={styles.vendorReply}>
                    <Text style={styles.replyLabel}>Store Reply</Text>
                    <Text style={styles.replyText}>{rev.vendor_reply}</Text>
                  </View>
                )}
              </View>
            )) : (
              <View style={styles.emptyState}>
                <Text>No reviews yet. Be the first to review!</Text>
              </View>
            )}
          </View>
        );
      case 'info':
        return (
          <View style={styles.tabContainer}>
            <View style={styles.contactList}>
              <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                <Icon name="phone" size={20} color={COLORS.orange} />
                <View style={styles.contactTextWrapper}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{vendorInfo.phone || 'Not available'}</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#CBD5E1" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp}>
                <Icon name="message-circle" size={20} color="#22C55E" />
                <View style={styles.contactTextWrapper}>
                  <Text style={styles.infoLabel}>WhatsApp</Text>
                  <Text style={styles.infoValue}>Chat with us</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#CBD5E1" />
              </TouchableOpacity>

              <View style={styles.contactItem}>
                <Icon name="mail" size={20} color="#3B82F6" />
                <View style={styles.contactTextWrapper}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>{vendorInfo.email || 'Not available'}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Sticky Compact Header for Scroll */}
      <Animated.View style={styles.stickyHeader}>
        <SafeAreaView edges={['top']} style={styles.stickyHeaderContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.stickyBackBtn}>
            <Icon name="arrow-left" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Animated.Text style={styles.stickyTitle} numberOfLines={1}>
            {vendorInfo.name || vendorInfo.shop_name}
          </Animated.Text>
          <View style={styles.stickyActions}>
            <TouchableOpacity onPress={handleSave}>
              <Icon name="heart" size={20} color={isSaved ? "#EF4444" : "#0F172A"} fill={isSaved ? "#EF4444" : "transparent"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
              <Icon name="share-2" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.heroSection}>
          <Animated.View style={styles.parallaxWrapper}>
            {(vendorInfo.image_url || vendorInfo.imageUrl) ? (
              <Animated.Image
                source={{ uri: vendorInfo.image_url || vendorInfo.imageUrl }}
                style={styles.heroImage}
              />
            ) : (
              <View style={styles.logoPlaceholderCenter}>
                <Logo size={120} transparent={true} />
              </View>
            )}
          </Animated.View>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.heroGradient}
          >
            <Animated.View style={styles.topActions}>
              <SafeAreaView edges={['top']} style={styles.topActionsContent}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircleWhite} activeOpacity={0.7}>
                  <Icon name="arrow-left" size={22} color="#0F172A" />
                </TouchableOpacity>
                <View style={styles.topRightActions}>
                  <TouchableOpacity onPress={handleShare} style={styles.iconCircleWhite} activeOpacity={0.7}>
                    <Icon name="share" size={20} color="#0F172A" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSave} style={styles.iconCircleWhite} activeOpacity={0.7}>
                    <Icon name="heart" size={20} color={isSaved ? "#EF4444" : "#0F172A"} fill={isSaved ? "#EF4444" : "transparent"} />
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Animated.View>


          </LinearGradient>
        </View>

        {/* Content Card (Overlaps Hero) */}
        <View style={styles.contentCard}>
          <View style={styles.vendorHeaderMain}>
            <View style={styles.logoCircleLarge}>
              {(vendorInfo.image_url || vendorInfo.imageUrl) ? (
                <Image
                  source={{ uri: vendorInfo.image_url || vendorInfo.imageUrl }}
                  style={styles.logoImageLarge}
                />
              ) : (
                <Text style={styles.logoLetterLarge}>
                  {(vendorInfo.shop_name || vendorInfo.name || 'L').charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            <View style={styles.headerTitles}>
              <Text style={styles.businessTitleMain}>{vendorInfo.name || vendorInfo.shop_name}</Text>
              <View style={styles.ratingStatusRow}>
                <Text style={styles.ratingTextMain}>
                  {averageRating} <Icon name="star" size={14} color="#10B981" fill="#10B981" />
                </Text>
                <Text style={styles.reviewCountMain}> ({reviews.length} reviews)</Text>
              </View>
              <Text style={styles.statusTextMain}>
                Open <Text style={{ color: '#94A3B8', fontWeight: '500' }}>• Closes at 9:00 PM</Text>
              </Text>
            </View>
          </View>

          {/* Tab Selection Bar - Sticky */}
          <View style={styles.tabsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={[styles.tabItem, activeTab === tab.id && styles.activeTabItem]}
                >
                  <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
                    {tab.label}
                  </Text>
                  {activeTab === tab.id && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tab Content Area */}
          <View style={styles.contentBody}>
            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.orange} />
              </View>
            ) : (
              renderTabContent()
            )}
          </View>
          <View style={{ height: 20 }} />
        </View>
      </Animated.ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bottomBtn, styles.callBtn]}
          onPress={handleCall}
        >
          <Icon name="phone" size={18} color="#FFF" />
          <Text style={styles.bottomBtnText}>Call Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBtn, styles.enquiryBtn]}
          onPress={() => setShowEnquiryModal(true)}
        >
          <Text style={[styles.bottomBtnText, { color: '#0F172A' }]}>Enquiry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBtn, styles.whatsappBtn]}
          onPress={handleWhatsApp}
        >
          <Icon name="message-circle" size={18} color="#FFF" />
          <Text style={styles.bottomBtnText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <EnquiryModal
        isOpen={showEnquiryModal}
        onClose={() => {
          setShowEnquiryModal(false);
          setSelectedProduct(null);
        }}
        businessName={vendorInfo.shop_name || vendorInfo.name}
        vendorId={targetVendorId}
        productName={selectedProduct?.name}
      />
      <WriteReview
        visible={showWriteReview}
        onClose={() => setShowWriteReview(false)}
        onSubmit={handleReviewSubmit}
        vendorName={vendorInfo.shop_name || vendorInfo.name}
        vendorId={targetVendorId}
      />

      {/* Product Image Enlarger Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
        animationType="fade"
      >
        <Pressable
          style={styles.fullScreenModal}
          onPress={() => setSelectedImage(null)}
        >
          <View style={styles.modalCloseBtn}>
            <Icon name="x" size={30} color="#FFF" />
          </View>
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </View>
  );
};

const createStyles = (COLORS, scrollY) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT + (Platform.OS === 'ios' ? 20 : 0),
    backgroundColor: '#FFF',
    zIndex: 100,
    opacity: scrollY.interpolate({
      inputRange: [HEADER_SCROLL_DISTANCE - 20, HEADER_SCROLL_DISTANCE],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    transform: [{
      translateY: scrollY.interpolate({
        inputRange: [HEADER_SCROLL_DISTANCE - 20, HEADER_SCROLL_DISTANCE],
        outputRange: [-20, 0],
        extrapolate: 'clamp',
      })
    }],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  stickyHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 15,
  },
  stickyBackBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  stickyActions: {
    flexDirection: 'row',
    gap: 15,
  },
  heroSection: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: '#F1F5F9',
  },
  parallaxWrapper: {
    ...StyleSheet.absoluteFillObject,
    transform: [{
      translateY: scrollY.interpolate({
        inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
        outputRange: [HERO_HEIGHT / 2, 0, -HERO_HEIGHT / 1.5],
        extrapolate: 'clamp',
      })
    }, {
      scale: scrollY.interpolate({
        inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
        outputRange: [2, 1, 1],
        extrapolate: 'clamp',
      })
    }]
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 24,
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  iconCircleWhite: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contentCard: {
    marginTop: -30,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 400,
  },
  vendorHeaderMain: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
    gap: 20,
  },
  logoCircleLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  logoImageLarge: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoLetterLarge: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.orange,
  },
  headerTitles: {
    flex: 1,
  },
  businessTitleMain: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  ratingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingTextMain: {
    fontSize: 15,
    fontWeight: '900',
    color: '#10B981',
  },
  reviewCountMain: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  statusTextMain: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  actionGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  gridActionItem: {
    alignItems: 'center',
    width: (width - 48 - 45) / 4,
  },
  gridActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gridActionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  locationSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
    gap: 15,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationMainRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  locationAddressText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 22,
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 28,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  mapPreviewMini: {
    width: 100,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  mapImageMini: {
    width: '100%',
    height: '100%',
  },
  mapMarkerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 24,
    fontWeight: '500',
  },
  moreLink: {
    color: '#2563EB',
    fontWeight: '800',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  viewAllLink: {
    color: '#2563EB',
    fontWeight: '800',
  },
  dealsScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  dealCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  dealImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  dealInfo: {
    padding: 12,
  },
  dealName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    height: 34,
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  overviewContainer: {
    paddingTop: 10,
  },
  tabContainer: {
    padding: 24,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productGridCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  productImageContainer: {
    height: 140,
    width: '100%',
    backgroundColor: '#F8FAFC',
  },
  gridProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridDiscountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gridDiscountText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  gridProductInfo: {
    padding: 12,
  },
  gridProductName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    height: 38,
  },
  gridProductCategory: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  gridPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  gridPriceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.orange,
  },
  gridMrpPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  gridAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  qtySelectorGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 2,
    gap: 8,
  },
  qtyBtnGrid: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  gridQtyText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    minWidth: 16,
    textAlign: 'center',
  },
  priceColumn: {
    flex: 1,
  },
  gridAddBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 74,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bottomBtn: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callBtn: {
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  enquiryBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  whatsappBtn: {
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  writeReviewBtn: {
    backgroundColor: COLORS.orange,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  writeReviewText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  innerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 58,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  reviewItem: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 4,
  },
  starRowSmall: {
    flexDirection: 'row',
    gap: 3,
  },
  commentText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  },
  vendorReply: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.orange,
  },
  replyLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.orange,
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  replyText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  contactTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsWrapper: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabsScroll: {
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginRight: 4,
    alignItems: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 4,
    backgroundColor: COLORS.orange,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activeTabLabel: {
    color: '#0F172A',
  },
  contentBody: {
    flex: 1,
    paddingBottom: 150,
  },
  loaderContainer: {
    padding: 50,
    alignItems: 'center',
  }
});

export default VendorDetails;
