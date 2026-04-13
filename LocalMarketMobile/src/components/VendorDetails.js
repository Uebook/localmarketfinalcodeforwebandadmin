import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, 
  Linking, Alert, ActivityIndicator, ImageBackground,
  Dimensions, StatusBar, Platform, TextInput, Share
} from 'react-native';
import Image from './ImageWithFallback';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
import { getVendorProducts, getVendorReviews, getVendorProfile, submitReview } from '../services/api';
import { saveVendor, removeSavedVendor, isVendorSaved } from '../utils/savedVendors';
import { addToCart } from '../utils/cartStorage';
import MapView from './MapView';
import EnquiryModal from './EnquiryModal';
import WriteReview from './WriteReview';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = width * 0.9;

const VendorDetails = ({ navigation, route }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  
  const business = route.params?.business || route.params?.vendor;
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorInfo, setVendorInfo] = useState(business);
  const [productSearch, setProductSearch] = useState('');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);

  useEffect(() => {
    const vid = business?.id || business?.vendor_id || business?.vendorId;
    if (vid) {
      loadData(vid);
      checkSaveStatus(vid);
    }
  }, [business?.id, business?.vendor_id]);

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
      const waUrl = Platform.OS === 'ios' 
        ? `whatsapp://send?phone=${cleanPhone}` 
        : `whatsapp://send?phone=${phone}`; // Android is more flexible
      
      Linking.canOpenURL(waUrl).then(supported => {
        if (supported) {
          Linking.openURL(waUrl);
        } else {
          Alert.alert('WhatsApp Not Installed', 'Please install WhatsApp to use this feature.');
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
      loadData(vendorInfo.id);
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error; // Will be caught by WriteReview Modal's internal catch
    }
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch) return allProducts;
    return allProducts.filter(p => 
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [allProducts, productSearch]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: `Products (${filteredProducts.length})` },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
    { id: 'info', label: 'Contact' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContainer}>
            {/* About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Us</Text>
              <Text style={styles.aboutText}>
                {vendorInfo.about || `Welcome to ${vendorInfo.name}. We are committed to providing the highest quality products and services to our local community in ${vendorInfo.city || 'your area'}.`}
              </Text>
            </View>

            {/* Info Grid (2x2) */}
            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <View style={[styles.infoIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Icon name="map-pin" size={18} color="#EA580C" />
                </View>
                <View style={styles.infoTextContent}>
                  <Text style={styles.infoLabel}>LOCATION</Text>
                  <Text style={styles.infoValue} numberOfLines={2}>{vendorInfo.address || 'Local Hub'}</Text>
                </View>
              </View>
              <View style={styles.infoBox}>
                <View style={[styles.infoIconBox, { backgroundColor: '#FEF3F2' }]}>
                  <Icon name="clock" size={18} color="#DC2626" />
                </View>
                <View style={styles.infoTextContent}>
                  <Text style={styles.infoLabel}>HOURS</Text>
                  <Text style={styles.infoValue}>{vendorInfo.openTime || '9 AM - 9 PM'}</Text>
                </View>
              </View>
              <View style={styles.infoBox}>
                <View style={[styles.infoIconBox, { backgroundColor: '#F0F9FF' }]}>
                  <Icon name="shield" size={18} color="#0284C7" />
                </View>
                <View style={styles.infoTextContent}>
                  <Text style={styles.infoLabel}>STATUS</Text>
                  <Text style={styles.infoValue}>{vendorInfo.isVerified ? 'Verified' : 'Registered'}</Text>
                </View>
              </View>
              <View style={styles.infoBox}>
                <View style={[styles.infoIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <Icon name="trending-up" size={18} color="#16A34A" />
                </View>
                <View style={styles.infoTextContent}>
                  <Text style={styles.infoLabel}>POPULARITY</Text>
                  <Text style={styles.infoValue}>Highly Rated</Text>
                </View>
              </View>

            </View>

            {/* Address & Map */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Address</Text>
               <TouchableOpacity 
                 style={styles.addressCard}
                 onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendorInfo.address)}`)}
               >
                 <Text style={styles.addressTextFull}>{vendorInfo.address}</Text>
                 <View style={styles.mapPreviewPlaceholder}>
                   <Icon name="map" size={24} color="#94A3B8" />
                   <Text style={styles.mapText}>Open in Google Maps</Text>
                 </View>
               </TouchableOpacity>
            </View>
          </View>
        );
      case 'products':
        return (
          <View style={styles.tabContainer}>
            {/* Inner Search Bar */}
            <View style={styles.innerSearchContainer}>
              <Icon name="search" size={18} color="#94A3B8" style={styles.innerSearchIcon} />
              <TextInput
                style={styles.innerSearchInput}
                placeholder={`Search in ${vendorInfo.shop_name || vendorInfo.name}...`}
                value={productSearch}
                onChangeText={setProductSearch}
                placeholderTextColor="#94A3B8"
                clearButtonMode="while-editing"
              />
            </View>

            <View style={styles.productListWide}>
              {filteredProducts.length > 0 ? filteredProducts.map((item) => {
                const comparisonPrice = Math.max(item.online_price || 0, item.mrp || 0);
                const savings = comparisonPrice > item.price ? comparisonPrice - item.price : 0;

                return (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.productCardWide}
                  onPress={() => addToCart(item, vendorInfo.id)}
                  activeOpacity={0.8}
                >
                  <Image 
                    source={{ uri: item.image_url || item.imageUrl }} 
                    style={styles.productImageWide} 
                  />
                  <View style={styles.productContentWide}>
                    <View style={styles.productHeaderWide}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productNameWide} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.productCategoryWide}>{item.category_name || vendorInfo.category}</Text>
                      </View>
                      {savings > 0 && (
                        <View style={styles.saveBadgeWide}>
                          <Text style={styles.saveBadgeTextWide}>SAVE ₹{savings}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.priceComparisonRowWide}>
                      <View style={styles.priceColumnWide}>
                        <Text style={styles.priceLabelWide}>LOKALL PRICE</Text>
                        <Text style={styles.priceValueWide}>₹{item.price}</Text>
                      </View>
                      <View style={[styles.priceColumnWide, styles.dividerWide]}>
                        <Text style={styles.priceLabelWide}>ONLINE</Text>
                        <Text style={styles.priceValueMutedWide}>₹{item.online_price || '--'}</Text>
                      </View>
                      <View style={[styles.priceColumnWide, styles.dividerWide]}>
                        <Text style={styles.priceLabelWide}>MRP</Text>
                        <Text style={styles.priceValueMutedWide}>₹{item.mrp || '--'}</Text>
                      </View>
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
             <TouchableOpacity 
               style={styles.writeReviewBtn}
               onPress={() => setShowWriteReview(true)}
             >
               <Text style={styles.writeReviewText}>Write a Review</Text>
             </TouchableOpacity>
             {reviews.length > 0 ? reviews.map((rev) => (
               <View key={rev.id} style={styles.reviewItem}>
                 <View style={styles.reviewHeader}>
                   <View style={styles.avatar}>
                     <Text style={styles.avatarText}>{(rev.user_name || 'U')[0]}</Text>
                   </View>
                   <View>
                     <Text style={styles.reviewerName}>{rev.user_name || 'Verified User'}</Text>
                     <View style={styles.starRowSmall}>
                       {[1,2,3,4,5].map(s => (
                         <Icon key={s} name="star" size={10} color={s <= rev.rating ? "#F59E0B" : "#E2E8F0"} />
                       ))}
                     </View>
                   </View>
                 </View>
                 <Text style={styles.commentText}>{rev.comment}</Text>
                 {rev.reply && (
                   <View style={styles.vendorReply}>
                     <Text style={styles.replyLabel}>Vendor Reply:</Text>
                     <Text style={styles.replyText}>{rev.reply}</Text>
                   </View>
                 )}
               </View>
             )) : (
               <View style={styles.emptyState}>
                 <Icon name="star" size={48} color="#CBD5E1" />
                 <Text style={styles.emptyText}>No reviews yet</Text>
               </View>
             )}
          </View>
        );
      case 'info':
        return (
          <View style={styles.tabContainer}>
            <View style={styles.contactList}>
               <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                 <Icon name="phone" size={20} color="#64748B" />
                 <View style={styles.contactTextWrapper}>
                    <Text style={styles.contactLabel}>Phone Call</Text>
                    <Text style={styles.contactValue}>{business.contactNumber || 'Available'}</Text>
                 </View>
                 <Icon name="chevron-right" size={20} color="#CBD5E1" />
               </TouchableOpacity>
               <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp}>
                 <Icon name="message-circle" size={20} color="#64748B" />
                 <View style={styles.contactTextWrapper}>
                    <Text style={styles.contactLabel}>WhatsApp Support</Text>
                    <Text style={styles.contactValue}>Chat Now</Text>
                 </View>
                 <Icon name="chevron-right" size={20} color="#CBD5E1" />
               </TouchableOpacity>
               <TouchableOpacity style={styles.contactItem} onPress={() => setShowEnquiryModal(true)}>
                 <Icon name="mail" size={20} color="#64748B" />
                 <View style={styles.contactTextWrapper}>
                    <Text style={styles.contactLabel}>Email Enquiry</Text>
                    <Text style={styles.contactValue}>Send Message</Text>
                 </View>
                 <Icon name="chevron-right" size={20} color="#CBD5E1" />
               </TouchableOpacity>
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
      
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        {/* Dynamic Hero Section */}
        <ImageBackground
          source={{ uri: vendorInfo.image_url || vendorInfo.imageUrl || 'https://images.unsplash.com/photo-1574310391921-4b130467b2bb?auto=format&fit=crop&w=800&q=80' }}
          style={styles.heroImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.9)']}
            style={styles.heroGradient}
          >
            <SafeAreaView edges={['top']} style={styles.topActions}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                <Icon name="arrow-left" size={20} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.topRightActions}>
                 <TouchableOpacity onPress={handleSave} style={styles.iconCircle}>
                    <Icon name="heart" size={20} color={isSaved ? "#EF4444" : "#FFF"} fill={isSaved ? "#EF4444" : "transparent"} />
                 </TouchableOpacity>
                 <TouchableOpacity onPress={handleShare} style={styles.iconCircle}>
                    <Icon name="share-2" size={20} color="#FFF" />
                 </TouchableOpacity>
              </View>
            </SafeAreaView>

            <View style={styles.heroContent}>
               <View style={styles.logoAndTitleRow}>
                  {(vendorInfo.profile_image_url || vendorInfo.profileImageUrl) && (
                    <View style={styles.logoWrapper}>
                      <Image 
                        source={{ uri: vendorInfo.profile_image_url || vendorInfo.profileImageUrl }} 
                        style={styles.profileLogo} 
                      />
                    </View>
                  )}
                  <View style={styles.titleWrapper}>
                    <View style={styles.badgeRow}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>{vendorInfo.category?.toUpperCase() || vendorInfo.category_name?.toUpperCase()}</Text>
                        </View>
                        {vendorInfo.isVerified && (
                          <View style={styles.verifiedBadge}>
                            <Icon name="check-circle" size={12} color="#FFF" />
                            <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                          </View>
                        )}
                    </View>
                    <Text style={styles.businessTitle} numberOfLines={2}>{vendorInfo.name || vendorInfo.shop_name}</Text>
                  </View>
               </View>

               <View style={styles.ratingRow}>
                 <View style={styles.glassChip}>
                    <Icon name="star" size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingValue}>{parseFloat(vendorInfo.rating || 0).toFixed(1)}</Text>
                    <Text style={styles.reviewCount}>({vendorInfo.reviewCount || 0})</Text>
                 </View>
                 <View style={[styles.glassChip, { flex: 1 }]}>
                    <Icon name="map-pin" size={14} color="#FFF" />
                    <Text style={styles.locationSummary} numberOfLines={1}>{vendorInfo.address || vendorInfo.city || 'Nearby'}</Text>
                 </View>
                 <TouchableOpacity 
                    style={[styles.glassChip, { backgroundColor: '#4A6CF7' }]}
                    onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendorInfo.address)}`)}
                 >
                    <Icon name="navigation" size={14} color="#FFF" />
                    <Text style={styles.locationSummary}>Directions</Text>
                 </TouchableOpacity>
               </View>
            </View>
          </LinearGradient>
        </ImageBackground>

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
              <ActivityIndicator size="large" color="#FF6B00" />
            </View>
          ) : (
            renderTabContent()
          )}
        </View>
      </ScrollView>

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
        onClose={() => setShowEnquiryModal(false)}
        businessName={vendorInfo.shop_name || vendorInfo.name}
        vendorId={vendorInfo.id}
      />
      <WriteReview
        visible={showWriteReview}
        onClose={() => setShowWriteReview(false)}
        onSubmit={handleReviewSubmit}
        vendorName={vendorInfo.shop_name || vendorInfo.name}
        vendorId={vendorInfo.id}
      />
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  heroImage: {
    width: '100%',
    height: HERO_HEIGHT,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroContent: {
    paddingBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  verifiedBadge: {
    backgroundColor: '#4A6CF7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  businessTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  glassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ratingValue: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
  },
  reviewCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  locationSummary: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  logoAndTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 16,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  profileLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
    resizeMode: 'cover',
  },
  titleWrapper: {
    flex: 1,
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
    marginRight: 8,
    alignItems: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 3,
    backgroundColor: '#FF6B00',
    borderRadius: 3,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activeTabLabel: {
    color: '#0F172A',
  },
  contentBody: {
    flex: 1,
    paddingBottom: 100, // For bottom bar
  },
  tabContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 24,
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  infoBox: {
    width: (width - 56) / 2,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  addressTextFull: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 16,
  },
  mapPreviewPlaceholder: {
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },
  productListWide: {
    gap: 16,
  },
  productCardWide: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  productImageWide: {
    width: 100,
    height: 100,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
  },
  productContentWide: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  productHeaderWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productNameWide: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  productCategoryWide: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  saveBadgeWide: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  saveBadgeTextWide: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  priceComparisonRowWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceColumnWide: {
    flex: 1,
  },
  dividerWide: {
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
    paddingLeft: 12,
  },
  priceLabelWide: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  priceValueWide: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6B00',
    letterSpacing: -0.5,
  },
  priceValueMutedWide: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  writeReviewBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  writeReviewText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  reviewItem: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 20,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 2,
  },
  starRowSmall: {
    flexDirection: 'row',
    gap: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  vendorReply: {
    marginTop: 16,
    paddingLeft: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
    paddingVertical: 4,
  },
  replyLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF6B00',
    letterSpacing: 1,
    marginBottom: 4,
  },
  replyText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  innerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  innerSearchIcon: {
    marginRight: 12,
  },
  innerSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySearchContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 16,
  },
  contactTextWrapper: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
  },
  bottomBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callBtn: {
    backgroundColor: '#FF6B00',
  },
  enquiryBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  whatsappBtn: {
    backgroundColor: '#22C55E',
  },
  bottomBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 13,
  },
  loaderContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
  }
});

export default VendorDetails;
