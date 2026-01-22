import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';

const Sidebar = ({ isOpen, onClose, onNavigate, userRole = 'customer', userName = 'Guest User', userLocation = 'Delhi, India' }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [expandedSections, setExpandedSections] = useState({
    'app-menu': true,
    'vendor-controls': true,
    'support-legal': true,
    'partners-menu': true,
    'add-new-sub': false,
  });

  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNav = (tab) => {
    console.log('Sidebar handleNav called with tab:', tab);
    if (onNavigate) {
      onNavigate(tab);
    } else {
      console.warn('onNavigate not provided to Sidebar');
    }
    if (tab !== 'logout') {
      onClose();
    }
  };

  const MenuItem = ({ iconName, label, onPress, highlight = false, expandable = false, isExpanded = false, className }) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        highlight && styles.menuItemHighlight,
        className && styles.menuItemSub
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Icon 
          name={getIconName(iconName) || iconName} 
          size={18} 
          color={highlight ? COLORS.danger : COLORS.textSecondary} 
        />
        <Text style={[styles.menuItemText, highlight && styles.menuItemTextHighlight]}>
          {label}
        </Text>
      </View>
      {expandable && (
        <Icon
          name={isExpanded ? getIconName('ChevronDown') : getIconName('ChevronDown')}
          size={16}
          color={highlight ? '#ec4899' : '#9ca3af'}
          style={[styles.chevronIcon, isExpanded && styles.chevronIconExpanded]}
        />
      )}
    </TouchableOpacity>
  );

  const CollapsibleSection = ({ title, isOpen: sectionOpen, onToggle, children }) => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={onToggle} 
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
        <Icon
          name={getIconName('ChevronDown')}
          size={16}
          color="#9ca3af"
          style={[styles.sectionChevron, sectionOpen && styles.sectionChevronExpanded]}
        />
      </TouchableOpacity>
      {sectionOpen && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            {/* Header with Gradient */}
            <View style={styles.header}>
              {/* Gradient Background */}
              <LinearGradient
                colors={COLORS.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBackground}
              />

              {/* Header Content */}
              <View style={styles.headerContent}>
                {/* Close Button - Top Right */}
                <TouchableOpacity 
                  onPress={onClose} 
                  style={styles.closeButton} 
                  activeOpacity={0.7}
                >
                  <Icon name={getIconName('X')} size={18} color={COLORS.white} />
                </TouchableOpacity>

                {/* User Info Section */}
                <View style={styles.userInfo}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Icon
                        name={userRole === 'vendor' ? getIconName('Store') : getIconName('User')}
                        size={40}
                        color={userRole === 'vendor' ? COLORS.danger : COLORS.textMuted}
                      />
                    </View>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                    {userRole === 'vendor' && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Local+ Account</Text>
                      </View>
                    )}
                    <View style={styles.locationRow}>
                      <Icon name={getIconName('MapPin')} size={14} color="#ffffff" />
                      <Text style={styles.userLocation} numberOfLines={1}>{userLocation}</Text>
                    </View>
                  </View>
                </View>

                {/* View Profile Button - Bottom */}
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() => handleNav('settings')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.profileButtonText}>View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu Content */}
            <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
              {userRole !== 'vendor' && (
                <>
                  <CollapsibleSection
                    title="App Menu"
                    isOpen={expandedSections['app-menu']}
                    onToggle={() => toggleSection('app-menu')}
                  >
                    <MenuItem iconName="Home" label="Home" onPress={() => handleNav('home')} />
                    <MenuItem iconName="Grid" label="Categories" onPress={() => handleNav('categories')} />
                    <MenuItem iconName="Bookmark" label="Saved Items" onPress={() => handleNav('saved')} />
                  </CollapsibleSection>

                  <View style={styles.divider} />

                  <CollapsibleSection
                    title="Partners"
                    isOpen={expandedSections['partners-menu']}
                    onToggle={() => toggleSection('partners-menu')}
                  >
                    <MenuItem
                      iconName="Briefcase"
                      label="Partner with us"
                      onPress={() => handleNav('register-business')}
                      highlight
                    />
                    <MenuItem
                      iconName="HelpCircle"
                      label="Help & Support"
                      onPress={() => handleNav('help')}
                    />
                  </CollapsibleSection>

                  <View style={styles.divider} />
                </>
              )}

              {userRole === 'vendor' && (
                <>
                  <CollapsibleSection
                    title="Local+ Controls"
                    isOpen={expandedSections['vendor-controls']}
                    onToggle={() => toggleSection('vendor-controls')}
                  >
                    <MenuItem
                      iconName="Activity"
                      label="Analytics & Overview"
                      onPress={() => handleNav('business-analytics')}
                    />
                    <MenuItem
                      iconName="Plus"
                      label="Add New Item"
                      onPress={() => toggleSection('add-new-sub')}
                      highlight
                      expandable
                      isExpanded={expandedSections['add-new-sub']}
                    />
                    {expandedSections['add-new-sub'] && (
                      <View style={styles.subMenu}>
                        <MenuItem
                          iconName="Package"
                          label="Add Product"
                          onPress={() => handleNav('business-add-product')}
                          className="sub"
                        />
                        <MenuItem
                          iconName="Settings"
                          label="Add Service"
                          onPress={() => handleNav('business-add-service')}
                          className="sub"
                        />
                      </View>
                    )}
                    <MenuItem
                      iconName="Package"
                      label="Manage Catalog"
                      onPress={() => handleNav('business-products')}
                    />
                    <MenuItem
                      iconName="Tag"
                      label="Manage Offers"
                      onPress={() => handleNav('business-offers')}
                    />
                    <MenuItem
                      iconName="MessageSquare"
                      label="Enquiries"
                      onPress={() => handleNav('business-enquiries')}
                    />
                    <MenuItem
                      iconName="Store"
                      label="Business Details"
                      onPress={() => handleNav('business-details')}
                    />
                    <MenuItem
                      iconName="CreditCard"
                      label="Payment & Subscription"
                      onPress={() => handleNav('payment-management')}
                    />
                    <MenuItem
                      iconName="TrendingUp"
                      label="Grow Your Business"
                      onPress={() => handleNav('business-analytics')}
                    />
                  </CollapsibleSection>

                  <View style={styles.divider} />
                </>
              )}

              <CollapsibleSection
                title="Settings & Legal"
                isOpen={expandedSections['support-legal']}
                onToggle={() => toggleSection('support-legal')}
              >
                <MenuItem iconName="Settings" label="Settings" onPress={() => handleNav('settings')} />
                <MenuItem iconName="FileText" label="Terms & Privacy" onPress={() => handleNav('terms')} />
              </CollapsibleSection>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => handleNav('logout')}
                activeOpacity={0.7}
              >
                <Icon name={getIconName('LogOut')} size={20} color="#dc2626" />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: '85%',
    maxWidth: 300,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    position: 'relative',
    padding: 24,
    paddingTop: 40,
    overflow: 'hidden',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
    paddingTop: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 20,
    marginTop: 8,
  },
  avatarContainer: {
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6', // Light grey background
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db', // Grey border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userLocation: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '500',
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    marginTop: 8,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  menuContent: {
    flex: 1,
    paddingVertical: 8,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  sectionChevron: {
    transform: [{ rotate: '0deg' }],
  },
  sectionChevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  sectionContent: {
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemHighlight: {
    backgroundColor: COLORS.highlightBg,
    borderLeftColor: COLORS.danger,
  },
  menuItemSub: {
    marginLeft: 24,
    paddingLeft: 16,
    backgroundColor: 'transparent',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  menuItemTextHighlight: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronIconExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  subMenu: {
    backgroundColor: 'transparent',
    marginLeft: 24,
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 24,
    marginVertical: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
});

export default Sidebar;


