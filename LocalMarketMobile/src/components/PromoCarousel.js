import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { PROMO_BANNERS } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PromoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trending & Popular Special Offers</Text>
      <View style={styles.carouselContainer}>
        {PROMO_BANNERS.map((banner, index) => (
          <View
            key={banner.id}
            style={[
              styles.slide,
              { opacity: index === currentIndex ? 1 : 0 },
            ]}
          >
            <Image
              source={{ uri: banner.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
                <Text style={styles.ctaText}>{banner.ctaText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {/* Indicators */}
        <View style={styles.indicators}>
          {PROMO_BANNERS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex ? styles.indicatorActive : styles.indicatorInactive,
              ]}
            />
          ))}
        </View>
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
});

export default PromoCarousel;




