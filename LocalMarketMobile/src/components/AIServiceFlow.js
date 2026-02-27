import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
import { startAISession, processAIAnswer, getAIRecommendations } from '../services/api';

const { width } = Dimensions.get('window');

const AIServiceFlow = ({ navigation }) => {
    const COLORS = useThemeColors();
    const styles = createStyles(COLORS);

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState('init');
    const [context, setContext] = useState({});
    const [options, setOptions] = useState([]);
    const [results, setResults] = useState(null);
    const [validationError, setValidationError] = useState('');

    const scrollViewRef = useRef();

    useEffect(() => {
        initSession();
    }, []);

    const addMessage = (text, sender, type = 'text') => {
        setMessages(prev => [...prev, { id: Date.now(), text, sender, type }]);
    };

    // Validation Functions
    const validateInput = (input, step) => {
        const trimmedInput = input.trim();

        // Clear previous errors
        setValidationError('');

        // Minimum length check
        if (trimmedInput.length < 2) {
            setValidationError('Please provide a more detailed response (at least 2 characters)');
            return false;
        }

        // Check for gibberish - repeated characters
        const repeatedCharPattern = /(.)\1{3,}/; // 4 or more repeated characters
        if (repeatedCharPattern.test(trimmedInput)) {
            setValidationError('Please provide a meaningful response');
            return false;
        }

        // Check for too many consonants in a row (likely gibberish)
        const consonantPattern = /[bcdfghjklmnpqrstvwxyz]{6,}/i;
        if (consonantPattern.test(trimmedInput)) {
            setValidationError('Please provide a valid response');
            return false;
        }

        // Context-specific validation
        switch (step) {
            case 'service_type':
                if (trimmedInput.length < 3) {
                    setValidationError('Please describe the service you need (at least 3 characters)');
                    return false;
                }
                break;

            case 'work_type':
                if (trimmedInput.length < 3) {
                    setValidationError('Please specify the type of work (at least 3 characters)');
                    return false;
                }
                break;

            case 'timing':
                // Check if it's a valid date-related response
                const dateKeywords = ['today', 'tomorrow', 'week', 'month', 'asap', 'urgent', 'flexible', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                const hasDateKeyword = dateKeywords.some(keyword => trimmedInput.toLowerCase().includes(keyword));
                const hasNumbers = /\d/.test(trimmedInput);

                if (!hasDateKeyword && !hasNumbers && trimmedInput.length < 5) {
                    setValidationError('Please specify when you need this service (e.g., "tomorrow", "next week", "ASAP")');
                    return false;
                }
                break;

            case 'budget':
                // Check if response contains numbers or budget-related keywords
                const budgetKeywords = ['flexible', 'negotiable', 'budget', 'affordable', 'premium', 'standard'];
                const hasBudgetKeyword = budgetKeywords.some(keyword => trimmedInput.toLowerCase().includes(keyword));
                const hasNumbersOrCurrency = /[\d$₹€£]/.test(trimmedInput);

                if (!hasBudgetKeyword && !hasNumbersOrCurrency && trimmedInput.length < 5) {
                    setValidationError('Please provide a budget range or select an option (e.g., "$100-$200", "flexible")');
                    return false;
                }
                break;

            default:
                // General validation for other steps
                if (trimmedInput.length < 3) {
                    setValidationError('Please provide a more detailed response (at least 3 characters)');
                    return false;
                }
        }

        return true;
    };

    const initSession = async () => {
        setIsLoading(true);
        try {
            // In production, fetch current user location here and pass to startAISession
            const data = await startAISession({ userId: 'user_APP' });

            addMessage(data.message, 'ai');
            setCurrentStep(data.nextStep);
            setOptions(data.options || []);

            // Add the question as a follow-up
            if (data.question) {
                setTimeout(() => addMessage(data.question, 'ai'), 500);
            }

        } catch (error) {
            console.error('❌ AI Start Error:', error);
            addMessage("Sorry, I'm having trouble connecting to the server. Please check your internet connection.", 'ai');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserResponse = async (answer, value = null) => {
        const answerText = value || answer;

        // Validate input (skip validation if it's from option buttons)
        if (!value && !validateInput(answerText, currentStep)) {
            return; // Validation failed, error message is already set
        }

        // Clear validation error on successful validation
        setValidationError('');

        // UI update
        addMessage(answer, 'user');
        setOptions([]); // Clear options while processing
        setInputValue('');
        setIsLoading(true);

        try {
            const data = await processAIAnswer({
                step: currentStep,
                answer: answerText,
                context: context
            });

            // Check for validation error from backend
            if (data.error === 'invalid_query') {
                // Backend rejected the query as off-topic
                addMessage(data.message, 'ai');
                setCurrentStep(data.nextStep || 'intent');
                setOptions(data.options || []);
                if (data.question) {
                    setTimeout(() => addMessage(data.question, 'ai'), 500);
                }
                setIsLoading(false);
                return;
            }

            // Update Context
            if (data.updatedContext) {
                setContext(data.updatedContext);
            }

            if (data.nextStep === 'results') {
                // Final Step: Fetch Match
                addMessage(data.message, 'ai');
                setCurrentStep('results');
                fetchRecommendations(data.updatedContext);
            } else {
                // Next Question
                setCurrentStep(data.nextStep);
                setOptions(data.options || []);
                if (data.question) {
                    addMessage(data.question, 'ai');
                }
            }

        } catch (error) {
            console.error('Processing Error:', error);
            addMessage("Something went wrong. Let's try that again.", 'ai');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRecommendations = async (finalContext) => {
        setIsLoading(true);
        try {
            const data = await getAIRecommendations(finalContext);
            setResults(data.vendors);

        } catch (err) {
            console.error('Recommendation Error:', err);
            addMessage("I couldn't find any matches right now.", 'ai');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVendorClick = (vendor) => {
        // Navigate to simulated vendor details
        navigation.navigate('VendorDetails', { business: vendor });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI Assistant</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Chat Area */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg) => (
                    <View
                        key={msg.id}
                        style={[
                            styles.messageBubble,
                            msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                        ]}
                    >
                        {msg.sender === 'ai' && (
                            <View style={styles.aiIconContainer}>
                                <Icon name="cpu" size={16} color="#FFF" />
                            </View>
                        )}
                        <Text style={[
                            styles.messageText,
                            msg.sender === 'user' ? styles.userText : styles.aiText
                        ]}>
                            {msg.text}
                        </Text>
                    </View>
                ))}

                {isLoading && (
                    <View style={styles.loadingBubble}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    </View>
                )}

                {/* Results View (Rendered inside chat stream for flow) */}
                {results && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsTitle}>Top Matches for You</Text>
                        {results.map((vendor) => (
                            <TouchableOpacity
                                key={vendor.id}
                                style={styles.vendorCard}
                                onPress={() => handleVendorClick(vendor)}
                            >
                                <View style={styles.vendorHeader}>
                                    <Text style={styles.vendorName}>{vendor.name}</Text>
                                    <View style={styles.ratingBadge}>
                                        <Icon name="star" size={12} color="#FFF" />
                                        <Text style={styles.ratingText}>{vendor.rating}</Text>
                                    </View>
                                </View>
                                <Text style={styles.vendorService}>{vendor.service}</Text>
                                <View style={styles.vendorMeta}>
                                    <Text style={styles.metaText}>{vendor.distance}</Text>
                                    <Text style={styles.metaText}>•</Text>
                                    <Text style={styles.metaText}>{vendor.price}</Text>
                                    <Text style={styles.metaText}>•</Text>
                                    <Text style={[styles.metaText, { color: 'green' }]}>{vendor.eta}</Text>
                                </View>
                                {vendor.isTopMatch && (
                                    <View style={styles.topMatchBadge}>
                                        <Text style={styles.topMatchText}>Top Match</Text>
                                    </View>
                                )}
                                {vendor.explanation && (
                                    <Text style={styles.explanationText}>💡 {vendor.explanation}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Input Area */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.inputContainer}>
                    {/* Validation Error Message */}
                    {validationError ? (
                        <View style={styles.errorContainer}>
                            <Icon name="alert-circle" size={16} color="#EF4444" />
                            <Text style={styles.errorText}>{validationError}</Text>
                        </View>
                    ) : null}

                    {/* Quick Options */}
                    {options.length > 0 && !isLoading && (
                        <View style={styles.optionsContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {options.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={styles.optionChip}
                                        onPress={() => handleUserResponse(opt.label, opt.value)}
                                    >
                                        <Text style={styles.optionText}>{opt.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Text Input (Only show if we are not in result mode) */}
                    {!results && (
                        <View style={styles.inputRow}>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    validationError ? styles.textInputError : null
                                ]}
                                placeholder="Type your answer..."
                                placeholderTextColor={COLORS.textMuted}
                                value={inputValue}
                                onChangeText={(text) => {
                                    setInputValue(text);
                                    // Clear error when user starts typing
                                    if (validationError) {
                                        setValidationError('');
                                    }
                                }}
                                onSubmitEditing={() => inputValue.trim() && handleUserResponse(inputValue)}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, { backgroundColor: inputValue.trim() ? COLORS.primary : '#E5E7EB' }]}
                                disabled={!inputValue.trim()}
                                onPress={() => handleUserResponse(inputValue)}
                            >
                                <Icon name="send" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const createStyles = (COLORS) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: 16,
        paddingBottom: 24,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 1,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 4,
        flexDirection: 'row',
        alignItems: 'center', // Align icon with text
        gap: 8,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary || '#F97316',
        borderBottomRightRadius: 4,
    },
    aiIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary || '#F97316',
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    aiText: {
        color: COLORS.textPrimary,
        flex: 1, // Allow text to wrap
    },
    userText: {
        color: '#FFF',
    },
    loadingBubble: {
        alignSelf: 'flex-start',
        padding: 12,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginLeft: 4,
        marginBottom: 12,
    },
    inputContainer: {
        padding: 16,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    optionsContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        height: 40,
    },
    optionChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#EEF2FF',
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    optionText: {
        color: '#4F46E5', // Indigo
        fontWeight: '600',
        fontSize: 14,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        color: COLORS.textPrimary,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    textInputError: {
        borderColor: '#EF4444',
        borderWidth: 1,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
        gap: 8,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: '#DC2626',
        fontWeight: '500',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultsContainer: {
        marginTop: 16,
        marginBottom: 32,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    vendorCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    vendorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    vendorName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#22C55E', // Green
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
    },
    ratingText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    vendorService: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    vendorMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    topMatchBadge: {
        position: 'absolute',
        top: -8,
        right: 16,
        backgroundColor: '#4F46E5', // Indigo
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    topMatchText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    explanationText: {
        fontSize: 12,
        color: '#4B5563',
        fontStyle: 'italic',
        marginTop: 8,
        backgroundColor: '#F3F4F6',
        padding: 8,
        borderRadius: 6,
    },
});

export default AIServiceFlow;
