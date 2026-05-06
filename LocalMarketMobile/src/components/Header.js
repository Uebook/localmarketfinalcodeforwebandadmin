import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import LocationPicker from './LocationPicker';
import Logo from './Logo';

const Header = ({
  locationState,
  onMenuClick,
  onProfileClick,
  onNotificationClick,
  onLocationChange,
  notificationCount = 2,
  transparent = false
}) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS, transparent);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const iconColor = transparent ? COLORS.white : COLORS.textPrimary;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Left: Drawer */}
          <View style={styles.leftSection}>
            <TouchableOpacity
              onPress={onMenuClick}
              style={styles.menuButton}
              activeOpacity={0.7}
            >
              <Icon name="menu" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Center: Location */}
          <View style={styles.centerSection}>
            <TouchableOpacity
              style={styles.locationButton}
              activeOpacity={0.7}
              onPress={() => setShowLocationModal(true)}
            >
              <Icon name="map-pin" size={16} color={COLORS.orange} />
              <View style={styles.locationTextBlock}>
                <Text style={styles.locationCity} numberOfLines={1}>
                  {locationState.loading
                    ? 'Detecting...'
                    : (locationState.circle || locationState.town || locationState.city || locationState.displayLabel || 'Pick Location')}
                </Text>
              </View>
              <Icon name="chevron-down" size={12} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Right: Actions */}
          <View style={styles.rightSection}>
            <TouchableOpacity
              onPress={onNotificationClick}
              style={styles.notificationButton}
              activeOpacity={0.7}
            >
              <Icon name="bell" size={24} color={iconColor} />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onProfileClick}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <Icon name="user" size={22} color={iconColor} />
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
                if (onLocationChange) onLocationChange();
              }}
              activeOpacity={0.8}
            >
              <Icon name={getIconName('Zap')} size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.redetectText}>Re-detect Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manualSelectButton}
              onPress={() => {
                setShowLocationModal(false);
                setShowLocationPicker(true);
              }}
              activeOpacity={0.8}
            >
              <Icon name={getIconName('Map')} size={14} color={COLORS.orange} style={{ marginRight: 6 }} />
              <Text style={styles.manualSelectText}>Choose Location Manually</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <LocationPicker
        visible={showLocationPicker}
        initialLocation={{
          state: locationState?.state,
          city: locationState?.city,
          circle: locationState?.circle
        }}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(loc) => {
           if (onLocationChange) {
             onLocationChange(loc);
           }
        }}
      />
    </SafeAreaView>
  );
};

const createStyles = (COLORS, transparent) => StyleSheet.create({
  safeArea: {
    backgroundColor: transparent ? 'transparent' : COLORS.white,
  },
  header: {
    height: 64,
    backgroundColor: transparent ? 'transparent' : COLORS.white,
    borderBottomWidth: transparent ? 0 : 1,
    borderBottomColor: '#F1F5F9',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: transparent ? 0 : 0.05,
    shadowRadius: 10,
    elevation: transparent ? 0 : 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  locationTextBlock: {
    marginHorizontal: 6,
  },
  locationCity: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    backgroundColor: '#E86A2C',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 8,
    color: '#FFF',
    fontWeight: '900',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  redetectText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  manualSelectButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  manualSelectText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default Header;




