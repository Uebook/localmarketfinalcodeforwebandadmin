import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';

const TermsPrivacy = ({ navigation, onBack }) => {
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
          <Text style={styles.headerTitle}>Terms & Privacy</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Terms of Service Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name={getIconName('FileText')} size={20} color="#dc2626" />
            <Text style={styles.sectionTitle}>Terms of Service</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>1. Acceptance of Terms:</Text> By accessing and using the Local app, you accept and agree to be bound by the terms and provision of this agreement.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>2. User Accounts:</Text> You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>3. Local+ Listings:</Text> Local+ partners are responsible for the accuracy of their product listings, prices, and shop information. Local reserves the right to remove listings that violate our community guidelines.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>4. Limitation of Liability:</Text> Local is a platform connecting users and vendors. We are not responsible for the quality of goods or services provided by vendors.
            </Text>
          </View>
        </View>

        {/* Privacy Policy Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name={getIconName('Shield')} size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Privacy Policy</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>1. Information Collection:</Text> We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>2. Location Data:</Text> To provide location-based services (like finding nearby vendors), we collect and process information about your actual location.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>3. Data Usage:</Text> We use the information we collect to provide, maintain, and improve our services, and to communicate with you.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>4. Data Security:</Text> We implement appropriate technical and organizational measures to protect the security of your personal information.
            </Text>
            <View style={styles.securityNote}>
              <Icon name={getIconName('Lock')} size={16} color="#6b7280" />
              <Text style={styles.securityText}>Your data is encrypted and handled securely.</Text>
            </View>
          </View>
        </View>

        <Text style={styles.lastUpdated}>Last updated: June 12, 2025</Text>
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
    gap: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionContent: {
    gap: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 16,
  },
});

export default TermsPrivacy;



