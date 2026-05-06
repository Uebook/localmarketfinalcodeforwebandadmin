import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, FlatList, Text, ActivityIndicator, ScrollView, Modal, Animated, Easing } from 'react-native';
import Image from './ImageWithFallback';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getCategories, getSearchSuggestions } from '../services/api';


const SearchBar = ({ onSearch, navigation, currentCity = '', locationState }) => {
  const COLORS = useThemeColors();
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
        categoryId: suggestion.type === 'category' ? suggestion.data.id : undefined,
        locationState: locationState // Pass location context
      });
    }
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
        {/* Left: Image/Icon */}
        <View style={styles.suggestionImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.suggestionImage} />
          ) : (
            <View style={styles.iconPlaceholder}>
              <Icon
                name={getIconName(isCategory ? 'grid' : (isVendor ? 'store' : 'package'))}
                size={22}
                color="#CBD5E1"
              />
            </View>
          )}
        </View>

        {/* Center: Info */}
        <View style={styles.suggestionInfo}>
          <View style={styles.titleRow}>
            {isVendor && <Text style={styles.tagVendor}>Vendor</Text>}
            {isCategory && <Text style={styles.tagCategory}>Category</Text>}
            <Text style={styles.suggestionTitle} numberOfLines={1}>
              {item.name}
            </Text>
          </View>

          {isProduct && (
            <View style={styles.metaRow}>
              <Icon name={getIconName('ShoppingBag')} size={12} color="#FF6B00" style={{ marginRight: 4 }} />
              <Text style={styles.vendorName} numberOfLines={1}>
                {item.vendor?.name || item.shop_name || 'Local Store'}
              </Text>
              <View style={styles.locationSmall}>
                <Icon name={getIconName('MapPin')} size={10} color="#94A3B8" />
                <Text style={styles.distanceText}>{item.vendor?.distance || 'Local'}</Text>
              </View>
            </View>
          )}

          {(isVendor || isCategory) && (
            <Text style={styles.exploreText}>
              Click to explore {isVendor ? 'store' : 'category'}
            </Text>
          )}
        </View>

        {/* Right: Price/Action */}
        <View style={styles.suggestionRight}>
          {item.price > 0 && (
            <View style={styles.priceColumn}>
              <View style={styles.pricePill}>
                <Text style={styles.priceValue}>₹{item.price}</Text>
              </View>
              {item.mrp && item.mrp > item.price && (
                <Text style={styles.mrpText}>₹{item.mrp}</Text>
              )}
            </View>
          )}
          {isVendor && !item.price && (
            <View style={styles.enterBadge}>
              <Text style={styles.enterText}>ENTER</Text>
            </View>
          )}
          <Icon name="chevron-right" size={16} color="#CBD5E1" style={{ marginLeft: 8 }} />
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
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F8FAFC',
    },
    suggestionImageContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: '#F1F5F9',
      marginRight: 12,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    suggestionImage: {
      width: '100%',
      height: '100%',
    },
    suggestionInfo: {
      flex: 1,
      marginRight: 8,
    },
    suggestionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#0F172A',
    },
    tagVendor: {
      fontSize: 8,
      fontWeight: '900',
      color: COLORS.orange,
      backgroundColor: '#FFF7ED',
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 4,
      marginRight: 6,
      textTransform: 'uppercase',
    },
    tagCategory: {
      fontSize: 8,
      fontWeight: '900',
      color: COLORS.blue,
      backgroundColor: '#EFF6FF',
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 4,
      marginRight: 6,
      textTransform: 'uppercase',
    },
    vendorName: {
      fontSize: 11,
      fontWeight: '600',
      color: '#64748B',
      marginTop: 2,
    },
    pricePill: {
      backgroundColor: '#0F172A',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    priceValue: {
      fontSize: 12,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 11,
      fontWeight: '700',
      color: '#94A3B8',
      textTransform: 'uppercase',
      letterSpacing: 1,
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



