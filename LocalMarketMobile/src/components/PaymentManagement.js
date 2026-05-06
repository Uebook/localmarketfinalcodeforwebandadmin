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
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation?.goBack()} 
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
          <TouchableOpacity style={styles.headerRight}>
            <Icon name="help-circle" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.statusCardGradient}
            >
              <View style={styles.statusTop}>
                <View>
                  <Text style={styles.statusLabel}>Current Status</Text>
                  <Text style={[styles.statusMain, { color: getStatusColor(paymentInfo.paymentStatus) }]}>
                    {paymentInfo.paymentStatus.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(paymentInfo.paymentStatus) + '15' }]}>
                  <Icon name="shield" size={24} color={getStatusColor(paymentInfo.paymentStatus)} />
                </View>
              </View>

              {paymentInfo.paymentStatus === PAYMENT_STATUS.PAID ? (
                <View style={styles.statusDetails}>
                  <View style={styles.detailItem}>
                    <Icon name="calendar" size={14} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>Next Due: {paymentInfo.paymentDueDate}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.alertBox}>
                  <Icon name="alert-triangle" size={16} color="#DC2626" />
                  <Text style={styles.alertText}>
                    {paymentInfo.paymentStatus === PAYMENT_STATUS.OVERDUE 
                      ? 'Action Required: Account overdue'
                      : 'Complete payment to unlock all features'}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>

        <View style={styles.plansSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            <Text style={styles.sectionSubtitle}>Select the best billing cycle for you</Text>
          </View>

          <View style={styles.plansList}>
            {Object.values(PAYMENT_PLANS).map((plan) => (
              <TouchableOpacity
                key={plan}
                onPress={() => handlePlanSelect(plan)}
                activeOpacity={0.9}
                style={[
                  styles.planItem,
                  selectedPlan === plan && styles.planItemSelected
                ]}
              >
                <View style={styles.planInfo}>
                  <View style={[
                    styles.planIcon,
                    selectedPlan === plan ? { backgroundColor: COLORS.orange } : { backgroundColor: '#F1F5F9' }
                  ]}>
                    <Icon 
                      name={plan === PAYMENT_PLANS.YEARLY ? "award" : (plan === PAYMENT_PLANS.SIX_MONTHLY ? "layers" : "clock")} 
                      size={20} 
                      color={selectedPlan === plan ? '#FFF' : COLORS.textSecondary} 
                    />
                  </View>
                  <View>
                    <Text style={[styles.planTitle, selectedPlan === plan && styles.planTitleActive]}>
                      {getPlanDisplayName(plan)}
                    </Text>
                    <Text style={styles.planSub}>
                      {plan === PAYMENT_PLANS.MONTHLY && 'Billed Monthly'}
                      {plan === PAYMENT_PLANS.SIX_MONTHLY && 'Billed Half-Yearly'}
                      {plan === PAYMENT_PLANS.YEARLY && 'Best Value'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.planPriceSection}>
                  <Text style={[styles.planPriceText, selectedPlan === plan && styles.planPriceTextActive]}>
                    ₹{planPrices[plan].toLocaleString()}
                  </Text>
                  {plan === PAYMENT_PLANS.YEARLY && (
                    <View style={styles.promoBadge}>
                      <Text style={styles.promoText}>-25%</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.payBtn}
            onPress={handleMakePayment}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#F97316', '#EA580C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.payBtnGradient}
            >
              <Text style={styles.payBtnText}>Subscribe Now</Text>
              <View style={styles.payBtnPrice}>
                <Text style={styles.payPriceVal}>₹{planPrices[selectedPlan].toLocaleString()}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {paymentInfo.lastPaymentDate && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Payment History</Text>
            <View style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Icon name="check-circle" size={18} color="#16a34a" />
              </View>
              <View style={styles.historyMain}>
                <Text style={styles.historyPlan}>{getPlanDisplayName(paymentInfo.subscriptionPlan)} Plan</Text>
                <Text style={styles.historyDate}>{paymentInfo.lastPaymentDate}</Text>
              </View>
              <Text style={styles.historyAmount}>₹{paymentInfo.amount?.toLocaleString()}</Text>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  statusSection: {
    padding: 20,
  },
  statusCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  statusCardGradient: {
    padding: 20,
  },
  statusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusMain: {
    fontSize: 24,
    fontWeight: '900',
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#BE123C',
    flex: 1,
  },
  plansSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  plansList: {
    gap: 12,
  },
  planItem: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  planItemSelected: {
    borderColor: '#F97316',
    backgroundColor: '#FFF9F5',
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  planIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  planTitleActive: {
    color: '#0F172A',
  },
  planSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  planPriceSection: {
    alignItems: 'flex-end',
  },
  planPriceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#334155',
  },
  planPriceTextActive: {
    color: '#F97316',
  },
  promoBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  promoText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  payBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  payBtnGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  payBtnPrice: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  payPriceVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
  },
  historySection: {
    padding: 20,
    paddingTop: 0,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  historyItem: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyMain: {
    flex: 1,
  },
  historyPlan: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    width: '100%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalBody: {
    gap: 16,
  },
  modalText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  modalPlan: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
});

export default PaymentManagement;
