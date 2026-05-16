import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import ImageWithFallback from './ImageWithFallback';

const TodayDeals = ({ navigation, data = [] }) => {
  const safeData = Array.isArray(data) ? data : [];
  if (safeData.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {safeData.map((item) => {
          const savings = (item.mrp || 0) - (item.price || 0);
          const vendorData = item.vendors || item.vendor || item;
          const imageUrl = (vendorData && (vendorData.profile_image_url || vendorData.profileImageUrl)) || item.image_url || item.imageUrl || (vendorData && (vendorData.image_url || vendorData.imageUrl));

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => {
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
              <View style={styles.imageContainer}>
                {imageUrl ? (
                  <ImageWithFallback 
                    source={{ uri: imageUrl }} 
                    style={styles.cardImage} 
                  />
                ) : (
                  <View style={styles.placeholderBox}>
                    <Icon name={item.type === 'service' ? 'tool' : 'package'} size={24} color="#CBD5E1" />
                  </View>
                )}
                {savings > 0 && (
                  <View style={styles.badgeOverlay}>
                    <Text style={styles.badgeText}>₹{savings} OFF</Text>
                  </View>
                )}
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.dealName} numberOfLines={1}>{item.name}</Text>
                
                <View style={styles.cardFooter}>
                  <View style={styles.shopRow}>
                    <Icon name="shopping-bag" size={10} color="#64748B" />
                    <Text style={styles.shopName} numberOfLines={1}>
                      {vendorData.shop_name || vendorData.name || 'Local Shop'}
                    </Text>
                  </View>
                  <View style={styles.locationRow}>
                    <Icon name="map-pin" size={10} color="#3B82F6" />
                    <Text style={styles.locationText}>{vendorData.city || 'Nearby'}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
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
    paddingBottom: 16,
  },
  card: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholderBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  infoBox: {
    padding: 12,
  },
  dealName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 4,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 4,
  },
});

export default TodayDeals;
