import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { submitFeedback } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FeedbackForm = ({ 
  navigation, 
  onBack, 
  userRole = 'user', // 'user' or 'vendor'
  onSubmit 
}) => {
  const COLORS = useThemeColors();
  const [formData, setFormData] = useState({
    category: '',
    rating: 0,
    comment: '',
    type: userRole
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Product Quality',
    'Platform Features',
    'Delivery',
    'Pricing',
    'Customer Service',
    'User Experience',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (formData.rating === 0) {
      Alert.alert('Error', 'Please provide a rating');
      return;
    }
    if (!formData.comment.trim()) {
      Alert.alert('Error', 'Please provide your feedback');
      return;
    }

    try {
      setSubmitting(true);
      
      // Get user ID from storage or generate one
      let userId = null;
      try {
        userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          // Try to get from phone
          const phone = await AsyncStorage.getItem('userPhone');
          if (phone) {
            userId = phone; // Use phone as identifier
          }
        }
      } catch (e) {
        console.log('Could not get userId from storage:', e);
      }

      // Prepare feedback data for API
      const feedbackData = {
        userId: userId || 'anonymous',
        type: formData.type || 'suggestion',
        message: `${formData.category}: ${formData.comment} (Rating: ${formData.rating}/5)`,
      };

      // Submit to API
      await submitFeedback(feedbackData);

      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit(formData);
      } else {
        // Default behavior - show success and go back
        Alert.alert(
          'Success',
          'Thank you for your feedback! We appreciate your input.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onBack) onBack();
                else if (navigation) navigation.goBack();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert(
        'Error',
        'Failed to submit feedback. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setFormData({ ...formData, rating: star })}
            style={styles.starButton}
          >
            <Icon
              name="star"
              size={32}
              color={star <= formData.rating ? '#FFD700' : '#E5E7EB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => {
              if (onBack) onBack();
              else if (navigation) navigation.goBack();
            }} 
            style={styles.backButton} 
            activeOpacity={0.7}
          >
            <Icon name={getIconName('ArrowLeft')} size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Give Feedback</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* User Type Badge */}
          <View style={styles.userTypeBadge}>
            <Icon 
              name={userRole === 'vendor' ? 'store' : 'user'} 
              size={16} 
              color={COLORS.orange} 
            />
            <Text style={styles.userTypeText}>
              {userRole === 'vendor' ? 'Vendor Feedback' : 'User Feedback'}
            </Text>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setFormData({ ...formData, category })}
                  style={[
                    styles.categoryButton,
                    formData.category === category && styles.categoryButtonActive
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === category && styles.categoryButtonTextActive
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text style={styles.label}>Rating <Text style={styles.required}>*</Text></Text>
            {renderStars()}
            {formData.rating > 0 && (
              <Text style={styles.ratingText}>
                {formData.rating} {formData.rating === 1 ? 'star' : 'stars'}
              </Text>
            )}
          </View>

          {/* Comment */}
          <View style={styles.section}>
            <Text style={styles.label}>Your Feedback <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.textInput}
              placeholder="Share your thoughts, suggestions, or concerns..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              value={formData.comment}
              onChangeText={(text) => setFormData({ ...formData, comment: text })}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{formData.comment.length}/500</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              ((!formData.category || formData.rating === 0 || !formData.comment.trim()) || submitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!formData.category || formData.rating === 0 || !formData.comment.trim() || submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
                <Icon name="send" size={20} color="#FFFFFF" style={styles.submitIcon} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.orange,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  required: {
    color: '#DC2626',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitIcon: {
    marginLeft: 8,
  },
});

export default FeedbackForm;
