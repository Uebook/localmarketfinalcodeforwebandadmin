
export interface Category {
  id: string;
  name: string;
  iconName: string; // Using string to map to Lucide icons dynamically or conditionally
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  discountAmount: string; // e.g. "50% OFF" or "₹500 OFF"
  validUntil: string;
  isActive: boolean;
  color?: string; // UI helper
}

export interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  description?: string;
  // Section 5: Product Specifics
  type?: 'product' | 'service'; // Distinguish between physical product and service
  category?: string; // Product level category
  mrp?: string; // Maximum Retail Price for discount calc
  stockQty?: string; // Numeric stock quantity
  uom?: string; // Unit of Measurement: Kg, Piece, Litre, Pack, etc.
  brand?: string;
  isFastMoving?: boolean;
  inStock?: boolean;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  reply?: string; // Vendor reply
}

export interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance: string; // Pre-calculated for display
  imageUrl: string;
  isPromoted?: boolean;
  // New fields for detailed search results
  isVerified?: boolean;
  address?: string;
  yearsInBusiness?: string;
  openTime?: string; // Display string e.g., "9:00 AM - 9:00 PM"
  reviewSnippet?: string;
  responseTime?: string;
  // Detailed View Fields
  about?: string;
  products?: Product[];
  reviews?: Review[];
  offers?: Offer[]; // Added offers to business
  
  // Publicly visible location details
  landmark?: string;
  city?: string;
  district?: string;
  pincode?: string;
  circle?: string;
  weeklyOff?: string;
}

export interface Enquiry {
  id: string;
  senderName: string;
  senderMobile: string;
  message: string;
  date: string;
  status: 'new' | 'read' | 'replied';
}

export interface VendorProfile extends Business {
  // Section 1: Basic Vendor Information
  ownerName: string; // Owner / Proprietor Name
  contactNumber: string; // Registered Mobile Number
  email: string; // Email Address (optional)
  alternateMobile?: string; // (optional)
  whatsappNumber?: string; // (optional)
  referralCode?: string; // (optional)

  // Section 2: Shop Details
  // 'name' inherited as Shop Name
  // 'category' inherited as Shop Type / Business Category (Primary)
  // 'address' inherited as Shop Address
  // 'landmark', 'city', 'district', 'pincode', 'circle', 'weeklyOff' inherited from Business
  
  geoLocation?: {
    lat: number;
    lng: number;
  };
  
  openingTime?: string;
  closingTime?: string;

  // Section 3: KYC & Verification Documents
  ownerPhotoUrl?: string;
  shopFrontPhotoUrl?: string;
  insideShopPhotoUrl?: string; // (optional)
  
  idProofType?: 'Aadhaar' | 'PAN' | 'Voter ID' | 'Driving Licence';
  idProofUrl?: string;
  
  shopProofType?: 'GST Certificate' | 'Shop License' | 'Rent Agreement' | 'Utility Bill';
  shopProofUrl?: string;
  
  gstNumber?: string; // (if applicable)
  panNumber?: string; // (optional)

  // Section 4: Account Access
  username?: string; // mobile number auto-filled
  otpVerified?: boolean;
  kycStatus?: 'Pending' | 'Approved' | 'Rejected';
  activationStatus?: 'Active' | 'Pending' | 'Blocked';

  // Section 5: Category & Product Setup
  // primaryCategory map to 'category'
  secondaryCategories?: string[]; // optional
  customCategories?: string[]; // Vendor Custom Category Creation
  
  // Section 6: Vendor Operations & Preferences
  priceUpdateFrequency?: 'Daily' | 'Alternate days' | 'Weekly';
  stockUpdateOption?: 'In Stock' | 'Out of Stock'; // Default preference
  enableBulkUpload?: boolean;
  enablePriceNotifications?: boolean;
  competitorRadius?: '500m' | '1km' | '2km';
  allowedCategories?: string[]; // Admin Control

  enquiries: Enquiry[];
  // reviews inherited
}

export interface CustomerProfile {
  name: string;
  mobile: string;
  location: string;
  email?: string;
  profilePhotoUrl?: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
}

export interface GeoLocationState {
  lat: number | null;
  lng: number | null;
  city: string;
  loading: boolean;
  error: string | null;
}

export interface ServiceItem {
  id: string;
  name: string;
  imageUrl: string;
}

export type ThemeOption = 'default' | 'blue' | 'green' | 'purple' | 'dark';
