import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, StatusBar, Platform } from 'react-native';
import Image from './ImageWithFallback';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import FeedbackForm from './FeedbackForm';
import { FESTIVAL_THEMES } from '../constants/festivalThemes';
import { getThemes, updateUserTheme, updateUser } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserId, updateUserData as updateStorageUserData } from '../utils/userStorage';
import { useTheme } from './ThemeProvider';

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
  const { theme, themeColors, setTheme: setThemeContext } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(theme || currentTheme);
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    loadThemes();
    loadUserTheme();
  }, []);

  useEffect(() => {
    if (profileData) {
      let locationStr = '';
      const rawLocation = profileData.location || profileData.address;
      
      if (typeof rawLocation === 'object' && rawLocation !== null) {
        // Format object to string: "Address, City, State Pincode"
        const parts = [
          rawLocation.address,
          rawLocation.city,
          rawLocation.state,
          rawLocation.pincode
        ].filter(Boolean);
        locationStr = parts.join(', ');
      } else {
        locationStr = rawLocation || '';
      }

      setFormData({
        name: profileData.name || profileData.full_name || profileData.ownerName || 'User',
        mobile: profileData.mobile || profileData.phone || profileData.contactNumber || '',
        location: locationStr,
        email: profileData.email || '',
        photo: profileData.profilePhotoUrl || profileData.ownerPhotoUrl || profileData.imageUrl || ''
      });
    }
  }, [profileData]);

  const loadThemes = async () => {
    try {
      setLoadingThemes(true);
      const apiThemes = await getThemes();
      const transformedThemes = [{
        id: 'default',
        name: 'Default (Red & Orange)',
        icon: '🎨',
        color: '#F97316',
      }];

      if (Array.isArray(apiThemes)) {
        apiThemes.forEach(t => {
          transformedThemes.push({
            id: t.id,
            name: t.name || t.id,
            icon: t.icon || '🎨',
            color: t.colors?.primary || '#F97316',
          });
        });
      }
      setThemes(transformedThemes);
    } catch (error) {
      console.error('Error loading themes:', error);
    } finally {
      setLoadingThemes(false);
    }
  };

  const loadUserTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedFestivalTheme');
      setSelectedTheme(savedTheme || theme || 'default');
    } catch (error) {
      console.error('Error loading user theme:', error);
    }
  };

  const handleThemeSelect = async (themeId) => {
    setSelectedTheme(themeId);
    try {
      await AsyncStorage.setItem('selectedFestivalTheme', themeId);
      setThemeContext(themeId);
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        await updateUserTheme({ userId, theme: themeId });
      }
    } catch (error) {
      console.error('Error updating user theme:', error);
    }
    if (onThemeChange) onThemeChange(themeId);
  };

  const handleSaveProfile = async () => {
    try {
      setLoadingProfile(true);
      const userId = await getUserId();
      if (!userId) return;

      const updateData = {
        id: userId,
        full_name: formData.name,
        phone: formData.mobile,
        email: formData.email,
      };

      const response = await updateUser(updateData);
      if (response && response.user) {
        await updateStorageUserData(response.user);
        if (onUpdateProfile) onUpdateProfile(response.user);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoadingProfile(false);
      setIsEditing(false);
    }
  };

  const renderInfoItem = (icon, label, value) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIconContainer}>
        <Icon name={icon} size={18} color="#64748B" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  const renderActionItem = (icon, title, color, onPress) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionItemLeft}>
        <View style={[styles.actionIconContainer, { backgroundColor: color + '10' }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  if (showFeedbackForm) {
    return <FeedbackForm onBack={() => setShowFeedbackForm(false)} userRole={userRole} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header Section */}
        <LinearGradient
          colors={[themeColors.primaryGradient[0], themeColors.primaryGradient[1]]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View />
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.iconButton}>
              <Icon name="edit-3" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {formData.photo ? (
                <Image source={{ uri: formData.photo }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="user" size={40} color={themeColors.orange} />
                </View>
              )}
            </View>
            <View style={styles.nameSection}>
              <Text style={styles.nameText}>{formData.name}</Text>
              <View style={styles.roleContainer}>
                 <Icon name={userRole === 'vendor' ? 'shopping-bag' : 'user'} size={12} color="rgba(255,255,255,0.7)" />
                 <Text style={styles.roleText}>
                   {userRole === 'vendor' ? 'Local+ Account' : 'Customer Account'}
                 </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Profile Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <View style={styles.card}>
            {renderInfoItem('phone', 'Mobile Number', formData.mobile)}
            <View style={styles.divider} />
            {renderInfoItem('mail', 'Email Address', formData.email)}
            <View style={styles.divider} />
            {renderInfoItem('map-pin', 'Location', formData.location)}
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.card}>
            {userRole === 'vendor' && onNavigateToBusiness && (
              <>
                {renderActionItem('shopping-bag', 'Manage Business Profile', '#EF4444', onNavigateToBusiness)}
                <View style={styles.divider} />
              </>
            )}
            {renderActionItem('palette', 'Festival Themes', '#F97316', () => setShowThemePicker(!showThemePicker))}
            {showThemePicker && (
              <View style={styles.themePickerContainer}>
                {loadingThemes ? (
                  <ActivityIndicator color={themeColors.orange} />
                ) : (
                  themes.map(t => (
                    <TouchableOpacity 
                      key={t.id} 
                      style={[styles.themeItem, selectedTheme === t.id && styles.themeItemActive]}
                      onPress={() => handleThemeSelect(t.id)}
                    >
                      <View style={[styles.themeColor, { backgroundColor: t.color }]} />
                      <Text style={styles.themeName}>{t.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
            <View style={styles.divider} />
            {renderActionItem('message-circle', 'Give Feedback', '#3B82F6', () => setShowFeedbackForm(true))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Icon name="log-out" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
           <Text style={styles.appName}>LOCAL MARKET</Text>
           <Text style={styles.versionText}>Version 1.0.3</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Overlay */}
      {isEditing && (
        <View style={styles.editOverlay}>
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Edit Information</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(t) => setFormData({...formData, name: t})}
              placeholder="Full Name"
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={styles.input}
              value={formData.mobile}
              onChangeText={(t) => setFormData({...formData, mobile: t})}
              placeholder="Mobile Number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(t) => setFormData({...formData, email: t})}
              placeholder="Email Address"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
            />
            <View style={styles.editButtons}>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
                {loadingProfile ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameSection: {
    marginLeft: 16,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 72,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
  },
  appName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#CBD5E1',
    letterSpacing: 2,
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  themePickerContainer: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  themeItemActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  themeColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
  },
  themeName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editCard: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: '#64748B',
    fontWeight: '700',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#E86A2C', // Use theme color later via props or dynamic style
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFF',
    fontWeight: '800',
  },
});

export default SettingsScreen;
