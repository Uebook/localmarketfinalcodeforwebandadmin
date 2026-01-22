/**
 * User Storage Utility
 * Handles saving and loading user data from AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_NAME: 'userName',
  USER_EMAIL: 'userEmail',
  USER_PHONE: 'userPhone',
  USER_STATE: 'userState',
  USER_CITY: 'userCity',
  USER_ROLE: 'userRole',
  IS_AUTHENTICATED: 'isAuthenticated',
  USER_DATA: 'userData', // Complete user object as JSON
};

/**
 * Save user data to AsyncStorage
 * @param {Object} userData - User data object
 * @param {string} userData.id - User ID
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.phone - User phone
 * @param {string} userData.state - User state
 * @param {string} userData.city - User city
 * @param {string} role - User role (customer/vendor)
 */
export const saveUserData = async (userData, role = 'customer') => {
  try {
    if (!userData) {
      console.warn('No user data provided to save');
      return;
    }

    // Save individual fields for backward compatibility
    if (userData.id) {
      await AsyncStorage.setItem(USER_STORAGE_KEYS.USER_ID, userData.id);
    }
    if (userData.name) {
      await AsyncStorage.setItem(USER_STORAGE_KEYS.USER_NAME, userData.name);
    }
    if (userData.email) {
      await AsyncStorage.setItem(USER_STORAGE_KEYS.USER_EMAIL, userData.email);
    }
    if (userData.phone) {
      await AsyncStorage.setItem(USER_STORAGE_KEYS.USER_PHONE, userData.phone);
    }
    if (userData.state) {
      await AsyncStorage.setItem(USER_STORAGE_KEYS.USER_STATE, userData.state);
    }
    if (userData.city) {
      await AsyncStorage.setItem(USER_STORAGE_KEYS.USER_CITY, userData.city);
    }

    // Save role
    await AsyncStorage.setItem(USER_STORAGE_KEYS.USER_ROLE, role);
    
    // Save authentication status
    await AsyncStorage.setItem(USER_STORAGE_KEYS.IS_AUTHENTICATED, 'true');

    // Save complete user object as JSON
    await AsyncStorage.setItem(USER_STORAGE_KEYS.USER_DATA, JSON.stringify({
      ...userData,
      role,
      savedAt: new Date().toISOString(),
    }));

    console.log('User data saved to AsyncStorage');
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

/**
 * Load user data from AsyncStorage
 * @returns {Promise<Object|null>} User data object or null
 */
export const loadUserData = async () => {
  try {
    const userDataJson = await AsyncStorage.getItem(USER_STORAGE_KEYS.USER_DATA);
    
    if (userDataJson) {
      const userData = JSON.parse(userDataJson);
      // Remove metadata fields
      delete userData.savedAt;
      return userData;
    }

    // Fallback to individual fields for backward compatibility
    const userId = await AsyncStorage.getItem(USER_STORAGE_KEYS.USER_ID);
    if (!userId) {
      return null;
    }

    return {
      id: userId,
      name: await AsyncStorage.getItem(USER_STORAGE_KEYS.USER_NAME) || '',
      email: await AsyncStorage.getItem(USER_STORAGE_KEYS.USER_EMAIL) || '',
      phone: await AsyncStorage.getItem(USER_STORAGE_KEYS.USER_PHONE) || '',
      state: await AsyncStorage.getItem(USER_STORAGE_KEYS.USER_STATE) || '',
      city: await AsyncStorage.getItem(USER_STORAGE_KEYS.USER_CITY) || '',
      role: await AsyncStorage.getItem(USER_STORAGE_KEYS.USER_ROLE) || 'customer',
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export const isUserAuthenticated = async () => {
  try {
    const isAuth = await AsyncStorage.getItem(USER_STORAGE_KEYS.IS_AUTHENTICATED);
    return isAuth === 'true';
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get user ID from storage
 * @returns {Promise<string|null>}
 */
export const getUserId = async () => {
  try {
    return await AsyncStorage.getItem(USER_STORAGE_KEYS.USER_ID);
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

/**
 * Clear all user data from AsyncStorage
 */
export const clearUserData = async () => {
  try {
    await AsyncStorage.multiRemove([
      USER_STORAGE_KEYS.USER_ID,
      USER_STORAGE_KEYS.USER_NAME,
      USER_STORAGE_KEYS.USER_EMAIL,
      USER_STORAGE_KEYS.USER_PHONE,
      USER_STORAGE_KEYS.USER_STATE,
      USER_STORAGE_KEYS.USER_CITY,
      USER_STORAGE_KEYS.USER_ROLE,
      USER_STORAGE_KEYS.IS_AUTHENTICATED,
      USER_STORAGE_KEYS.USER_DATA,
    ]);
    console.log('User data cleared from AsyncStorage');
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
};

/**
 * Update user data (partial update)
 * @param {Object} updates - Partial user data to update
 */
export const updateUserData = async (updates) => {
  try {
    const currentData = await loadUserData();
    if (!currentData) {
      throw new Error('No user data found to update');
    }

    const updatedData = { ...currentData, ...updates };
    await saveUserData(updatedData, updatedData.role || 'customer');
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};
