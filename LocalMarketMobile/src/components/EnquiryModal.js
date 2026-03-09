import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { submitEnquiry } from '../services/api';

const EnquiryModal = ({ businessName, vendorId, isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name || !phone || !message) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!vendorId) {
      Alert.alert('Error', 'Vendor information is missing. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitEnquiry({
        vendor_id: vendorId,
        name,
        mobile: phone,
        message,
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      // Close modal after showing success message
      setTimeout(() => {
        setIsSuccess(false);
        setName('');
        setPhone('');
        setMessage('');
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Mobile Enquiry Error:', error);
      setIsSubmitting(false);
      Alert.alert('Error', error.message || 'Unable to send enquiry. Please try again.');
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Icon name={getIconName('X')} size={20} color="#9ca3af" />
          </TouchableOpacity>

          {isSuccess ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Icon name={getIconName('Send')} size={40} color="#16a34a" />
              </View>
              <Text style={styles.successTitle}>Enquiry Sent!</Text>
              <Text style={styles.successText}>
                Your message has been successfully sent to{' '}
                <Text style={styles.businessNameText}>{businessName}</Text>. They will contact you shortly.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Send Enquiry</Text>
                <Text style={styles.subtitle}>
                  To <Text style={styles.businessNameText}>{businessName}</Text>
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Your Name</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Icon name={getIconName('User')} size={20} color="#9ca3af" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9ca3af"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Icon name={getIconName('Phone')} size={20} color="#9ca3af" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 10 digit number"
                      placeholderTextColor="#9ca3af"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={(text) => setPhone(text.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Message</Text>
                  <View style={styles.textAreaWrapper}>
                    <View style={styles.textAreaIcon}>
                      <Icon name={getIconName('MessageSquare')} size={20} color="#9ca3af" />
                    </View>
                    <TextInput
                      style={styles.textArea}
                      placeholder="I am interested in your services..."
                      placeholderTextColor="#9ca3af"
                      multiline
                      numberOfLines={3}
                      value={message}
                      onChangeText={setMessage}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Send Enquiry</Text>
                      <Icon name={getIconName('Send')} size={16} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  businessNameText: {
    fontWeight: '700',
    color: '#dc2626',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    paddingRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    paddingVertical: 12,
    minHeight: 44,
  },
  textAreaWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  textAreaIcon: {
    paddingRight: 12,
    paddingTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    minHeight: 80,
    paddingBottom: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
});

export default EnquiryModal;




