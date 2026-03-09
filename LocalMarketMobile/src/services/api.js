/**
 * API Service for Local Market Mobile App
 * Base URL: https://admin-panel-rho-sepia-57.vercel.app
 */

export const API_BASE_URL = 'https://admin-panel-rho-sepia-57.vercel.app'; // Production URL
import { Platform } from 'react-native';

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    const hasJsonContent = contentType && contentType.includes('application/json');

    let data;
    if (hasJsonContent) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error(`JSON Parse Error [${endpoint}]:`, parseError, 'Response text:', text);
          throw new Error(`Invalid JSON response: ${parseError.message}`);
        }
      } else {
        // Empty response body
        data = {};
      }
    } else {
      // Non-JSON response
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status} ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==================== CATEGORIES API ====================

/**
 * Get all categories
 * @param {string} q - Optional search query
 * @returns {Promise<{categories: Array}>}
 */
export const getCategories = async (q = '') => {
  const params = q ? `?q=${encodeURIComponent(q)}` : '';
  return await apiRequest(`/api/categories${params}`);
};

// ==================== THEMES API ====================

/**
 * Get all themes
 * @param {boolean} activeOnly - Get only active theme
 * @returns {Promise<Array>}
 */
export const getThemes = async (activeOnly = false) => {
  const params = activeOnly ? '?active=true' : '';
  return await apiRequest(`/api/themes${params}`);
};

/**
 * Get active theme
 * @returns {Promise<Object|null>}
 */
export const getActiveTheme = async () => {
  try {
    const themes = await getThemes(true);
    return Array.isArray(themes) && themes.length > 0 ? themes[0] : null;
  } catch (error) {
    console.error('Error getting active theme:', error);
    return null;
  }
};

// ==================== BANNERS API ====================

/**
 * Get all banners
 * @returns {Promise<{banners: Array}>}
 */
export const getBanners = async () => {
  try {
    return await apiRequest('/api/banners');
  } catch (error) {
    console.error('Error getting banners:', error);
    return { banners: [] };
  }
};

// ==================== FESTIVE OFFERS API ====================

/**
 * Get all festive offers
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Filter by status (active, inactive, expired)
 * @param {string} filters.vendorId - Filter by vendor ID (optional)
 * @returns {Promise<Array>}
 */
export const getFestiveOffers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.vendorId) params.set('vendorId', filters.vendorId);

    const queryString = params.toString();
    const response = await apiRequest(`/api/festive-offers${queryString ? `?${queryString}` : ''}`);

    if (Array.isArray(response)) {
      // If vendorId is provided, filter client-side if backend doesn't support it yet
      if (filters.vendorId) {
        return response.filter(offer =>
          offer.type === 'vendor' &&
          offer.vendor_ids &&
          offer.vendor_ids.includes(filters.vendorId)
        );
      }
      return response;
    }
    return response.offers || [];
  } catch (error) {
    console.error('Error getting festive offers:', error);
    return [];
  }
};

// ==================== NOTIFICATIONS API ====================

/**
 * Get notifications
 * @returns {Promise<{notifications: Array}>}
 */
export const getNotifications = async () => {
  try {
    return await apiRequest('/api/notifications');
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { notifications: [] };
  }
};

// ==================== LOCATIONS API ====================

/**
 * Get locations
 * @param {Object} filters - Filter options
 * @param {string} filters.state - Filter by state
 * @param {string} filters.city - Filter by city
 * @param {number} filters.limit - Limit results (max 2000)
 * @returns {Promise<{locations: Array}>}
 */
export const getLocations = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.state) params.set('state', filters.state);
    if (filters.city) params.set('city', filters.city);
    if (filters.limit) params.set('limit', Math.min(filters.limit, 2000).toString());

    const queryString = params.toString();
    return await apiRequest(`/api/locations${queryString ? `?${queryString}` : ''}`);
  } catch (error) {
    console.error('Error getting locations:', error);
    return { locations: [] };
  }
};

/**
 * Reverse geocode latitude and longitude into an address using the backend
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{address: Object, display_name: string}>}
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    return await apiRequest(`/api/geocode?lat=${lat}&lng=${lng}`);
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
};

// ==================== FEEDBACK API ====================

/**
 * Submit feedback
 * @param {Object} feedbackData
 * @param {string} feedbackData.userId - User ID
 * @param {string} feedbackData.type - Feedback type
 * @param {string} feedbackData.message - Feedback message
 * @returns {Promise<Object>}
 */
