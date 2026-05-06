import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const DEALS = [
       { id: 1, name: 'Cooking Oil 1L', price: '₹160', shop: 'Singh Mart', distance: '800m', savings: '₹15 off', icon: 'droplet' },
       { id: 2, name: 'Surf Excel 500g', price: '₹185', shop: 'Gupta Store', distance: '1.1 km', savings: '₹20 off', icon: 'feather' },
       { id: 3, name: 'Basmati Rice 5kg', price: '₹520', shop: 'Sharma Foods', distance: '600m', savings: '₹30 off', icon: 'package' },
       { id: 4, name: 'Milk 1L', price: '₹56', shop: 'Gupta Dairy', distance: '400m', savings: '₹4 off', icon: 'coffee' },
       { id: 5, name: 'Shampoo 200ml', price: '₹95', shop: 'Beauty Hub', distance: '900m', savings: '₹15 off', icon: 'star' },
];

const TodayDeals = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DEALS.map((deal) => (
          <TouchableOpacity
            key={deal.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation && navigation.navigate('SearchResults', { query: deal.name })}
          >
            <View style={styles.cardTop}>
              <View style={styles.iconBg}>
                <Icon name={deal.icon} size={18} color="#FF6B00" />
              </View>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>{deal.savings}</Text>
              </View>
            </View>
            <Text style={styles.dealName} numberOfLines={2}>{deal.name}</Text>
            <Text style={styles.price}>{deal.price}</Text>
            <View style={styles.footer}>
              <Text style={styles.shopName} numberOfLines={1}>{deal.shop}</Text>
              <View style={styles.distanceBadge}>
                <Icon name="map-pin" size={9} color="#94A3B8" />
                <Text style={styles.distanceText}> {deal.distance}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  card: {
    width: 160,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginRight: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  savingsText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#16A34A',
    textTransform: 'uppercase',
  },
  dealName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 18,
    height: 36,
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6B00',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  shopName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    flex: 1,
    marginRight: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
  },
});

export default TodayDeals;
