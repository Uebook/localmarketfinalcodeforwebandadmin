import { Share, Alert, Linking } from 'react-native';

export const handleShare = async (vendorData) => {
  try {
    const result = await Share.share({
      message: `Check out ${vendorData?.name || 'My Awesome Shop'} on Local Market!`,
      title: 'Share Shop',
    });
  } catch (error) {
    Alert.alert('Error', 'Unable to share');
  }
};

export const handlePreview = (navigation, vendorData) => {
  if (navigation && vendorData) {
    const fullAddress = [
      vendorData.address || 'Shop 12, Main Market',
      vendorData.landmark || 'Near Clock Tower',
      `${vendorData.city || 'New Delhi'} - ${vendorData.pincode || '110001'}`
    ].filter(Boolean).join(' / ');

    const businessData = {
      ...vendorData,
      id: vendorData.id || 'v1',
      name: vendorData.name || 'My Awesome Shop',
      category: vendorData.category || 'Grocery',
      rating: vendorData.rating || 4.8,
      reviewCount: vendorData.reviewCount || 12,
      address: fullAddress,
      contactNumber: vendorData.contactNumber || '9876543210',
      whatsappNumber: vendorData.whatsappNumber || vendorData.contactNumber || '9876543210',
      openTime: vendorData.openTime || '09:00 AM - 09:00 PM',
      about: vendorData.about || 'Welcome to our shop! We provide high quality products.',
      products: vendorData.products || [],
      isVerified: vendorData.isVerified !== false,
    };
    
    navigation.navigate('VendorDetails', { business: businessData });
  }
};



