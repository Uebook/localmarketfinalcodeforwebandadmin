import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const PriceDropAlerts = ({ data = [] }) => {
  const navigation = useNavigation();
  const safeData = Array.isArray(data) ? data : [];
  if (safeData.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>📉</Text>
          <Text style={styles.title}>Price Drops</Text>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Recent price reductions in your area</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {safeData.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => {
              const vendorData = item.vendors || item.vendor || item;
              navigation.navigate('VendorDetails', { 
                business: {
                  ...vendorData,
                  id: vendorData.id || item.vendor_id || item.vendorId,
                  name: vendorData.name || vendorData.shop_name || item.vendor_name || item.shop_name,
                  shop_name: vendorData.name || vendorData.shop_name || item.vendor_name || item.shop_name
                },
                highlightProductId: item.id
              });
            }}
          >
            <View style={styles.dropBadge}>
              <Icon name="trending-down" size={11} color="#DC2626" />
              <Text style={styles.dropPct}> {item.pct || 'Sale'}</Text>
            </View>

            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.oldPrice}>₹{item.old || item.mrp}</Text>
              <Icon name="arrow-right" size={12} color="#94A3B8" style={styles.arrow} />
              <Text style={styles.newPrice}>₹{item.new || item.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
       container: {
              marginTop: 8,
              marginBottom: 16,
       },
       header: {
              paddingHorizontal: 16,
              marginBottom: 12,
       },
       titleRow: {
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 2,
       },
       emoji: {
              fontSize: 16,
              marginRight: 6,
       },
       title: {
              fontSize: 18,
              fontWeight: '800',
              color: '#0F172A',
              letterSpacing: -0.3,
              marginRight: 8,
       },
       newBadge: {
              backgroundColor: '#FEE2E2',
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
       },
       newBadgeText: {
              fontSize: 9,
              fontWeight: '900',
              color: '#DC2626',
              letterSpacing: 0.5,
       },
       subtitle: {
              fontSize: 12,
              color: '#94A3B8',
              fontWeight: '500',
       },
       scrollContent: {
              paddingHorizontal: 16,
              flexDirection: 'row',
              paddingBottom: 4,
       },
       card: {
              width: 148,
              backgroundColor: '#FFF',
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: '#FEE2E2',
              shadowColor: '#DC2626',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
              marginRight: 12,
       },
       dropBadge: {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FEF2F2',
              alignSelf: 'flex-start',
              borderRadius: 8,
              paddingHorizontal: 7,
              paddingVertical: 3,
              marginBottom: 10,
       },
       dropPct: {
              fontSize: 11,
              fontWeight: '800',
              color: '#DC2626',
       },
       productName: {
              fontSize: 13,
              fontWeight: '700',
              color: '#0F172A',
              lineHeight: 18,
              marginBottom: 10,
       },
       priceRow: {
              flexDirection: 'row',
              alignItems: 'center',
       },
       oldPrice: {
              fontSize: 13,
              fontWeight: '600',
              color: '#94A3B8',
              textDecorationLine: 'line-through',
       },
       arrow: {
              marginHorizontal: 4,
       },
       newPrice: {
              fontSize: 16,
              fontWeight: '900',
              color: '#16A34A',
              letterSpacing: -0.3,
       },
});

export default PriceDropAlerts;
