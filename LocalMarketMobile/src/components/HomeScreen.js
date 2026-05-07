import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image as RNImage } from 'react-native';
import Image from './ImageWithFallback';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './Header';
import { useThemeColors } from '../hooks/useThemeColors';

// Import sidebar control from shared utility
import { setSidebarControl, getSidebarControl } from '../utils/sidebarControl';
import { loadUserData, updateUserData } from '../utils/userStorage';
import SearchBar from './SearchBar';
import Icon from 'react-native-vector-icons/Feather';
import TopCategoriesGrid from './TopCategoriesGrid';
import NearbySection from './NearbySection';
import HorizontalSection from './HorizontalSection';
import PromoCarousel from './PromoCarousel';
import { getCategories, detectLocation, getMegaSavings, getPriceDrops, getBrands } from '../services/api';

import DraggableAIButton from './DraggableAIButton';

import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

// New LOKALL sections
import CheapestMarketCard from './CheapestMarketCard';
import NearbyCirclesSection from './NearbyCirclesSection';
import TodayDeals from './TodayDeals';
import PriceDropAlerts from './PriceDropAlerts';
import MegaSavingsSection from './MegaSavingsSection';
import SalesSection from './SalesSection';
import QuickCategories from './QuickCategories';




const HomeScreen = ({ navigation, route, locationState, setLocationState, onLocationPickerOpen }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);

  const [categories, setCategories] = useState([]);
  const [megaSavingsData, setMegaSavingsData] = useState([]);
  const [priceDropsData, setPriceDropsData] = useState([]);
  const [verifiedVendors, setVerifiedVendors] = useState([]);
  const [nearbyCircles, setNearbyCircles] = useState([]);
  const [premiumBrands, setPremiumBrands] = useState([]);
  const [todayDealsData, setTodayDealsData] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // --- Fallback helpers defined at component scope so all functions can access them ---
  const getFallbackFromUser = async () => {
    try {
      const userData = await loadUserData();
      if (userData && (userData.city || userData.location)) {
        const cityStr = userData.location || [userData.city, userData.state].filter(Boolean).join(', ');
        setLocationState({
          lat: userData.lat || null,
          lng: userData.lng || null,
          displayLabel: userData.displayLabel || userData.city || 'Your Area',
          city: userData.city || '',
          circle: userData.circle || '',
          town: userData.town || '',
          fullAddress: cityStr,
          loading: false,
          error: null,
          state: userData.state || '',
        });
        return true;
      }
    } catch (err) {
      console.warn('Could not load user location fallback:', err);
    }
    return false;
  };

  const setAbsoluteFallback = () => {
    setLocationState({
      lat: 31.6340,
      lng: 74.8723,
      displayLabel: 'Amritsar',
      city: 'Amritsar',
      circle: '',
      town: '',
      fullAddress: 'Amritsar, Punjab, India',
      loading: false,
      error: null,
    });
  };

  const handleFallback = async () => {
    const userFallbackSuccess = await getFallbackFromUser();
    if (!userFallbackSuccess) {
      setAbsoluteFallback();
    }
  };


  const fetchLocation = async (manualLocation = null, forceRedetect = false) => {
    if (manualLocation) {
      // Manual selection from Picker
      const displayLabel = manualLocation.circle || manualLocation.town || manualLocation.city || 'Your Area';
      const fullAddress = [
        manualLocation.circle,
        manualLocation.subTehsil,
        manualLocation.tehsil,
        manualLocation.town,
        manualLocation.city,
        manualLocation.state
      ].filter(Boolean).join(', ');

      setLocationState({
        lat: null,
        lng: null,
        displayLabel: displayLabel,
        city: manualLocation.city || '',
        circle: manualLocation.circle || '',
        town: manualLocation.town || '',
        fullAddress: fullAddress,
        loading: false,
        error: null,
        state: manualLocation.state || '',
      });

      // Persist manual choice
      try {
        await updateUserData({
          city: manualLocation.city || '',
          circle: manualLocation.circle || '',
          town: manualLocation.town || '',
          state: manualLocation.state || '',
          location: fullAddress,
          displayLabel: displayLabel
        });
      } catch (err) {
        console.warn('Failed to persist manual location:', err);
      }
      return;
    }

    // Auto-detection logic
    if (forceRedetect) {
      setLocationState(prev => ({ ...prev, loading: true }));
    }

    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    };

    // PRIORITIZE SAVED DATA (Unless forceRedetect is true)
    if (!forceRedetect) {
      const userFallbackSuccess = await getFallbackFromUser();
      if (userFallbackSuccess) {
        return; // Saved data found and used, stop here
      }
    }

    // START AUTO-DETECTION (GPS -> IP Fallback)
    const hasPermission = await requestLocationPermission();

    if (hasPermission) {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            console.log('Detecting via GPS...', latitude, longitude);
            const data = await detectLocation(latitude, longitude);
            if (data && data.success) {
              const displayLabel = data.displayLabel || 'Your Area';
              const city = data.address?.city || data.address?.town || '';

              setLocationState({
                lat: latitude,
                lng: longitude,
                displayLabel: displayLabel,
                city: city || displayLabel.split(',')[0],
                circle: data.matchedCircle || '',
                town: data.address?.village || data.address?.suburb || '',
                fullAddress: data.address?.display_name || displayLabel,
                loading: false,
                error: null,
                state: data.address?.state || '',
              });
              return;
            } else if (data && data.error === 'International location detected') {
              console.warn("Detected location is outside India. Falling back to default...");
              handleFallback();
              return;
            }
          } catch (geocodeErr) {
            console.warn("GPS Geocoding failed, trying IP fallback...", geocodeErr);
            handleIpOnlyFallback();
          }
        },
        (error) => {
          console.warn("Geolocation signal failed, trying IP fallback...", error);
          handleIpOnlyFallback();
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      console.log('No GPS permission, trying IP fallback...');
      handleIpOnlyFallback();
    }
  };

  const handleIpOnlyFallback = async () => {
    try {
      const data = await detectLocation(); // No lat/lng triggers IP logic
      if (data && data.success) {
        setLocationState({
          lat: null,
          lng: null,
          displayLabel: data.displayLabel || 'Your Area',
          city: data.city || data.displayLabel?.split(',')[0] || '',
          circle: data.matchedCircle || '',
          town: '',
          fullAddress: data.displayLabel || 'Detected via IP',
          loading: false,
          error: null,
          state: data.state || '',
        });
        return;
      }
    } catch (err) {
      console.warn('IP Fallback detection failed:', err);
    }

    handleFallback(); // Ultimate fallback (saved or absolute)
  };


  useEffect(() => {
    fetchLocation();
    loadCategories();
  }, []);

  useEffect(() => {
    if (locationState.city || locationState.circle || locationState.town) {
      loadSectionsData(locationState.city, locationState.circle || locationState.town);
    }
  }, [locationState.city, locationState.circle, locationState.town]);

  const loadSectionsData = async (city, circle) => {
    setLoadingSections(true);
    try {
      const { getVendors, getCircles, getTodayDeals } = require('../services/api');
      const [mega, drops, verifiedRes, circlesRes, brandsRes, todayDealsRes] = await Promise.all([
        getMegaSavings(city, circle).catch(() => []),
        getPriceDrops(city, circle).catch(() => []),
        getVendors({ city, circle, verified: true, limit: 10 }).catch(() => ({ vendors: [] })),
        getCircles(city).catch(() => ({ circles: [] })),
        getBrands().catch(() => []),
        getTodayDeals(city, 10).catch(() => []),
      ]);
      const DUMMY_BRANDS = [
        { id: 'b3', name: 'Nike', localSource: require('../assets/nike_logo.jpg'), category: 'Footwear', description: 'Nike Exclusive Store' },
        { id: 'b5', name: 'Zara', localSource: require('../assets/zara_logo.jpg'), category: 'Clothing', description: 'Zara Fashion Hub' },
      ];

      // Guard: always store arrays to prevent .length crashes in child components
      setMegaSavingsData(Array.isArray(mega) ? mega : []);
      setPriceDropsData(Array.isArray(drops) ? drops : []);
      setVerifiedVendors(verifiedRes?.vendors || []);
      setNearbyCircles(circlesRes?.circles || []);
      setTodayDealsData(Array.isArray(todayDealsRes) ? todayDealsRes : (todayDealsRes?.results || []));

      const brands = Array.isArray(brandsRes) && brandsRes.length > 0 ? brandsRes : DUMMY_BRANDS;
      setPremiumBrands(brands);
    } catch (error) {
      console.error('Error loading sections data:', error);
      setMegaSavingsData([]);
      setPriceDropsData([]);
      setVerifiedVendors([]);
      setNearbyCircles([]);
      setPremiumBrands([]);
    } finally {
      setLoadingSections(false);
    }
  };


  const loadCategories = async () => {
    try {
      const data = await getCategories();
      if (data && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleCategorySelect = (categoryName, categoryId) => {
    if (navigation) {
      navigation.navigate('SearchResults', {
        query: categoryName,
        categoryId: categoryId,
        isCategorySearch: true,
        locationState: locationState, // Pass location context
      });
    }
  };

  const handleViewAllCategories = () => {
    if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Categories' });
    }
  };

  const handleSearch = (query) => {
    if (navigation && query) {
      navigation.navigate('SearchResults', {
        query,
        locationState: locationState // Pass location context
      });
    }
  };

  const handleBusinessClick = (business) => {
    if (navigation) {
      navigation.navigate('VendorDetails', { business });
    }
  };

  const handleMenuClick = () => {
    const control = getSidebarControl();
    if (control) {
      control(true);
    }
  };

  const handleProfileClick = () => {
    if (navigation) {
      navigation.navigate('Settings');
    }
  };

  const handleNotificationClick = () => {
    if (navigation) {
      navigation.navigate('Notifications');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.whiteBackground} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* New Premium Hero Section */}
        <View style={styles.premiumHero}>
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitleMain}>Best Deals,</Text>
              <Text style={styles.heroTitleAccent}>Nearby.</Text>
              <Text style={styles.heroSubtitle}>
                Compare prices from{"\n"}trusted local shops instantly.
              </Text>
            </View>
            <View style={styles.heroRight}>
              <Image
                source={require('../assets/lokall_shop_illustration.png')}
                style={styles.heroIllustration}
                resizeMode="contain"
              />
            </View>
          </View>

          <SearchBar
            onSearch={handleSearch}
            navigation={navigation}
            currentCity={locationState.city}
            locationState={locationState}
          />
          
          {/* Quick Search Categories */}
          <QuickCategories onSelect={(name) => handleSearch(name)} />
        </View>

        <View style={styles.mainContent}>
          <View style={styles.sectionContainer}>
            <CheapestMarketCard
              navigation={navigation}
              city={locationState.city}
              circle={locationState.circle}
              onLocationChange={onLocationPickerOpen}
            />
          </View>

          {/* New Section: Verified Shops Nearby You */}
          {verifiedVendors.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Verified Shops Nearby You</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SearchResults', { query: 'verified', verified: true, locationState })} style={styles.viewAllRow}>
                  <Text style={styles.viewAllText}>View all</Text>
                  <Icon name="arrow-right" size={14} color="#3B82F6" />
                </TouchableOpacity>
              </View>
              <NearbySection
                vendors={verifiedVendors}
                onBusinessClick={handleBusinessClick}
              />
            </View>
          )}

          {/* New Section: Nearby Markets (Circles) */}
          {nearbyCircles.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Markets in {locationState.city}</Text>
              </View>
              <NearbyCirclesSection
                circles={nearbyCircles}
                onCircleSelect={(circle) => {
                  setLocationState(prev => ({ ...prev, circle: circle.name }));
                  navigation.navigate('MarketScreen', { circle: circle.name, city: locationState.city });
                }}
              />
            </View>
          )}

          {/* 2. Shop by Categories */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shop by Categories</Text>
              <TouchableOpacity onPress={handleViewAllCategories} style={styles.viewAllRow}>
                <Text style={styles.viewAllText}>View all</Text>
                <Icon name="arrow-right" size={14} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            <TopCategoriesGrid
              categories={categories.length > 0 ? categories.slice(0, 8) : []}
              onCategorySelect={handleCategorySelect}
              onViewAll={handleViewAllCategories}
            />
          </View>

          {/* 3. Support Local Banner & Trust Badges */}
          <View style={styles.bannerContainer}>
            <LinearGradient
              colors={['#FEF3C7', '#FFFBEB']}
              style={styles.supportBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.bannerTextContent}>
                <Text style={styles.bannerSubtitle}>Support local shops in</Text>
                <Text style={styles.bannerTitle}>
                  {locationState?.circle || locationState?.city || 'Your Circle'}
                </Text>
                <Text style={styles.bannerDesc}>Better prices, better deals!</Text>
                <TouchableOpacity 
                  style={styles.shopLocalBtn}
                  onPress={() => {
                    if (locationState.circle) {
                      navigation.navigate('MarketScreen', { circle: locationState.circle, locationState });
                    } else {
                      navigation.navigate('SearchResults', { 
                        query: 'all', 
                        locationState 
                      });
                    }
                  }}
                >
                  <Text style={styles.shopLocalText}>Shop Local</Text>
                  <Icon name="arrow-right" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
              <Image
                source={require('../assets/shopkeeper_illustration.png')}
                style={styles.bannerIllustration}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>

          {/* 4. Trust Badges (2x2 Grid) */}
          <View style={styles.trustGridContainer}>
            <View style={styles.trustRow}>
              <View style={styles.trustItem}>
                <View style={[styles.trustIconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <Icon name="home" size={14} color="#22C55E" />
                </View>
                <View>
                  <Text style={styles.trustItemTitle}>100% Local Shops</Text>
                  <Text style={styles.trustItemDesc}>Direct from nearby stores</Text>
                </View>
              </View>

              <View style={styles.trustItem}>
                <View style={[styles.trustIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Icon name="shield" size={14} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.trustItemTitle}>Best Price Guarantee</Text>
                  <Text style={styles.trustItemDesc}>We show you lowest price</Text>
                </View>
              </View>
            </View>

            <View style={[styles.trustRow, { marginBottom: 0 }]}>
              <View style={styles.trustItem}>
                <View style={[styles.trustIconCircle, { backgroundColor: '#FFF7ED' }]}>
                  <Icon name="pocket" size={14} color="#F97316" />
                </View>
                <View>
                  <Text style={styles.trustItemTitle}>Save More</Text>
                  <Text style={styles.trustItemDesc}>Compare & save instantly</Text>
                </View>
              </View>

              <View style={styles.trustItem}>
                <View style={[styles.trustIconCircle, { backgroundColor: '#F5F3FF' }]}>
                  <Icon name="check-circle" size={14} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={styles.trustItemTitle}>Trusted & Verified</Text>
                  <Text style={styles.trustItemDesc}>Verified shops & reviews</Text>
                </View>
              </View>
            </View>
          </View>

          {/* New Section: Today's Best Deals */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Best Deals</Text>
            </View>
            <TodayDeals navigation={navigation} data={todayDealsData} />
          </View>

          {/* New Section: All India Mega Sales */}
          {megaSavingsData.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All India Mega Sales</Text>
              </View>
              <MegaSavingsSection
                data={megaSavingsData}
                navigation={navigation}
              />
            </View>
          )}

          {/* New Section: Price Drop Alerts */}
          {priceDropsData.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Price Drop Alerts</Text>
              </View>
              <PriceDropAlerts
                data={priceDropsData}
                navigation={navigation}
              />
            </View>
          )}


          {/* 5. Premium Brands */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Premium Brands</Text>
                <Text style={styles.sectionSubtitle}>Exclusive partnerships with top local brands</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandsScroll}>
              {premiumBrands.map((brand, i) => (
                <TouchableOpacity
                  key={brand.id || i}
                  style={styles.brandCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('VendorDetails', {
                    business: {
                      id: brand.id,
                      shop_name: brand.name,
                      name: brand.name,
                      category_name: brand.category,
                      category: brand.category,
                      imageUrl: brand.logoUrl || brand.logo_url,
                      image_url: brand.logoUrl || brand.logo_url,
                      about: brand.description,
                      description: brand.description,
                      address: brand.address || 'Premium Brand Store',
                      phone: brand.phone || '',
                      rating: 4.8,
                      reviewCount: 120,
                      isVerified: true,
                      isBrand: true
                    }
                  })}
                >
                  <View style={styles.brandLogoContainer}>
                    {brand.localSource ? (
                      <RNImage source={brand.localSource} style={styles.brandLogo} resizeMode="contain" />
                    ) : (brand.logoUrl || brand.logo_url) ? (
                      <Image source={{ uri: brand.logoUrl || brand.logo_url }} style={styles.brandLogo} />
                    ) : (
                      <Icon name="briefcase" size={30} color="#CBD5E1" />
                    )}
                  </View>
                  <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

        </View>
      </ScrollView>

      <DraggableAIButton onPress={() => navigation.navigate('AIServiceFlow')} />
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  whiteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  premiumHero: {
    backgroundColor: '#EFF6FF', // Light blue background
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  heroLeft: {
    flex: 1,
  },
  heroTitleMain: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 36,
  },
  heroTitleAccent: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F97316',
    lineHeight: 36,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 20,
  },
  heroRight: {
    width: 140,
    height: 140,
  },
  heroIllustration: {
    width: '100%',
    height: '100%',
  },
  mainContent: {
    paddingTop: 10,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
    marginRight: 4,
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  supportBanner: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 140,
  },
  bannerTextContent: {
    flex: 1,
    paddingRight: 8,
  },
  bannerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  bannerDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#B45309',
    marginBottom: 12,
  },
  shopLocalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  shopLocalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    marginRight: 6,
  },
  bannerIllustration: {
    width: 120,
    height: 120,
  },
  trustGridContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trustItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  trustItemTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 12,
  },
  trustItemDesc: {
    fontSize: 9,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
    lineHeight: 11,
  },
  brandsScroll: {
    paddingHorizontal: 16,
  },
  brandCard: {
    width: 84,
    alignItems: 'center',
    marginRight: 20,
  },
  brandLogoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  brandLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    resizeMode: 'contain',
  },
  brandName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
  },
});

export default HomeScreen;
