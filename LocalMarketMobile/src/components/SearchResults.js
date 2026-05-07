import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, PanResponder, Modal, Share, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
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
    
    // Get locationState from params or props
    const [currentLocation, setCurrentLocation] = useState(route?.params?.locationState || locationState);
    
    const COLORS = useThemeColors();
    const { addToCart } = useCart();
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
    const [sliderWidth, setSliderWidth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // -- Refs --
    const sliderTrackRef = useRef(null);
    const sliderWidthRef = useRef(0);
    const maxDistanceRef = useRef(maxDistance);
    const handleMoveRef = useRef(null);
    
    // -- Effects --
    useEffect(() => {
        loadSearchData();
    }, [query, categoryId, circle, currentLocation?.city]);

    useEffect(() => {
        if (!currentLocation && route?.params?.locationState) {
            setCurrentLocation(route.params.locationState);
        } else if (!currentLocation && locationState) {
            setCurrentLocation(locationState);
        }
    }, [route?.params?.locationState, locationState]);

    useEffect(() => {
        sliderWidthRef.current = sliderWidth;
    }, [sliderWidth]);

    useEffect(() => {
        maxDistanceRef.current = maxDistance;
    }, [maxDistance]);

    // -- Logic Functions --
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
                if (locationState.city?.startsWith('All ')) {
                    filters.city = locationState.city?.replace('All ', '').trim();
                } else {
                    filters.city = locationState.city?.split(',')[0].trim();
                }
            }

            // Handle Circle
            if (circle) {
                filters.circle = circle;
            } else if (route?.params?.circle) {
                filters.circle = route.params.circle;
            }

            // Handle Category Search
            if (categoryId) {
                try {
                    const cats = await getCategories();
                    const cat = cats?.categories?.find(c => String(c.id) === String(categoryId));
                    if (cat) {
                        filters.category = cat.name;
                        // If no query, set q to category name for better multi-column matching
                        if (!query) filters.q = cat.name;
                    }
                } catch (e) {
                    console.warn('Error mapping category ID:', e);
                }
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

        if (currentLocation?.lat && currentLocation?.lng && (vendor.latitude || vendor.lat) && (vendor.longitude || vendor.lng)) {
            const dist = calculateDistance(
                currentLocation.lat,
                currentLocation.lng,
                parseFloat(vendor.latitude || vendor.lat),
                parseFloat(vendor.longitude || vendor.lng)
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
            address: vendor.address || `${vendor.city || ''} ${vendor.state || ''}`?.trim() || 'Nearby',
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
    }, [vendors, currentLocation]);

    const baseResults = propResults || allBusinesses;

    const filteredResults = useMemo(() => {
        let results = [...baseResults];
        
        const specialKeywords = ['verified', 'deals', 'megasavings', 'pricedrops', 'all'];
        const isSpecialQuery = query && specialKeywords.includes(query.toLowerCase());

        if (query && !propResults && !isSpecialQuery) {
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
        const width = sliderWidthRef.current;
        if (width === 0) return;
        const percentage = Math.max(0, Math.min(1, locationX / width));
        const newDistance = Math.round(1 + percentage * 49);
        if (newDistance !== maxDistanceRef.current) {
            setMaxDistance(newDistance);
        }
    };

    handleMoveRef.current = handleSliderMoveFromLocation;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                setIsDragging(true);
                if (sliderTrackRef.current) {
                    sliderTrackRef.current.measure((x, y, width, height, pageX, pageY) => {
                        const touchX = evt.nativeEvent.pageX - pageX;
                        handleMoveRef.current(touchX);
                    });
                }
            },
            onPanResponderMove: (evt) => {
                if (sliderTrackRef.current) {
                    sliderTrackRef.current.measure((x, y, width, height, pageX, pageY) => {
                        const touchX = evt.nativeEvent.pageX - pageX;
                        handleMoveRef.current(touchX);
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

    const startListening = () => {
        // Voice search transitioned to AIServiceFlow from Home SearchBar
    };

    const stopListening = () => {
        // Voice search transitioned to AIServiceFlow from Home SearchBar
    };

    const sortOptions = [
        { value: 'default', label: 'Default' },
        { value: 'rating', label: 'Rating (High to Low)' },
        { value: 'distance', label: 'Distance (Near to Far)' },
    ];

    const renderBusinessCard = ({ item, index }) => {
        const isSaved = savedIds.includes(item.id);
        
        return (
            <TouchableOpacity
                style={styles.businessCard}
                onPress={() => handleBusinessClick(item)}
                activeOpacity={0.9}
            >
                <View style={styles.cardContent}>
                    {/* Left: Product/Store Image */}
                    <View style={styles.imageContainer}>
                        <ImageWithFallback
                            source={{ uri: item.imageUrl }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        {item.isVerified && (
                            <View style={styles.bestPriceBadge}>
                                <Icon name="check-circle" size={10} color="#ffffff" />
                                <Text style={styles.bestPriceText}>Best Price</Text>
                            </View>
                        )}
                    </View>

                    {/* Right: Details */}
                    <View style={styles.contentContainer}>
                        <View style={styles.headerRow}>
                            <Text style={styles.businessName} numberOfLines={2}>{item.name}</Text>
                            <TouchableOpacity 
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleToggleSave(item.id);
                                }}
                                style={styles.wishlistBtn}
                            >
                                <Icon
                                    name="heart"
                                    size={20}
                                    color={isSaved ? "#EF4444" : "#CBD5E1"}
                                    fill={isSaved ? "#EF4444" : "none"}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.ratingRow}>
                            <View style={styles.ratingBadge}>
                                <Icon name="star" size={10} color="#16A34A" fill="#16A34A" />
                                <Text style={styles.ratingText}>{item.rating}</Text>
                            </View>
                            <Text style={styles.reviewCount}>({item.reviewCount} reviews)</Text>
                            
                            <TouchableOpacity 
                                style={styles.quickAddBtn}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(item);
                                }}
                            >
                                <Icon name="shopping-bag" size={14} color="#FFF" />
                                <Text style={styles.quickAddText}>ADD</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Store & Distance Info */}
                        <Text style={styles.categoryText} numberOfLines={1}>
                            {item.category}
                        </Text>
                        
                        <View style={styles.footerRow}>
                            <View style={styles.distanceContainer}>
                                <Icon name="map-pin" size={12} color="#64748B" />
                                <Text style={styles.distanceText}>{item.distance}</Text>
                            </View>
                            

                        </View>
                    </View>
                </View>
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
                        <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>

                    <View style={styles.searchContainer}>
                        <Icon name="search" size={18} color="#94A3B8" />
                        <Text style={styles.searchInput} numberOfLines={1}>
                            {query || 'Search local stores...'}
                        </Text>
                    </View>
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
                    >
                        <Icon name="sliders" size={14} color={showFilterPanel ? "#FFF" : "#64748B"} />
                        <Text style={[styles.filterButtonText, showFilterPanel && styles.filterButtonTextActive]}>Filters</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.filterButton, styles.filterPillWithArrow]}
                        onPress={() => setShowSortMenu(true)}
                    >
                        <Text style={styles.filterButtonText}>Sort by</Text>
                        <Icon name="chevron-down" size={14} color="#64748B" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.filterButton, maxDistance < 50 && styles.filterButtonActive]}
                        onPress={() => setShowFilterPanel(true)}
                    >
                        <Text style={[styles.filterButtonText, maxDistance < 50 && styles.filterButtonTextActive]}>
                            {maxDistance} km
                        </Text>
                        <Icon name="chevron-down" size={14} color={maxDistance < 50 ? "#FFF" : "#64748B"} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.filterButton, filterTopRated && styles.filterButtonActive]}
                        onPress={() => setFilterTopRated(!filterTopRated)}
                    >
                        <Text style={[styles.filterButtonText, filterTopRated && styles.filterButtonTextActive]}>4.0+</Text>
                    </TouchableOpacity>
                </ScrollView>

                {showFilterPanel && (
                    <View style={styles.filterPanel}>
                        <View style={styles.filterPanelHeader}>
                            <View style={styles.filterPanelHeaderLeft}>
                                <Icon name="sliders" size={16} color={COLORS.textPrimary} />
                                <Text style={styles.filterPanelTitle}>Advanced Filters</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowFilterPanel(false)}>
                                <Icon name="x" size={20} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filterItem}>
                            <View style={styles.filterItemHeader}>
                                <Text style={styles.filterLabel}>Distance Range</Text>
                                <View style={styles.distanceBadge}>
                                    <Text style={styles.distanceBadgeText}>{maxDistance} km</Text>
                                </View>
                            </View>
                            <View style={styles.sliderContainer}>
                                <Text style={styles.sliderLabel}>1km</Text>
                                <View 
                                    style={styles.sliderTrack}
                                    onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                                    ref={sliderTrackRef}
                                    {...panResponder.panHandlers}
                                >
                                    <View style={styles.sliderTrackBackground} />
                                    <View style={[styles.sliderFill, { width: `${(maxDistance - 1) / 49 * 100}%` }]} />
                                    <View style={[styles.sliderThumb, { left: `${(maxDistance - 1) / 49 * 100}%`, marginLeft: -8 }]} />
                                </View>
                                <Text style={styles.sliderLabel}>50km</Text>
                            </View>
                        </View>

                        <View style={styles.filterToggles}>
                            <TouchableOpacity 
                                style={[styles.filterToggle, filterTopRated && styles.filterToggleActive]}
                                onPress={() => setFilterTopRated(!filterTopRated)}
                            >
                                <Icon name="star" size={14} color={filterTopRated ? "#FFF" : "#64748B"} />
                                <Text style={[styles.filterToggleText, filterTopRated && styles.filterToggleTextActive]}>
                                    Top Rated
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.filterToggle, filterVerified && styles.filterToggleActive]}
                                onPress={() => setFilterVerified(!filterVerified)}
                            >
                                <Icon name="check-circle" size={14} color={filterVerified ? "#FFF" : "#64748B"} />
                                <Text style={[styles.filterToggleText, filterVerified && styles.filterToggleTextActive]}>
                                    Verified
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={styles.applyButton}
                            onPress={() => setShowFilterPanel(false)}
                        >
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.resultsSummaryRow}>
                    <Text style={styles.resultCountText}>{filteredResults.length}+ results found</Text>
                </View>
            </View>

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
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        padding: 4,
    },
    searchContainer: {
        flex: 1,
        height: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInputContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    searchInput: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
        padding: 0,
        marginLeft: 8,
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
        flex: 1,
    },
    quickAddBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.orange,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        shadowColor: COLORS.orange,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    quickAddText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
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
    filterPillWithArrow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    filterItem: {
        marginTop: 20,
    },
    filterItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    filterToggles: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    filterToggle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.divider,
        backgroundColor: COLORS.white,
    },
    filterToggleActive: {
        backgroundColor: COLORS.textPrimary,
        borderColor: COLORS.textPrimary,
    },
    filterToggleText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    filterToggleTextActive: {
        color: COLORS.white,
    },
    applyButton: {
        backgroundColor: COLORS.orange,
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: COLORS.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    applyButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    resultsSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 12,
        paddingHorizontal: 4,
    },
    resultCountText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    wishlistBtn: {
        padding: 4,
    },
    bestPriceBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#16a34a',
        paddingVertical: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    bestPriceText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#ffffff',
        textTransform: 'uppercase',
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


