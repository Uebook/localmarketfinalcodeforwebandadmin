import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';

const FAQS = [
  {
    question: "How do I register as a Local+ Vendor?",
    answer: "Go to the menu (or login screen) and click 'Register as Local+'. Fill in your basic details, shop location, and upload the required KYC documents. Your account will be approved within 24-48 hours."
  },
  {
    question: "Is there a fee for listing?",
    answer: "Currently, listing your business on Local is free for the first 3 months. After that, nominal charges may apply."
  },
  {
    question: "How can I change my shop location?",
    answer: "Go to 'Local+ Dashboard' > 'Profile & Settings'. Click 'Edit' and update your address or drag the pin on the map."
  },
  {
    question: "My category is not listed. What to do?",
    answer: "Select 'Others' in the category dropdown during registration or editing. You can type a new category name, which will be sent for Super Admin approval."
  },
  {
    question: "How do I reply to reviews?",
    answer: "In your Local+ Dashboard, go to the 'Reviews' tab. You will see an option to 'Reply' under each customer review."
  }
];

const HelpSupport = ({ navigation, onBack }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <Icon name={getIconName('ArrowLeft')} size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Contact Cards */}
        <View style={styles.contactGrid}>
          <View style={styles.contactCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#dbeafe' }]}>
              <Icon name={getIconName('Mail')} size={20} color="#2563eb" />
            </View>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactEmail}>support@local.com</Text>
          </View>
          <View style={styles.contactCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
              <Icon name={getIconName('Shield')} size={20} color="#16a34a" />
            </View>
            <Text style={styles.contactTitle}>Trust & Safety</Text>
            <Text style={styles.contactEmail}>safety@local.com</Text>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <View style={styles.faqHeader}>
            <Icon name={getIconName('HelpCircle')} size={20} color="#dc2626" />
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          </View>

          {FAQS.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => setOpenIndex(openIndex === index ? null : index)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Icon
                  name={openIndex === index ? getIconName('ChevronUp') : getIconName('ChevronDown')}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
              {openIndex === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  contactGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  faqSection: {
    gap: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  faqItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginRight: 8,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#f9fafb',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});

export default HelpSupport;



