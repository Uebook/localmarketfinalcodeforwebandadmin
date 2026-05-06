import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
import { getMarketComparisonStats } from '../services/api';

const CheapestMarketCard = ({ navigation, city, circle }) => {
  const COLORS = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState({
    name: circle || city || 'Your Market',
    city: city || 'Local',
    shopsCount: 120,
    avgSavings: 120,
    trendingDeals: 240,
  });

  useEffect(() => {
    // Simulate fetching data or use actual API
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [city, circle]);

  if (loading) {
    return (
      <View style={[styles.wrapper, styles.loadingWrapper]}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.leftContent}>
          <Text style={styles.subTitle}>YOUR CURRENT MARKET</Text>
          <Text style={styles.marketName}>{marketData.name}</Text>
          <Text style={styles.cityName}>{marketData.city}</Text>
          
          <View style={styles.statusRow}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
            <Text style={styles.shopCount}>{marketData.shopsCount}+ shops active</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#F0FDF4' }]}>
                <Icon name="briefcase" size={14} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.statLabel}>Avg. savings</Text>
                <Text style={styles.statValue}>₹{marketData.avgSavings}</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#EFF6FF' }]}>
                <Icon name="trending-up" size={14} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.statLabel}>Trending deals</Text>
                <Text style={styles.statValue}>{marketData.trendingDeals}+</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => navigation?.navigate('SearchResults', { query: marketData.name })}
            >
              <Text style={styles.exploreButtonText}>Explore Market</Text>
              <Icon name="arrow-right" size={14} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.locationChangeButton}>
              <Icon name="map-pin" size={12} color="#3B82F6" />
              <Text style={styles.locationChangeText}>Change location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Map Decoration */}
        <View style={styles.rightContent}>
          <View style={styles.mapContainer}>
             {/* Map Placeholder with a blue pin */}
             <View style={styles.mapCircle}>
                <View style={styles.bluePin}>
                   <Icon name="map-pin" size={24} color="#3B82F6" />
                </View>
             </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#FFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  card: {
    flexDirection: 'row',
    padding: 20,
  },
  loadingWrapper: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
  },
  subTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  marketName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  cityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  shopCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  exploreButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    marginRight: 6,
  },
  locationChangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationChangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    marginLeft: 4,
  },
  rightContent: {
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapCircle: {
     width: 80,
     height: 80,
     borderRadius: 40,
     backgroundColor: '#DBEAFE',
     borderWidth: 2,
     borderColor: '#FFF',
     alignItems: 'center',
     justifyContent: 'center',
  },
  bluePin: {
     width: 40,
     height: 40,
     borderRadius: 20,
     backgroundColor: '#FFF',
     alignItems: 'center',
     justifyContent: 'center',
     shadowColor: '#3B82F6',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.2,
     shadowRadius: 8,
     elevation: 4,
  }
});

export default CheapestMarketCard;
