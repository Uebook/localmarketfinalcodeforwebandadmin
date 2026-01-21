import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import { PROMO_BANNERS } from '../constants';
import { getBanners } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PromoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await getBanners();
      if (data && data.banners && data.banners.length > 0) {
        // Filter active banners and sort by priority
        const activeBanners = data.banners
          .filter(b => b.active)
          .sort((a, b) => (a.priority || 999) - (b.priority || 999));
        setBanners(activeBanners);
      } else {
        // Fallback to constants
        setBanners(PROMO_BANNERS);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      // Fallback to constants
      setBanners(PROMO_BANNERS);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    if (banners.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }
  }, [banners.length]);

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, banners.length]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Trending & Popular Special Offers</Text>
        <View style={[styles.carouselContainer, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </View>
    );
  }

  if (banners.length === 0) {
    return null; // Don't show carousel if no banners
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trending & Popular Special Offers</Text>
      <View style={styles.carouselContainer}>
        {banners.map((banner, index) => (
          <TouchableOpacity
            key={banner.id || index}
            style={[
              styles.slide,
              { opacity: index === currentIndex ? 1 : 0 },
            ]}
            activeOpacity={1}
            onPress={() => {
              // Handle banner click - could navigate to linkUrl if available
              if (banner.linkUrl) {
                // In production, use Linking.openURL(banner.linkUrl)
                console.log('Banner clicked:', banner.linkUrl);
              }
            }}
          >
            <Image
              source={{ uri: banner.imageUrl || banner.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              {banner.description && (
                <Text style={styles.bannerSubtitle}>{banner.description}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Indicators */}
        {banners.length > 1 && (
          <View style={styles.indicators}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentIndex ? styles.indicatorActive : styles.indicatorInactive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  carouselContainer: {
    width: SCREEN_WIDTH - 32,
    height: 224,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  slide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'transparent',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f1f5f9',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  indicators: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#ffffff',
  },
  indicatorInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PromoCarousel;




