import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const POPULAR_ITEMS = [
       { label: 'Milk', icon: 'droplet' },
       { label: 'Cooking Oil', icon: 'wind' },
       { label: 'Rice', icon: 'package' },
       { label: 'Atta', icon: 'layers' },
       { label: 'Mobile Charger', icon: 'zap' },
       { label: 'Shampoo', icon: 'star' },
       { label: 'Gas Stove', icon: 'thermometer' },
       { label: 'Soap', icon: 'feather' },
];

const PopularSearches = ({ onSearchClick }) => {
       return (
              <View style={styles.container}>
                     <View style={styles.header}>
                            <View style={styles.titleRow}>
                                   <Text style={styles.fireEmoji}>🔥</Text>
                                   <Text style={styles.title}>Popular Today</Text>
                            </View>
                            <Text style={styles.subtitle}>What people are searching right now</Text>
                     </View>

                     <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chipsContainer}
                     >
                            {POPULAR_ITEMS.map((item, index) => (
                                   <TouchableOpacity
                                          key={index}
                                          style={styles.chip}
                                          onPress={() => onSearchClick && onSearchClick(item.label)}
                                          activeOpacity={0.75}
                                   >
                                          <Icon name={item.icon} size={14} color="#FF6B00" style={styles.chipIcon} />
                                          <Text style={styles.chipText}>{item.label}</Text>
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
              marginBottom: 10,
       },
       titleRow: {
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 2,
       },
       fireEmoji: {
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
       chipsContainer: {
              paddingHorizontal: 16,
              flexDirection: 'row',
       },
       chip: {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFF',
              borderRadius: 30,
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderWidth: 1.5,
              borderColor: '#E2E8F0',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
              marginRight: 8,
       },
       chipIcon: {
              marginRight: 6,
       },
       chipText: {
              fontSize: 13,
              fontWeight: '700',
              color: '#334155',
       },
});

export default PopularSearches;
