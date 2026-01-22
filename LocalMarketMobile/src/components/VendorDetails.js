import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Linking, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import EnquiryModal from './EnquiryModal';
import WriteReview from './WriteReview';
import MapView from './MapView';
import { getVendorProducts, getVendorReviews, submitReview } from '../services/api';
import { getUserId } from '../utils/userStorage';

const VendorDetails = ({ navigation, route, savedBusinessIds = [], setSavedBusinessIds }) => {
    const COLORS = useThemeColors();
    const styles = createStyles(COLORS);
    // Handle both 'business' and 'vendor' parameter names
    const business = route.params?.business || route.params?.vendor;
    const [activeTab, setActiveTab] = useState('Overview');
    const [isSaved, setIsSaved] = useState(savedBusinessIds.includes(business?.id));
    const [showEnquiryModal, setShowEnquiryModal] = useState(false);
    const [showWriteReview, setShowWriteReview] = useState(false);
    const [vendorProducts, setVendorProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [businessWithProducts, setBusinessWithProducts] = useState(business);
    const [reviews, setReviews] = useState(business?.reviews || []);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        // Load vendor products when component mounts or business changes
        if (business?.id) {
            loadVendorProducts();
            loadReviews();
        }
    }, [business?.id]);

    const loadVendorProducts = async () => {
        if (!business?.id) return;

        try {
            setLoadingProducts(true);
            const data = await getVendorProducts(business.id);

            if (data?.products && Array.isArray(data.products)) {
                // Transform vendor products to match the expected format
                const transformedProducts = data.products.map(product => ({
                    id: product.id,
                    name: product.name,
                    price: product.price ? `₹${product.price}` : product.mrp ? `₹${product.mrp}` : 'Price on request',
                    mrp: product.mrp ? `₹${product.mrp}` : null,
                    uom: product.uom || '',
                    description: product.description || `${product.name}${product.uom ? ` (${product.uom})` : ''}`,
                    imageUrl: product.image_url || product.imageUrl || 'https://via.placeholder.com/200',
                    category_id: product.category_id,
                }));

                setVendorProducts(transformedProducts);
                // Update business object with products
                setBusinessWithProducts({
                    ...business,
                    products: transformedProducts,
                });
            } else {
                // If no products from API, use products from business object if available
                setVendorProducts(business.products || []);
                setBusinessWithProducts(business);
            }
        } catch (error) {
            console.error('Error loading vendor products:', error);
            // Fallback to products from business object if available
            setVendorProducts(business.products || []);
            setBusinessWithProducts(business);
        } finally {
            setLoadingProducts(false);
        }
    };

    if (!business) {
        return (
            <View style={styles.container}>
                <Text>Business not found</Text>
            </View>
        );
    }

    // Use businessWithProducts if available, otherwise use business
    const displayBusiness = businessWithProducts || business;

    const tabs = ['Overview', 'Products/Services', 'Reviews', 'Quick Info'];

    const handleSave = () => {
        const newSavedState = !isSaved;
        setIsSaved(newSavedState);
        if (setSavedBusinessIds) {
            setSavedBusinessIds(prev =>
                prev.includes(business.id)
                    ? prev.filter(id => id !== business.id)
                    : [...prev, business.id]
            );
        }
    };

    const handleCall = () => {
        if (business.contactNumber) {
            Linking.openURL(`tel:${business.contactNumber}`);
        } else {
            Alert.alert('Error', 'Phone number not available');
        }
    };

    const handleWhatsApp = () => {
        const phone = business.whatsappNumber || business.contactNumber;
        if (phone) {
            Linking.openURL(`whatsapp://send?phone=${phone}`);
        } else {
            Alert.alert('Error', 'WhatsApp number not available');
        }
    };

    const handleCopyAddress = () => {
        const address = business.address || '';
        // In a real app, you'd use Clipboard API
        Alert.alert('Copied', 'Address copied to clipboard');
    };

    const loadReviews = async () => {
        if (!business?.id) return;
        
        try {
            setLoadingReviews(true);
            const response = await getVendorReviews(business.id);
            if (response && response.reviews) {
                // Transform API reviews to match component format
                const transformedReviews = response.reviews.map(review => ({
                    id: review.id,
                    userName: review.user_name || review.userName || 'Anonymous',
                    rating: review.rating,
                    comment: review.comment,
                    date: review.created_at ? new Date(review.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
                    reply: review.reply || null,
                }));
                setReviews(transformedReviews);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            // Keep existing reviews if API fails
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleReviewSubmit = async (reviewData) => {
        try {
            const userId = await getUserId();
            
            // Submit review to API
            await submitReview({
                vendorId: business.id,
                userId: userId,
                userName: reviewData.userName,
                rating: reviewData.rating,
                comment: reviewData.comment,
            });

            // Reload reviews to show the new one
            await loadReviews();

            Alert.alert(
                'Review Submitted',
                `Thank you for your ${reviewData.rating}-star review! Your feedback helps other customers make better decisions.`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to submit review. Please try again.',
                [{ text: 'OK' }]
            );
            console.error('Error submitting review:', error);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
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
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Icon name={getIconName('ArrowLeft')} size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
                                <Icon name={getIconName('Search')} size={20} color={COLORS.white} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
                                <Icon name={getIconName('Share2')} size={20} color={COLORS.white} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
                                <Icon name={getIconName('MoreVertical')} size={20} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Main Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.businessHeader}>
                        <Text style={styles.businessName}>{displayBusiness.name}</Text>
                        <Image
                            source={{ uri: displayBusiness.imageUrl }}
                            style={styles.businessImage}
                            resizeMode="cover"
                        />
                    </View>

                    <View style={styles.ratingRow}>
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>{displayBusiness.rating}</Text>
                            <Icon name={getIconName('Star')} size={10} color="#ffffff" />
                        </View>
                        <Text style={styles.reviewCount}>{displayBusiness.reviewCount} Ratings</Text>
                        {displayBusiness.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>Verified</Text>
                                <Icon name={getIconName('CheckCircle')} size={12} color="#2563eb" />
                            </View>
                        )}
                    </View>

                    <View style={styles.locationRow}>
                        <Icon name={getIconName('MapPin')} size={14} color="#9ca3af" />
                        <Text style={styles.locationText}>
                            {displayBusiness.address || 'Location Unavailable'}
                            {displayBusiness.landmark ? `, ${displayBusiness.landmark}` : ''}
                        </Text>
                    </View>
                    <Text style={styles.categoryText}>
                        {displayBusiness.category} • {displayBusiness.yearsInBusiness || 'New Business'}
                    </Text>
                    <Text style={styles.openTime}>{displayBusiness.openTime || 'Open Now'}</Text>

                    {/* Action Grid */}
                    <View style={styles.actionGrid}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleCall} activeOpacity={0.7}>
                            <View style={[styles.actionIcon, styles.callIcon]}>
                                <Icon name={getIconName('Phone')} size={20} color="#ffffff" />
                            </View>
                            <Text style={styles.actionText}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp} activeOpacity={0.7}>
                            <View style={[styles.actionIcon, { backgroundColor: '#22c55e' }]}>
                                <Icon name={getIconName('MessageCircle')} size={20} color="#ffffff" />
                            </View>
                            <Text style={styles.actionText}>WhatsApp</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setShowEnquiryModal(true)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, styles.enquiryIcon]}>
                                <Icon name={getIconName('MessageSquare')} size={20} color="#1e293b" />
                            </View>
                            <Text style={styles.actionText}>Enquiry</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleSave}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, styles.enquiryIcon]}>
                                <Icon
                                    name={getIconName('Heart')}
                                    size={20}
                                    color={isSaved ? '#ef4444' : '#1e293b'}
                                />
                            </View>
                            <Text style={styles.actionText}>{isSaved ? 'Saved' : 'Save'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                            <View style={[styles.actionIcon, styles.enquiryIcon]}>
                                <Icon name={getIconName('Star')} size={20} color="#1e293b" />
                            </View>
                            <Text style={styles.actionText}>Review</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabs}
                    >
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, activeTab === tab && styles.tabActive]}
                                onPress={() => setActiveTab(tab)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Tab Content */}
                <View style={styles.tabContent}>
                    {activeTab === 'Overview' && (
                        <View style={styles.overviewContent}>
                            {/* Start Review */}
                            <View style={styles.reviewSection}>
                                <Text style={styles.sectionTitle}>Start a review</Text>
                                <TouchableOpacity
                                    style={styles.reviewButton}
                                    onPress={() => setShowWriteReview(true)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.starRow}>
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Icon key={s} name={getIconName('Star')} size={32} color="#e5e7eb" />
                                        ))}
                                    </View>
                                    <Text style={styles.writeReviewText}>Tap to write a review</Text>
                                </TouchableOpacity>
                            </View>

                            {/* About */}
                            {business.about && (
                                <View style={styles.aboutSection}>
                                    <Text style={styles.sectionTitle}>About Us</Text>
                                    <Text style={styles.aboutText}>{business.about}</Text>
                                </View>
                            )}

                            {/* Address */}
                            <View style={styles.addressSection}>
                                <Text style={styles.sectionTitle}>Address</Text>
                                <Text style={styles.addressText}>{business.address}</Text>
                                {business.landmark && (
                                    <Text style={styles.landmarkText}>Near {business.landmark}</Text>
                                )}
                                {business.city && business.pincode && (
                                    <Text style={styles.landmarkText}>{business.city} - {business.pincode}</Text>
                                )}
                                <TouchableOpacity
                                    style={styles.copyButton}
                                    onPress={handleCopyAddress}
                                    activeOpacity={0.7}
                                >
                                    <Icon name={getIconName('Copy')} size={12} color="#2563eb" />
                                    <Text style={styles.copyText}>Copy</Text>
                                </TouchableOpacity>
                                <View style={styles.mapPreview}>
                                    <Icon name={getIconName('MapPin')} size={16} color="#9ca3af" />
                                    <Text style={styles.mapPreviewText}>Map Preview</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {activeTab === 'Products/Services' && (
                        <View style={styles.productsContent}>
                            <Text style={styles.sectionTitle}>Products & Services</Text>
                            {loadingProducts ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={COLORS.orange} />
                                    <Text style={styles.loadingText}>Loading products...</Text>
                                </View>
                            ) : vendorProducts.length > 0 ? (
                                <View style={styles.productsList}>
                                    {vendorProducts.map((product) => (
                                        <TouchableOpacity
                                            key={product.id}
                                            style={styles.productCard}
                                            onPress={() => navigation?.navigate('ProductDetails', {
                                                product,
                                                business: displayBusiness
                                            })}
                                            activeOpacity={0.7}
                                        >
                                            <Image
                                                source={{ uri: product.imageUrl }}
                                                style={styles.productImage}
                                                resizeMode="cover"
                                            />
                                            <View style={styles.productInfo}>
                                                <Text style={styles.productName}>{product.name}</Text>
                                                {product.description && (
                                                    <Text style={styles.productDescription} numberOfLines={2}>
                                                        {product.description}
                                                    </Text>
                                                )}
                                                {product.uom && (
                                                    <Text style={styles.productUom}>{product.uom}</Text>
                                                )}
                                                <View style={styles.productFooter}>
                                                    <View>
                                                        <Text style={styles.productPrice}>{product.price}</Text>
                                                        {product.mrp && product.mrp !== product.price && (
                                                            <Text style={styles.productMrp}>{product.mrp}</Text>
                                                        )}
                                                    </View>
                                                    <TouchableOpacity
                                                        style={styles.addButton}
                                                        activeOpacity={0.7}
                                                        onPress={(e) => {
                                                            e.stopPropagation();
                                                            // Handle add to cart or enquiry
                                                            setShowEnquiryModal(true);
                                                        }}
                                                    >
                                                        <Icon name={getIconName('Plus')} size={16} color="#dc2626" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <Icon name={getIconName('Package')} size={48} color={COLORS.textMuted} />
                                    <Text style={styles.emptyText}>No products listed by this vendor yet.</Text>
                                    <Text style={styles.emptySubtext}>Check back later or contact the vendor directly.</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {activeTab === 'Reviews' && (
                        <View style={styles.reviewsContent}>
                            <View style={styles.reviewsHeader}>
                                <Text style={styles.sectionTitle}>User Reviews</Text>
                                <Text style={styles.reviewsCount}>
                                    {reviews?.length || 0} reviews
                                </Text>
                            </View>

                            {loadingReviews ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color={COLORS.orange} />
                                    <Text style={styles.loadingText}>Loading reviews...</Text>
                                </View>
                            ) : reviews && reviews.length > 0 ? (
                                <View style={styles.reviewsList}>
                                    {reviews.map((review) => (
                                        <View key={review.id} style={styles.reviewCard}>
                                            <View style={styles.reviewHeader}>
                                                <View style={styles.reviewUser}>
                                                    <View style={styles.userAvatar}>
                                                        <Text style={styles.userAvatarText}>
                                                            {review.userName.charAt(0).toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <View>
                                                        <Text style={styles.userName}>{review.userName}</Text>
                                                        <View style={styles.reviewStars}>
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Icon
                                                                    key={s}
                                                                    name={getIconName('Star')}
                                                                    size={12}
                                                                    color={s <= review.rating ? '#fbbf24' : '#e5e7eb'}
                                                                />
                                                            ))}
                                                        </View>
                                                    </View>
                                                </View>
                                                <Text style={styles.reviewDate}>{review.date}</Text>
                                            </View>

                                            <Text style={styles.reviewComment}>"{review.comment}"</Text>

                                            {review.reply && (
                                                <View style={styles.replyCard}>
                                                    <View style={styles.replyHeader}>
                                                        <Icon name={getIconName('MessageCircle')} size={12} color="#dc2626" />
                                                        <Text style={styles.replyLabel}>Response from Owner:</Text>
                                                    </View>
                                                    <Text style={styles.replyText}>{review.reply}</Text>
                                                </View>
                                            )}

                                            <TouchableOpacity style={styles.helpfulButton} activeOpacity={0.7}>
                                                <Icon name={getIconName('ThumbsUp')} size={12} color="#9ca3af" />
                                                <Text style={styles.helpfulText}>Helpful</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No reviews yet.</Text>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setShowWriteReview(true)}
                                    >
                                        <Text style={styles.writeReviewText}>Be the first to write a review</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {activeTab === 'Quick Info' && (
                        <View style={styles.quickInfoContent}>
                            {/* Map View */}
                            <MapView
                                address={displayBusiness.address}
                                latitude={displayBusiness.latitude || displayBusiness.lat}
                                longitude={displayBusiness.longitude || displayBusiness.lng}
                                businessName={displayBusiness.name}
                            />

                            <View style={styles.infoGrid}>
                                <View style={styles.infoCard}>
                                    <Text style={styles.infoLabel}>Payment Modes</Text>
                                    <Text style={styles.infoValue}>Cash, UPI, Cards</Text>
                                </View>
                                <View style={styles.infoCard}>
                                    <Text style={styles.infoLabel}>Amenities</Text>
                                    <Text style={styles.infoValue}>AC, Parking, Wifi</Text>
                                </View>
                                <View style={styles.infoCard}>
                                    <Text style={styles.infoLabel}>Response Time</Text>
                                    <Text style={styles.infoValue}>{business.responseTime || 'Within 2 hours'}</Text>
                                </View>
                                <View style={styles.infoCard}>
                                    <Text style={styles.infoLabel}>Year Est.</Text>
                                    <Text style={styles.infoValue}>{business.yearsInBusiness || 'N/A'}</Text>
                                </View>
                                {business.weeklyOff && (
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoLabel}>Weekly Off</Text>
                                        <Text style={styles.infoValue}>{business.weeklyOff}</Text>
                                    </View>
                                )}
                                {business.circle && (
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoLabel}>Service Circle</Text>
                                        <Text style={styles.infoValue}>{business.circle}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Sticky Bottom Actions */}
            <View style={styles.bottomActions}>
                <TouchableOpacity
                    onPress={handleCall}
                    activeOpacity={0.8}
                    style={styles.callButtonContainer}
                >
                    <LinearGradient
                        colors={COLORS.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.callButton}
                    >
                        <Icon name={getIconName('Phone')} size={20} color={COLORS.white} />
                        <Text style={styles.callButtonText}>Call Now</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.enquireButton}
                    onPress={() => setShowEnquiryModal(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.enquireButtonText}>Enquire Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={handleWhatsApp}
                    activeOpacity={0.8}
                >
                    <Icon name={getIconName('MessageCircle')} size={20} color="#ffffff" />
                    <Text style={styles.whatsappButtonText}>WhatsApp</Text>
                </TouchableOpacity>
            </View>

            {/* Enquiry Modal */}
            <EnquiryModal
                isOpen={showEnquiryModal}
                businessName={business.name}
                onClose={() => setShowEnquiryModal(false)}
            />

            {/* Write Review Modal */}
            <WriteReview
                visible={showWriteReview}
                onClose={() => setShowWriteReview(false)}
                onSubmit={handleReviewSubmit}
                vendorName={business.name}
                vendorId={business.id}
            />
        </View>
    );
};

const createStyles = (COLORS) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
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
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        position: 'relative',
        zIndex: 1,
    },
    backButton: {
        padding: 8,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerButton: {
        padding: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    infoCard: {
        backgroundColor: '#ffffff',
        padding: 16,
        marginBottom: 8,
    },
    businessHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    businessName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        flex: 1,
        marginRight: 8,
        lineHeight: 24,
    },
    businessImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    ratingBadge: {
        backgroundColor: '#15803d',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#ffffff',
    },
    reviewCount: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    verifiedBadge: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    verifiedText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#2563eb',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    locationText: {
        fontSize: 14,
        color: '#475569',
    },
    categoryText: {
        fontSize: 12,
        color: '#6b7280',
        marginLeft: 18,
        marginBottom: 4,
    },
    openTime: {
        fontSize: 12,
        color: '#1e293b',
        fontWeight: '500',
        marginLeft: 18,
        marginBottom: 24,
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 24,
    },
    actionButton: {
        alignItems: 'center',
        gap: 4,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    callIcon: {
        backgroundColor: '#dc2626',
    },
    enquiryIcon: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    actionText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1e293b',
    },
    tabsContainer: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabs: {
        paddingHorizontal: 16,
        gap: 24,
    },
    tab: {
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#1e293b',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#1e293b',
    },
    tabContent: {
        backgroundColor: '#ffffff',
        minHeight: 300,
        padding: 16,
    },
    overviewContent: {
        gap: 24,
    },
    reviewSection: {
        marginBottom: 8,
    },
    reviewButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    starRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    aboutSection: {
        marginBottom: 8,
    },
    aboutText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    addressSection: {
        marginBottom: 8,
    },
    addressText: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 4,
    },
    landmarkText: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    copyText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2563eb',
    },
    mapPreview: {
        height: 128,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 4,
        marginTop: 12,
    },
    mapPreviewText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9ca3af',
    },
    productsContent: {
        gap: 16,
    },
    productsList: {
        gap: 16,
    },
    productCard: {
        flexDirection: 'row',
        gap: 12,
        padding: 12,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    productDescription: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 8,
        lineHeight: 16,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#dc2626',
    },
    productUom: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
        marginBottom: 4,
    },
    productMrp: {
        fontSize: 12,
        color: '#9ca3af',
        textDecorationLine: 'line-through',
        marginTop: 2,
    },
    addButton: {
        padding: 4,
        backgroundColor: '#fee2e2',
        borderRadius: 12,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    emptySubtext: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 8,
        textAlign: 'center',
    },
    reviewsContent: {
        gap: 16,
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    reviewsCount: {
        fontSize: 12,
        color: '#6b7280',
    },
    reviewsList: {
        gap: 16,
    },
    reviewCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    reviewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    userAvatarText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#dc2626',
    },
    userName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    reviewStars: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewDate: {
        fontSize: 10,
        color: '#9ca3af',
        fontWeight: '500',
    },
    reviewComment: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 12,
        paddingLeft: 40,
    },
    replyCard: {
        marginLeft: 40,
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 2,
        borderLeftColor: '#dc2626',
        marginBottom: 8,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    replyLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1e293b',
    },
    replyText: {
        fontSize: 12,
        color: '#475569',
        fontStyle: 'italic',
    },
    helpfulButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 40,
        marginTop: 4,
    },
    helpfulText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9ca3af',
    },
    quickInfoContent: {
        gap: 16,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    infoCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9ca3af',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    writeReviewText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#dc2626',
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        flexDirection: 'row',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    callButtonContainer: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    callButton: {
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    callButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    enquireButton: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#dc2626',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    enquireButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#dc2626',
    },
    whatsappButton: {
        flex: 1,
        backgroundColor: '#22c55e',
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    whatsappButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
});

export default VendorDetails;
