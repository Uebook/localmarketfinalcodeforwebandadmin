import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,  FlatList, TextInput, Switch, Modal, Alert, RefreshControl } from 'react-native';
import Image from './ImageWithFallback';
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
import ExitConfirmModal from './ExitConfirmModal';
import { BackHandler } from 'react-native';
import { getCategories, createVendorProduct, updateVendorProduct, deleteVendorProduct, uploadFile, getVendorProducts } from '../services/api';
import { AI_DEFAULT_ITEMS, getSuggestedItemsByCategory } from '../constants/aiDefaultItems';

const VendorCatalogScreen = ({ navigation, vendorData, setVendorData }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [locationState] = React.useState({
    lat: null,
    lng: null,
    city: 'Amritsar, India',
    loading: false,
    error: null,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [products, setProducts] = useState(vendorData?.products || []);

  const fetchProducts = async (showLoading = false) => {
    if (!vendorData?.id) return;
    if (showLoading) setRefreshing(true);
    try {
      const freshProducts = await getVendorProducts(vendorData.id);
      const productsList = freshProducts?.products || (Array.isArray(freshProducts) ? freshProducts : []);
      
      const mappedProducts = productsList.map(p => ({
        ...p,
        id: p.id || p._id || p.uuid || p.v_product_id,
        category: p.category_name || p.category || '',
        imageUrl: p.image_url || p.imageUrl || null,
      }));

      setProducts(mappedProducts);
      if (setVendorData) {
        setVendorData(prev => ({ ...prev, products: mappedProducts }));
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      if (showLoading) setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    fetchProducts(true);
  }, [vendorData?.id]);

  useEffect(() => {
    if (vendorData?.products) {
      setProducts(vendorData.products);
    }
  }, [vendorData?.products]);

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
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedAICategory, setSelectedAICategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const units = ['Piece', 'Kg', 'Litre', 'Pack', 'Box', 'Dozen'];

  useEffect(() => {
    const backAction = () => {
      if (navigation.isFocused()) {
        setShowExitModal(true);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      backHandler.remove();
    };
  }, [navigation]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (data && data.categories) {
          const sortedCategories = [...data.categories].sort((a, b) => 
            (a.name || '').localeCompare(b.name || '')
          );
          setCategories(sortedCategories);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Sync category name when categories load or categoryId changes
  useEffect(() => {
    if (categories.length > 0 && formData.categoryId && !formData.categoryName) {
      const found = categories.find(c => c.id === formData.categoryId);
      if (found) {
        setFormData(prev => ({ ...prev, categoryName: found.name }));
      }
    }
  }, [categories, formData.categoryId]);

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

  const handleDownloadCatalogue = () => {
    if (products.length === 0) {
      Alert.alert('Empty Catalogue', 'Please add products to your catalogue before downloading.');
      return;
    }

    // Generate catalogue data for download
    const catalogueData = products.map((product, index) => ({
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
      'Catalogue Download',
      `Catalogue file generated for ${products.length} products.\n\n` +
      `In production, this would download an Excel/CSV file with all your catalogue items.\n\n` +
      `File includes: Product ID, Name, Category, Price, MRP, Unit, Stock Status, and Description.`,
      [{ text: 'OK' }]
    );
  };

  const profileCompletion = 85;

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
      bestSeller: false,
      image: null,
    });
    setShowAddForm(true);
  };

  const handleEditItem = (item) => {
    // Ensure we have a valid ID
    const itemId = item.id || item._id || item.v_product_id;
    if (!itemId) {
      console.warn('[Catalog] Attempting to edit item without ID:', item.name);
    }
    
    const categoryId = item.category_id || '';
    const foundCategory = categories.find(c => c.id === categoryId);
    const categoryName = foundCategory ? foundCategory.name : (item.category_name || item.category || '');

    setFormData({
      name: item.name || '',
      price: (item.price !== undefined ? item.price : '').toString().replace('₹', ''),
      mrp: (item.mrp !== undefined ? item.mrp : (item.originalPrice || '')).toString().replace('₹', ''),
      type: item.type || 'Product',
      categoryId: categoryId,
      categoryName: categoryName,
      unit: item.uom || item.unit || item.uom_name || item.unit_name || '',
      description: item.description || '',
      bestSeller: item.is_featured === true || item.bestSeller === true,
      inStock: item.status === 'Active' || item.is_active !== false,
      image: item.image_url || item.imageUrl || null,
    });
    setShowAddForm(true);
  };

  const handleSelectAIProduct = (item) => {
    setFormData({
      ...formData,
      name: item.name,
      description: item.description,
      price: item.price,
      mrp: (parseInt(item.price) * 1.2).toFixed(0),
      image: item.image_url,
    });
    setShowAIModal(false);
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
          setFormData({
            ...formData,
            image: response.assets[0]
          });
        }
      }
    );
  };

  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({ ...formData, images: updatedImages });
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

    if (!formData.image) {
      Alert.alert('Image Required', 'Please upload an image for this item.');
      return;
    }


    setSaving(true);
    try {
      let uploadedUrl = formData.image?.uri || formData.image;
      
      if (formData.image?.uri && !formData.image.uri.startsWith('http')) {
        try {
          uploadedUrl = await uploadFile(formData.image.uri, 'product-images', formData.image.type || 'image/jpeg');
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          Alert.alert(
            'Upload Failed', 
            `Could not upload product image. ${uploadErr.message || 'Please try again or use a different image.'}`
          );
          setSaving(false);
          return;
        }
      } else if (typeof formData.image === 'string' && !formData.image.startsWith('http') && formData.image.startsWith('file://')) {
        // Handle case where image is just a file URI string
        try {
          uploadedUrl = await uploadFile(formData.image, 'product-images', 'image/jpeg');
        } catch (uploadErr) {
          console.error('Image upload failed (string URI):', uploadErr);
          Alert.alert('Upload Failed', 'Could not upload product image.');
          setSaving(false);
          return;
        }
      }


      const productPayload = {
        vendor_id: vendorData.id,
        name: formData.name,
        price: parseFloat(formData.price),
        uom: formData.unit,
        description: formData.description,
        image_url: uploadedUrl, 
        status: formData.inStock ? 'Active' : 'Inactive', // Use status as discovered via testing
        is_active: formData.inStock !== false, // Still include for safety
        is_featured: formData.bestSeller || false,
      };

      // Add optional fields only if they have values (including 0)
      if (formData.mrp !== undefined && formData.mrp !== '') {
        productPayload.mrp = parseFloat(formData.mrp);
      }
      
      if (formData.categoryId && formData.categoryId !== 'undefined' && formData.categoryId !== '') {
        productPayload.category_id = formData.categoryId;
      }

      // Final sanitization to prevent "undefined" string errors
      Object.keys(productPayload).forEach(key => {
        if (productPayload[key] === 'undefined' || productPayload[key] === undefined) {
          delete productPayload[key];
        }
      });


      let res;
      if (editingItem) {
        res = await updateVendorProduct(editingItem.id, productPayload);
      } else {
        res = await createVendorProduct(productPayload);
      }

      if (res && (res.success || res.id || res.product)) {
        // Update local state
        const savedProduct = res.product || (res.id ? res : null);
        
        if (!savedProduct) {
          // If we can't find product data, just re-fetch and close
          fetchProducts();
          setShowAddForm(false);
          setEditingItem(null);
          return;
        }

        const discount = calculateDiscount(formData.price, formData.mrp);
        const newItem = {
          ...savedProduct,
          id: savedProduct.id || savedProduct._id || editingItem?.id,
          name: savedProduct.name || formData.name,
          category: savedProduct.category_name || formData.categoryName || '',
          price: `₹${savedProduct.price || formData.price}`,
          originalPrice: (savedProduct.mrp || formData.mrp) ? `₹${savedProduct.mrp || formData.mrp}` : undefined,
          discount: discount,
          inStock: (savedProduct.is_active !== false),
          imageUrl: savedProduct.image_url || uploadedUrl,
          image_url: savedProduct.image_url || uploadedUrl,
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
        // Force a fresh fetch from server to ensure perfect sync
        fetchProducts();
        setShowAddForm(false);
        setEditingItem(null);
      } else {
        const errorMsg = res.error || 'Failed to save product';
        const errorDetail = res.details ? `\n\nDetails: ${res.details}` : '';
        Alert.alert('Error', errorMsg + errorDetail);
      }
    } catch (err) {
      console.error('Save Product Error:', err);
      Alert.alert('Error', err.message || 'Something went wrong while saving');
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
      image: null
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

  const renderAIModal = () => (
    <Modal
      visible={showAIModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowAIModal(false)}
    >
      <View style={styles.suggestionModalOverlay}>
        <View style={styles.suggestionModalContent}>
          <View style={styles.suggestionModalHeader}>
            <Text style={styles.suggestionModalTitle}>AI Product Suggestions</Text>
            <TouchableOpacity onPress={() => setShowAIModal(false)}>
              <Icon name="x" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.categoryList}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.keys(AI_DEFAULT_ITEMS).sort().map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.aicategoryChip,
                    selectedAICategory === cat && styles.selectedAICategoryChip
                  ]}
                  onPress={() => setSelectedAICategory(cat)}
                >
                  <Text style={[
                    styles.aicategoryText,
                    selectedAICategory === cat && styles.selectedAICategoryText
                  ]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.suggestionsList}>
              {selectedAICategory ? (
                getSuggestedItemsByCategory(selectedAICategory).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionCard}
                    onPress={() => handleSelectAIProduct(item)}
                  >
                    <Image source={{ uri: item.image_url }} style={styles.suggestionImage} />
                    <View style={styles.suggestionInfo}>
                      <Text style={styles.suggestionName}>{item.name}</Text>
                      <Text style={styles.suggestionPrice}>₹{item.price}</Text>
                    </View>
                    <Icon name="plus-circle" size={24} color={COLORS.orange} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptySuggestions}>
                  <Text style={styles.noSuggestionsText}>Select a category above to see suggestions</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderAIModal()}
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
        hideCart={true}
        profileImage={vendorData?.imageUrl || vendorData?.image || vendorData?.image_url || vendorData?.profilePhotoUrl || vendorData?.profile_image_url}
      />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.orange]}
            tintColor={COLORS.orange}
          />
        }
      >
                {/* Shop Profile Section - Premium Redesign */}
        <View style={styles.profileSectionWrapper}>
          <LinearGradient
            colors={['#1E293B', '#334155']}
            style={styles.premiumCover}
          >
            <View style={styles.coverOverlay} />
            <TouchableOpacity style={styles.editCoverBtn}>
              <Icon name="camera" size={14} color="#FFF" />
              <Text style={styles.editCoverText}>Change Cover</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.profileCard}>
            <View style={styles.profileHeaderRow}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarInner}>
                  {(vendorData?.imageUrl || vendorData?.image || vendorData?.image_url || vendorData?.profilePhotoUrl || vendorData?.profile_image_url) ? (
                    <Image 
                      source={{ uri: vendorData.imageUrl || vendorData.image || vendorData.image_url || vendorData.profilePhotoUrl || vendorData.profile_image_url }} 
                      style={styles.avatarImage} 
                    />
                  ) : (
                    <Icon name="user" size={32} color={COLORS.textMuted} />
                  )}
                </View>
                <View style={styles.onlineBadge} />
              </View>

              <View style={styles.shopMainDetails}>
                <View style={styles.nameBadgeRow}>
                  <Text style={styles.shopNameText}>{vendorData?.name || 'My Shop'}</Text>
                  <View style={styles.verifiedBadge}>
                    <Icon name="check" size={10} color="#FFF" />
                  </View>
                </View>
                <View style={styles.subDetailRow}>
                  <Icon name="map-pin" size={12} color="#64748B" />
                  <Text style={styles.subDetailText}>{vendorData?.address || 'Shop Address'}</Text>
                </View>
              </View>

              <View style={styles.ratingBadgeTop}>
                <Icon name="star" size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingValueText}>{vendorData?.rating || '4.8'}</Text>
              </View>
            </View>

            <View style={styles.completionContainer}>
              <View style={styles.completionHeader}>
                <Text style={styles.completionTitle}>Profile Strength</Text>
                <Text style={styles.completionValue}>{profileCompletion}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[COLORS.orange, '#F97316']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${profileCompletion}%` }]}
                />
              </View>
            </View>

            <View style={styles.quickActionsRow}>
              <TouchableOpacity style={styles.qActionItem} onPress={() => handleShare(vendorData)}>
                <View style={[styles.qActionIcon, { backgroundColor: '#F0F9FF' }]}>
                  <Icon name="share-2" size={18} color="#0EA5E9" />
                </View>
                <Text style={styles.qActionLabel}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.qActionItem} onPress={handlePreview}>
                <View style={[styles.qActionIcon, { backgroundColor: '#F5F3FF' }]}>
                  <Icon name="eye" size={18} color="#8B5CF6" />
                </View>
                <Text style={styles.qActionLabel}>Preview</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.qActionItem} onPress={() => navigation?.navigate('VendorOffers')}>
                <View style={[styles.qActionIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Icon name="tag" size={18} color="#10B981" />
                </View>
                <Text style={styles.qActionLabel}>Offers</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.qActionItem} onPress={() => navigation?.navigate('Settings')}>
                <View style={[styles.qActionIcon, { backgroundColor: '#F8FAFC' }]}>
                  <Icon name="settings" size={18} color="#64748B" />
                </View>
                <Text style={styles.qActionLabel}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
         {/* Catalogue Management Section */}
        <View style={styles.catalogSection}>
          <View style={styles.catalogHeaderRow}>
            <View>
              <Text style={styles.catalogHeading}>Manage Catalogue</Text>
              <Text style={styles.catalogSubheading}>{products.length} Items listed</Text>
            </View>
            <TouchableOpacity style={styles.addMainBtn} onPress={handleAddItem}>
              <Icon name="plus" size={18} color="#FFF" />
              <Text style={styles.addMainBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.managementGrid}>
            <TouchableOpacity
              style={styles.manageCard}
              onPress={handleDownloadCatalogue}
              activeOpacity={0.7}
            >
              <View style={[styles.manageIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Icon name="download" size={20} color="#10B981" />
              </View>
              <Text style={styles.manageLabel}>Export Excel</Text>
              <Text style={styles.manageDesc}>Get full list</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manageCard}
              onPress={() => navigation?.navigate('BulkPriceUpdate')}
              activeOpacity={0.7}
            >
              <View style={[styles.manageIconBox, { backgroundColor: '#F0F9FF' }]}>
                <Icon name="refresh-cw" size={20} color="#0EA5E9" />
              </View>
              <Text style={styles.manageLabel}>Bulk Update</Text>
              <Text style={styles.manageDesc}>Edit prices</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manageCard}
              onPress={() => setShowAIModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.manageIconBox, { backgroundColor: '#FFF7ED' }]}>
                <Icon name="zap" size={20} color="#F97316" />
              </View>
              <Text style={styles.manageLabel}>AI Smart Add</Text>
              <Text style={styles.manageDesc}>Auto-fill items</Text>
            </TouchableOpacity>
          </View>
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

                {!editingItem && (
                  <TouchableOpacity
                    style={styles.aiQuickAddButton}
                    onPress={() => setShowAIModal(true)}
                  >
                    <LinearGradient
                      colors={[COLORS.orange, '#f97316']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.aiButtonGradient}
                    >
                      <Icon name="zap" size={16} color={COLORS.white} />
                      <Text style={styles.aiButtonText}>Pick from AI Suggestions</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
                  <View style={styles.formSection}>
                    <View style={styles.imageUploadSection}>
                      <Text style={styles.inputLabel}>Product Photo *</Text>
                      <TouchableOpacity style={styles.singleImageSelector} onPress={handleImagePicker}>
                        {formData.image ? (
                          <View style={styles.selectedImageContainer}>
                            <Image 
                              source={formData.image.uri ? { uri: formData.image.uri } : (typeof formData.image === 'string' ? { uri: formData.image } : formData.image)}
                              style={styles.selectedImageLarge} 
                            />
                            <View style={styles.editImageIcon}>
                              <Icon name={getIconName('Camera')} size={20} color={COLORS.white} />
                            </View>
                          </View>
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Icon name={getIconName('Plus')} size={32} color={COLORS.textMuted} />
                            <Text style={styles.placeholderText}>Tap to add photo</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>

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
                            <Text style={[styles.dropdownText, !formData.categoryId ? styles.dropdownPlaceholder : null]} numberOfLines={1}>
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
                    </View> {/* End formFieldsStack */}
                  </View> {/* End formSection */}
                </ScrollView>
              </View> {/* End modalContent */}
            </View> {/* End modalOverlay */}
          </Modal>

          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <Image source={{ uri: item.imageUrl || item.image_url }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productCategory}>{item.category}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>{item.price}</Text>
                    <Text style={styles.unitText}> / {item.uom || item.unit || item.uom_name || item.unit_name || 'Unit'}</Text>
                    {!!item.originalPrice && (
                      <>
                        <Text style={styles.originalPrice}>{item.originalPrice}</Text>
                        {!!item.discount && <Text style={styles.discount}>{item.discount}</Text>}
                      </>
                    )}
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
      </ScrollView>

      <ExitConfirmModal 
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => BackHandler.exitApp()}
      />
    </View >
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
  catalogSection: {
      padding: 16,
    },
    catalogHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    catalogHeading: {
      fontSize: 20,
      fontWeight: '900',
      color: '#0F172A',
    },
    catalogSubheading: {
      fontSize: 12,
      fontWeight: '600',
      color: '#64748B',
    },
    addMainBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.orange,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 6,
      elevation: 2,
    },
    addMainBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFF',
    },
    managementGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    manageCard: {
      flex: 1,
      backgroundColor: '#FFF',
      padding: 16,
      borderRadius: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F1F5F9',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    manageIconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    manageLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: '#1E293B',
      textAlign: 'center',
      marginBottom: 4,
    },
    manageDesc: {
      fontSize: 9,
      fontWeight: '500',
      color: '#94A3B8',
      textAlign: 'center',
    },
    // Premium Profile Styles
    profileSectionWrapper: {
      backgroundColor: '#F8FAFC',
      marginBottom: 24,
    },
    premiumCover: {
      height: 160,
      justifyContent: 'flex-end',
      padding: 20,
    },
    coverOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    editCoverBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'flex-end',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      gap: 6,
    },
    editCoverText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFF',
      textTransform: 'uppercase',
    },
    profileCard: {
      backgroundColor: '#FFF',
      marginHorizontal: 16,
      marginTop: -50,
      borderRadius: 24,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 8,
    },
    profileHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    avatarWrapper: {
      position: 'relative',
      marginRight: 16,
    },
    avatarInner: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
    onlineBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#10B981',
      borderWidth: 2,
      borderColor: '#FFF',
    },
    shopMainDetails: {
      flex: 1,
    },
    nameBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    shopNameText: {
      fontSize: 18,
      fontWeight: '800',
      color: '#0F172A',
    },
    verifiedBadge: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#3B82F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    subDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    subDetailText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#64748B',
    },
    ratingBadgeTop: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFBEB',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#FEF3C7',
      gap: 4,
    },
    ratingValueText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#B45309',
    },
    completionContainer: {
      marginBottom: 24,
      backgroundColor: '#F8FAFC',
      padding: 16,
      borderRadius: 16,
    },
    completionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    completionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: '#64748B',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    completionValue: {
      fontSize: 12,
      fontWeight: '900',
      color: COLORS.orange,
    },
    progressTrack: {
      height: 6,
      backgroundColor: '#E2E8F0',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    qActionItem: {
      alignItems: 'center',
      gap: 8,
    },
    qActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qActionLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: '#475569',
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
  unitText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
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
  imageUploadSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  singleImageSelector: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.divider,
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selectedImageLarge: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editImageIcon: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: COLORS.orange,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
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
  aiQuickAddButton: {
    marginHorizontal: 0,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  aiButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  aiButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  suggestionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  suggestionModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  suggestionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  suggestionModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  categoryList: {
    marginBottom: 15,
  },
  aicategoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedAICategoryChip: {
    backgroundColor: COLORS.orange + '15',
    borderColor: COLORS.orange,
  },
  aicategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  selectedAICategoryText: {
    color: COLORS.orange,
  },
  suggestionsList: {
    gap: 12,
  },
  suggestionCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
    alignItems: 'center',
  },
  suggestionImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  suggestionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  suggestionPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.orange,
  },
  emptySuggestions: {
    padding: 40,
    alignItems: 'center',
  },
  noSuggestionsText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 14,
  },
});

export default VendorCatalogScreen;

