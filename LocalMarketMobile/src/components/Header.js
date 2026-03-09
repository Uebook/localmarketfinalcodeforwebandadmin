import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';

const Header = ({
  locationState,
  onMenuClick,
  onProfileClick,
  onNotificationClick,
  onLocationRedetect,
  notificationCount = 2
}) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [showLocationModal, setShowLocationModal] = useState(false);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        {/* Gradient Background */}
        <LinearGradient
          colors={COLORS.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBackground}
        />
        {/* Content */}
        <View style={styles.headerContent}>
          {/* Left: Hamburger & Brand */}
          <View style={styles.leftSection}>
            <TouchableOpacity
              onPress={onMenuClick}
              style={styles.menuButton}
              activeOpacity={0.7}
            >
              <Icon name={getIconName('Menu')} size={28} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.brandSection}>
              <Text style={styles.brandTitle}>LOKALL</Text>
              <TouchableOpacity
                style={styles.locationButton}
                activeOpacity={0.7}
                onPress={() => setShowLocationModal(true)}
              >
                <Icon name={getIconName('MapPin')} size={11} color='rgba(255,255,255,0.8)' style={styles.locationIcon} />
                <View style={styles.locationTextBlock}>
                  <Text style={styles.locationCity} numberOfLines={1}>
                    {locationState.loading
                      ? 'Detecting...'
                      : locationState.error
                        ? 'Select Location'
                        : (locationState.fullAddress
                          ? locationState.fullAddress.split(',')[0]
                          : locationState.city) || 'Your City'}
                  </Text>
                  <Text style={styles.locationArea} numberOfLines={1}>
                    {locationState.loading ? '' : locationState.city || 'Tap to change'}
                  </Text>
                </View>
                <View style={styles.changeLocationBtn}>
                  <Text style={styles.changeLocationText}>Change</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right: Actions */}
          <View style={styles.rightSection}>
            <TouchableOpacity
              onPress={onNotificationClick}
              style={styles.notificationButton}
              activeOpacity={0.7}
            >
              <Icon name={getIconName('Bell')} size={24} color={COLORS.white} />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onProfileClick}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <View style={styles.profileIconContainer}>
                <Icon name={getIconName('User')} size={20} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Location Details Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLocationModal(false)}
        >
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Icon name={getIconName('MapPin')} size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Current Location</Text>
                <Text style={styles.modalSubtitle}>Detected Address</Text>
              </View>
            </View>

            <View style={styles.addressBox}>
              <Text style={styles.fullAddressText}>
                {locationState.fullAddress || locationState.city || 'No location detected yet'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.redetectButton}
              onPress={() => {
                setShowLocationModal(false);
                if (onLocationRedetect) onLocationRedetect();
              }}
              activeOpacity={0.8}
            >
              <Icon name={getIconName('Zap')} size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.redetectText}>Re-detect Location</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    height: 64,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: '100%',
    position: 'relative',
    zIndex: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuButton: {
    padding: 4,
  },
  brandSection: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1.5,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationIcon: {
    marginRight: 2,
  },
  locationTextBlock: {
    flexDirection: 'column',
    maxWidth: 130,
  },
  locationCity: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '700',
    lineHeight: 16,
  },
  locationArea: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    lineHeight: 13,
  },
  changeLocationBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  changeLocationText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    backgroundColor: COLORS.orange,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileButton: {
    padding: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    paddingTop: 85, // Roughly below header
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fullAddressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  redetectButton: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  redetectText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default Header;




