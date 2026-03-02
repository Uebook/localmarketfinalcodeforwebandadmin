import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, TextInput, Switch, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { launchImageLibrary } from 'react-native-image-picker';
import { getVendorSidebarControl } from '../utils/vendorSidebarControl';
import { getSidebarControl } from '../utils/sidebarControl';
import { handleShare } from '../utils/vendorActions';
import { getCategories, createVendorProduct, updateVendorProduct, deleteVendorProduct, uploadFile } from '../services/api';

const VendorCatalogScreen = ({ navigation, vendorData, setVendorData }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [locationState] = React.useState({
    lat: null,
    lng: null,
    city: 'Delhi, India',
    loading: false,
    error: null,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    mrp: '',
    type: 'Product', // Product or Service
    categoryId: '',
    categoryName: '',
    unit: '',
    description: '',
    inStock: true,
    bestSeller: false,
    image: null,
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const units = ['Piece', 'Kg', 'Litre', 'Pack', 'Box', 'Dozen'];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (data && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleMenuClick = () => {
    const vendorControl = getVendorSidebarControl();
    const customerControl = getSidebarControl();
    const control = vendorControl || customerControl;
    if (control) {
      control(true);
    } else {
      console.warn('Sidebar control not available');
    }
  };

  const handleProfileClick = () => {
    if (navigation) {
      navigation.navigate('Settings');
    }
  };

  const handleNotificationClick = () => {
    if (navigation) {
      navigation.navigate('Notifications');
    }
  };

  const handleDownloadCatalog = () => {
    if (products.length === 0) {
      Alert.alert('Empty Catalog', 'Please add products to your catalog before downloading.');
      return;
    }

    // Generate catalog data for download
    const catalogData = products.map((product, index) => ({
      'S.No': index + 1,
      'Product ID': product.id || `PROD-${index + 1}`,
      'Product Name': product.name || '',
      'Category': product.category || '',
      'Price': product.price || '0',
      'MRP': product.mrp || product.originalPrice || product.price || '0',
      'Unit': product.unit || 'Piece',
      'In Stock': product.inStock ? 'Yes' : 'No',
      'Best Seller': product.bestSeller ? 'Yes' : 'No',
      'Description': product.description || '',
    }));

    // In production, this would generate and download an actual Excel/CSV file
    Alert.alert(
      'Catalog Download',
      `Catalog file generated for ${products.length} products.\n\n` +
      `In production, this would download an Excel/CSV file with all your catalog items.\n\n` +
      `File includes: Product ID, Name, Category, Price, MRP, Unit, Stock Status, and Description.`,
      [{ text: 'OK' }]
    );
  };

  const profileCompletion = 85;
  const [products, setProducts] = useState(vendorData?.products || []);

  useEffect(() => {
    if (vendorData?.products) {
      setProducts(vendorData.products);
    }
  }, [vendorData]);

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: '',
      mrp: '',
      type: 'Product',
      categoryId: '',
      categoryName: '',
      unit: '',
      description: '',
      inStock: true,
      bestSeller: false,
      image: null,
    });
    setShowAddForm(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      price: item.price?.toString().replace('₹', '') || '',
      mrp: item.originalPrice?.toString().replace('₹', '') || '',
      type: item.type || 'Product',
      categoryId: item.category_id || '',
      categoryName: item.category_name || item.category || '',
      unit: item.uom || item.unit || '',
      description: item.description || '',
      inStock: item.inStock !== false,
      bestSeller: item.bestSeller || false,
      image: item.imageUrl ? { uri: item.imageUrl } : null,
    });
    setShowAddForm(true);
  };

  const handleDeleteItem = async (itemId) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteVendorProduct(itemId);
            const updatedProducts = products.filter(p => p.id !== itemId);
            setProducts(updatedProducts);
            if (setVendorData) {
              setVendorData({
                ...vendorData,
                products: updatedProducts,
              });
            }
          } catch (err) {
            Alert.alert('Error', 'Failed to delete product');
          }
        }
      }
    ]);
  };

  const handleImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          setFormData({ ...formData, image: response.assets[0] });
        }
      }
    );
  };

  const calculateDiscount = (price, mrp) => {
    if (!price || !mrp) return '';
    const priceNum = parseFloat(price);
    const mrpNum = parseFloat(mrp);
    if (mrpNum > priceNum) {
      const discount = ((mrpNum - priceNum) / mrpNum) * 100;
      return `${Math.round(discount)}% OFF`;
    }
    return '';
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Required Fields', 'Please enter Name and Price');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = editingItem?.imageUrl || 'https://via.placeholder.com/100';
      if (formData.image && formData.image.uri && formData.image.uri !== editingItem?.imageUrl) {
        // Upload image if it's new
        imageUrl = await uploadFile(formData.image.uri, 'product-images', formData.image.type);
      }

      const productPayload = {
        vendor_id: vendorData.id,
        name: formData.name,
        price: parseFloat(formData.price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        uom: formData.unit,
        category_id: formData.categoryId || null,
        description: formData.description,
        image_url: imageUrl,
        status: formData.inStock ? 'Active' : 'Inactive',
      };

      let res;
      if (editingItem) {
        res = await updateVendorProduct(editingItem.id, productPayload);
      } else {
        res = await createVendorProduct(productPayload);
      }

      if (res && res.success) {
        // Update local state
        const discount = calculateDiscount(formData.price, formData.mrp);
        const newItem = {
          ...res.product,
          id: res.product.id,
          name: res.product.name,
          category: res.product.category_name || formData.categoryName || '',
          price: `₹${res.product.price}`,
          originalPrice: res.product.mrp ? `₹${res.product.mrp}` : undefined,
          discount: discount,
          inStock: res.product.status === 'Active',
          imageUrl: res.product.image_url || imageUrl,
        };

        let updatedProducts;
        if (editingItem) {
          updatedProducts = products.map(p => p.id === editingItem.id ? newItem : p);
        } else {
          updatedProducts = [...products, newItem];
        }

        setProducts(updatedProducts);
        if (setVendorData) {
          setVendorData({
            ...vendorData,
            products: updatedProducts,
          });
        }
        setShowAddForm(false);
        setEditingItem(null);
      } else {
        const errorMsg = res.error || 'Failed to save product';
        const errorDetail = res.details ? `\n\nDetails: ${res.details}` : '';
        Alert.alert('Error', errorMsg + errorDetail);
      }
    } catch (err) {
      console.error('Save Product Error:', err);
      Alert.alert('Error', 'Something went wrong while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({
      name: '',
      price: '',
      mrp: '',
      type: 'Product',
      categoryId: '',
      categoryName: '',
      unit: '',
      description: '',
      inStock: true,
      bestSeller: false,
      image: null,
    });
  };

  const handlePreview = () => {
    if (navigation && vendorData) {
      // Format full address
      const fullAddress = [
        vendorData.address || 'Shop 12, Main Market',
        vendorData.landmark || 'Near Clock Tower',
        `${vendorData.city || 'New Delhi'} - ${vendorData.pincode || '110001'}`
      ].filter(Boolean).join(' / ');

      // Convert vendorData to business format for VendorDetails
      const businessData = {
        ...vendorData,
        // Ensure all required fields are present
        id: vendorData.id || 'v1',
        name: vendorData.name || 'My Awesome Shop',
        category: vendorData.category || 'Grocery',
        rating: vendorData.rating || 4.8,
        reviewCount: vendorData.reviewCount || 12,
        address: fullAddress,
        landmark: vendorData.landmark || 'Near Clock Tower',
        city: vendorData.city || 'New Delhi',
        pincode: vendorData.pincode || '110001',
        contactNumber: vendorData.contactNumber || '9876543210',
        whatsappNumber: vendorData.whatsappNumber || vendorData.contactNumber || '9876543210',
        openTime: vendorData.openTime || '09:00 AM - 09:00 PM',
        about: vendorData.about || 'Welcome to our shop! We provide high quality products.',
        products: products, // Use current products list
        isVerified: vendorData.isVerified !== false,
        geoLocation: vendorData.geoLocation || { lat: 28.6139, lng: 77.2090 },
      };

      navigation.navigate('VendorDetails', { business: businessData });
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      />

      <Header
        locationState={locationState}
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
        onNotificationClick={handleNotificationClick}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Shop Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.coverImage}>
            <Text style={styles.coverText}>Cover</Text>
            <TouchableOpacity style={styles.cameraButton}>
              <Icon name={getIconName('Camera')} size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Icon name={getIconName('User')} size={40} color={COLORS.textMuted} />
              </View>
            </View>

            <View style={styles.shopInfo}>
              <View style={styles.shopNameRow}>
                <Text style={styles.shopName}>{vendorData?.name || 'My Shop'}</Text>
                <Icon name={getIconName('CheckCircle')} size={20} color={COLORS.blue} />
              </View>
              <View style={styles.locationRow}>
                <Icon name={getIconName('MapPin')} size={14} color={COLORS.textMuted} />
                <Text style={styles.locationText}>{vendorData?.address || 'Shop Address'}</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Open</Text>
              </View>
            </View>
          </View>

          {/* Profile Completion */}
          <View style={styles.completionSection}>
            <Text style={styles.completionLabel}>Profile Completion</Text>
            <View style={styles.completionBarContainer}>
              <LinearGradient
                colors={['#dc2626', '#9333ea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.completionBar, { width: `${profileCompletion}%` }]}
              />
            </View>
            <Text style={styles.completionPercent}>{profileCompletion}%</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(vendorData)}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.orange }]}>
                <Icon name={getIconName('Share2')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handlePreview}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.orange }]}>
                <Icon name={getIconName('Eye')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation?.navigate('VendorOffers')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.blue }]}>
                <Icon name={getIconName('Tag')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Offers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation?.navigate('Settings')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.textMuted }]}>
                <Icon name={getIconName('Settings')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Catalog Section */}
        <View style={styles.catalogSection}>
          <View style={styles.catalogHeader}>
            <Text style={styles.catalogTitle}>Your Catalog ({products.length})</Text>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.catalogButtonsRow}>
            <TouchableOpacity
              style={styles.catalogActionButton}
              onPress={handleDownloadCatalog}
              activeOpacity={0.8}
            >
              <View style={[styles.catalogButtonIcon, { backgroundColor: '#16a34a' }]}>
                <Icon name={getIconName('Download')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.catalogButtonText}>Download Excel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.catalogActionButton}
              onPress={() => navigation?.navigate('BulkPriceUpdate')}
              activeOpacity={0.8}
            >
              <View style={[styles.catalogButtonIcon, { backgroundColor: COLORS.blue }]}>
                <Icon name={getIconName('Upload')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.catalogButtonText}>Bulk Update</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.catalogActionButton}
              onPress={handleAddItem}
              activeOpacity={0.8}
            >
              <View style={[styles.catalogButtonIcon, { backgroundColor: COLORS.orange }]}>
                <Icon name={getIconName('Plus')} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.catalogButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>

          {/* Add/Edit Item Modal */}
          <Modal
            visible={showAddForm}
            transparent={true}
            animationType="slide"
            onRequestClose={handleCloseForm}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>{editingItem ? 'Edit Item' : 'Add New Item'}</Text>
                  <TouchableOpacity onPress={handleCloseForm} style={styles.closeButton}>
                    <Icon name={getIconName('X')} size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
                  <View style={styles.formSection}>
                    {/* Image Upload - Centered and larger */}
                    <TouchableOpacity style={styles.imageUploadFull} onPress={handleImagePicker}>
                      {formData.image ? (
                        <Image source={formData.image.uri ? { uri: formData.image.uri } : formData.image} style={styles.uploadedImageFull} />
                      ) : (
                        <View style={styles.uploadPlaceholder}>
                          <Icon name={getIconName('Image')} size={48} color={COLORS.textMuted} />
                          <Text style={styles.uploadText}>Add Product Photo</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <View style={styles.formFieldsStack}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Item Name *</Text>
                        <TextInput
                          style={styles.input}
                          value={formData.name}
                          onChangeText={(text) => setFormData({ ...formData, name: text })}
                          placeholder="e.g. Fresh Apples"
                          placeholderTextColor={COLORS.textMuted}
                        />
                      </View>

                      <View style={styles.inputRow}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Price (₹) *</Text>
                          <TextInput
                            style={styles.input}
                            value={formData.price}
                            onChangeText={(text) => setFormData({ ...formData, price: text.replace(/[^0-9]/g, '') })}
                            placeholder="0"
                            keyboardType="numeric"
                            placeholderTextColor={COLORS.textMuted}
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>MRP (₹)</Text>
                          <TextInput
                            style={styles.input}
                            value={formData.mrp}
                            onChangeText={(text) => setFormData({ ...formData, mrp: text.replace(/[^0-9]/g, '') })}
                            placeholder="0"
                            keyboardType="numeric"
                            placeholderTextColor={COLORS.textMuted}
                          />
                        </View>
                      </View>

                      {/* Product/Service Toggle */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Listing Type</Text>
                        <View style={styles.typeToggle}>
                          <TouchableOpacity
                            style={[styles.typeButton, formData.type === 'Product' && styles.typeButtonActive]}
                            onPress={() => setFormData({ ...formData, type: 'Product' })}
                          >
                            <Text style={[styles.typeButtonText, formData.type === 'Product' && styles.typeButtonTextActive]}>
                              Product
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.typeButton, formData.type === 'Service' && styles.typeButtonActive]}
                            onPress={() => setFormData({ ...formData, type: 'Service' })}
                          >
                            <Text style={[styles.typeButtonText, formData.type === 'Service' && styles.typeButtonTextActive]}>
                              Service
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.inputRow}>
                        {/* Category Dropdown */}
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Category</Text>
                          <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                          >
                            <Text style={[styles.dropdownText, !formData.categoryId && styles.dropdownPlaceholder]} numberOfLines={1}>
                              {formData.categoryName || 'Select'}
                            </Text>
                            <Icon name={getIconName('ChevronDown')} size={16} color={COLORS.textMuted} />
                          </TouchableOpacity>
                          {showCategoryDropdown && (
                            <View style={styles.dropdownList}>
                              <ScrollView nestedScrollEnabled={true}>
                                {categories.map((cat) => (
                                  <TouchableOpacity
                                    key={cat.id}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                      setFormData({ ...formData, categoryId: cat.id, categoryName: cat.name });
                                      setShowCategoryDropdown(false);
                                    }}
                                  >
                                    <Text style={styles.dropdownItemText}>{cat.name}</Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}
                        </View>

                        {/* Unit Dropdown */}
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Unit</Text>
                          <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowUnitDropdown(!showUnitDropdown)}
                          >
                            <Text style={[styles.dropdownText, !formData.unit && styles.dropdownPlaceholder]}>
                              {formData.unit || 'Select'}
                            </Text>
                            <Icon name={getIconName('ChevronDown')} size={16} color={COLORS.textMuted} />
                          </TouchableOpacity>
                          {showUnitDropdown && (
                            <View style={styles.dropdownList}>
                              <ScrollView nestedScrollEnabled={true}>
                                {units.map((unit) => (
                                  <TouchableOpacity
                                    key={unit}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                      setFormData({ ...formData, unit: unit });
                                      setShowUnitDropdown(false);
                                    }}
                                  >
                                    <Text style={styles.dropdownItemText}>{unit}</Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Description */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Description (Optional)</Text>
                        <TextInput
                          style={[styles.input, styles.textArea]}
                          value={formData.description}
                          onChangeText={(text) => setFormData({ ...formData, description: text })}
                          placeholder="Describe your product/service..."
                          placeholderTextColor={COLORS.textMuted}
                          multiline
                          numberOfLines={3}
                        />
                      </View>

                      {/* Toggles */}
                      <View style={styles.toggleRow}>
                        <View style={styles.toggleItem}>
                          <Text style={styles.toggleLabel}>In Stock</Text>
                          <Switch
                            value={formData.inStock}
                            onValueChange={(value) => setFormData({ ...formData, inStock: value })}
                            trackColor={{ false: '#E5E7EB', true: '#16a34a' }}
                            thumbColor={COLORS.white}
                          />
                        </View>
                        <View style={styles.toggleItem}>
                          <Text style={styles.toggleLabel}>Best Seller</Text>
                          <Switch
                            value={formData.bestSeller}
                            onValueChange={(value) => setFormData({ ...formData, bestSeller: value })}
                            trackColor={{ false: '#E5E7EB', true: COLORS.orange }}
                            thumbColor={COLORS.white}
                          />
                        </View>
                      </View>

                      {/* Save Button */}
                      <TouchableOpacity
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                        onPress={handleSaveItem}
                        disabled={saving}
                      >
                        <Text style={styles.saveButtonText}>
                          {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>

          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productCategory}>{item.category}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>{item.price}</Text>
                    {item.originalPrice && (
                      <>
                        <Text style={styles.originalPrice}>{item.originalPrice}</Text>
                        {item.discount && <Text style={styles.discount}>{item.discount}</Text>}
                      </>
                    )}
                  </View>
                  <View style={styles.stockRow}>
                    <View style={[styles.stockDot, !item.inStock && styles.stockDotOut]} />
                    <Text style={[styles.stockText, !item.inStock && styles.stockTextOut]}>
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </Text>
                  </View>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.actionIconButton}
                    onPress={() => handleEditItem(item)}
                  >
                    <Icon name={getIconName('Edit')} size={18} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIconButton}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    <Icon name={getIconName('Trash')} size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  coverImage: {
    height: 120,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  coverText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  cameraButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.textPrimary,
    padding: 8,
    borderRadius: 8,
  },
  profileInfo: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    marginTop: -40,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  shopInfo: {
    flex: 1,
    paddingTop: 40,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  completionSection: {
    padding: 16,
    paddingTop: 0,
  },
  completionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  completionBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  completionBar: {
    height: '100%',
    borderRadius: 4,
  },
  completionPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.orange,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  catalogSection: {
    padding: 16,
  },
  catalogHeader: {
    marginBottom: 16,
  },
  catalogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  catalogButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  catalogActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  catalogButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  catalogButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  originalPrice: {
    fontSize: 14,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  stockText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  productActions: {
    justifyContent: 'center',
    gap: 12,
  },
  actionIconButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    padding: 20,
    paddingBottom: 40,
  },
  formScroll: {
    flex: 1,
  },
  formSection: {
    gap: 20,
    paddingBottom: 20,
  },
  imageUploadFull: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.divider,
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  uploadedImageFull: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  formFieldsStack: {
    gap: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
    backgroundColor: COLORS.textMuted,
  },
  addItemForm: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  formContent: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  imageUpload: {
    width: 140,
    height: 140,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.divider,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 8,
  },
  formFields: {
    flex: 1,
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.white,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  typeButtonTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  dropdownText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  dropdownPlaceholder: {
    color: COLORS.textMuted,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  dropdownItemText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  toggleItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.orange,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  stockDotOut: {
    backgroundColor: '#dc2626',
  },
  stockTextOut: {
    color: '#dc2626',
  },
});

export default VendorCatalogScreen;

