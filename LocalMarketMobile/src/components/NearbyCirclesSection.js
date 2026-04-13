import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, } from 'react-native';
import Image from './ImageWithFallback';
import Icon from 'react-native-vector-icons/Feather';
import { getCircles } from '../services/api';
import { useThemeColors } from '../hooks/useThemeColors';

const NearbyCirclesSection = ({ navigation, locationState }) => {
  const COLORS = useThemeColors();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
               setCircles(data.circles);
            } else {
               setCircles([]);
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
  }, [locationState?.city]);

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
    if (navigation) {
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
    marginBottom: 24,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  areaTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 2,
  },
  headerDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12, // Added to prevent shadow clipping
    gap: 16,
  },
  card: {
    width: 120,
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F8FAFC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#F8FAFC',
  },
  circleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  marketName: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 28,
    letterSpacing: -0.2,
  },
  shopsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopsText: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
});

export default NearbyCirclesSection;
