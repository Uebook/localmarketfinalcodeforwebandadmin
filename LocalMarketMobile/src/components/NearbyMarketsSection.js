import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

const MARKETS = [
       { id: 1, name: 'Hall Bazaar', shops: '200+', icon: 'shopping-bag', color: ['#FF6B00', '#FF9D3B'] },
       { id: 2, name: 'Lawrence Road', shops: '150+', icon: 'map-pin', color: ['#6366F1', '#8B5CF6'] },
       { id: 3, name: 'Putligarh', shops: '100+', icon: 'home', color: ['#10B981', '#34D399'] },
       { id: 4, name: 'Katra Jaimal Singh', shops: '180+', icon: 'star', color: ['#F59E0B', '#FBBF24'] },
       { id: 5, name: 'Novelty Chowk', shops: '120+', icon: 'truck', color: ['#EF4444', '#F87171'] },
       { id: 6, name: 'Ranjit Avenue', shops: '90+', icon: 'coffee', color: ['#3B82F6', '#60A5FA'] },
];

const NearbyMarketsSection = ({ navigation }) => {
       const handleMarketPress = (market) => {
              if (navigation) {
                     navigation.navigate('SearchResults', { query: market.name });
              }
       };

       return (
              <View style={styles.container}>
                     <View style={styles.header}>
                            <View style={styles.titleRow}>
                                   <Text style={styles.mapEmoji}>🏛️</Text>
                                   <Text style={styles.title}>Nearby Markets</Text>
                            </View>
                            <Text style={styles.subtitle}>Tap a market to see all shops inside</Text>
                     </View>

                     <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                     >
                            {MARKETS.map((market) => (
                                   <TouchableOpacity
                                          key={market.id}
                                          style={styles.card}
                                          onPress={() => handleMarketPress(market)}
                                          activeOpacity={0.85}
                                   >
                                          <LinearGradient
                                                 colors={market.color}
                                                 start={{ x: 0, y: 0 }}
                                                 end={{ x: 1, y: 1 }}
                                                 style={styles.iconBg}
                                          >
                                                 <Icon name={market.icon} size={22} color="#FFF" />
                                          </LinearGradient>
                                          <Text style={styles.marketName} numberOfLines={2}>{market.name}</Text>
                                          <View style={styles.shopsRow}>
                                                 <Icon name="shopping-bag" size={11} color="#94A3B8" />
                                                 <Text style={styles.shopsText}>  {market.shops} shops</Text>
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
              marginBottom: 4,
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
       mapEmoji: {
              fontSize: 16,
              marginRight: 6,
       },
       title: {
              fontSize: 18,
              fontWeight: '800',
              color: '#0F172A',
              letterSpacing: -0.3,
       },
       subtitle: {
              fontSize: 12,
              color: '#94A3B8',
              fontWeight: '500',
       },
       scrollContent: {
              paddingHorizontal: 16,
              paddingRight: 16,
              flexDirection: 'row',
       },
       card: {
              width: 110,
              backgroundColor: '#FFF',
              borderRadius: 16,
              padding: 14,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#F1F5F9',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 6,
              elevation: 2,
              marginRight: 12,
       },
       iconBg: {
              width: 52,
              height: 52,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
       },
       marketName: {
              fontSize: 12,
              fontWeight: '700',
              color: '#0F172A',
              textAlign: 'center',
              marginBottom: 6,
              lineHeight: 16,
       },
       shopsRow: {
              flexDirection: 'row',
              alignItems: 'center',
       },
       shopsText: {
              fontSize: 10,
              color: '#94A3B8',
              fontWeight: '600',
       },
});

export default NearbyMarketsSection;
