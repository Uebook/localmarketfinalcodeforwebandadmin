import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, FlatList, Text, ActivityIndicator, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Voice from '@react-native-voice/voice';
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
  const [isListening, setIsListening] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    // Setting up voice listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      // Cleanup listeners and stop voice recognition if it's running
      Voice.destroy().then(Voice.removeAllListeners);

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

  const onSpeechStart = (e) => {
    console.log('onSpeechStart: ', e);
  };

  const onSpeechEnd = (e) => {
    console.log('onSpeechEnd: ', e);
    setIsListening(false);
  };

  const onSpeechResults = (e) => {
    console.log('onSpeechResults: ', e);
    if (e.value && e.value.length > 0) {
      const recognizedText = e.value[0];
      setQuery(recognizedText);
      setIsListening(false);

      // Automatically trigger search after a brief delay so user can see what was captured
      setTimeout(() => {
        if (onSearch) {
          onSearch(recognizedText);
        }
      }, 500);
    }
  };

  const onSpeechError = (e) => {
    console.log('onSpeechError: ', e);
    setIsListening(false);
  };

  const startListening = async () => {
    try {
      setQuery('');
      setIsListening(true);
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error(e);
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
          <Icon name={getIconName('Search')} size={22} color={COLORS.orange} />
        </View>

        {/* Input Field */}
        <TextInput
          style={styles.input}
          placeholder="Search products, markets or shops"
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
        <TouchableOpacity
          style={styles.micContainer}
          activeOpacity={0.7}
          onPress={startListening}
        >
          <View style={styles.micBg}>
            <Icon name={getIconName('Mic')} size={18} color={COLORS.white} />
          </View>
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
      {/* Voice Listening Modal */}
      <Modal
        visible={isListening}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsListening(false)}
      >
        <TouchableOpacity
          style={styles.voiceOverlay}
          activeOpacity={1}
          onPress={() => setIsListening(false)}
        >
          <View style={styles.voiceContent}>
            <View style={styles.pulseRing}>
              <Icon name={getIconName('Mic')} size={40} color={COLORS.white} />
            </View>
            <Text style={styles.listeningText}>Listening...</Text>
            <Text style={styles.listeningSubtext}>Try saying "Restaurants" or "Plumber"</Text>

            <TouchableOpacity
              style={styles.closeVoiceButton}
              onPress={stopListening}
            >
              <Icon name={getIconName('X')} size={24} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  iconContainer: {
    width: 52,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
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
  voiceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceContent: {
    alignItems: 'center',
    padding: 20,
  },
  pulseRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  listeningText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  listeningSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 40,
  },
  closeVoiceButton: {
    padding: 12,
  },
});

export default SearchBar;




