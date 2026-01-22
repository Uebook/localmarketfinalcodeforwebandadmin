import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';

const WriteReview = ({ visible, onClose, onSubmit, vendorName }) => {
  const COLORS = useThemeColors();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');

  const handleStarPress = (starIndex) => {
    setRating(starIndex + 1);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Comment Required', 'Please write a comment before submitting.');
      return;
    }
    if (!userName.trim()) {
      Alert.alert('Name Required', 'Please enter your name before submitting.');
      return;
    }

    onSubmit({
      rating,
      comment: comment.trim(),
      userName: userName.trim(),
      date: new Date().toISOString(),
    });

    // Reset form
    setRating(0);
    setComment('');
    setUserName('');
    onClose();
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setUserName('');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name={getIconName('X')} size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Write a Review</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
              {/* Vendor Info */}
              {vendorName && (
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorLabel}>Reviewing</Text>
                  <Text style={styles.vendorName}>{vendorName}</Text>
                </View>
              )}

              {/* Rating Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Rating</Text>
                <View style={styles.starContainer}>
                  {[1, 2, 3, 4, 5].map((star, index) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => handleStarPress(index)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={getIconName('Star')}
                        size={40}
                        color={index < rating ? '#fbbf24' : '#E5E7EB'}
                        style={styles.star}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {rating > 0 && (
                  <Text style={styles.ratingText}>
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </Text>
                )}
              </View>

              {/* Name Input */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={COLORS.textMuted}
                  value={userName}
                  onChangeText={setUserName}
                />
              </View>

              {/* Comment Input */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Review</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Share your experience with this vendor..."
                  placeholderTextColor={COLORS.textMuted}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{comment.length}/500</Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, (!rating || !comment.trim() || !userName.trim()) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!rating || !comment.trim() || !userName.trim()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={COLORS.primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.white,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  vendorInfo: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: 16,
  },
  vendorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  star: {
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.orange,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default WriteReview;
