import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, PanResponder, Modal, Share } from 'react-native';
import ImageWithFallback from './ImageWithFallback';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
// Static vendor data removed - using database only
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { 
    getVendors, 
    getVendorProducts, 
    getCategories,
    getSearchResults 
} from '../services/api';

const SearchResults = ({
    navigation,
    route,
    onBusinessClick,
    savedIds: propSavedIds = [],
    onToggleSave,
    savedBusinessIds = [],
    setSavedBusinessIds,
    results: propResults,
    isSavedTab = false,
    query: propQuery,
    locationState
}) => {
    // Get query from route params or props
    const query = route?.params?.query || propQuery;
    const categoryId = route?.params?.categoryId;
    const circle = route?.params?.circle;
    const isCategorySearch = route?.params?.isCategorySearch || false; 
    const COLORS = useThemeColors();
    const styles = createStyles(COLORS);

    const savedIds = savedBusinessIds.length > 0 ? savedBusinessIds : propSavedIds;
    const [sortBy, setSortBy] = useState('default');
    const [maxDistance, setMaxDistance] = useState(25);
    const [filterTopRated, setFilterTopRated] = useState(false);
    const [filterVerified, setFilterVerified] = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const sliderTrackRef = useRef(null);
    const [sliderWidth, setSliderWidth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        loadSearchData();
    }, [query, categoryId, circle, locationState?.city]);

    const loadSearchData = async () => {
        try {
            setLoading(true);

            // 1. Prepare Localized Filters
            const filters = {
                q: query || '',
                // format=vendors returns vendor-centric results with matchingProducts,
                // which is exactly what the website's search page uses.
                format: 'vendors'
            };


            // Handle City
            if (locationState?.city) {
                // If "All Amritsar", use Amritsar for hierarchical search
                if (locationState.city.startsWith('All ')) {
                    filters.city = locationState.city.replace('All ', '').trim();
                } else {
                    filters.city = locationState.city.split(',')[0].trim();
                }
            }

            // Handle Circle
            if (circle) {
                filters.circle = circle;
            } else if (route?.params?.circle) {
                filters.circle = route.params.circle;
            }

            // Map categoryId to query if it's a category search but no text query provided
            if (categoryId && !query) {
                try {
                    const cats = await getCategories();
                    const cat = cats?.categories?.find(c => String(c.id) === String(categoryId));
                    if (cat) filters.q = cat.name;
                } catch (e) {}
            }

            // 2. Call unified Search API (Matches Website logic)
            const searchData = await getSearchResults(filters);
            
            // 3. Normalize results for the existing rendering logic
            const results = searchData?.results || [];
            
            // Fetch minimal details or use the ones from search if needed
            // The /api/search already includes vendor info and matchingProducts
            setVendors(results);

        } catch (error) {
            console.error('Error loading search data:', error);
            setVendors([]);
        } finally {
            setLoading(false);
        }
    };

    // Haversine formula to calculate distance in km
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    // Transform vendors to business format
    const transformVendorToBusiness = (vendor) => {
        let distanceStr = 'Nearby';
        let distanceValue = 0;

        if (locationState?.lat && locationState?.lng && vendor.latitude && vendor.longitude) {
            const dist = calculateDistance(
                locationState.lat,
                locationState.lng,
                parseFloat(vendor.latitude),
                parseFloat(vendor.longitude)
            );
            if (dist !== null) {
                distanceValue = dist;
                distanceStr = `${dist.toFixed(1)} km`;
            }
        } else {
            // Fallback for demo/missing data but keep it deterministic
            const vendorIdNum = parseInt(String(vendor.id).replace(/\D/g, '')) || 0;
            distanceValue = (vendorIdNum % 15) + 0.5; // More realistic 0-15km
            distanceStr = `${distanceValue.toFixed(1)} km`;
        }

        return {
            id: vendor.id,
            name: vendor.name || vendor.shop_name || '',
            category: vendor.category || 'General',
            rating: parseFloat(vendor.rating) || (parseInt(String(vendor.id).charCodeAt(0)) % 2) + 3.5, // Deterministic mock rating 3.5-4.5
            reviewCount: vendor.reviewCount || vendor.review_count || (parseInt(String(vendor.id).charCodeAt(0)) % 100) + 10,
            distance: distanceStr,
            distanceValue: distanceValue, // Store raw value for sorting/filtering
            imageUrl: vendor.imageUrl || vendor.image_url,
            address: vendor.address || `${vendor.city || ''} ${vendor.state || ''}`.trim() || 'Nearby',
            isVerified: vendor.kycStatus === 'Approved' || vendor.kyc_status === 'Approved',
            matchingProducts: vendor.matchingProducts || vendor.products || [],
            products: vendor.matchingProducts || vendor.products || [],
            contactNumber: vendor.contactNumber || vendor.contact_number || '',

            email: vendor.email || '',
        };
    };

    const allBusinesses = useMemo(() => {
        // Use database vendors only - no static fallback
        return vendors.map(transformVendorToBusiness);
    }, [vendors]);

    const baseResults = propResults || allBusinesses;

    const filteredResults = useMemo(() => {
        let results = [...baseResults];

        if (query && !propResults) {
            const lowerQuery = query.toLowerCase();
            // Split query into words for better matching
            const queryWords = lowerQuery.split(/[\s\/&]+/).filter(w => w.length > 0);

            results = results.filter(item => {
                const itemName = (item.name || '').toLowerCase();
                const itemCategory = (item.category || '').toLowerCase();

                // Check if any query word matches name or category
                const matchesName = queryWords.some(word => itemName.includes(word));
                const matchesCategory = queryWords.some(word => itemCategory.includes(word)) ||
                    itemCategory.includes(lowerQuery) ||
                    lowerQuery.includes(itemCategory);

                // Also check if category name is in the query (e.g., "Groceries" in "Groceries / General Store")
                const categoryInQuery = itemCategory && lowerQuery.includes(itemCategory.split(' ')[0]);

                // Check vendor products (vendors that sell products matching the query)
                const matchesVendorProducts = item.products && Array.isArray(item.products) && item.products.some(p => {
                    const productName = (p.name || '').toLowerCase();
                    return queryWords.some(word => productName.includes(word));
                });

                return matchesName || matchesCategory || categoryInQuery || matchesVendorProducts;
            });
        }

        results = results.filter(item => {
            return item.distanceValue <= maxDistance;
        });

        if (filterTopRated) {
            results = results.filter((item) => item.rating >= 4.0);
        }

        if (filterVerified) {
            results = results.filter(item => item.isVerified);
        }

        if (sortBy === 'rating') {
            results.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'distance') {
            results.sort((a, b) => a.distanceValue - b.distanceValue);
        }

        return results;
    }, [baseResults, sortBy, filterTopRated, filterVerified, maxDistance, query, propResults]);

    const handleBusinessClick = (business) => {
        if (onBusinessClick) {
            onBusinessClick(business);
        } else if (navigation) {
            navigation.navigate('VendorDetails', { business, isSaved: savedIds.includes(business.id) });
        }
    };

    const handleToggleSave = (id) => {
        if (onToggleSave) {
            onToggleSave(id);
        } else if (setSavedBusinessIds) {
            setSavedBusinessIds(prev =>
                prev.includes(id) ? prev.filter(savedId => savedId !== id) : [...prev, id]
            );
        }
    };

    const handleSliderMove = (evt) => {
        if (sliderWidth === 0 || !sliderTrackRef.current) return;

        sliderTrackRef.current.measure((x, y, width, height, pageX, pageY) => {
            const touchX = evt.nativeEvent.pageX - pageX;
            const percentage = Math.max(0, Math.min(1, touchX / width));
            const newDistance = Math.round(1 + percentage * 49); // Range: 1 to 50 km

            if (newDistance !== maxDistance) {
                setMaxDistance(newDistance);
            }
        });
    };

    const handleSliderMoveFromLocation = (locationX) => {
        if (sliderWidth === 0) return;
        const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
        const newDistance = Math.round(1 + percentage * 49);
        if (newDistance !== maxDistance) {
            setMaxDistance(newDistance);
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                setIsDragging(true);
                if (sliderTrackRef.current) {
                    sliderTrackRef.current.measure((x, y, width, height, pageX, pageY) => {
                        const touchX = evt.nativeEvent.pageX - pageX;
                        handleSliderMoveFromLocation(touchX);
                    });
                }
            },
            onPanResponderMove: (evt) => {
                if (sliderTrackRef.current) {
                    sliderTrackRef.current.measure((x, y, width, height, pageX, pageY) => {
                        const touchX = evt.nativeEvent.pageX - pageX;
                        handleSliderMoveFromLocation(touchX);
                    });
                }
            },
            onPanResponderRelease: () => {
                setIsDragging(false);
            },
        })
    ).current;

    const handleSliderPress = (evt) => {
        if (sliderWidth === 0 || !sliderTrackRef.current) return;

        sliderTrackRef.current.measure((x, y, width, height, pageX, pageY) => {
            const touchX = evt.nativeEvent.pageX - pageX;
            const percentage = Math.max(0, Math.min(1, touchX / width));
            const newDistance = Math.round(1 + percentage * 49);

            if (newDistance !== maxDistance) {
                setMaxDistance(newDistance);
            }
        });
    };

    const handleShare = async () => {
        try {
            const message = `Check out local stores and best deals for "${query || 'local services'}" on LOKALL app!`;
            await Share.share({
                message,
                title: 'LOKALL Search',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleBusinessShare = async (business) => {
        try {
            const message = `Check out ${business.name} on LOKALL!\nLocation: ${business.address}\n\nDownload LOKALL app for best local updates.`;
            await Share.share({
                message,
                title: business.name,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const startListening = async () => {
        console.warn('Voice search has been removed.');
    };

    const stopListening = async () => {
        // Voice search removed
    };

    const sortOptions = [
        { value: 'default', label: 'Default' },
        { value: 'rating', label: 'Rating (High to Low)' },
        { value: 'distance', label: 'Distance (Near to Far)' },
    ];

    const renderBusinessCard = ({ item, index }) => {
        const isSaved = savedIds.includes(item.id);
        const matchingProducts = item.matchingProducts || [];

        return (
            <TouchableOpacity
                style={styles.businessCard}
                onPress={() => handleBusinessClick(item)}
                activeOpacity={0.8}
            >
                <View style={styles.cardContent}>
                    <View style={styles.imageContainer}>
                        <ImageWithFallback
                            source={{ uri: item.imageUrl }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        {item.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>Verified Partner</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.headerRow}>
                            <Text style={styles.businessName} numberOfLines={1}>{item.name}</Text>
                            <TouchableOpacity style={styles.callButton} activeOpacity={0.7}>
                                <Icon name={getIconName('Phone')} size={12} color="#ffffff" />
                                <Text style={styles.callButtonText}>Call</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.categoryText} numberOfLines={1}>
                            {item.category} • {item.address}
                        </Text>

                        <View style={styles.ratingRow}>
                            <View style={styles.ratingBadge}>
                                <Text style={styles.ratingText}>{item.rating}</Text>
                                <Icon name={getIconName('Star')} size={10} color="#16a34a" />
                            </View>
                            <Text style={styles.reviewCount}>({item.reviewCount} Ratings)</Text>
                        </View>

                        <View style={styles.footerRow}>
                            <View style={styles.distanceContainer}>
                                <Icon name={getIconName('MapPin')} size={12} color="#ef4444" />
                                <Text style={styles.distanceText}>{item.distance}</Text>
                            </View>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleToggleSave(item.id);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Icon
                                        name={getIconName('Heart')}
                                        size={16}
                                        color={isSaved ? COLORS.orange : COLORS.textMuted}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleBusinessShare(item);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Icon name={getIconName('Share2')} size={16} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Matching Products Section (Website-style) */}
                {matchingProducts.length > 0 && query && (
                    <View style={styles.matchingSection}>
                        <Text style={styles.matchingSectionLabel}>MATCHING ITEMS</Text>
                        <View style={styles.matchingList}>
                            {matchingProducts.slice(0, 2).map((prod, idx) => {
                                const isMatch = query && prod.name.toLowerCase().includes(query.toLowerCase());
                                return (
                                    <View 
                                        key={prod.id || idx} 
                                        style={[
                                            styles.matchingItem,
                                            isMatch && styles.matchingItemActive
                                        ]}
                                    >
                                        <View style={styles.matchingItemInfo}>
                                            <Image 
                                                source={{ uri: prod.image }} 
                                                style={styles.matchingItemImage} 
                                            />
                                            <View>
                                                <Text style={styles.matchingItemName} numberOfLines={1}>
                                                    {prod.name}
                                                </Text>
                                                <Text style={styles.matchingItemPrice}>₹{prod.price}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.basketBtn}
                                            activeOpacity={0.7}
                                        >
                                            <Icon name={getIconName('ShoppingBag')} size={14} color="#64748B" />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                            {matchingProducts.length > 2 && (
                                <Text style={styles.moreMatchingText}>
                                    + {matchingProducts.length - 2} more matching items
                                </Text>
                            )}
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };


    const handleBack = () => {
        if (navigation) {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            {/* Gradient Header */}
            <LinearGradient
                colors={COLORS.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBackground}
            />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
                        <Icon name={getIconName('ArrowLeft')} size={24} color={COLORS.white} />
                    </TouchableOpacity>

                    <View style={styles.searchContainer}>
                        <Icon name={getIconName('Search')} size={20} color="rgba(255, 255, 255, 0.7)" style={styles.searchIcon} />
                        <View style={styles.searchInputContainer}>
                            <Text style={styles.searchInput}>{query || 'Search local stores...'}</Text>
                            <Text style={styles.locationText}>{locationState?.city || 'Nearby'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleShare} style={styles.shareButton} activeOpacity={0.7}>
                        <Icon name={getIconName('Share2')} size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    <TouchableOpacity
                        style={[styles.filterButton, showFilterPanel && styles.filterButtonActive]}
                        onPress={() => setShowFilterPanel(!showFilterPanel)}
                        activeOpacity={0.7}
                    >
                        <Icon name={getIconName('Sliders')} size={16} color={showFilterPanel ? COLORS.white : COLORS.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterButton, sortBy !== 'default' && styles.filterButtonActive]}
                        onPress={() => setShowSortMenu(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.filterButtonText, sortBy !== 'default' && styles.filterButtonTextActive]}>
                            Sort by {sortBy !== 'default' ? `(${sortOptions.find(o => o.value === sortBy)?.label.split(' ')[0]})` : ''}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.filterButtonBlue}
                        onPress={() => setShowFilterPanel(true)}
                        activeOpacity={0.7}
                    >
                        <Icon name={getIconName('MapPin')} size={14} color={COLORS.white} />
                        <Text style={styles.filterButtonTextWhite}>Within {maxDistance} km</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterButton, filterTopRated && styles.filterButtonActive]}
                        onPress={() => setFilterTopRated(!filterTopRated)}
                        activeOpacity={0.7}
                    >
                        <Icon name={getIconName('Star')} size={14} color={filterTopRated ? COLORS.white : COLORS.textSecondary} />
                        <Text style={[styles.filterButtonText, filterTopRated && styles.filterButtonTextActive]}>
                            Top Rated
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterButton, filterVerified && styles.filterButtonBlue]}
                        onPress={() => setFilterVerified(!filterVerified)}
                        activeOpacity={0.7}
                    >
                        <Icon name={getIconName('CheckCircle')} size={14} color={filterVerified ? COLORS.white : COLORS.textSecondary} />
                        <Text style={[styles.filterButtonText, filterVerified && styles.filterButtonTextWhite]}>
                            Verified
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                {showFilterPanel && (
                    <View style={styles.filterPanel}>
                        <View style={styles.filterPanelHeader}>
                            <View style={styles.filterPanelHeaderLeft}>
                                <TouchableOpacity
                                    onPress={() => setShowFilterPanel(false)}
                                    style={styles.closeButton}
                                    activeOpacity={0.7}
                                >
                                    <Icon name={getIconName('X')} size={18} color={COLORS.white} />
                                </TouchableOpacity>
                                <Text style={styles.filterPanelTitle}>DISTANCE RANGE</Text>
                            </View>
                            <View style={styles.distanceBadge}>
                                <Text style={styles.distanceBadgeText}>0 - {maxDistance} km</Text>
                            </View>
                        </View>
                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>1 km</Text>
                            <View
                                style={styles.sliderTrack}
                                ref={sliderTrackRef}
                                onLayout={(event) => {
                                    const { width } = event.nativeEvent.layout;
                                    setSliderWidth(width);
                                }}
                            >
                                {/* Background track */}
                                <View style={styles.sliderTrackBackground} />
                                {/* Filled portion */}
                                <View
                                    style={[
                                        styles.sliderFill,
                                        {
                                            width: `${((maxDistance - 1) / 49) * 100}%`
                                        }
                                    ]}
                                />
                                {/* Touchable area for tap */}
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={handleSliderPress}
                                    style={StyleSheet.absoluteFill}
                                />
                                {/* Thumb - draggable */}
                                <View
                                    style={[
                                        styles.sliderThumb,
                                        {
                                            left: `${((maxDistance - 1) / 49) * 100}%`,
                                            marginLeft: -8, // Half of thumb width (16/2)
                                        }
                                    ]}
                                    {...panResponder.panHandlers}
                                />
                            </View>
                            <Text style={styles.sliderLabel}>50 km</Text>
                        </View>
                    </View>
                )}

                {/* Sort By Menu Modal */}
                <Modal
                    visible={showSortMenu}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowSortMenu(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowSortMenu(false)}
                    >
                        <View style={styles.sortMenuContainer}>
                            <View style={styles.sortMenuHeader}>
                                <Text style={styles.sortMenuTitle}>Sort By</Text>
                                <TouchableOpacity
                                    onPress={() => setShowSortMenu(false)}
                                    style={styles.closeButton}
                                >
                                    <Icon name={getIconName('X')} size={20} color={COLORS.textPrimary} />
                                </TouchableOpacity>
                            </View>
                            {sortOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.sortOption,
                                        sortBy === option.value && styles.sortOptionActive
                                    ]}
                                    onPress={() => {
                                        setSortBy(option.value);
                                        setShowSortMenu(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.sortOptionText,
                                        sortBy === option.value && styles.sortOptionTextActive
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {sortBy === option.value && (
                                        <Icon name={getIconName('Check')} size={18} color={COLORS.orange} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.orange} />
                    <Text style={styles.loadingText}>
                        Searching vendors...
                    </Text>
                </View>
            ) : filteredResults.length > 0 ? (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Vendors Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {isCategorySearch ? `${query} Vendors` : `Vendors`} ({filteredResults.length})
                            </Text>
                        </View>
                        <View style={styles.listContent}>
                            {filteredResults.map((item) => (
                                <View key={item.id}>
                                    {renderBusinessCard({ item })}
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.emptyStateContainer}>
                    <View style={styles.emptyState}>
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Icon name={getIconName('Search')} size={48} color={COLORS.textMuted} />
                            </View>
                            <Text style={styles.emptyTitle}>Sorry, no vendors found</Text>
                            <Text style={styles.emptyText}>
                                Please try different keywords or adjust your filters.
                            </Text>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={() => {
                                    setMaxDistance(50);
                                    setFilterTopRated(false);
                                    setFilterVerified(false);
                                    setShowFilterPanel(false);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.resetButtonText}>Reset Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const createStyles = (COLORS) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    gradientBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    safeArea: {
        backgroundColor: 'transparent',
    },
    header: {
        paddingHorizontal: 16,
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    searchContainer: {
        flex: 1,
        height: 44,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInputContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    searchInput: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.white,
        padding: 0,
    },
    locationText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    micIcon: {
        marginLeft: 8,
    },
    shareButton: {
        padding: 8,
    },
    filterContainer: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    filterScroll: {
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.divider,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    filterButtonActive: {
        backgroundColor: COLORS.textPrimary,
        borderColor: COLORS.textPrimary,
    },
    filterButtonBlue: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.blue,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    filterButtonGreen: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    filterButtonTextActive: {
        color: COLORS.white,
    },
    filterButtonTextWhite: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.white,
    },
    filterPanel: {
        marginTop: 16,
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    filterPanelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    filterPanelHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: COLORS.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterPanelTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    distanceBadge: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.divider,
    },
    distanceBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.blue,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 12,
    },
    sliderLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textSecondary,
        minWidth: 40,
    },
    sliderTrack: {
        flex: 1,
        height: 40, // Increased height for better touch target
        backgroundColor: 'transparent',
        borderRadius: 3,
        position: 'relative',
        justifyContent: 'center',
        overflow: 'visible',
    },
    sliderTrackBackground: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: '#E5E7EB', // Light grey background track
        borderRadius: 3,
        top: 17, // Center vertically (40/2 - 6/2 = 17)
    },
    sliderFill: {
        position: 'absolute',
        left: 0,
        height: 6,
        backgroundColor: '#dc2626', // Red
        borderRadius: 3,
        top: 17, // Center vertically
    },
    sliderThumb: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#dc2626', // Red
        borderWidth: 2,
        borderColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        top: 12, // Center vertically (40/2 - 16/2 = 12)
    },
    resultsHeader: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    resultsCount: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: COLORS.white,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
        gap: 16,
    },
    businessCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 24, // Matches website's "2rem"
        borderWidth: 1,
        borderColor: COLORS.divider,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    matchingSection: {
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        padding: 12,
        paddingTop: 10,
    },
    matchingSectionLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#94A3B8',
        letterSpacing: 1,
        paddingHorizontal: 4,
        marginBottom: 8,
    },
    matchingList: {
        gap: 8,
    },
    matchingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    matchingItemActive: {
        backgroundColor: '#FFF7ED',
        borderColor: '#FDBA74',
    },
    matchingItemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    matchingItemImage: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
    },
    matchingItemName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1E293B',
        width: 140,
    },
    matchingItemPrice: {
        fontSize: 11,
        fontWeight: '900',
        color: '#FF6B00',
    },
    basketBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
    },
    moreMatchingText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 4,
    },

    cardContent: {
        flexDirection: 'row',
        padding: 12,
        gap: 12,
    },
    imageContainer: {
        width: 96,
        height: 96,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(37, 99, 235, 0.9)',
        paddingVertical: 2,
        alignItems: 'center',
    },
    verifiedText: {
        fontSize: 8,
        fontWeight: '700',
        color: '#ffffff',
    },
    contentContainer: {
        flex: 1,
        minWidth: 0,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    businessName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    callButton: {
        backgroundColor: COLORS.blue,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    callButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#ffffff',
    },
    categoryText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    ratingBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#bbf7d0',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#16a34a',
    },
    reviewCount: {
        fontSize: 10,
        color: '#9ca3af',
        fontWeight: '500',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        borderStyle: 'dashed',
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    distanceText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748b',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    emptyStateContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        paddingHorizontal: 16,
        backgroundColor: COLORS.white,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    emptyIcon: {
        width: 100,
        height: 100,
        backgroundColor: '#F3F4F6',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        maxWidth: 280,
    },
    resetButton: {
        marginTop: 20,
        backgroundColor: COLORS.orange,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        elevation: 2,
        shadowColor: COLORS.orange,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    resetButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    productsScroll: {
        paddingHorizontal: 16,
        gap: 12,
    },
    productCard: {
        width: 160,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.divider,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#f3f4f6',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    productBrand: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.orange,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sortMenuContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        width: '80%',
        maxWidth: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    sortMenuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    sortMenuTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    closeButton: {
        padding: 4,
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    sortOptionActive: {
        backgroundColor: COLORS.highlightBg,
    },
    sortOptionText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    sortOptionTextActive: {
        fontWeight: '700',
        color: COLORS.orange,
    },
});

export default SearchResults;