export const submitFeedback = async (feedbackData) => {
  return await apiRequest('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });
};

// ==================== USERS API ====================

/**
 * Get user by ID, phone, or email
 * @param {Object} identifier
 * @param {string} identifier.userId - User ID
 * @param {string} identifier.phone - Phone number
 * @param {string} identifier.email - Email
 * @returns {Promise<Object|null>} User object or null
 */
export const getUser = async (identifier) => {
  try {
    const params = new URLSearchParams();
    if (identifier.userId) params.set('userId', identifier.userId);
    if (identifier.phone) params.set('phone', identifier.phone);
    if (identifier.email) params.set('email', identifier.email);

    if (params.toString()) {
      const response = await apiRequest(`/api/users?${params.toString()}&limit=1`);
      // API returns { users: [...] } format
      if (response && response.users && Array.isArray(response.users) && response.users.length > 0) {
        const user = response.users[0];
        return {
          id: user.id,
          name: user.name || user.full_name,
          email: user.email,
          phone: user.phone,
          state: user.state,
          city: user.city,
          status: user.status,
        };
      }
      return null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Update user
 * @param {Object} userData
 * @param {string} userData.id - User ID
 * @param {string} userData.status - Status (Active, Blocked, Pending)
 * @param {string} userData.name - Full name
 * @param {string} userData.email - Email
 * @param {string} userData.phone - Phone
 * @param {string} userData.state - State
 * @param {string} userData.city - City
 * @returns {Promise<{user: Object}>}
 */
export const updateUser = async (userData) => {
  return await apiRequest('/api/users', {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
};

// ==================== USER THEME API ====================

/**
 * Get user's theme preference
 * @param {Object} identifier
 * @param {string} identifier.userId - User ID
 * @param {string} identifier.phone - Phone number
 * @param {string} identifier.email - Email
 * @returns {Promise<{theme: string, userId?: string}>}
 */
export const getUserTheme = async (identifier) => {
  try {
    const params = new URLSearchParams();
    if (identifier.userId) params.set('userId', identifier.userId);
    if (identifier.phone) params.set('phone', identifier.phone);
    if (identifier.email) params.set('email', identifier.email);

    if (params.toString()) {
      return await apiRequest(`/api/user/theme?${params.toString()}`);
    }
    // If no identifier, return global default
    return await apiRequest('/api/user/theme');
  } catch (error) {
    console.error('Error getting user theme:', error);
    return { theme: 'default' };
  }
};

/**
 * Update user's theme preference
 * @param {Object} data
 * @param {string} data.userId - User ID (optional)
 * @param {string} data.phone - Phone number (optional)
 * @param {string} data.email - Email (optional)
 * @param {string} data.theme - Theme ID (or data.themeId will be mapped to theme)
 * @returns {Promise<Object>}
 */
export const updateUserTheme = async (data) => {
  try {
    // Map themeId to theme if provided (for backward compatibility)
    const requestData = {
      userId: data.userId,
      phone: data.phone,
      email: data.email,
      theme: data.theme || data.themeId, // Support both 'theme' and 'themeId'
    };

    // Remove undefined values
    Object.keys(requestData).forEach(key => {
      if (requestData[key] === undefined) {
        delete requestData[key];
      }
    });

    return await apiRequest('/api/user/theme', {
      method: 'PATCH',
      body: JSON.stringify(requestData),
    });
  } catch (error) {
    console.error('Error updating user theme:', error);
    throw error;
  }
};

// ==================== VENDORS API ====================

/**
 * Get vendors
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Filter by status (Active, Pending, Blocked, all)
 * @param {string} filters.q - Search query
 * @param {string} filters.state - Filter by state
 * @param {string} filters.city - Filter by city
 * @param {string} filters.town - Filter by town
 * @param {string} filters.category - Filter by category (if available)
 * @param {string} filters.categoryId - Filter by category ID (will filter vendors with products in this category)
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 20, max: 100)
 * @returns {Promise<{vendors: Array, pagination: Object}>}
 */
export const getVendors = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.q) params.set('q', filters.q);
    if (filters.state) params.set('state', filters.state);
    if (filters.city) params.set('city', filters.city);
    if (filters.town) params.set('town', filters.town);
    if (filters.category) params.set('category', filters.category);
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', Math.min(filters.limit, 100).toString());
    // Note: categoryId is handled client-side by filtering vendors with products in that category

    const queryString = params.toString();
    return await apiRequest(`/api/vendors${queryString ? `?${queryString}` : ''}`);
  } catch (error) {
    console.error('Error getting vendors:', error);
    return { vendors: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
};

// ==================== VENDOR PRODUCTS API ====================

/**
 * Get vendor products
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<{products: Array}>}
 */
export const getVendorProducts = async (vendorId) => {
  try {
    if (!vendorId || vendorId.trim() === '') {
      console.warn('getVendorProducts: Invalid vendorId provided');
      return { products: [] };
    }

    const response = await apiRequest(`/api/vendor-products?vendorId=${encodeURIComponent(vendorId)}`);

    // Ensure we always return an array
    if (response && Array.isArray(response.products)) {
      return { products: response.products };
    }

    return { products: [] };
  } catch (error) {
    console.error('Error getting vendor products:', error);
    // Return empty array instead of throwing to prevent app crashes
    return { products: [] };
  }
};

/**
 * Get master products (for search)
 * @param {Object} filters
 * @param {string} filters.q - Search query
 * @param {string} filters.categoryId - Filter by category ID
 * @param {number} filters.limit - Limit results
 * @returns {Promise<{products: Array}>}
 */
export const getMasterProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.limit) params.set('limit', filters.limit.toString());

    const queryString = params.toString();
    return await apiRequest(`/api/master-products${queryString ? `?${queryString}` : ''}`);
  } catch (error) {
    console.error('Error getting master products:', error);
    return { products: [] };
  }
};

/**
 * Get vendor products list (with vendor names)
 * @param {Object} filters
 * @param {string} filters.q - Search query
 * @param {string} filters.vendorId - Filter by vendor ID
 * @param {string} filters.categoryId - Filter by category ID
 * @param {number} filters.limit - Limit results
 * @param {number} filters.offset - Offset for pagination
 * @returns {Promise<{products: Array, total: number}>}
 */
export const getVendorProductsList = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.vendorId) params.set('vendorId', filters.vendorId);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.offset) params.set('offset', filters.offset.toString());

    const queryString = params.toString();
    return await apiRequest(`/api/vendor-products/list${queryString ? `?${queryString}` : ''}`);
  } catch (error) {
    console.error('Error getting vendor products list:', error);
    return { products: [], total: 0 };
  }
};

