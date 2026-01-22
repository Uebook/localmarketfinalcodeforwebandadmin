import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';

// Initialize Geocoder
let Geocoder;
try {
  Geocoder = require('react-native-geocoding');
  Geocoder.init('AIzaSyAonK15hotzDslX4ePjIbmizRii-7Ng4QE');
} catch (error) {
  console.warn('react-native-geocoding not installed. Map features may be limited.');
}

const MapView = ({ address, latitude, longitude, businessName }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (latitude && longitude) {
      // Use provided coordinates
      setCoordinates({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
      setLoading(false);
    } else if (address && Geocoder) {
      // Geocode address to get coordinates
      geocodeAddress();
    } else {
      setLoading(false);
    }
  }, [address, latitude, longitude]);

  const geocodeAddress = async () => {
    try {
      setLoading(true);
      const response = await Geocoder.from(address);
      if (response && response.results && response.results.length > 0) {
        const location = response.results[0].geometry.location;
        setCoordinates({
          latitude: location.lat,
          longitude: location.lng,
        });
        setError(null);
      } else {
        setError('Location not found');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Unable to find location');
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = () => {
    if (coordinates) {
      const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Unable to open maps');
      });
    } else if (address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Unable to open maps');
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.orange} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </View>
    );
  }

  if (error || !coordinates) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name={getIconName('MapPin')} size={48} color={COLORS.textMuted} />
          <Text style={styles.errorText}>
            {error || 'Map location not available'}
          </Text>
          {address && (
            <TouchableOpacity
              style={styles.openMapsButton}
              onPress={openInMaps}
              activeOpacity={0.7}
            >
              <Icon name={getIconName('MapPin')} size={16} color={COLORS.white} />
              <Text style={styles.openMapsText}>Open in Maps</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // For now, show a placeholder with open in maps button
  // In production, you would use react-native-maps here
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Icon name={getIconName('MapPin')} size={64} color={COLORS.orange} />
        <Text style={styles.mapTitle}>{businessName || 'Location'}</Text>
        {address && (
          <Text style={styles.mapAddress}>{address}</Text>
        )}
        <TouchableOpacity
          style={styles.openMapsButton}
          onPress={openInMaps}
          activeOpacity={0.7}
        >
          <Icon name={getIconName('MapPin')} size={16} color={COLORS.white} />
          <Text style={styles.openMapsText}>Open in Google Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: COLORS.backgroundSoft || '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  mapAddress: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  openMapsText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  errorContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSoft || '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default MapView;
