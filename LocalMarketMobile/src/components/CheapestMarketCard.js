import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';

const CheapestMarketCard = ({ navigation }) => {
       const COLORS = useThemeColors();

       return (
              <TouchableOpacity
                     style={styles.wrapper}
                     activeOpacity={0.88}
                     onPress={() => navigation && navigation.navigate('SearchResults', { query: 'Hall Bazaar' })}
              >
                     <LinearGradient
                            colors={['#FF6B00', '#FF9D3B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.card}
                     >
                            {/* Left Content */}
                            <View style={styles.content}>
                                   <View style={styles.badgeRow}>
                                          <View style={styles.liveDot} />
                                          <Text style={styles.badgeText}>TODAY'S CHEAPEST MARKET</Text>
                                   </View>
                                   <Text style={styles.marketName}>Hall Bazaar</Text>
                                   <Text style={styles.savingsText}>
                                          <Text style={styles.highlight}>8% cheaper</Text> than nearby markets
                                   </Text>
                                   <View style={styles.ctaRow}>
                                          <Text style={styles.ctaText}>Explore Deals</Text>
                                          <Icon name="arrow-right" size={14} color="#FFF" style={{ marginLeft: 4 }} />
                                   </View>
                            </View>

                            {/* Right Decoration */}
                            <View style={styles.rightDecor}>
                                   <View style={styles.bigCircle} />
                                   <View style={styles.smallCircle} />
                                   <View style={styles.tagContainer}>
                                          <Icon name="tag" size={36} color="rgba(255,255,255,0.25)" />
                                   </View>
                            </View>
                     </LinearGradient>
              </TouchableOpacity>
       );
};

const styles = StyleSheet.create({
       wrapper: {
              marginHorizontal: 16,
              marginTop: 12,
              marginBottom: 4,
              borderRadius: 20,
              shadowColor: '#FF6B00',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 8,
       },
       card: {
              borderRadius: 20,
              paddingVertical: 20,
              paddingHorizontal: 20,
              flexDirection: 'row',
              alignItems: 'center',
              overflow: 'hidden',
       },
       content: {
              flex: 1,
       },
       badgeRow: {
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 6,
       },
       liveDot: {
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: '#FFF',
              marginRight: 6,
              opacity: 0.9,
       },
       badgeText: {
              fontSize: 9,
              fontWeight: '800',
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: 1,
              textTransform: 'uppercase',
       },
       marketName: {
              fontSize: 26,
              fontWeight: '900',
              color: '#FFF',
              letterSpacing: -0.5,
              marginBottom: 4,
       },
       savingsText: {
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              fontWeight: '500',
              marginBottom: 12,
       },
       highlight: {
              fontWeight: '800',
              color: '#FFF',
       },
       ctaRow: {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
       },
       ctaText: {
              fontSize: 12,
              fontWeight: '700',
              color: '#FFF',
       },
       rightDecor: {
              width: 90,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: 90,
       },
       bigCircle: {
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(255,255,255,0.12)',
              right: -10,
              top: 5,
       },
       smallCircle: {
              position: 'absolute',
              width: 45,
              height: 45,
              borderRadius: 23,
              backgroundColor: 'rgba(255,255,255,0.08)',
              right: 15,
              top: -15,
       },
       tagContainer: {
              position: 'absolute',
              right: 8,
              top: 15,
       },
});

export default CheapestMarketCard;
