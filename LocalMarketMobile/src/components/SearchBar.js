import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, FlatList, Text, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getCategories, getMasterProducts } from '../services/api';

const SearchBar = ({ onSearch, navigation }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);

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

      // Fetch categories and products in parallel
      const [categoriesData, productsData] = await Promise.all([
        getCategories(searchQuery).catch(() => ({ categories: [] })),
        getMasterProducts({ q: searchQuery, limit: 5 }).catch(() => ({ products: [] }))
      ]);

      const categorySuggestions = (categoriesData?.categories || []).slice(0, 5).map(cat => ({
        id: `category_${cat.id}`,
        type: 'category',
        name: cat.name,
        icon: cat.icon_name || 'grid',
        data: cat
      }));

      const productSuggestions = (productsData?.products || []).slice(0, 5).map(product => ({
        id: `product_${product.id}`,
        type: 'product',
        name: product.name,
        brand: product.brand,
        data: product
      }));

      // Combine and limit total suggestions
      const allSuggestions = [...categorySuggestions, ...productSuggestions].slice(0, 8);
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

    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSuggestionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.suggestionIconContainer}>
          <Icon
            name={getIconName(isCategory ? item.icon : 'Package')}
            size={18}
            color={isCategory ? COLORS.orange : COLORS.blue}
          />
        </View>
        <View style={styles.suggestionContent}>
          <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
          {item.brand && (
            <Text style={styles.suggestionBrand} numberOfLines={1}>{item.brand}</Text>
          )}
          {isCategory && (
            <Text style={styles.suggestionType}>Category</Text>
          )}
        </View>
        <Icon name={getIconName('ChevronRight')} size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {/* Search Icon */}
        <View style={styles.iconContainer}>
          <Icon name={getIconName('Search')} size={20} color={COLORS.textMuted} />
        </View>

        {/* Input Field */}
        <TextInput
          style={styles.input}
          placeholder="Search for the lowest price..."
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

        {/* Mic Icon */}
        <TouchableOpacity style={styles.micContainer} activeOpacity={0.7}>
          <Icon name={getIconName('Mic')} size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.trim().length >= 2 || suggestions.length > 0) && (
        <View style={styles.suggestionsContainer}>
          {loadingSuggestions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.orange} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : suggestions.length > 0 ? (
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.suggestionsList}
            />
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
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  micContainer: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 300,
    overflow: 'hidden',
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  suggestionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.highlightBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
    minWidth: 0,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  suggestionBrand: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  suggestionType: {
    fontSize: 11,
    color: COLORS.orange,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  noSuggestionsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noSuggestionsText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});

export default SearchBar;




