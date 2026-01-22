/**
 * Saved Vendors Utility
 * Handles saving and loading saved vendors from AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_VENDORS_KEY = 'savedVendors';
const SAVED_VENDOR_IDS_KEY = 'savedVendorIds';

/**
 * Save a vendor to saved list
 * @param {Object} vendor - Vendor/business object
 * @returns {Promise<void>}
 */
export const saveVendor = async (vendor) => {
  try {
    if (!vendor || !vendor.id) {
      console.warn('Invalid vendor data');
      return;
    }

    // Get existing saved vendors
    const savedVendorsJson = await AsyncStorage.getItem(SAVED_VENDORS_KEY);
    const savedVendors = savedVendorsJson ? JSON.parse(savedVendorsJson) : [];
    
    // Check if vendor already exists
    const existingIndex = savedVendors.findIndex(v => v.id === vendor.id);
    
    if (existingIndex === -1) {
      // Add new vendor
      savedVendors.push({
        ...vendor,
        savedAt: new Date().toISOString(),
      });
    } else {
      // Update existing vendor
      savedVendors[existingIndex] = {
        ...savedVendors[existingIndex],
        ...vendor,
        savedAt: new Date().toISOString(),
      };
    }

    // Save updated list
    await AsyncStorage.setItem(SAVED_VENDORS_KEY, JSON.stringify(savedVendors));
    
    // Update IDs list for quick lookup
    const savedIds = savedVendors.map(v => v.id);
    await AsyncStorage.setItem(SAVED_VENDOR_IDS_KEY, JSON.stringify(savedIds));

    console.log('Vendor saved:', vendor.id);
  } catch (error) {
    console.error('Error saving vendor:', error);
    throw error;
  }
};

/**
 * Remove a vendor from saved list
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<void>}
 */
export const removeSavedVendor = async (vendorId) => {
  try {
    if (!vendorId) {
      console.warn('Invalid vendor ID');
      return;
    }

    // Get existing saved vendors
    const savedVendorsJson = await AsyncStorage.getItem(SAVED_VENDORS_KEY);
    const savedVendors = savedVendorsJson ? JSON.parse(savedVendorsJson) : [];
    
    // Remove vendor
    const filteredVendors = savedVendors.filter(v => v.id !== vendorId);

    // Save updated list
    await AsyncStorage.setItem(SAVED_VENDORS_KEY, JSON.stringify(filteredVendors));
    
    // Update IDs list
    const savedIds = filteredVendors.map(v => v.id);
    await AsyncStorage.setItem(SAVED_VENDOR_IDS_KEY, JSON.stringify(savedIds));

    console.log('Vendor removed from saved:', vendorId);
  } catch (error) {
    console.error('Error removing saved vendor:', error);
    throw error;
  }
};

/**
 * Get all saved vendors
 * @returns {Promise<Array>} Array of saved vendor objects
 */
export const getSavedVendors = async () => {
  try {
    const savedVendorsJson = await AsyncStorage.getItem(SAVED_VENDORS_KEY);
    if (savedVendorsJson) {
      return JSON.parse(savedVendorsJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting saved vendors:', error);
    return [];
  }
};

/**
 * Get saved vendor IDs
 * @returns {Promise<Array>} Array of saved vendor IDs
 */
export const getSavedVendorIds = async () => {
  try {
    const savedIdsJson = await AsyncStorage.getItem(SAVED_VENDOR_IDS_KEY);
    if (savedIdsJson) {
      return JSON.parse(savedIdsJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting saved vendor IDs:', error);
    return [];
  }
};

/**
 * Check if a vendor is saved
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<boolean>}
 */
export const isVendorSaved = async (vendorId) => {
  try {
    const savedIds = await getSavedVendorIds();
    return savedIds.includes(vendorId);
  } catch (error) {
    console.error('Error checking if vendor is saved:', error);
    return false;
  }
};

/**
 * Clear all saved vendors
 * @returns {Promise<void>}
 */
export const clearSavedVendors = async () => {
  try {
    await AsyncStorage.removeItem(SAVED_VENDORS_KEY);
    await AsyncStorage.removeItem(SAVED_VENDOR_IDS_KEY);
    console.log('All saved vendors cleared');
  } catch (error) {
    console.error('Error clearing saved vendors:', error);
    throw error;
  }
};
