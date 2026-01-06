// Payment and subscription utilities

export const PAYMENT_PLANS = {
  MONTHLY: 'monthly',
  SIX_MONTHLY: 'six_monthly',
  YEARLY: 'yearly',
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  EXPIRED: 'expired',
};

export const VENDOR_STATUS = {
  ACTIVE: 'Active',
  BLOCKED: 'Blocked',
  PENDING: 'Pending',
  SUSPENDED: 'Suspended',
};

// Generate Vendor ID
export const generateVendorId = (vendorData) => {
  const prefix = 'VEND';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Generate User ID
export const generateUserId = (userData) => {
  const prefix = 'USER';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Check if vendor should be blocked due to non-payment
export const shouldBlockVendor = (vendor) => {
  if (!vendor.paymentInfo) return false;
  
  const { paymentStatus, paymentDueDate, subscriptionPlan } = vendor.paymentInfo;
  const today = new Date();
  const dueDate = new Date(paymentDueDate);
  
  // Block if payment is overdue or expired
  if (paymentStatus === PAYMENT_STATUS.OVERDUE || paymentStatus === PAYMENT_STATUS.EXPIRED) {
    return true;
  }
  
  // Block if due date has passed and status is pending
  if (paymentStatus === PAYMENT_STATUS.PENDING && dueDate < today) {
    return true;
  }
  
  return false;
};

// Check if vendor should be activated after payment
export const shouldActivateVendor = (vendor) => {
  if (!vendor.paymentInfo) return false;
  
  const { paymentStatus } = vendor.paymentInfo;
  
  // Activate if payment is paid and vendor is currently blocked
  if (paymentStatus === PAYMENT_STATUS.PAID && vendor.activationStatus === VENDOR_STATUS.BLOCKED) {
    return true;
  }
  
  return false;
};

// Calculate next payment due date
export const calculateNextDueDate = (currentDueDate, plan) => {
  const date = new Date(currentDueDate);
  
  switch (plan) {
    case PAYMENT_PLANS.MONTHLY:
      date.setMonth(date.getMonth() + 1);
      break;
    case PAYMENT_PLANS.SIX_MONTHLY:
      date.setMonth(date.getMonth() + 6);
      break;
    case PAYMENT_PLANS.YEARLY:
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  
  return date.toISOString().split('T')[0];
};

// Get payment plan display name
export const getPlanDisplayName = (plan) => {
  const names = {
    [PAYMENT_PLANS.MONTHLY]: 'Monthly',
    [PAYMENT_PLANS.SIX_MONTHLY]: 'Six-Monthly',
    [PAYMENT_PLANS.YEARLY]: 'Yearly',
  };
  return names[plan] || 'Monthly';
};
