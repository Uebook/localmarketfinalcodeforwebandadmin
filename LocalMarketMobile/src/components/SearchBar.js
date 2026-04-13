import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, FlatList, Text, ActivityIndicator } from 'react-native';
import Image from './ImageWithFallback';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getCategories, getSearchSuggestions } from '../services/api';


const SearchBar = ({ onSearch, navigation, currentCity = '' }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);

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
        categoryId: suggestion.type === 'category' ? suggestion.data.id : undefined
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name={getIconName('Search')} size={22} color={COLORS.orange} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="mention name of the article you need"
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.8}>
          <Text style={styles.searchButtonText}>SEARCH</Text>
        </TouchableOpacity>
      </View>

      {/* Popular Chips */}
      <View style={styles.chipsRow}>
        {['Milk', 'Cooking Oil', 'Atta', 'Mobile Charger', 'Shampoo'].map((chip, i) => (
          <TouchableOpacity
            key={i}
            style={styles.quickChip}
            onPress={() => { setQuery(chip); onSearch && onSearch(chip); }}
            activeOpacity={0.7}
          >
            <Text style={styles.quickChipText}>{chip}</Text>
          </TouchableOpacity>
        ))}
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
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  searchButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    paddingVertical: 0,
  },
  micContainer: {
    width: 52,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  quickChip: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FDBA74',
    marginRight: 8,
    marginBottom: 6,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
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
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  lowPriceText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#16A34A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 3,
  },
  suggestionsFooter: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    backgroundColor: '#F8FAFC',
  },
  suggestionsFooterText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  mrpText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginTop: 2,
    textAlign: 'right',
  },
  locationSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    gap: 3,
  },
  pricePill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  suggestionImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    marginRight: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  iconPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionInfo: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  tagVendor: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.orange,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 6,
    textTransform: 'uppercase',
  },
  tagCategory: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.blue,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 6,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginLeft: 4,
  },
  dot: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 4,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  exploreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: -0.2,
  },
  suggestionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  priceBox: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  enterBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  enterText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.orange,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
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
});

export default SearchBar;




