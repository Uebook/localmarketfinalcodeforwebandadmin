import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { getFestiveOffers } from '../services/api';
import { useThemeColors } from '../hooks/useThemeColors';

const SalesSection = ({ locationState, navigation }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = await getFestiveOffers({ status: 'active' });
        if (Array.isArray(data)) {
          setSales(data);
        }
      } catch (err) {
        console.error('Failed to fetch sales in SalesSection:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const cityDis = locationState?.city?.split(',').pop()?.trim() || '';

  const { stateSales, indiaSales } = useMemo(() => {
    const sSales = [];
    const iSales = [];

    sales.forEach(sale => {
      const circle = sale.circle?.toLowerCase() || '';
      if (circle === 'all india' || !circle) {
        iSales.push(sale);
      } else if (cityDis && circle.includes(cityDis.toLowerCase())) {
        sSales.push(sale);
      } else {
        if (circle === 'all india') iSales.push(sale);
        else sSales.push(sale);
      }
    });
    return { stateSales: sSales, indiaSales: iSales };
  }, [sales, cityDis]);

  const handleSalePress = (sale) => {
    // Navigate to a generic offers or specific category search
    if (navigation) {
      navigation.navigate('Offers');
    }
  };

  const renderSaleCard = (sale, isLast = false) => {
    const bgUrl = sale.image_url ? { uri: sale.image_url } : null;
    return (
      <TouchableOpacity 
        key={sale.id}
        activeOpacity={0.9}
        onPress={() => handleSalePress(sale)}
        style={[styles.cardContainer, isLast && { marginRight: 20 }]}
      >
        <ImageBackground
          source={bgUrl}
          style={styles.cardImageBg}
          imageStyle={styles.cardImageStyle}
        >
          <View style={styles.gradientOverlay} />
          
          <View style={styles.cardContent}>
            <View>
              <View style={styles.cardHeader}>
                <View style={styles.circleBadge}>
                  <Text style={styles.circleBadgeText}>{sale.circle || 'All India'}</Text>
                </View>
                <View style={styles.sparkleIcon}>
                  <Icon name="zap" size={16} color={COLORS.white} />
                </View>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{sale.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{sale.description}</Text>
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.discountBadge}>
                <Icon name="tag" size={14} color={COLORS.orange} />
                <Text style={styles.discountText}>{sale.discount_amount || 'Special'}</Text>
              </View>
              <View style={styles.shopButton}>
                <Text style={styles.shopButtonText}>SHOP DEAL</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={[styles.cardContainer, styles.loadingCard]} />
        <View style={[styles.cardContainer, styles.loadingCard]} />
      </View>
    );
  }

  if (sales.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Icon name="zap" size={24} color={COLORS.orange} />
            <Text style={styles.sectionTitle}>Active Offer & Sale</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Big savings from top local markets</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewAllBtn}
          onPress={() => navigation && navigation.navigate('Offers')}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Icon name="chevron-right" size={16} color={COLORS.orange} />
        </TouchableOpacity>
      </View>

      {stateSales.length > 0 && (
        <View style={styles.rowContainer}>
          <View style={styles.rowHeader}>
            <Icon name="map-pin" size={16} color={COLORS.orange} />
            <Text style={styles.rowTitle}>Sales in {cityDis || 'Your State'}</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollList}
          >
            {stateSales.map((s, idx) => renderSaleCard(s, idx === stateSales.length - 1))}
          </ScrollView>
        </View>
      )}

      {indiaSales.length > 0 && (
        <View style={styles.rowContainer}>
          <View style={styles.rowHeader}>
            <Icon name="flag" size={16} color={COLORS.orange} />
            <Text style={styles.rowTitle}>All India Mega Sales</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollList}
          >
            {indiaSales.map((s, idx) => renderSaleCard(s, idx === indiaSales.length - 1))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 106, 44, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#E86A2C',
    marginRight: 2,
  },
  rowContainer: {
    marginBottom: 24,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  rowTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 6,
  },
  scrollList: {
    paddingLeft: 16,
  },
  cardContainer: {
    width: 300,
    height: 180,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: COLORS.orange,
  },
  cardImageBg: {
    width: '100%',
    height: '100%',
  },
  cardImageStyle: {
    borderRadius: 20,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  circleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  circleBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sparkleIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
    marginLeft: 6,
  },
  shopButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
  },
  loadingContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  loadingCard: {
    backgroundColor: '#E2E8F0',
  }
});

export default SalesSection;
