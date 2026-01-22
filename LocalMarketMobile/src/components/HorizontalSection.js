import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';

const HorizontalSection = ({ title, items, onItemClick, containerClass, isCircular = false }) => {
  const isBeautySpa = title.toLowerCase().includes('beauty') || title.toLowerCase().includes('spa');
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title.toUpperCase()}</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => onItemClick && onItemClick(item.name)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.imageContainer,
              (isCircular || isBeautySpa) && styles.circularImageContainer
            ]}>
              <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A', // Dark text for white background
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.9,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  item: {
    width: 96,
    alignItems: 'center',
  },
  imageContainer: {
    width: 96,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  circularImageContainer: {
    borderRadius: 48, // Make it circular
    width: 96,
    height: 96,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A', // Dark text for white background
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default HorizontalSection;




