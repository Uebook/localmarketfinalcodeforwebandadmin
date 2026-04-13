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
  onLocationRedetect,
  notificationCount = 2
}) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleManualLocationSelect = (location) => {
    // We could pass this up, but for now we'll just close it
    // Wait, the parent needs to know! Since Header didn't originally receive an onLocationSelect,
    // we should see if we can trigger something or if the parent reload will fetch from storage.
    // Let's pass it up if we can, else just redetect. We'll add onLocationSelect to props.
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        {/* Content */}
        <View style={styles.headerContent}>
          {/* Left: Hamburger & Brand */}
          <View style={styles.leftSection}>
            <TouchableOpacity
              onPress={onMenuClick}
              style={styles.menuButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name={getIconName('Menu')} size={26} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => onLocationRedetect && onLocationRedetect()}
              activeOpacity={0.8}
              style={styles.logoWrapper}
            >
              <Logo size={34} />
            </TouchableOpacity>
          </View>

          {/* Center: Location */}
          <View style={styles.centerSection}>
            <TouchableOpacity
              style={styles.locationButton}
              activeOpacity={0.7}
              onPress={() => setShowLocationModal(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.locationIconBg}>
                <Icon name={getIconName('MapPin')} size={12} color={COLORS.orange} />
              </View>
              <View style={styles.locationTextBlock}>
                <Text style={styles.locationCity} numberOfLines={1}>
                  {locationState.loading
                    ? 'Detecting...'
                    : (locationState.displayLabel || 'Your Area')}
                </Text>
                <Text style={styles.locationArea} numberOfLines={1}>
                  {locationState.loading 
                    ? 'Searching...' 
                    : (locationState.city || 'Tap to Select')}
                </Text>
              </View>
              <Icon name={getIconName('ChevronDown')} size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Right: Actions */}
          <View style={styles.rightSection}>
            <TouchableOpacity
              onPress={onNotificationClick}
              style={styles.notificationButton}
              activeOpacity={0.7}
            >
              <Icon name={getIconName('Bell')} size={22} color={COLORS.textPrimary} />
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
                <Icon name={getIconName('User')} size={20} color={COLORS.textPrimary} />
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
           // Provide a way to inform the parent component that a manual location was picked
           if (onLocationRedetect) {
             // For now we just trigger redetect as a fallback, 
             // but ideally the parent needs an onManualLocationSelect handler
             // Let's call the redetect trigger, but later this can be expanded.
             onLocationRedetect(loc);
           }
        }}
      />
    </SafeAreaView>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.white,
  },
  header: {
    height: 70,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
    gap: 8,
  },
  menuButton: {
    padding: 6,
    marginRight: 2,
  },
  logoWrapper: {
    padding: 2,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    maxWidth: '100%',
  },
  locationIconBg: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  locationTextBlock: {
    flexDirection: 'column',
    marginRight: 6,
    maxWidth: 100,
  },
  locationCity: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '800',
    lineHeight: 14,
  },
  locationArea: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    lineHeight: 11,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: COLORS.orange,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  profileButton: {
    padding: 2,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  profileIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
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




