import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getSavedVendors, removeSavedVendor } from '../utils/savedVendors';

const SavedScreen = ({ navigation, savedIds = [], onToggleSave }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [locationState] = useState({
    lat: null,
    lng: null,
    city: 'Delhi, India',
    loading: false,
    error: null,
  });
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved vendors from AsyncStorage
  useEffect(() => {
    loadSavedVendors();
  }, []);

  // Reload when savedIds change (from parent)
  useEffect(() => {
    if (savedIds && savedIds.length > 0) {
      loadSavedVendors();
    }
  }, [savedIds]);

  const loadSavedVendors = async () => {
    try {
      setLoading(true);
      const saved = await getSavedVendors();
      setSavedItems(saved || []);
    } catch (error) {
      console.error('Error loading saved vendors:', error);
      setSavedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (vendorId) => {
    try {
      // Remove from AsyncStorage
      await removeSavedVendor(vendorId);

      // Update local state
      setSavedItems(prev => prev.filter(item => item.id !== vendorId));

      // Notify parent component if callback provided
      if (onToggleSave) {
        onToggleSave(vendorId);
      }
    } catch (error) {
      console.error('Error removing saved vendor:', error);
    }
  };

  const handleBusinessClick = (business) => {
    if (navigation) {
      navigation.navigate('VendorDetails', { vendor: business });
    }
  };

  const handleMenuClick = () => {
    // Use global sidebar control
    const { getSidebarControl } = require('../utils/sidebarControl');
    const control = getSidebarControl();
    if (control) {
      control(true);
    } else {
      console.warn('Sidebar control not available');
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

  const renderBusinessCard = ({ item }) => {
    // Safely determine the best image to show, handling empty strings
    const imgSource = item.profileImageUrl || item.imageUrl || item.shopFrontPhotoUrl;
    const finalImageUrl = (imgSource && imgSource.trim() !== '') ? imgSource : 'https://via.placeholder.com/150';

    return (
      <TouchableOpacity
        style={styles.businessCard}
        onPress={() => handleBusinessClick(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: finalImageUrl }}
          style={styles.businessImage}
        />
        <View style={styles.businessInfo}>
          <View style={styles.businessHeader}>
            <Text style={styles.businessName} numberOfLines={1}>{item.name}</Text>
            <TouchableOpacity
              onPress={() => handleToggleSave(item.id)}
              activeOpacity={0.7}
              style={styles.heartButton}
            >
              <Icon
                name="heart"
                size={20}
                color={COLORS.orange}
                fill={COLORS.orange}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.businessMeta}>
            <View style={styles.ratingContainer}>
              <Icon name={getIconName('Star')} size={14} color="#fbbf24" />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount})</Text>
            </View>
            {item.isVerified && (
              <View style={styles.verifiedBadge}>
                <Icon name={getIconName('CheckCircle')} size={12} color="#2563eb" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.locationRow}>
            <Icon name={getIconName('MapPin')} size={12} color={COLORS.textMuted} />
            <Text style={styles.location} numberOfLines={1}>{item.address || item.location}</Text>
          </View>
          <View style={styles.categoryRow}>
            <Text style={styles.category}>{item.category}</Text>
            {item.distance && (
              <Text style={styles.distance}>{item.distance}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.orange} />
          <Text style={styles.loadingText}>Loading saved items...</Text>
        </View>
      </View>
    );
  }

  if (savedItems.length === 0) {
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

        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Icon name={getIconName('Heart')} size={64} color="#6B7280" />
            </View>
            <Text style={styles.emptyTitle}>No Saved Items Yet</Text>
            <Text style={styles.emptyText}>
              Tap the heart icon on any business or product to save it here for later.
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation?.navigate('MainTabs', { screen: 'Home' })}
              activeOpacity={0.7}
            >
              <Text style={styles.exploreButtonText}>Start Exploring</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

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

      <FlatList
        data={savedItems}
        renderItem={renderBusinessCard}
        keyExtractor={(item) => item.id || item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadSavedVendors}
      />
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // White theme background
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: '#F8FAFC',
  },
  businessCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  businessImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  businessName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 8,
  },
  heartButton: {
    padding: 4,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563eb',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  location: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.orange,
    backgroundColor: COLORS.highlightBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  distance: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyCard: {
    backgroundColor: '#F5F5DC', // Light beige/off-white
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB', // Light gray
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#D1D5DB', // Dark gray outline
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151', // Dark gray
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280', // Lighter gray
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 280,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  exploreButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default SavedScreen;



