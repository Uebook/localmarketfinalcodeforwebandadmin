import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
import api from '../services/api';

export default function SubmitQuotationScreen({ navigation, route }) {
  const themeColors = useThemeColors();
  const { requirement, vendorData, existingQuotation, isViewOnly } = route.params || {};

  const [price, setPrice] = useState(existingQuotation?.price ? existingQuotation.price.toString() : '');
  const [deliveryTime, setDeliveryTime] = useState(existingQuotation?.delivery_time || '');
  const [note, setNote] = useState(existingQuotation?.note || '');
  const [submitting, setSubmitting] = useState(false);

  if (!requirement || !vendorData) return null;

  const handleSubmit = async () => {
    if (!price.trim()) {
      Alert.alert('Error', 'Please enter your quotation price');
      return;
    }

    try {
      setSubmitting(true);
      
      if (existingQuotation) {
        // Edit mode
        const updates = {
          price: parseFloat(price),
          delivery_time: deliveryTime.trim() || 'Standard time',
          note: note.trim()
        };
        const res = await api.updateQuotationDetails(existingQuotation.id, updates);
        if (res.success || res.quotation) {
          Alert.alert('Success', 'Your bid has been updated successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } else {
          throw new Error(res.error || 'Failed to update quotation');
        }
      } else {
        // Create mode
        const quoteData = {
          requirement_id: requirement.id,
          vendor_id: vendorData.id,
          price: parseFloat(price),
          delivery_time: deliveryTime.trim() || 'Standard time',
          note: note.trim()
        };

        const res = await api.submitQuotation(quoteData);
        if (res.success || res.quotation) {
          Alert.alert('Success', 'Your bid has been submitted to the buyer!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } else {
          throw new Error(res.error || 'Failed to submit quotation');
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('duplicate key value')) {
        Alert.alert('Duplicate', 'You have already submitted a bid for this requirement.');
      } else {
        Alert.alert('Error', err.message || 'Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getScreenTitle = () => {
    if (isViewOnly) return 'View Bid Details';
    if (existingQuotation) return 'Edit Bid';
    return 'Submit Bid';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSoft }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: themeColors.white, borderBottomColor: themeColors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{getScreenTitle()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        
        <View style={[styles.reqCard, { backgroundColor: themeColors.white, borderColor: themeColors.divider }]}>
          <Text style={[styles.reqSubtitle, { color: themeColors.textSecondary }]}>Buyer Request</Text>
          <Text style={[styles.reqTitle, { color: themeColors.textPrimary }]}>{requirement.title}</Text>
          <Text style={[styles.reqDesc, { color: themeColors.textSecondary }]}>{requirement.description}</Text>
          
          <View style={styles.reqMeta}>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: themeColors.textMuted }]}>Qty</Text>
              <Text style={[styles.metaValue, { color: themeColors.textPrimary }]}>{requirement.quantity} {requirement.unit}</Text>
            </View>
            {requirement.budget_max && (
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: themeColors.textMuted }]}>Budget</Text>
                <Text style={[styles.metaValue, { color: themeColors.textPrimary }]}>Up to ₹{requirement.budget_max}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Your Quotation</Text>
        
        <View style={[styles.card, { backgroundColor: themeColors.white, borderColor: themeColors.divider }]}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Total Price (₹) *</Text>
          <TextInput
            style={[styles.input, { borderColor: themeColors.divider, color: themeColors.textPrimary, fontSize: 18, fontWeight: '700' }, isViewOnly && { backgroundColor: themeColors.backgroundSoft }]}
            placeholder="0.00"
            placeholderTextColor={themeColors.textMuted}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            editable={!isViewOnly}
          />

          <Text style={[styles.label, { color: themeColors.textSecondary, marginTop: 16 }]}>Delivery / Completion Time</Text>
          <TextInput
            style={[styles.input, { borderColor: themeColors.divider, color: themeColors.textPrimary }, isViewOnly && { backgroundColor: themeColors.backgroundSoft }]}
            placeholder="e.g., Today by 5 PM, or 2 Days"
            placeholderTextColor={themeColors.textMuted}
            value={deliveryTime}
            onChangeText={setDeliveryTime}
            editable={!isViewOnly}
          />

          <Text style={[styles.label, { color: themeColors.textSecondary, marginTop: 16 }]}>Additional Note for Buyer</Text>
          <TextInput
            style={[styles.input, styles.textArea, { borderColor: themeColors.divider, color: themeColors.textPrimary }, isViewOnly && { backgroundColor: themeColors.backgroundSoft }]}
            placeholder="e.g., We use premium materials and offer a 1-year warranty..."
            placeholderTextColor={themeColors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isViewOnly}
          />
        </View>

      </ScrollView>

      {!isViewOnly && (
        <View style={[styles.footer, { backgroundColor: themeColors.white, borderTopColor: themeColors.divider }]}>
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: themeColors.primaryOrange }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>{existingQuotation ? 'Save Changes' : 'Submit Bid'}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  reqCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24, backgroundColor: '#FAFAFA' },
  reqSubtitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  reqTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  reqDesc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  reqMeta: { flexDirection: 'row', gap: 16 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 12, marginBottom: 4 },
  metaValue: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  footer: { padding: 16, borderTopWidth: 1 },
  submitButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
