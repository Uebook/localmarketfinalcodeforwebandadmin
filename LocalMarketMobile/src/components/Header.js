import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { COLORS } from '../constants/colors';

const Header = ({ 
  locationState, 
  onMenuClick, 
  onProfileClick,
  onNotificationClick,
  notificationCount = 2
}) => {
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
              <Text style={styles.brandTitle}>LOCAL</Text>
              <TouchableOpacity style={styles.locationButton} activeOpacity={0.7}>
                <Icon name={getIconName('MapPin')} size={12} color={COLORS.white} style={styles.locationIcon} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {locationState.loading
                    ? 'Detecting...'
                    : locationState.error
                    ? 'Select Location'
                    : locationState.city || 'Delhi, India'}
                </Text>
                <Icon name={getIconName('ChevronDown')} size={12} color={COLORS.white} style={styles.chevronIcon} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500',
    maxWidth: 120,
  },
  chevronIcon: {
    marginLeft: 2,
    opacity: 0.8,
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
});

export default Header;




