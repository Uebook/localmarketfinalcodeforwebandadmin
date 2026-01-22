import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { PAYMENT_PLANS, PAYMENT_STATUS, getPlanDisplayName } from '../utils/paymentUtils';

const PaymentManagement = ({ navigation, vendorData, onUpdateVendor }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [selectedPlan, setSelectedPlan] = useState(vendorData?.paymentInfo?.subscriptionPlan || PAYMENT_PLANS.MONTHLY);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const paymentInfo = vendorData?.paymentInfo || {
    subscriptionPlan: PAYMENT_PLANS.MONTHLY,
    paymentStatus: PAYMENT_STATUS.PENDING,
    paymentDueDate: new Date().toISOString().split('T')[0],
    lastPaymentDate: null,
    amount: 0,
  };

  const planPrices = {
    [PAYMENT_PLANS.MONTHLY]: 999,
    [PAYMENT_PLANS.SIX_MONTHLY]: 4999,
    [PAYMENT_PLANS.YEARLY]: 8999,
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleMakePayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    // In production, this would process actual payment
    const updatedVendor = {
      ...vendorData,
      paymentInfo: {
        ...paymentInfo,
        subscriptionPlan: selectedPlan,
        paymentStatus: PAYMENT_STATUS.PAID,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        paymentDueDate: calculateNextDueDate(new Date().toISOString().split('T')[0], selectedPlan),
        amount: planPrices[selectedPlan],
      },
      activationStatus: 'Active',
    };

    if (onUpdateVendor) {
      onUpdateVendor(updatedVendor);
    }

    setShowPaymentModal(false);
    Alert.alert('Payment Successful', 'Your subscription has been activated!');
  };

  const calculateNextDueDate = (currentDate, plan) => {
    const date = new Date(currentDate);
    if (plan === PAYMENT_PLANS.MONTHLY) {
      date.setMonth(date.getMonth() + 1);
    } else if (plan === PAYMENT_PLANS.SIX_MONTHLY) {
      date.setMonth(date.getMonth() + 6);
    } else if (plan === PAYMENT_PLANS.YEARLY) {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toISOString().split('T')[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case PAYMENT_STATUS.PAID:
        return '#16a34a';
      case PAYMENT_STATUS.PENDING:
        return '#f59e0b';
      case PAYMENT_STATUS.OVERDUE:
        return '#dc2626';
      case PAYMENT_STATUS.EXPIRED:
        return '#991b1b';
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      />
      
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation?.goBack()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name={getIconName('ArrowLeft')} size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment & Subscription</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Current Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(paymentInfo.paymentStatus) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(paymentInfo.paymentStatus) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(paymentInfo.paymentStatus) }]}>
                {paymentInfo.paymentStatus.toUpperCase()}
              </Text>
            </View>
          </View>
          
          {paymentInfo.paymentStatus === PAYMENT_STATUS.PAID && (
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Next Payment Due</Text>
              <Text style={styles.statusValue}>{paymentInfo.paymentDueDate || 'N/A'}</Text>
            </View>
          )}

          {paymentInfo.paymentStatus !== PAYMENT_STATUS.PAID && (
            <View style={styles.warningBox}>
              <Icon name={getIconName('AlertCircle')} size={20} color="#dc2626" />
              <Text style={styles.warningText}>
                {paymentInfo.paymentStatus === PAYMENT_STATUS.OVERDUE 
                  ? 'Your account will be blocked due to overdue payment'
                  : 'Please complete payment to continue using the platform'}
              </Text>
            </View>
          )}
        </View>

        {/* Subscription Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Subscription Plan</Text>
          <Text style={styles.sectionDescription}>Select your preferred billing cycle</Text>

          <View style={styles.plansContainer}>
            {Object.values(PAYMENT_PLANS).map((plan) => (
              <TouchableOpacity
                key={plan}
                style={[
                  styles.planCard,
                  selectedPlan === plan && styles.planCardSelected
                ]}
                onPress={() => handlePlanSelect(plan)}
                activeOpacity={0.7}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{getPlanDisplayName(plan)}</Text>
                  {selectedPlan === plan && (
                    <View style={styles.selectedBadge}>
                      <Icon name={getIconName('Check')} size={16} color={COLORS.white} />
                    </View>
                  )}
                </View>
                <Text style={styles.planPrice}>₹{planPrices[plan].toLocaleString()}</Text>
                <Text style={styles.planPeriod}>
                  {plan === PAYMENT_PLANS.MONTHLY && 'per month'}
                  {plan === PAYMENT_PLANS.SIX_MONTHLY && 'for 6 months'}
                  {plan === PAYMENT_PLANS.YEARLY && 'per year'}
                </Text>
                {plan === PAYMENT_PLANS.YEARLY && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>Save 25%</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={handleMakePayment}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={COLORS.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.paymentButtonGradient}
          >
            <Text style={styles.paymentButtonText}>
              Pay ₹{planPrices[selectedPlan].toLocaleString()}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Payment History */}
        {paymentInfo.lastPaymentDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <View style={styles.historyCard}>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Last Payment</Text>
                <Text style={styles.historyValue}>₹{paymentInfo.amount?.toLocaleString() || '0'}</Text>
              </View>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Date</Text>
                <Text style={styles.historyValue}>{paymentInfo.lastPaymentDate}</Text>
              </View>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Plan</Text>
                <Text style={styles.historyValue}>{getPlanDisplayName(paymentInfo.subscriptionPlan)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Payment</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Icon name={getIconName('X')} size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                In production, this would integrate with payment gateway (Razorpay, Stripe, etc.)
              </Text>
              <Text style={styles.modalAmount}>Amount: ₹{planPrices[selectedPlan].toLocaleString()}</Text>
              <Text style={styles.modalPlan}>Plan: {getPlanDisplayName(selectedPlan)}</Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handlePaymentComplete}
              >
                <Text style={styles.confirmButtonText}>Simulate Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  header: {
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 64,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusInfo: {
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.divider,
  },
  planCardSelected: {
    borderColor: COLORS.orange,
    backgroundColor: '#FFF4EC',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.orange,
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  savingsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  paymentButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
  },
  paymentButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  historyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalBody: {
    padding: 16,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  modalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.orange,
    marginBottom: 8,
  },
  modalPlan: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: COLORS.orange,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default PaymentManagement;
