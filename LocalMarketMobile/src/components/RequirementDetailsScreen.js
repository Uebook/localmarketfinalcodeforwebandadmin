import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
import api from '../services/api';

export default function RequirementDetailsScreen({ navigation, route }) {
  const themeColors = useThemeColors();
  const { requirement, userData } = route.params || {};

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  useEffect(() => {
    fetchQuotations();
  }, [requirement]);

  const fetchQuotations = async () => {
    if (!requirement?.id) return;
    try {
      setLoading(true);
      const res = await api.getQuotations({ requirement_id: requirement.id });
      if (res && res.success) {
        setQuotations(res.quotations || []);
      }
    } catch (err) {
      console.warn('Failed to fetch quotations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (quotation) => {
    setSelectedQuotation(quotation);
    setConfirmModalVisible(true);
  };

  const confirmAccept = async () => {
    if (!selectedQuotation) return;
    
    try {
      setProcessing(true);
      // Update this quotation to accepted
      await api.updateQuotationStatus(selectedQuotation.id, 'accepted');
      // Update requirement to accepted
      await api.updateRequirementStatus(requirement.id, 'accepted');
      
      setConfirmModalVisible(false);
      Alert.alert('Success', 'Quotation accepted! Vendor details are now available.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to accept quotation');
    } finally {
      setProcessing(false);
    }
  };

  const renderQuotation = ({ item }) => {
    const isAccepted = item.status === 'accepted';
    const isPending = item.status === 'pending';
    
    return (
      <View style={[styles.quoteCard, { backgroundColor: themeColors.white, borderColor: isAccepted ? themeColors.success : themeColors.divider }]}>
        <View style={styles.quoteHeader}>
          <Text style={[styles.vendorName, { color: themeColors.textPrimary }]}>{item.vendors?.name || 'Local Vendor'}</Text>
          <Text style={[styles.quotePrice, { color: themeColors.primaryOrange }]}>₹{item.price}</Text>
        </View>
        
        {item.note ? (
          <Text style={[styles.quoteNote, { color: themeColors.textSecondary }]}>"{item.note}"</Text>
        ) : null}

        <View style={styles.quoteDetails}>
          <View style={styles.quoteItem}>
            <Icon name="clock" size={14} color={themeColors.textMuted} />
            <Text style={[styles.quoteItemText, { color: themeColors.textSecondary }]}>{item.delivery_time || 'Standard time'}</Text>
          </View>
          {item.vendors?.rating ? (
            <View style={styles.quoteItem}>
              <Icon name="star" size={14} color="#F59E0B" />
              <Text style={[styles.quoteItemText, { color: themeColors.textSecondary }]}>{item.vendors.rating}</Text>
            </View>
          ) : null}
        </View>

        {isAccepted ? (
          <View style={[styles.vendorReveal, { backgroundColor: themeColors.backgroundSoft, borderColor: themeColors.divider }]}>
            <Text style={[styles.revealTitle, { color: themeColors.textPrimary }]}>Vendor Contact Info</Text>
            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${item.vendors?.contact_number}`)}>
              <Icon name="phone" size={16} color={themeColors.primaryBlue} />
              <Text style={[styles.contactText, { color: themeColors.primaryBlue }]}>{item.vendors?.contact_number || 'Not provided'}</Text>
            </TouchableOpacity>
            <View style={styles.contactRow}>
              <Icon name="map-pin" size={16} color={themeColors.textSecondary} />
              <Text style={[styles.contactText, { color: themeColors.textSecondary }]}>{item.vendors?.city || 'Location hidden'}</Text>
            </View>
          </View>
        ) : null}

        {requirement.status === 'active' && isPending ? (
          <TouchableOpacity 
            style={[styles.acceptBtn, { backgroundColor: themeColors.success }]}
            onPress={() => handleAccept(item)}
            disabled={processing}
          >
            <Text style={styles.acceptBtnText}>Accept Quotation</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  if (!requirement) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSoft }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: themeColors.white, borderBottomColor: themeColors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Requirement Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={quotations}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={[styles.reqCard, { backgroundColor: themeColors.white, borderColor: themeColors.divider }]}>
            <Text style={[styles.reqTitle, { color: themeColors.textPrimary }]}>{requirement.title}</Text>
            <Text style={[styles.reqDesc, { color: themeColors.textSecondary }]}>{requirement.description}</Text>
            
            <View style={styles.reqMeta}>
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: themeColors.textMuted }]}>Category</Text>
                <Text style={[styles.metaValue, { color: themeColors.textPrimary }]}>{requirement.category}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: themeColors.textMuted }]}>Quantity</Text>
                <Text style={[styles.metaValue, { color: themeColors.textPrimary }]}>{requirement.quantity} {requirement.unit}</Text>
              </View>
              {requirement.budget_min || requirement.budget_max ? (
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: themeColors.textMuted }]}>Budget</Text>
                  <Text style={[styles.metaValue, { color: themeColors.textPrimary }]}>
                    ₹{requirement.budget_min || 0} - ₹{requirement.budget_max || 'Any'}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary, marginTop: 24 }]}>
              Quotations Received ({quotations.length})
            </Text>
          </View>
        }
        renderItem={renderQuotation}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Icon name="inbox" size={48} color={themeColors.divider} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No quotations received yet</Text>
            </View>
          )
        }
      />

      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.white }]}>
            <View style={styles.modalIconContainer}>
              <Icon name="check-circle" size={32} color={themeColors.success} />
            </View>
            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Accept Quotation?</Text>
            <Text style={[styles.modalText, { color: themeColors.textSecondary }]}>
              Are you sure you want to accept this quotation from <Text style={{ fontWeight: '700', color: themeColors.textPrimary }}>{selectedQuotation?.vendors?.name || 'Vendor'}</Text>? Other quotations will be automatically rejected.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: themeColors.backgroundSoft }]}
                onPress={() => setConfirmModalVisible(false)}
                disabled={processing}
              >
                <Text style={[styles.modalBtnText, { color: themeColors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: themeColors.success }]}
                onPress={confirmAccept}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Accept</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  listContainer: { padding: 16 },
  reqCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  reqTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  reqDesc: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  reqMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  metaItem: { minWidth: '45%' },
  metaLabel: { fontSize: 12, marginBottom: 4 },
  metaValue: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  quoteCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  quoteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  vendorName: { fontSize: 16, fontWeight: '600', flex: 1 },
  quotePrice: { fontSize: 18, fontWeight: '700' },
  quoteNote: { fontSize: 14, fontStyle: 'italic', marginBottom: 12 },
  quoteDetails: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  quoteItem: { flexDirection: 'row', alignItems: 'center' },
  quoteItemText: { fontSize: 13, marginLeft: 4 },
  acceptBtn: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  acceptBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', padding: 32 },
  emptyText: { marginTop: 12, fontSize: 15 },
  vendorReveal: { marginTop: 12, padding: 12, borderRadius: 8, borderWidth: 1 },
  revealTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  contactText: { fontSize: 14, marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', borderRadius: 16, padding: 24, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  modalIconContainer: { alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  modalText: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '600' },
});
