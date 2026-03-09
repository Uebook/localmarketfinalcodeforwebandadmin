import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

const FindCheapestButton = ({ navigation }) => {
       const scaleAnim = useRef(new Animated.Value(1)).current;

       const onPressIn = () => {
              Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
       };
       const onPressOut = () => {
              Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
       };

       const handlePress = () => {
              if (navigation) {
                     navigation.navigate('SearchResults', { query: 'cheapest', sortBy: 'price_asc' });
              }
       };

       return (
              <View style={styles.wrapper}>
                     <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <TouchableOpacity
                                   activeOpacity={1}
                                   onPressIn={onPressIn}
                                   onPressOut={onPressOut}
                                   onPress={handlePress}
                            >
                                   <LinearGradient
                                          colors={['#0F172A', '#1E293B']}
                                          start={{ x: 0, y: 0 }}
                                          end={{ x: 1, y: 0 }}
                                          style={styles.button}
                                   >
                                          <View style={styles.iconBg}>
                                                 <Icon name="tag" size={20} color="#FF6B00" />
                                          </View>
                                          <View style={styles.textBlock}>
                                                 <Text style={styles.mainText}>Find Cheapest Items Near Me</Text>
                                                 <Text style={styles.subText}>Compare prices across local shops instantly</Text>
                                          </View>
                                          <View style={styles.arrowBg}>
                                                 <Icon name="chevron-right" size={18} color="#FF6B00" />
                                          </View>
                                   </LinearGradient>
                            </TouchableOpacity>
                     </Animated.View>
              </View>
       );
};

const styles = StyleSheet.create({
       wrapper: {
              marginHorizontal: 16,
              marginVertical: 8,
              borderRadius: 16,
              shadowColor: '#0F172A',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 6,
       },
       button: {
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
       },
       iconBg: {
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: 'rgba(255,107,0,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
       },
       textBlock: {
              flex: 1,
       },
       mainText: {
              fontSize: 15,
              fontWeight: '800',
              color: '#FFF',
              marginBottom: 2,
              letterSpacing: 0.1,
       },
       subText: {
              fontSize: 11,
              color: 'rgba(255,255,255,0.55)',
              fontWeight: '500',
       },
       arrowBg: {
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: 'rgba(255,107,0,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 12,
       },
});

export default FindCheapestButton;
