import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Image from './ImageWithFallback';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
import Logo from './Logo';

const MegaSavingsSection = ({ data = [], navigation }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Icon name="trending-up" size={20} color="#16A34A" />
            <Text style={styles.title}>Mega Savings</Text>
          </View>
          <Text style={styles.subtitle}>Best Local Deals vs MRP</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Icon name="shield" size={12} color="#16A34A" />
          <Text style={styles.verifiedText}>LOKALL VERIFIED</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {safeData.map((item) => {
          const savings = (item.mrp || 0) - (item.price || item.offline || 0);
          const savingsPct = item.mrp > 0 ? Math.round((savings / item.mrp) * 100) : 0;
          const displayImage = item.image || item.imageUrl || item.image_url || item.profile_image_url;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => navigation?.navigate('VendorDetails', { business: item })}
            >
              <View style={styles.imageContainer}>
                {displayImage ? (
                  <Image source={{ uri: displayImage }} style={styles.image} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Icon name="image" size={24} color="#CBD5E1" />
                  </View>
                )}
                {savingsPct > 0 && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsPct}>-{savingsPct}%</Text>
                  </View>
                )}
                <View style={styles.vendorIconOverlay}>
                    <Logo size={28} transparent={false} />
                </View>
              </View>

              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                
                <View style={styles.comparisonContainer}>
                  {/* MRP */}
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>MRP</Text>
                    <Text style={styles.onlinePrice}>₹{item.mrp || '--'}</Text>
                  </View>
                  
                  {/* Local Price */}
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Local Price</Text>
                    <Text style={styles.offlinePrice}>₹{item.price || item.offline || '--'}</Text>
                  </View>
                  
                  {savings > 0 ? (
                    <Text style={styles.saveText}>Save ₹{savings} at local shop</Text>
                  ) : (
                    <Text style={styles.saveText}>Verified Local Deal</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#16A34A',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  card: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 2,
  },
  savingsPct: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  vendorIconOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 2,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  comparisonContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  onlinePrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  offlinePrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#16A34A',
  },
  saveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
    textAlign: 'center',
    marginTop: 8,
    textTransform: 'uppercase',
  },
});

export default MegaSavingsSection;