// ==================== AUTH API ====================

/**
 * Login user
 * @param {Object} credentials
 * @param {string} credentials.method - 'email' or 'sms'
 * @param {string} credentials.email - Email (required for email method)
 * @param {string} credentials.phone - Phone number (required for sms method)
 * @param {string} credentials.password - Password (required for email method)
 * @param {string} credentials.otp - OTP (required for sms verification)
 * @returns {Promise<{success: boolean, user?: Object, message?: string, otp?: string}>}
 */
export const login = async (credentials) => {
  try {
    return await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Login vendor
 * @param {Object} credentials
 * @param {string} credentials.method - 'email' or 'sms'
 * @param {string} credentials.email - Email (required for email method)
 * @param {string} credentials.phone - Phone number (required for sms method)
 * @param {string} credentials.password - Password (required for email method)
 * @param {string} credentials.otp - OTP (required for sms verification)
 * @returns {Promise<{success: boolean, user?: Object, message?: string, otp?: string}>}
 */
export const vendorLogin = async (credentials) => {
  try {
    return await apiRequest('/api/vendor/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  } catch (error) {
    console.error('Vendor Login error:', error);
    throw error;
  }
};

/**
 * Register new user
 * @param {Object} userData
 * @param {string} userData.full_name - Full name
 * @param {string} userData.email - Email (optional)
 * @param {string} userData.phone - Phone number
 * @param {string} userData.password - Password (required if email provided)
 * @param {string} userData.state - State (optional)
 * @param {string} userData.city - City (optional)
 * @returns {Promise<{success: boolean, user: Object, message: string}>}
 */
export const register = async (userData) => {
  try {
    return await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Register new vendor
 * @param {Object} vendorData
 * @returns {Promise<{success: boolean, vendor: Object, message: string}>}
 */
export const registerVendor = async (vendorData) => {
  try {
    return await apiRequest('/api/vendor/auth/register', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  } catch (error) {
    console.error('Vendor Registration error:', error);
    throw error;
  }
};

/**
 * Get full vendor profile including products, enquiries, and reviews
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>}
 */
export const getVendorProfile = async (vendorId) => {
  if (!vendorId) return null;
  // Using pluralized /api/vendors/ endpoint which is confirmed working and updated with robust normalization
  return await apiRequest(`/api/vendors/${vendorId}`);
};

/**
 * Update vendor profile details
 * @param {string} id - Vendor ID
 * @param {Object} profileData - Data to update
 * @returns {Promise<Object>}
 */
export const updateVendorProfile = async (id, profileData) => {
  return await apiRequest('/api/vendor/profile', {
    method: 'PATCH',
    body: JSON.stringify({ id, ...profileData }),
  });
};

/**
 * Upload a file to the server using FormData
 * @param {string} fileUri - The local URI of the file
 * @param {string} folder - The destination folder on the server
 * @returns {Promise<string>} The URL of the uploaded file
 */
export const uploadFile = async (fileUri, folder, mimeType = 'image/jpeg') => {
  try {
    console.log(`Starting upload to ${folder}... URI: ${fileUri}, Mime: ${mimeType}`);
    const formData = new FormData();

    // Extremely robust URI handling for React Native fetch/FormData
    let normalizedUri = fileUri;

    if (Platform.OS === 'ios') {
      // iOS: fetch usually needs 'file://' prefix but sometimes it's already there or missing
      normalizedUri = fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`;
    } else {
      // Android: fetch works best with 'content://' or 'file://' as provided by the picker
      // If the URI is a plain path, add 'file://'
      if (!fileUri.includes('://')) {
        normalizedUri = `file://${fileUri}`;
      }
    }

    const filename = fileUri.split('/').pop() || (mimeType && mimeType.includes('pdf') ? 'doc.pdf' : 'photo.jpg');

    const fileObject = {
      uri: normalizedUri,
      type: mimeType || 'image/jpeg',
      name: filename,
    };

    formData.append('file', fileObject);
    formData.append('bucket', 'vendor-documents');
    formData.append('folder', folder);

    console.log('FormData Details:', {
      uri: fileObject.uri,
      type: fileObject.type,
      name: fileObject.name,
      folder,
      os: Platform.OS
    });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/api/upload`);
      xhr.setRequestHeader('Accept', 'application/json');

      xhr.onload = () => {
        console.log('Upload response status:', xhr.status);
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('Upload successful! URL:', data.url);
            resolve(data.url);
          } else {
            console.error('Upload failed on server:', data);
            reject(new Error(data.error || 'Upload failed'));
          }
        } catch (e) {
          reject(new Error('Invalid server response'));
        }
      };

      xhr.onerror = () => {
        console.error('Network request failed. This often means the URI is invalid or the server is unreachable.');
        reject(new Error('Network request failed'));
      };

      xhr.send(formData);
    });
  } catch (error) {
    console.error('File Upload error details:', error);
    throw error;
  }
};

/**
 * Create a new vendor product
 * @param {Object} productData - { vendor_id, name, price, ... }
 * @returns {Promise<Object>}
 */
export const createVendorProduct = async (productData) => {
  console.log('Creating Product Payload:', JSON.stringify(productData, null, 2));
  return await apiRequest('/api/vendor-products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

/**
 * Update a vendor product
 * @param {string} id - Product ID
 * @param {Object} productData - Data to update
 * @returns {Promise<Object>}
 */
export const updateVendorProduct = async (id, productData) => {
  return await apiRequest(`/api/vendor-products?id=${id}`, {
    method: 'PATCH',
    body: JSON.stringify(productData),
  });
};

/**
 * Delete a vendor product
 * @param {string} id - Product ID
 * @returns {Promise<Object>}
 */
export const deleteVendorProduct = async (id) => {
  return await apiRequest(`/api/vendor-products?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
};

// ==================== OFFERS API ====================

/**
 * Create a new offer
 * @param {Object} offerData
 * @returns {Promise<Object>}
 */
export const createOffer = async (offerData) => {
  return await apiRequest('/api/festive-offers', {
    method: 'POST',
    body: JSON.stringify(offerData),
  });
};

/**
 * Update an existing offer
 * @param {Object} offerData
 * @returns {Promise<Object>}
 */
export const updateOffer = async (offerData) => {
  return await apiRequest('/api/festive-offers', {
    method: 'PATCH',
    body: JSON.stringify(offerData),
  });
};

/**
 * Delete an offer (sets status to inactive)
 * @param {string} offerId
 * @returns {Promise<Object>}
 */
export const deleteOffer = async (offerId) => {
  return await apiRequest('/api/festive-offers', {
    method: 'PATCH',
    body: JSON.stringify({ id: offerId, status: 'inactive' }),
  });
};

// ==================== SEARCH API ====================

/**
 * Get search reports (for analytics, not direct search)
 * @param {Object} filters
 * @param {string} filters.state - Filter by state
 * @param {string} filters.city - Filter by city
 * @returns {Promise<Array>}
 */
export const getSearchReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.state) params.set('state', filters.state);
    if (filters.city) params.set('city', filters.city);

    const queryString = params.toString();
    return await apiRequest(`/api/reports/search${queryString ? `?${queryString}` : ''}`);
  } catch (error) {
    console.error('Error getting search reports:', error);
    return [];
  }
};

/**
 * Get recent searches (from search logs)
 * @param {Object} filters
 * @param {string} filters.userId - User ID (optional)
 * @param {number} filters.limit - Limit results (default: 10)
 * @returns {Promise<Array>}
 */
export const getRecentSearches = async (filters = {}) => {
  try {
    // Note: This uses search reports API which returns search logs
    // In production, you might want a dedicated endpoint for recent searches
    const reports = await getSearchReports(filters);

    // Extract unique search queries and sort by most recent
    const uniqueSearches = [];
    const seenQueries = new Set();

    if (Array.isArray(reports)) {
      reports.forEach(report => {
        if (report.product && !seenQueries.has(report.product.toLowerCase())) {
          seenQueries.add(report.product.toLowerCase());
          uniqueSearches.push({
            query: report.product,
            count: report.count || 0,
          });
        }
      });
    }

    // Limit results
    const limit = filters.limit || 10;
    return uniqueSearches.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

// ==================== ENQUIRIES API ====================

/**
 * Submit a new enquiry to a vendor
 * @param {Object} enquiryData - { vendor_id, name, mobile, message }
 * @returns {Promise<Object>}
 */
export const submitEnquiry = async (enquiryData) => {
  try {
    return await apiRequest('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiryData),
    });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    throw error;
  }
};

// ==================== REVIEWS API ====================

/**
 * Get reviews for a vendor
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<{reviews: Array}>}
 */
export const getVendorReviews = async (vendorId) => {
  try {
    if (!vendorId) {
      return { reviews: [] };
    }
    const response = await apiRequest(`/api/reviews?vendorId=${encodeURIComponent(vendorId)}`);
    return response;
  } catch (error) {
    console.error('Error getting vendor reviews:', error);
    return { reviews: [] };
  }
};

/**
 * Submit a review for a vendor
 * @param {Object} reviewData
 * @param {string} reviewData.vendorId - Vendor ID
 * @param {string} reviewData.userId - User ID (optional)
 * @param {string} reviewData.userName - User name
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review comment
 * @returns {Promise<Object>}
 */
export const submitReview = async (reviewData) => {
  try {
    const { vendorId, userId, userName, rating, comment } = reviewData;

    if (!vendorId || !userName || !rating || !comment) {
      throw new Error('Missing required review fields');
    }

    return await apiRequest('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        vendorId,
        userId,
        userName,
        rating,
        comment,
      }),
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

/**
 * Submit a reply to a review (Vendor only)
 * @param {string} reviewId - ID of the review to reply to
 * @param {string} reply - The vendor's reply text
 * @returns {Promise<Object>}
 */
export const submitReviewReply = async (reviewId, reply) => {
  try {
    if (!reviewId || !reply) {
      throw new Error('Missing review ID or reply text');
    }

    return await apiRequest(`/api/vendor/reviews/${encodeURIComponent(reviewId)}/reply`, {
      method: 'PATCH',
      body: JSON.stringify({ reply }),
    });
  } catch (error) {
    console.error('Error submitting review reply:', error);
    throw error;
  }
};

// ==================== AI API ====================

/**
 * Start a new AI session
 * @param {Object} data - Session data (userId, location, etc.)
 * @returns {Promise<Object>}
 */
export const startAISession = async (data) => {
  return await apiRequest('/api/ai/start', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Process user answer
 * @param {Object} data - Answer data (step, answer, context)
 * @returns {Promise<Object>}
 */
export const processAIAnswer = async (data) => {
  return await apiRequest('/api/ai/process-answer', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Get AI recommendations
 * @param {Object} context - Final context
 * @returns {Promise<Object>}
 */
export const getAIRecommendations = async (context) => {
  return await apiRequest('/api/ai/recommendations', {
    method: 'POST',
    body: JSON.stringify(context),
  });
};

export default {
  getCategories,
  getThemes,
  getActiveTheme,
  getBanners,
  getFestiveOffers,
  getNotifications,
  getLocations,
  submitFeedback,
  getUser,
  updateUser,
  getUserTheme,
  updateUserTheme,
  getVendors,
  getVendorProducts,
  getVendorProductsList,
  getMasterProducts,
  getSearchReports,
  getRecentSearches,
  getVendorReviews,
  submitReview,
  submitReviewReply,
  login,
  vendorLogin,
  register,
  registerVendor,
  uploadFile,
  startAISession,
  processAIAnswer,
  getAIRecommendations,
};
