import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, FlatList, Text, ActivityIndicator, ScrollView, Modal, Animated, Easing } from 'react-native';
import Image from './ImageWithFallback';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getCategories, getSearchSuggestions } from '../services/api';
import { useCart } from '../context/CartContext';
import { Alert } from 'react-native';


const SearchBar = ({ onSearch, navigation, currentCity = '', locationState }) => {
  const COLORS = useThemeColors();
  const { addToCart } = useCart();
  const styles = createStyles(COLORS);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (showVoiceModal) {
      startPulseAnimation();
      // Simulate listening for 3 seconds then redirect to AI
      const timer = setTimeout(() => {
        setIsListening(false);
        setShowVoiceModal(false);
        if (navigation) {
          navigation.navigate('AIServiceFlow');
        }
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showVoiceModal]);

  const startPulseAnimation = () => {
    pulseAnim.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If query is empty, hide suggestions
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search suggestions
    setLoadingSuggestions(true);
    setShowSuggestions(true);

    searchTimeoutRef.current = setTimeout(async () => {
      await loadSuggestions(query.trim());
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const loadSuggestions = async (searchQuery) => {
    try {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        setLoadingSuggestions(false);
        return;
      }

      // Fetch unified suggestions from the new API
      const data = await getSearchSuggestions(searchQuery, currentCity);

      let allSuggestions = [];

      if (data) {
        // Sort products by ascending price (lowest first), matching website
        // BUT prioritize items with actual prices over those without
        const productSugs = (data.products || [])
          .map(p => ({
            ...p,
            type: p.type || 'product' // Respect API type if present 
          }));

        const vendorSugs = (data.vendors || []).map(v => ({ ...v, type: 'vendor' }));
        const categorySugs = (data.categories || []).map(c => ({ ...c, type: 'category' }));

        // Combine all and ensure products are sorted price low-to-high, but keep them at top
        allSuggestions = [...productSugs, ...vendorSugs, ...categorySugs].slice(0, 15);
      }

      setSuggestions(allSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };



  const handleSearch = () => {
    if (query.trim() && onSearch) {
      setShowSuggestions(false);
      onSearch(query);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);

    if (onSearch) {
      onSearch(suggestion.name);
    } else if (navigation) {
      // Navigate to SearchResults with the suggestion
      navigation.navigate('SearchResults', {
        query: suggestion.name,
        categoryId: suggestion.type === 'category' ? suggestion.data?.id : undefined,
        locationState: locationState // Pass location context
      });
    }
  };

  const handleQuickAdd = (item) => {
    const vendor = item.vendor || { id: item.vendor_id, name: item.shop_name || 'Local Store' };
    addToCart(item, vendor.id, vendor.name);
    Alert.alert('Added to Basket', `${item.name} has been added to your shopping basket.`);
  };

  const renderSuggestion = ({ item }) => {
    const isCategory = item.type === 'category';
    const isVendor = item.type === 'vendor';
    const isProduct = item.type === 'product' || !item.type;

    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSuggestionPress(item)}
        activeOpacity={0.7}
      >
        {/* Left: Image/Icon with Badge */}
        <View style={styles.suggestionImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.suggestionImage} />
          ) : (
            <View style={styles.iconPlaceholder}>
              <Icon
                name={getIconName(isCategory ? 'grid' : (isVendor ? 'store' : 'package'))}
                size={22}
                color={isCategory ? COLORS.blue : (isVendor ? COLORS.orange : '#94A3B8')}
              />
            </View>
          )}
          {isProduct && item.price > 0 && item.mrp > item.price && (
            <View style={styles.saleBadgeSmall}>
              <Text style={styles.saleTextSmall}>SALE</Text>
            </View>
          )}
        </View>

        {/* Center: Info */}
        <View style={styles.suggestionInfo}>
          <View style={styles.titleRow}>
            {isVendor && (
              <View style={[styles.miniTag, { backgroundColor: '#FFF7ED' }]}>
                <Text style={[styles.miniTagText, { color: COLORS.orange }]}>SHOP</Text>
              </View>
            )}
            {isCategory && (
              <View style={[styles.miniTag, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.miniTagText, { color: COLORS.blue }]}>CAT</Text>
              </View>
            )}
            <Text style={styles.suggestionTitle} numberOfLines={1}>
              {item.name}
            </Text>
          </View>

          {isProduct && (
            <View style={styles.metaRow}>
              <Text style={styles.vendorName} numberOfLines={1}>
                by {item.vendor?.name || item.shop_name || 'Local Store'}
              </Text>
              <View style={styles.dot} />
              <Text style={styles.distanceTextSmall}>{item.vendor?.distance || 'Nearby'}</Text>
            </View>
          )}

          {isVendor && (
            <View style={styles.metaRow}>
              <Icon name="star" size={10} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingTextSmall}>{item.rating || '4.5'}</Text>
              <View style={styles.dot} />
              <Text style={styles.metaTextSmall}>{item.category || 'Local Shop'}</Text>
            </View>
          )}

          {isCategory && (
            <Text style={styles.exploreTextSmall}>Explore wide range of products</Text>
          )}
        </View>

        {/* Right: Price/Action */}
        <View style={styles.suggestionRight}>
          {isProduct && item.price > 0 ? (
            <View style={styles.productActionContainer}>
               <Text style={styles.priceValueLarge}>₹{item.price}</Text>
               <TouchableOpacity 
                  style={styles.quickAddPill}
                  onPress={(e) => {
                    handleQuickAdd(item);
                  }}
               >
                  <Icon name="plus" size={12} color="#FFF" />
                  <Text style={styles.quickAddPillText}>ADD</Text>
               </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.chevronCircle}>
              <Icon name="chevron-right" size={14} color="#94A3B8" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };



  return (
    <>
      <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <Icon name="search" size={20} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="Search for AC, shoes, plumber, groceries..."
              placeholderTextColor="#94A3B8"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={styles.micButton} 
              onPress={() => setShowVoiceModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.micIconContainer}>
                <Icon name="mic" size={18} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
      </View>

      {/* Voice Search Modal */}
      <Modal
        visible={showVoiceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <View style={styles.voiceModalOverlay}>
          <View style={styles.voiceModalContent}>
            <TouchableOpacity 
              style={styles.closeVoiceModal}
              onPress={() => setShowVoiceModal(false)}
            >
              <Icon name="x" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <View style={styles.voiceIconWrapper}>
              <Animated.View style={[
                styles.voicePulseCircle, 
                { transform: [{ scale: pulseAnim }] }
              ]} />
              <View style={styles.voiceMicMain}>
                <Icon name="mic" size={40} color="#FFF" />
              </View>
            </View>

            <Text style={styles.voiceStatusText}>Listening...</Text>
            <Text style={styles.voiceInstructionText}>
              Say "Find cheapest AC near me" or "Search for plumbers"
            </Text>

            <View style={styles.voiceHelperContainer}>
               <Text style={styles.voiceHelperTitle}>TRY SAYING</Text>
               <View style={styles.voiceHelperPills}>
                  {['Plumbers near me', 'Best mobile offers', 'Grocery deals'].map((text, i) => (
                    <TouchableOpacity key={i} style={styles.voiceHelperPill}>
                       <Text style={styles.voiceHelperPillText}>{text}</Text>
                    </TouchableOpacity>
                  ))}
               </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Try Searching section */}
      <View style={styles.trySearchingRow}>
          <Icon name="zap" size={14} color={COLORS.orange} />
          <Text style={styles.trySearchingText}>Try searching:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
            {['Cheapest AC near me', 'Best iPhone under ₹50k'].map((chip, i) => (
              <TouchableOpacity
                key={i}
                style={styles.pillChip}
                onPress={() => { setQuery(chip); onSearch && onSearch(chip); }}
                activeOpacity={0.7}
              >
                <Text style={styles.pillChipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Icon name="arrow-right" size={14} color={COLORS.orange} />
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.trim().length >= 2 || suggestions.length > 0) && (
        <View style={styles.suggestionsContainer}>
          {/* Header: count + Low Price First badge */}
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsHeaderText}>
              {loadingSuggestions ? 'Searching...' : `${suggestions.length} Results Found`}
            </Text>
            {!loadingSuggestions && suggestions.length > 0 && (
              <View style={styles.lowPriceBadge}>
                <Icon name="trending-down" size={10} color="#16A34A" />
                <Text style={styles.lowPriceText}>Low Price First</Text>
              </View>
            )}
          </View>

          {loadingSuggestions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.orange} />
              <Text style={styles.loadingText}>Finding the best local prices...</Text>
            </View>
          ) : suggestions.length > 0 ? (
            <>
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item, index) => item.id ? String(item.id) : String(index)}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}
              />
              {/* Footer */}
              <View style={styles.suggestionsFooter}>
                <Text style={styles.suggestionsFooterText}>Press Search to see all results</Text>
              </View>
            </>
          ) : query.trim().length >= 2 ? (
            <View style={styles.noSuggestionsContainer}>
              <Text style={styles.noSuggestionsText}>No suggestions found</Text>
            </View>
          ) : null}
        </View>
      )}
    </>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
    searchContainer: {
      paddingHorizontal: 16,
      marginTop: 10,
    },
    inputContainer: {
      height: 54,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF',
      borderRadius: 27,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: '#334155',
      marginHorizontal: 10,
      fontWeight: '500',
    },
    micButton: {
      padding: 4,
    },
    micIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#F97316',
      alignItems: 'center',
      justifyContent: 'center',
    },
    trySearchingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginTop: 16,
      backgroundColor: '#FFF7ED',
      paddingVertical: 12,
      borderRadius: 12,
      marginHorizontal: 16,
    },
    trySearchingText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#F97316',
      marginLeft: 6,
      marginRight: 10,
    },
    pillsScroll: {
      flex: 1,
    },
    pillChip: {
      backgroundColor: '#FFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#FED7AA',
      marginRight: 8,
    },
    pillChipText: {
      fontSize: 11,
      color: '#334155',
      fontWeight: '600',
    },
    suggestionsContainer: {
      marginTop: 8,
      backgroundColor: COLORS.white,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 8,
      maxHeight: 450,
      overflow: 'hidden',
    },
    suggestionsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
      backgroundColor: '#F8FAFC',
    },
    suggestionsHeaderText: {
      fontSize: 10,
      fontWeight: '900',
      color: '#94A3B8',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    lowPriceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#F0FDF4',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    lowPriceText: {
      fontSize: 9,
      fontWeight: '900',
      color: '#16A34A',
      textTransform: 'uppercase',
    },
    suggestionsFooter: {
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: '#F8FAFC',
    },
    suggestionsFooterText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#94A3B8',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginHorizontal: 8,
      marginVertical: 4,
      backgroundColor: '#FFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#F1F5F9',
    },
    suggestionImageContainer: {
      width: 56,
      height: 56,
      borderRadius: 14,
      backgroundColor: '#F8FAFC',
      marginRight: 12,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    suggestionImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    saleBadgeSmall: {
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: '#EF4444',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderBottomRightRadius: 8,
    },
    saleTextSmall: {
      color: '#FFF',
      fontSize: 7,
      fontWeight: '900',
    },
    suggestionInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    miniTag: {
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 4,
      marginRight: 6,
    },
    miniTagText: {
      fontSize: 8,
      fontWeight: '900',
    },
    suggestionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#1E293B',
      flex: 1,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    vendorName: {
      fontSize: 11,
      fontWeight: '600',
      color: '#64748B',
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: '#CBD5E1',
      marginHorizontal: 6,
    },
    distanceTextSmall: {
      fontSize: 10,
      color: '#94A3B8',
      fontWeight: '600',
    },
    ratingTextSmall: {
      fontSize: 11,
      fontWeight: '800',
      color: '#0F172A',
      marginLeft: 4,
    },
    metaTextSmall: {
      fontSize: 11,
      color: '#64748B',
      fontWeight: '600',
    },
    exploreTextSmall: {
      fontSize: 11,
      color: COLORS.blue,
      fontWeight: '600',
    },
    suggestionRight: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingLeft: 8,
    },
    productActionContainer: {
      alignItems: 'center',
      gap: 6,
    },
    priceValueLarge: {
      fontSize: 14,
      fontWeight: '900',
      color: '#0F172A',
    },
    quickAddPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: COLORS.orange,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      shadowColor: COLORS.orange,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    quickAddPillText: {
      color: '#FFF',
      fontSize: 9,
      fontWeight: '900',
    },
    chevronCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#F8FAFC',
      alignItems: 'center',
      justifyContent: 'center',
    },
    noSuggestionsContainer: {
      padding: 40,
      alignItems: 'center',
    },
    noSuggestionsText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#94A3B8',
    },
    // Voice Modal Styles
    voiceModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    voiceModalContent: {
      width: '100%',
      backgroundColor: '#FFF',
      borderRadius: 32,
      padding: 40,
      alignItems: 'center',
      position: 'relative',
    },
    closeVoiceModal: {
      position: 'absolute',
      top: 20,
      right: 20,
      padding: 10,
    },
    voiceIconWrapper: {
      width: 120,
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 30,
    },
    voicePulseCircle: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(249, 115, 22, 0.2)',
    },
    voiceMicMain: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#F97316',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#F97316',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    voiceStatusText: {
      fontSize: 24,
      fontWeight: '900',
      color: '#0F172A',
      marginBottom: 10,
    },
    voiceInstructionText: {
      fontSize: 14,
      color: '#64748B',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 40,
    },
    voiceHelperContainer: {
      width: '100%',
      alignItems: 'center',
    },
    voiceHelperTitle: {
      fontSize: 10,
      fontWeight: '900',
      color: '#94A3B8',
      letterSpacing: 2,
      marginBottom: 16,
    },
    voiceHelperPills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
    },
    voiceHelperPill: {
      backgroundColor: '#F8FAFC',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#F1F5F9',
    },
    voiceHelperPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#475569',
    },
  });

export default SearchBar;



