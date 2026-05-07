import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, } from 'react-native';
import Image from './ImageWithFallback';
import Icon from 'react-native-vector-icons/Feather';
import { getCircles } from '../services/api';
import { useThemeColors } from '../hooks/useThemeColors';
import Logo from './Logo';

const NearbyCirclesSection = ({ circles: propsCircles, onCircleSelect, navigation, locationState }) => {
  const COLORS = useThemeColors();
  const [internalCircles, setInternalCircles] = useState([]);
  const [loading, setLoading] = useState(!propsCircles);

  const circles = propsCircles || internalCircles;

  useEffect(() => {
    if (propsCircles) {
      setLoading(false);
      return;
    }
    
    let active = true;
    const fetchCircles = async () => {
      setLoading(true);
      if (locationState?.city) {
        try {
          let queryParam = (locationState.displayLabel && locationState.displayLabel.startsWith('All ')) 
            ? locationState.displayLabel 
            : (locationState.city || locationState.circle || '');
          const data = await getCircles(queryParam);
          if (active) {
            if (data && data.circles) {
               setInternalCircles(data.circles);
            } else {
               setInternalCircles([]);
            }
          }
        } catch (error) {
          console.error("Error fetching circles:", error);
        }
      } 
      if (active) setLoading(false);
    };

    fetchCircles();
    return () => { active = false; };
  }, [propsCircles, locationState?.city]);

  // Group circles by town/city to match website grouping
  const groupedCircles = useMemo(() => {
    if (!circles.length) return {};
    return circles.reduce((acc, circle) => {
      const area = (circle.town || circle.city || 'Local Areas').toUpperCase();
      if (!acc[area]) acc[area] = [];
      acc[area].push(circle);
      return acc;
    }, {});
  }, [circles]);

  const handleCirclePress = (circle) => {
    if (onCircleSelect) {
      onCircleSelect(circle);
    } else if (navigation) {
      navigation.navigate('MarketScreen', { 
        circle: circle.name
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
         <ActivityIndicator size="small" color="#FF6B00" />
      </View>
    );
  }

  if (circles.length === 0) return null;

  return (
    <View style={styles.container}>
      {Object.entries(groupedCircles).map(([area, areaCircles], areaIdx) => (
        <View key={area} style={styles.areaSection}>
          {/* Area Header with Divider to match website */}
          <View style={styles.areaHeader}>
            <Text style={styles.areaTitle}>{area.toUpperCase()}</Text>
            <View style={styles.headerDivider} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {areaCircles.map((circle, index) => {
              const imageUrl = circle.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
              
              return (
                <TouchableOpacity
                  key={circle.id || `${area}-${index}`}
                  style={styles.card}
                  onPress={() => handleCirclePress(circle)}
                  activeOpacity={0.8}
                >
                  {/* Circular Image - Matching website MarketCard */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.circleImage}
                    />
                    <View style={styles.logoOverlay}>
                      <Logo size={24} transparent={false} />
                    </View>
                  </View>

                  {/* Title - Bold Uppercase */}
                  <Text style={styles.marketName} numberOfLines={2}>
                    {circle.name.toUpperCase()}
                  </Text>

                  {/* Stats */}
                  <View style={styles.shopsRow}>
                    <Icon name="shopping-bag" size={10} color="#FF6B00" />
                    <Text style={styles.shopsText}> {circle.shops || 0} SHOPS</Text>
                  </View>

                  {/* Bottom Navigation Circle Button */}
                  <View style={styles.actionButton}>
                    <Icon name="chevron-right" size={14} color="#FFF" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  loadingContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaSection: {
    marginBottom: 20,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  areaTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  headerDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  card: {
    width: 150,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    padding: 2,
    backgroundColor: '#F1F5F9',
    position: 'relative',
    overflow: 'visible',
  },
  circleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    resizeMode: 'cover',
  },
  logoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  marketName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
    minHeight: 32,
    lineHeight: 16,
  },
  shopsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  shopsText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '800',
    marginLeft: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default NearbyCirclesSection;
