import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { COLORS } from '../constants/colors';
import FeedbackForm from './FeedbackForm';
import { FESTIVAL_THEMES } from '../constants/festivalThemes';

const SettingsScreen = ({ 
  navigation,
  currentTheme = 'default', 
  onThemeChange, 
  onBack, 
  userRole,
  profileData,
  onUpdateProfile,
  onLogout,
  onNavigateToBusiness
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (userRole === 'vendor') {
      setFormData({
        name: profileData?.ownerName || '',
        mobile: profileData?.contactNumber || '',
        location: profileData?.address || '',
        email: profileData?.email || '',
        photo: profileData?.ownerPhotoUrl || ''
      });
    } else {
      setFormData({
        name: profileData?.name || '',
        mobile: profileData?.mobile || '',
        location: profileData?.location || '',
        email: profileData?.email || '',
        photo: profileData?.profilePhotoUrl || ''
      });
    }
  }, [profileData, userRole]);

  const handleSave = () => {
    if (userRole === 'vendor') {
      onUpdateProfile({
        ...profileData,
        ownerName: formData.name,
        contactNumber: formData.mobile,
        address: formData.location,
        email: formData.email,
        ownerPhotoUrl: formData.photo
      });
    } else {
      onUpdateProfile({
        ...profileData,
        name: formData.name,
        mobile: formData.mobile,
        location: formData.location,
        email: formData.email,
        profilePhotoUrl: formData.photo
      });
    }
    setIsEditing(false);
  };

  const getDisplayImage = () => {
    if (formData.photo) return formData.photo;
    if (userRole === 'vendor') {
      return profileData?.ownerPhotoUrl || profileData?.imageUrl;
    } else {
      return profileData?.profilePhotoUrl;
    }
  };

  const displayImageUrl = getDisplayImage();

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  // Convert festival themes to app format
  const themes = Object.values(FESTIVAL_THEMES).map(theme => ({
    id: theme.id,
    name: theme.name,
    icon: theme.icon,
    description: theme.description,
    color: theme.colors.primary,
    secondaryColor: theme.colors.secondary,
    gradient: [theme.colors.primary, theme.colors.secondary],
  }));
  
  // Add default theme
  themes.unshift({
    id: 'default',
    name: 'Red & Orange (Default)',
    icon: '🎨',
    description: 'Default theme',
    color: COLORS.orange,
    secondaryColor: COLORS.blue,
    gradient: COLORS.primaryGradient,
  });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <Icon name={getIconName('ArrowLeft')} size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} activeOpacity={0.7}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton} activeOpacity={0.7}>
              <Icon name={getIconName('Edit')} size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={COLORS.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.profileHeader}
          >
            <View style={styles.profileImageContainer}>
              {displayImageUrl ? (
                <Image source={{ uri: displayImageUrl }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Icon name={getIconName('User')} size={40} color={COLORS.textMuted} />
                </View>
              )}
              {isEditing && (
                <TouchableOpacity style={styles.cameraButton} activeOpacity={0.7}>
                  <Icon name={getIconName('Camera')} size={12} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
          
          <View style={styles.profileInfo}>
            {!isEditing ? (
              <>
                <Text style={styles.profileName}>{formData.name || 'User'}</Text>
                <View style={styles.roleBadge}>
                  <Icon 
                    name={userRole === 'vendor' ? getIconName('Store') : getIconName('User')} 
                    size={12} 
                    color="#6b7280" 
                  />
                  <Text style={styles.roleText}>
                    {userRole === 'vendor' ? 'Local+ Account' : 'Customer Account'}
                  </Text>
                </View>
              </>
            ) : (
              <TextInput
                style={styles.nameInput}
                value={formData.name || ''}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Enter Name"
                placeholderTextColor="#9ca3af"
              />
            )}
          </View>

          {/* Personal Info Fields */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name={getIconName('Phone')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>MOBILE NUMBER</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={formData.mobile || ''}
                    onChangeText={(text) => setFormData({...formData, mobile: text})}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.infoValue}>{formData.mobile || '9876543210'}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name={getIconName('Mail')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={formData.email || ''}
                    onChangeText={(text) => setFormData({...formData, email: text})}
                    keyboardType="email-address"
                    placeholder="Add Email"
                    placeholderTextColor={COLORS.textMuted}
                  />
                ) : (
                  <Text style={styles.infoValue}>{formData.email || 'rahul.k@example.com'}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name={getIconName('MapPin')} size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>LOCATION</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={formData.location || ''}
                    onChangeText={(text) => setFormData({...formData, location: text})}
                  />
                ) : (
                  <Text style={styles.infoValue}>{formData.location || 'Connaught Place, Delhi'}</Text>
                )}
              </View>
            </View>
          </View>

          {userRole === 'vendor' && onNavigateToBusiness && (
            <TouchableOpacity 
              style={styles.businessButton}
              onPress={onNavigateToBusiness}
              activeOpacity={0.7}
            >
              <Icon name={getIconName('Store')} size={16} color="#dc2626" />
              <Text style={styles.businessButtonText}>Manage Business Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Feedback Section */}
        <View style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => setShowFeedbackForm(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingsItemLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: '#FFF4EC' }]}>
                <Icon name="message-circle" size={20} color={COLORS.orange} />
              </View>
              <View style={styles.settingsText}>
                <Text style={styles.settingsLabel}>Give Feedback</Text>
                <Text style={styles.settingsDescription}>Share your thoughts and suggestions</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Theme Settings */}
        <View style={styles.themeCard}>
          <View style={styles.themeHeader}>
            <Icon name={getIconName('Palette')} size={20} color={COLORS.textMuted} />
            <Text style={styles.themeTitle}>Festival Themes</Text>
          </View>
          
          <View style={styles.themeList}>
            {themes.map(theme => (
              <TouchableOpacity
                key={theme.id}
                onPress={() => onThemeChange && onThemeChange(theme.id)}
                style={[
                  styles.themeItem,
                  currentTheme === theme.id && styles.themeItemActive
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.themeItemContent}>
                  {theme.gradient ? (
                    <LinearGradient
                      colors={theme.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.themeColorCircle}
                    />
                  ) : (
                    <View style={[styles.themeColorCircle, { backgroundColor: theme.color }]} />
                  )}
                  <View style={styles.themeTextContainer}>
                    <Text style={[
                      styles.themeName,
                      currentTheme === theme.id && styles.themeNameActive
                    ]}>
                      {theme.icon} {theme.name}
                    </Text>
                    {theme.description && (
                      <Text style={styles.themeDescription}>{theme.description}</Text>
                    )}
                  </View>
                </View>
                {currentTheme === theme.id && (
                  <View style={styles.checkCircle}>
                    <Icon name={getIconName('Check')} size={12} color={COLORS.textPrimary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <Icon name={getIconName('LogOut')} size={18} color={COLORS.orange} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Info Section */}
        <View style={styles.appInfoCard}>
          <View style={styles.appIconContainer}>
            <View style={styles.appIconWrapper}>
              <Icon name="shopping-bag" size={48} color={COLORS.orange} />
              <View style={styles.appIconBadge}>
                <Icon name="check" size={14} color={COLORS.white} />
              </View>
            </View>
          </View>
          <Text style={styles.appName}>LOCAL</Text>
          <Text style={styles.appTagline}>Your City, Your Market</Text>
          <Text style={styles.versionText}>Version 1.0.3</Text>
        </View>
      </ScrollView>

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <FeedbackForm
          navigation={navigation}
          onBack={() => setShowFeedbackForm(false)}
          userRole={userRole}
          onSubmit={(feedbackData) => {
            console.log('Feedback submitted:', feedbackData);
            setShowFeedbackForm(false);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background
  },
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.highlightBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.orange,
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 100,
    gap: 24,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileHeader: {
    height: 96,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  profileImageContainer: {
    position: 'absolute',
    bottom: -48,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: '#E5E7EB', // Light gray
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1e293b',
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInfo: {
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 4,
    minWidth: 200,
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  infoInput: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  businessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  businessButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
  },
  themeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  themeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  themeList: {
    gap: 8,
  },
  themeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  themeItemActive: {
    backgroundColor: '#F3F4F6', // Light gray background
    borderWidth: 1,
    borderColor: COLORS.textMuted, // Dark gray border
  },
  themeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeColorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  themeNameActive: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  themeTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  themeDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    overflow: 'hidden',
    marginBottom: 24,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsText: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingsDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.textMuted, // Dark gray circle
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.orange,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.orange,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  appInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  appIconContainer: {
    marginBottom: 16,
  },
  appIconWrapper: {
    width: 96,
    height: 96,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: COLORS.divider,
    position: 'relative',
  },
  appIconBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: 12,
  },
});

export default SettingsScreen;



