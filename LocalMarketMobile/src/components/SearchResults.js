import React, { useState, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList, PanResponder, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { SEARCH_RESULTS, NEARBY_BUSINESSES, FEATURED_BUSINESSES, IT_COMPANIES } from '../constants';
import { getIconName } from '../utils/iconMapping';
import { COLORS } from '../constants/colors';

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
    query: propQuery
}) => {
    // Get query from route params or props
    const query = route?.params?.query || propQuery;
    // Use savedBusinessIds from props if available, otherwise use savedIds
    const savedIds = savedBusinessIds.length > 0 ? savedBusinessIds : propSavedIds;
    const [sortBy, setSortBy] = useState('default');
    const [maxDistance, setMaxDistance] = useState(22);
    const [filterTopRated, setFilterTopRated] = useState(false);
    const [filterVerified, setFilterVerified] = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const sliderTrackRef = useRef(null);
    const [sliderWidth, setSliderWidth] = useState(0);

    const parseDistance = (distStr) => {
        return parseFloat(distStr.toLowerCase().replace(' km', '').trim()) || 0;
    };

    const allBusinesses = useMemo(() => {
        const combined = [...SEARCH_RESULTS, ...NEARBY_BUSINESSES, ...FEATURED_BUSINESSES, ...IT_COMPANIES];
        return Array.from(new Map(combined.map(item => [item.id, item])).values());
    }, []);

    const baseResults = propResults || allBusinesses;

    const filteredResults = useMemo(() => {
        let results = [...baseResults];

        if (query && !propResults) {
            const lowerQuery = query.toLowerCase();
            // Split query into words for better matching
            const queryWords = lowerQuery.split(/[\s\/]+/).filter(w => w.length > 0);
            
            results = results.filter(item => {
                const itemName = item.name.toLowerCase();
                const itemCategory = item.category.toLowerCase();
                
                // Check if any query word matches name or category
                const matchesName = queryWords.some(word => itemName.includes(word));
                const matchesCategory = queryWords.some(word => itemCategory.includes(word)) || 
                                       itemCategory.includes(lowerQuery) || 
                                       lowerQuery.includes(itemCategory);
                
                // Also check if category name is in the query (e.g., "Groceries" in "Groceries / General Store")
                const categoryInQuery = itemCategory && lowerQuery.includes(itemCategory.split(' ')[0]);
                
                // Check products
                const matchesProducts = item.products && item.products.some(p => 
                    queryWords.some(word => p.name.toLowerCase().includes(word))
                );
                
                return matchesName || matchesCategory || categoryInQuery || matchesProducts;
            });
        }

        results = results.filter(item => {
            const distance = item.distance ? parseDistance(item.distance) : 0;
            return distance <= maxDistance;
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
            results.sort((a, b) => parseDistance(a.distance) - parseDistance(b.distance));
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

    const handleSliderMove = (gestureState) => {
        if (sliderWidth === 0) return;
        
        const { locationX } = gestureState;
        const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
        const newDistance = Math.round(1 + percentage * 49); // Range: 1 to 50 km
        setMaxDistance(newDistance);
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                handleSliderMove(evt.nativeEvent);
            },
            onPanResponderMove: (evt) => {
                handleSliderMove(evt.nativeEvent);
            },
        })
    ).current;

    const renderBusinessCard = ({ item, index }) => {
        const isSaved = savedIds.includes(item.id);

        return (
            <TouchableOpacity
                style={styles.businessCard}
                onPress={() => handleBusinessClick(item)}
                activeOpacity={0.8}
            >
                <View style={styles.cardContent}>
                    <View style={styles.imageContainer}>
                        <Image
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
                                <TouchableOpacity activeOpacity={0.7}>
                                    <Icon name={getIconName('Share2')} size={16} color="#9ca3af" />
                                </TouchableOpacity>
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
                        <Icon name={getIconName('ArrowLeft')} size={24} color={COLORS.white} />
                    </TouchableOpacity>

                    <View style={styles.searchContainer}>
                        <Icon name={getIconName('Search')} size={20} color="rgba(255, 255, 255, 0.7)" style={styles.searchIcon} />
                        <View style={styles.searchInputContainer}>
                            <Text style={styles.searchInput}>{query || 'Tutors'}</Text>
                            <Text style={styles.locationText}>Halbatpur, Sector 4</Text>
                        </View>
                        <Icon name={getIconName('Mic')} size={20} color={COLORS.white} style={styles.micIcon} />
                    </View>

                    <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
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
                        style={[styles.filterButton, sortBy === 'rating' && styles.filterButtonActive]}
                        onPress={() => setSortBy(sortBy === 'rating' ? 'default' : 'rating')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.filterButtonText, sortBy === 'rating' && styles.filterButtonTextActive]}>
                            Sort by
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
                                {...panResponder.panHandlers}
                            >
                                <View 
                                    style={[
                                        styles.sliderFill, 
                                        { 
                                            width: `${((maxDistance - 1) / 49) * 100}%` 
                                        }
                                    ]} 
                                />
                                <View 
                                    style={[
                                        styles.sliderThumb,
                                        {
                                            left: `${((maxDistance - 1) / 49) * 100}%`,
                                            marginLeft: -8, // Half of thumb width (16/2)
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={styles.sliderLabel}>50 km</Text>
                        </View>
                    </View>
                )}
            </View>

            {filteredResults.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.resultsCount}>
                        {filteredResults.length} Results for your search
                    </Text>
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Icon name={getIconName('Search')} size={48} color={COLORS.textMuted} />
                        </View>
                        <Text style={styles.emptyTitle}>No matches found</Text>
                        <Text style={styles.emptyText}>Try increasing the distance or changing filters.</Text>
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
            ) : (
                <>
                    <View style={styles.resultsHeader}>
                        <Text style={styles.resultsTitle}>
                            {filteredResults.length} Result{filteredResults.length !== 1 ? 's' : ''} for your search
                        </Text>
                    </View>
                    <FlatList
                        data={filteredResults}
                        renderItem={renderBusinessCard}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
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
        height: 6,
        backgroundColor: '#E5E7EB', // Light grey
        borderRadius: 3,
        position: 'relative',
        justifyContent: 'center',
    },
    sliderFill: {
        position: 'absolute',
        left: 0,
        height: '100%',
        backgroundColor: '#dc2626', // Red
        borderRadius: 3,
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.divider,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
    emptyIcon: {
        width: 120,
        height: 120,
        backgroundColor: '#E5E7EB', // Light gray
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#D1D5DB', // Dark gray outline
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        maxWidth: 280,
    },
    resetButton: {
        marginTop: 8,
    },
    resetButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.orange,
    },
});

export default SearchResults;

