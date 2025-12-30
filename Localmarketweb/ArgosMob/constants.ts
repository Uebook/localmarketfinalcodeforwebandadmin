
import { Category, Business, PromoBanner, ServiceItem, VendorProfile } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Groceries', iconName: 'ShoppingBag' },
  { id: '2', name: 'Electronics', iconName: 'Smartphone' },
  { id: '3', name: 'Clothing', iconName: 'Shirt' },
  { id: '4', name: 'Medicines', iconName: 'Pill' },
  { id: '5', name: 'Appliances', iconName: 'Zap' },
  { id: '6', name: 'Home', iconName: 'Home' },
  { id: '7', name: 'Accessories', iconName: 'Headphones' },
  { id: '8', name: 'Sports', iconName: 'Trophy' },
];

export const INITIAL_VENDOR_DATA: VendorProfile = {
  id: 'v1',
  name: 'My Awesome Shop',
  ownerName: 'John Doe',
  category: 'Grocery',
  rating: 4.8,
  reviewCount: 12,
  distance: '0 km',
  imageUrl: 'https://images.unsplash.com/photo-1604719312566-b7cb9f9fc72e?auto=format&fit=crop&w=800&q=80',
  isVerified: true,
  contactNumber: '9876543210',
  alternateMobile: '9988776655',
  whatsappNumber: '9876543210',
  email: 'john@example.com',
  referralCode: 'REF2024',
  address: 'Shop 12, Main Market',
  landmark: 'Near Clock Tower',
  city: 'New Delhi',
  district: 'Central Delhi',
  pincode: '110001',
  circle: 'Connaught Place',
  geoLocation: { lat: 28.6139, lng: 77.2090 },
  yearsInBusiness: '2',
  openTime: '09:00 AM - 09:00 PM',
  openingTime: '09:00',
  closingTime: '21:00',
  weeklyOff: 'Sunday',
  username: '9876543210',
  otpVerified: true,
  kycStatus: 'Pending',
  activationStatus: 'Active',
  secondaryCategories: ['General Store', 'Daily Essentials'],
  customCategories: ['Imported Snacks'],
  priceUpdateFrequency: 'Weekly',
  stockUpdateOption: 'In Stock',
  enableBulkUpload: false,
  enablePriceNotifications: true,
  competitorRadius: '1km',
  allowedCategories: ['Grocery', 'Essentials'],
  about: 'Welcome to our shop! We provide high quality products.',
  products: [
    { 
      id: 'vp1', 
      name: 'Sample Product', 
      price: '₹100', 
      mrp: '₹120',
      category: 'Snacks',
      stockQty: '50',
      imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80', 
      description: 'This is a sample product description.',
      uom: 'Pack',
      brand: 'GoodBrands',
      isFastMoving: true,
      inStock: true
    }
  ],
  enquiries: [
    { id: 'e1', senderName: 'Rahul Kumar', senderMobile: '+91 9898989898', message: 'Hi, do you have this item in stock?', date: '2024-05-20', status: 'new' },
    { id: 'e2', senderName: 'Priya Singh', senderMobile: '+91 9797979797', message: 'What are your shop timings?', date: '2024-05-19', status: 'read' },
    { id: 'e3', senderName: 'Amit Sharma', senderMobile: '+91 9696969696', message: 'Can you deliver to Sector 18?', date: '2024-05-18', status: 'replied' }
  ],
  reviews: [
    { id: 'r1', userName: 'Vikas Gupta', rating: 5, date: '2 days ago', comment: 'Great service and friendly behavior!', reply: 'Thank you Vikas!' },
    { id: 'r2', userName: 'Anjali Mehra', rating: 4, date: '1 week ago', comment: 'Good products but slight delay in delivery.' },
    { id: 'r3', userName: 'Rohan Das', rating: 5, date: '2 weeks ago', comment: 'Best shop in the market. Highly recommended.' }
  ],
  offers: [
    { id: 'vo1', title: 'Grand Opening Sale', description: 'Flat 20% off on first purchase', code: 'WELCOME20', discountAmount: '20%', validUntil: '2025-12-31', isActive: true, color: 'bg-purple-600' }
  ]
};

export const NEARBY_BUSINESSES: Business[] = [
  {
    id: '101',
    name: 'Joe\'s Pizza & Grill',
    category: 'Restaurant',
    rating: 4.5,
    reviewCount: 128,
    distance: '0.8 km',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    address: 'Block A, Connaught Place',
    openTime: 'Opens at 11:00 AM',
    about: 'Authentic Italian pizza and grill in the heart of the city.',
    products: [
      { id: 'p1', name: 'Margherita Pizza', price: '₹350', mrp: '₹400', category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80', description: 'Classic cheese and basil' },
      { id: 'p2', name: 'Pasta Alfredo', price: '₹400', category: 'Pasta', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=400&q=80', description: 'Creamy white sauce pasta' },
      { id: 'p3', name: 'Grilled Sandwich', price: '₹150', category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80' }
    ],
    offers: [
       { id: 'o101', title: 'Pizza Fest', description: 'Buy 1 Get 1 Free on Large Pizzas', code: 'BOGOPIZZA', discountAmount: 'BOGO', validUntil: '2024-11-30', isActive: true, color: 'bg-orange-500' }
    ]
  },
  {
    id: '102',
    name: 'City Care Pharmacy',
    category: 'Healthcare',
    rating: 4.8,
    reviewCount: 45,
    distance: '1.2 km',
    imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80',
    address: 'Sector 15, Noida',
    openTime: 'Open 24 Hours',
    about: 'Your trusted neighborhood pharmacy for all medical needs.',
    offers: []
  },
  {
    id: '103',
    name: 'QuickFix Auto',
    category: 'Car Service',
    rating: 4.2,
    reviewCount: 89,
    distance: '2.5 km',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=800&q=80',
    address: 'Okhla Industrial Area',
    openTime: 'Opens at 9:00 AM',
    offers: [
      { id: 'o103', title: 'Service Week', description: '10% off on full service', code: 'CARLOVE', discountAmount: '10%', validUntil: '2024-10-15', isActive: true, color: 'bg-blue-600' }
    ]
  },
  {
    id: '104',
    name: 'Elite Salon',
    category: 'Beauty',
    rating: 4.7,
    reviewCount: 210,
    distance: '3.0 km',
    imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80',
    address: 'Greater Kailash 1',
    openTime: 'Opens at 10:00 AM',
    offers: []
  },
];

export const FEATURED_BUSINESSES: Business[] = [
  {
    id: '201',
    name: 'Grand Plaza Hotel',
    category: 'Hotel',
    rating: 4.9,
    reviewCount: 1500,
    distance: '5.0 km',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    isPromoted: true,
    address: 'Aerocity, New Delhi',
    about: 'Luxury stay with world-class amenities.',
    products: [
       { id: 'fp1', name: 'Deluxe Room', price: '₹5000/night', imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=400&q=80' },
       { id: 'fp2', name: 'Spa Session', price: '₹2000', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80' }
    ],
    offers: []
  },
  {
    id: '202',
    name: 'Tech World Repairs',
    category: 'Electronics',
    rating: 4.6,
    reviewCount: 340,
    distance: '1.5 km',
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
    isPromoted: true,
    address: 'Nehru Place',
    about: 'Expert repairs for all your electronic gadgets.',
    offers: []
  },
];

export const IT_COMPANIES: Business[] = [
  { id: 'it1', name: 'Pixel Perfect Web Solutions', category: 'IT Services', rating: 4.8, reviewCount: 150, distance: '2.5 km', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', address: 'Sector 62, Noida', about: 'Custom website development and design.', offers: [] },
  { id: 'it2', name: 'CodeCrafters', category: 'Software Development', rating: 4.5, reviewCount: 89, distance: '3.0 km', imageUrl: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=800&q=80', address: 'Cyber City, Gurgaon', about: 'Enterprise software solutions.', offers: [] },
  { id: 'it3', name: 'NextGen App Studio', category: 'App Development', rating: 4.7, reviewCount: 210, distance: '4.2 km', imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80', address: 'Okhla Phase 3, Delhi', about: 'Mobile app development for iOS and Android.', offers: [] },
  { id: 'it4', name: 'CloudSync Solutions', category: 'Cloud Services', rating: 4.9, reviewCount: 56, distance: '5.1 km', imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', address: 'Aerocity, Delhi', about: 'Cloud migration and management services.', offers: [] },
  { id: 'it5', name: 'CyberShield Security', category: 'Cyber Security', rating: 4.6, reviewCount: 120, distance: '1.8 km', imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', address: 'Nehru Place, Delhi', about: 'Network security and penetration testing.', offers: [] }
];

export const RECENT_SEARCHES = [
  'Plumber',
  'Restaurants',
  'AC Repair',
  'Hotels',
  'Electrician',
  'Car Wash',
];

export const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'b1',
    title: 'Summer Sale!',
    subtitle: 'Get 50% off on AC Services',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Book Now',
  },
  {
    id: 'b2',
    title: 'New in Town?',
    subtitle: 'Explore top-rated local cafes',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Explore',
  },
  {
    id: 'b3',
    title: 'Health Checkup Camp',
    subtitle: 'Free basic checkups this weekend',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'View Details',
  },
];

export const HOME_SERVICES: ServiceItem[] = [
  { id: 'hs1', name: 'Cleaning', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80' },
  { id: 'hs2', name: 'Plumber', imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=400&q=80' },
  { id: 'hs3', name: 'Electrician', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80' },
  { id: 'hs4', name: 'Painting', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80' },
  { id: 'hs5', name: 'Carpenter', imageUrl: 'https://images.unsplash.com/photo-1622295023576-e413e7073364?auto=format&fit=crop&w=400&q=80' },
];

export const EDUCATION_SERVICES: ServiceItem[] = [
  { id: 'ed1', name: 'Tutors', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=400&q=80' },
  { id: 'ed2', name: 'Music Class', imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80' },
  { id: 'ed3', name: 'Dance', imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=400&q=80' },
  { id: 'ed4', name: 'Coaching', imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=400&q=80' },
  { id: 'ed5', name: 'Art School', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80' },
];

export const DAILY_ESSENTIALS: ServiceItem[] = [
  { id: 'de1', name: 'Grocery', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' },
  { id: 'de2', name: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=400&q=80' },
  { id: 'de3', name: 'Milk', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80' },
  { id: 'de4', name: 'Medicines', imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80' },
  { id: 'de5', name: 'Meat', imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80' },
];

export const HEALTH_FITNESS: ServiceItem[] = [
  { id: 'hf1', name: 'Gym', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80' },
  { id: 'hf2', name: 'Yoga', imageUrl: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&w=400&q=80' },
  { id: 'hf3', name: 'Doctors', imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80' },
  { id: 'hf4', name: 'Labs', imageUrl: 'https://images.unsplash.com/photo-1579165466741-7f35a4755657?auto=format&fit=crop&w=400&q=80' },
  { id: 'hf5', name: 'Dietician', imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80' },
];

export const BEAUTY_SPA: ServiceItem[] = [
  { id: 'bs1', name: 'Salon', imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=400&q=80' },
  { id: 'bs2', name: 'Massage', imageUrl: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=400&q=80' },
  { id: 'bs3', name: 'Makeup', imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80' },
  { id: 'bs4', name: 'Nails', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80' },
  { id: 'bs5', name: 'Skincare', imageUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=80' },
];

export const SEARCH_RESULTS: Business[] = [
  // --- Groceries (10) ---
  { id: 'g1', name: 'Daily Fresh Market', category: 'Groceries', rating: 4.5, reviewCount: 120, distance: '0.5 km', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Sector 18, Noida' },
  { id: 'g2', name: 'Organic Harvest', category: 'Groceries', rating: 4.8, reviewCount: 85, distance: '1.2 km', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'GK 1, Delhi' },
  { id: 'g3', name: 'Sharma General Store', category: 'Groceries', rating: 4.2, reviewCount: 200, distance: '0.2 km', imageUrl: 'https://images.unsplash.com/photo-1604719312566-b7cb9f9fc72e?auto=format&fit=crop&w=800&q=80', address: 'Laxmi Nagar' },
  { id: 'g4', name: 'Big Basket Hub', category: 'Groceries', rating: 4.6, reviewCount: 500, distance: '3.0 km', imageUrl: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Okhla Phase 3' },
  { id: 'g5', name: 'Reliable Supermart', category: 'Groceries', rating: 4.3, reviewCount: 150, distance: '1.5 km', imageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80', address: 'Dwarka Sec 10' },
  { id: 'g6', name: 'Green Valley Veggies', category: 'Groceries', rating: 4.7, reviewCount: 90, distance: '0.8 km', imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', address: 'Saket' },
  { id: 'g7', name: 'Apna Kirana', category: 'Groceries', rating: 4.1, reviewCount: 60, distance: '0.3 km', imageUrl: 'https://images.unsplash.com/photo-1580913428706-c311ab527ebc?auto=format&fit=crop&w=800&q=80', address: 'Mayur Vihar' },
  { id: 'g8', name: '24/7 Essentials', category: 'Groceries', rating: 4.4, reviewCount: 300, distance: '2.0 km', imageUrl: 'https://images.unsplash.com/photo-1574620058564-88481358d844?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'CP Outer Circle' },
  { id: 'g9', name: 'Nature\'s Basket', category: 'Groceries', rating: 4.9, reviewCount: 120, distance: '4.5 km', imageUrl: 'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Vasant Vihar' },
  { id: 'g10', name: 'Local Ration Shop', category: 'Groceries', rating: 4.0, reviewCount: 40, distance: '0.6 km', imageUrl: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=800&q=80', address: 'Uttam Nagar' },

  // --- Electronics (10) ---
  { id: 'e1', name: 'Tech World', category: 'Electronics', rating: 4.6, reviewCount: 340, distance: '1.5 km', imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Nehru Place' },
  { id: 'e2', name: 'Gadget Guru', category: 'Electronics', rating: 4.4, reviewCount: 210, distance: '2.0 km', imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80', address: 'Lajpat Nagar' },
  { id: 'e3', name: 'Mobile Junction', category: 'Electronics', rating: 4.2, reviewCount: 150, distance: '0.8 km', imageUrl: 'https://images.unsplash.com/photo-1598327771808-5d444260e0a5?auto=format&fit=crop&w=800&q=80', address: 'Karol Bagh' },
  { id: 'e4', name: 'Digital Dreams', category: 'Electronics', rating: 4.8, reviewCount: 80, distance: '3.5 km', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Gurgaon Sec 29' },
  { id: 'e5', name: 'Electro City', category: 'Electronics', rating: 4.0, reviewCount: 100, distance: '1.0 km', imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80', address: 'Chandni Chowk' },
  { id: 'e6', name: 'Smart Home Solutions', category: 'Electronics', rating: 4.7, reviewCount: 60, distance: '5.0 km', imageUrl: 'https://images.unsplash.com/photo-1558002038-1091a1661116?auto=format&fit=crop&w=800&q=80', address: 'Noida Sec 62' },
  { id: 'e7', name: 'Laptop Care', category: 'Electronics', rating: 4.5, reviewCount: 180, distance: '2.2 km', imageUrl: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=800&q=80', address: 'Laxmi Nagar' },
  { id: 'e8', name: 'Sound & Vision', category: 'Electronics', rating: 4.3, reviewCount: 90, distance: '4.0 km', imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', address: 'Saket Select City' },
  { id: 'e9', name: 'Future Tech', category: 'Electronics', rating: 4.9, reviewCount: 45, distance: '6.5 km', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Cyber Hub' },
  { id: 'e10', name: 'Budget Electronics', category: 'Electronics', rating: 3.9, reviewCount: 300, distance: '1.8 km', imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80', address: 'Old Delhi' },

  // --- Clothing (10) ---
  { id: 'c1', name: 'Fashion Hub', category: 'Clothing', rating: 4.5, reviewCount: 250, distance: '1.0 km', imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Sarojini Nagar' },
  { id: 'c2', name: 'Trends Boutique', category: 'Clothing', rating: 4.7, reviewCount: 120, distance: '2.5 km', imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80', address: 'Hauz Khas' },
  { id: 'c3', name: 'Men\'s Wearhouse', category: 'Clothing', rating: 4.3, reviewCount: 80, distance: '3.0 km', imageUrl: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=800&q=80', address: 'Rajouri Garden' },
  { id: 'c4', name: 'Kids Corner', category: 'Clothing', rating: 4.6, reviewCount: 95, distance: '1.5 km', imageUrl: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=800&q=80', address: 'Kamla Nagar' },
  { id: 'c5', name: 'Silk & Saree', category: 'Clothing', rating: 4.8, reviewCount: 300, distance: '4.0 km', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'South Ex' },
  { id: 'c6', name: 'Denim Studio', category: 'Clothing', rating: 4.2, reviewCount: 150, distance: '2.0 km', imageUrl: 'https://images.unsplash.com/photo-1542272617-08f08630793c?auto=format&fit=crop&w=800&q=80', address: 'CP Inner Circle' },
  { id: 'c7', name: 'Ethnic Vibes', category: 'Clothing', rating: 4.4, reviewCount: 110, distance: '5.5 km', imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80', address: 'Noida Sec 18' },
  { id: 'c8', name: 'Urban Chic', category: 'Clothing', rating: 4.1, reviewCount: 70, distance: '1.2 km', imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80', address: 'Janpath' },
  { id: 'c9', name: 'Wedding Trousseau', category: 'Clothing', rating: 4.9, reviewCount: 60, distance: '6.0 km', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Shahpur Jat' },
  { id: 'c10', name: 'Budget Fashion', category: 'Clothing', rating: 3.8, reviewCount: 400, distance: '0.5 km', imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80', address: 'Palika Bazar' },

  // --- Medicines (10) ---
  { id: 'm1', name: 'City Care Pharmacy', category: 'Medicines', rating: 4.8, reviewCount: 45, distance: '1.2 km', imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Sector 15, Noida' },
  { id: 'm2', name: 'Apollo Pharmacy', category: 'Medicines', rating: 4.5, reviewCount: 1200, distance: '0.5 km', imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Multiple Locations' },
  { id: 'm3', name: 'Wellness Chemist', category: 'Medicines', rating: 4.3, reviewCount: 80, distance: '1.0 km', imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80', address: 'Green Park' },
  { id: 'm4', name: '24/7 Medicos', category: 'Medicines', rating: 4.6, reviewCount: 300, distance: '2.5 km', imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'AIIMS Road' },
  { id: 'm5', name: 'Generic Drug Store', category: 'Medicines', rating: 4.2, reviewCount: 150, distance: '1.5 km', imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80', address: 'Patel Nagar' },
  { id: 'm6', name: 'Homeopathy Clinic & Store', category: 'Medicines', rating: 4.7, reviewCount: 60, distance: '3.0 km', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80', address: 'Rohini' },
  { id: 'm7', name: 'Ayurveda Kendra', category: 'Medicines', rating: 4.4, reviewCount: 90, distance: '4.0 km', imageUrl: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=800&q=80', address: 'Rishikesh (Branch)' },
  { id: 'm8', name: 'Discount Meds', category: 'Medicines', rating: 4.1, reviewCount: 200, distance: '0.8 km', imageUrl: 'https://images.unsplash.com/photo-1586015555751-63c9732d2f6b?auto=format&fit=crop&w=800&q=80', address: 'Tilak Nagar' },
  { id: 'm9', name: 'LifeCare Pharma', category: 'Medicines', rating: 4.9, reviewCount: 100, distance: '5.0 km', imageUrl: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Dwarka' },
  { id: 'm10', name: 'Sanjivani Medical', category: 'Medicines', rating: 4.0, reviewCount: 50, distance: '1.8 km', imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80', address: 'Malviya Nagar' },

  // --- Appliances (10) ---
  { id: 'a1', name: 'Cool World ACs', category: 'Appliances', rating: 4.5, reviewCount: 120, distance: '2.0 km', imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80', address: 'Lajpat Nagar' },
  { id: 'a2', name: 'Kitchen Kings', category: 'Appliances', rating: 4.7, reviewCount: 90, distance: '3.5 km', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Kirti Nagar' },
  { id: 'a3', name: 'Vijay Sales', category: 'Appliances', rating: 4.4, reviewCount: 500, distance: '1.5 km', imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d58b794a?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Patel Nagar' },
  { id: 'a4', name: 'Home Comforts', category: 'Appliances', rating: 4.2, reviewCount: 60, distance: '4.0 km', imageUrl: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=800&q=80', address: 'Gurgaon' },
  { id: 'a5', name: 'Repair & Care', category: 'Appliances', rating: 4.6, reviewCount: 150, distance: '1.0 km', imageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80', address: 'Mayur Vihar' },
  { id: 'a6', name: 'Smart Appliances', category: 'Appliances', rating: 4.8, reviewCount: 75, distance: '5.0 km', imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80', address: 'Noida' },
  { id: 'a7', name: 'Washing Machine Hub', category: 'Appliances', rating: 4.3, reviewCount: 100, distance: '2.5 km', imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80', address: 'Rohini' },
  { id: 'a8', name: 'TV & Sound Center', category: 'Appliances', rating: 4.5, reviewCount: 200, distance: '3.0 km', imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80', address: 'Nehru Place' },
  { id: 'a9', name: 'Fridge Zone', category: 'Appliances', rating: 4.1, reviewCount: 80, distance: '1.8 km', imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80', address: 'Janakpuri' },
  { id: 'a10', name: 'Gadget Repair Pro', category: 'Appliances', rating: 4.7, reviewCount: 300, distance: '0.8 km', imageUrl: 'https://images.unsplash.com/photo-1588702547923-7093a6c3f062?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Karol Bagh' },

  // --- Home (10) ---
  { id: 'h1', name: 'Furniture Plaza', category: 'Home', rating: 4.6, reviewCount: 200, distance: '5.0 km', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Kirti Nagar' },
  { id: 'h2', name: 'Decor Dreams', category: 'Home', rating: 4.8, reviewCount: 90, distance: '2.5 km', imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&w=800&q=80', address: 'MG Road' },
  { id: 'h3', name: 'Sleepwell Store', category: 'Home', rating: 4.4, reviewCount: 150, distance: '1.2 km', imageUrl: 'https://images.unsplash.com/photo-1505693416388-3343727460a9?auto=format&fit=crop&w=800&q=80', address: 'Lajpat Nagar' },
  { id: 'h4', name: 'Kitchen Needs', category: 'Home', rating: 4.2, reviewCount: 80, distance: '0.8 km', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=800&q=80', address: 'Chandni Chowk' },
  { id: 'h5', name: 'Lights & Luminaries', category: 'Home', rating: 4.7, reviewCount: 110, distance: '3.0 km', imageUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Bhagirath Palace' },
  { id: 'h6', name: 'Curtain Call', category: 'Home', rating: 4.3, reviewCount: 70, distance: '4.0 km', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', address: 'Amar Colony' },
  { id: 'h7', name: 'Green Plant Nursery', category: 'Home', rating: 4.9, reviewCount: 200, distance: '1.5 km', imageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=800&q=80', address: 'Sunder Nursery' },
  { id: 'h8', name: 'Hardware Depot', category: 'Home', rating: 4.1, reviewCount: 100, distance: '2.2 km', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', address: 'Chawri Bazar' },
  { id: 'h9', name: 'Bath & Tile Co.', category: 'Home', rating: 4.5, reviewCount: 130, distance: '6.0 km', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Kotla' },
  { id: 'h10', name: 'Rug House', category: 'Home', rating: 4.6, reviewCount: 65, distance: '3.5 km', imageUrl: 'https://images.unsplash.com/photo-1575414003591-ece8d0416c7a?auto=format&fit=crop&w=800&q=80', address: 'Hauz Khas Village' },

  // --- Accessories (10) ---
  { id: 'ac1', name: 'Bag Zone', category: 'Accessories', rating: 4.3, reviewCount: 110, distance: '1.0 km', imageUrl: 'https://images.unsplash.com/photo-1590874103328-327526788dbb?auto=format&fit=crop&w=800&q=80', address: 'CP' },
  { id: 'ac2', name: 'Watch World', category: 'Accessories', rating: 4.7, reviewCount: 200, distance: '2.5 km', imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Khan Market' },
  { id: 'ac3', name: 'Shoe Factory', category: 'Accessories', rating: 4.2, reviewCount: 300, distance: '4.0 km', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', address: 'Karol Bagh' },
  { id: 'ac4', name: 'Jewellery Box', category: 'Accessories', rating: 4.8, reviewCount: 90, distance: '3.0 km', imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Dariba Kalan' },
  { id: 'ac5', name: 'Sunglass Hut', category: 'Accessories', rating: 4.5, reviewCount: 120, distance: '1.5 km', imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', address: 'Select City Walk' },
  { id: 'ac6', name: 'Belt & Wallet', category: 'Accessories', rating: 4.0, reviewCount: 80, distance: '0.8 km', imageUrl: 'https://images.unsplash.com/photo-1627123424574-18bd03b4e65d?auto=format&fit=crop&w=800&q=80', address: 'Palika' },
  { id: 'ac7', name: 'Perfume Point', category: 'Accessories', rating: 4.6, reviewCount: 150, distance: '2.2 km', imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80', address: 'Vasant Kunj' },
  { id: 'ac8', name: 'Hat Trick', category: 'Accessories', rating: 4.1, reviewCount: 50, distance: '5.0 km', imageUrl: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=80', address: 'Noida' },
  { id: 'ac9', name: 'Mobile Case City', category: 'Accessories', rating: 4.4, reviewCount: 400, distance: '0.5 km', imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80', address: 'Gaffar Market' },
  { id: 'ac10', name: 'Scarves & More', category: 'Accessories', rating: 4.7, reviewCount: 75, distance: '1.8 km', imageUrl: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=800&q=80', address: 'Dilli Haat' },

  // --- Sports (10) ---
  { id: 'sp1', name: 'Champion Sports', category: 'Sports', rating: 4.6, reviewCount: 180, distance: '2.0 km', imageUrl: 'https://images.unsplash.com/photo-1533560906234-54c628e685bc?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Lodhi Road' },
  { id: 'sp2', name: 'Fitness Gear Pro', category: 'Sports', rating: 4.5, reviewCount: 120, distance: '3.5 km', imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80', address: 'GK 2' },
  { id: 'sp3', name: 'Cricket Corner', category: 'Sports', rating: 4.8, reviewCount: 300, distance: '1.2 km', imageUrl: 'https://images.unsplash.com/photo-1531415074968-bc2d3f789aa7?auto=format&fit=crop&w=800&q=80', address: 'Daryaganj' },
  { id: 'sp4', name: 'Decathlon Hub', category: 'Sports', rating: 4.7, reviewCount: 800, distance: '6.0 km', imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Noida' },
  { id: 'sp5', name: 'Yoga Mat Store', category: 'Sports', rating: 4.3, reviewCount: 90, distance: '1.5 km', imageUrl: 'https://images.unsplash.com/photo-1599447421405-0c3036c739e4?auto=format&fit=crop&w=800&q=80', address: 'Vasant Vihar' },
  { id: 'sp6', name: 'Cycle World', category: 'Sports', rating: 4.4, reviewCount: 150, distance: '2.8 km', imageUrl: 'https://images.unsplash.com/photo-1485965120184-e224f7230c4f?auto=format&fit=crop&w=800&q=80', address: 'Jhandewalan' },
  { id: 'sp7', name: 'Swim Shop', category: 'Sports', rating: 4.2, reviewCount: 60, distance: '4.0 km', imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80', address: 'Talkatora' },
  { id: 'sp8', name: 'Badminton Point', category: 'Sports', rating: 4.5, reviewCount: 110, distance: '3.0 km', imageUrl: 'https://images.unsplash.com/photo-1626224583764-847890e05851?auto=format&fit=crop&w=800&q=80', address: 'Siri Fort' },
  { id: 'sp9', name: 'Football Factory', category: 'Sports', rating: 4.6, reviewCount: 130, distance: '5.5 km', imageUrl: 'https://images.unsplash.com/photo-1552318965-5638e4c66e4c?auto=format&fit=crop&w=800&q=80', address: 'Dwarka Sports Complex' },
  { id: 'sp10', name: 'Adventure Gear', category: 'Sports', rating: 4.9, reviewCount: 75, distance: '2.5 km', imageUrl: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Rohini' },
  
  {
    id: 's1',
    name: 'Punjabi Rasoi',
    category: 'Restaurant',
    rating: 3.9,
    reviewCount: 7700,
    distance: '0.5 km',
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
    address: 'Connaught Place',
    yearsInBusiness: '5 Years',
    openTime: 'Open Now',
    reviewSnippet: 'Best parathas in town, very spicy and authentic.',
    responseTime: 'Fast',
    about: 'Authentic Punjabi cuisine with a focus on Tandoori dishes.',
    products: [],
    offers: []
  },
  {
    id: 's2',
    name: 'Bawarchi Baba - By Posh Foods',
    category: 'Restaurant',
    rating: 4.0,
    reviewCount: 12000,
    distance: '5 km',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
    address: 'Greater Kailash',
    yearsInBusiness: '8 Years',
    openTime: '30-35 mins',
    reviewSnippet: 'Great value for money, hygiene is top notch.',
    responseTime: 'Standard',
    about: 'Serving delicious North Indian curries and breads.',
    products: [],
    offers: []
  },
  {
    id: 's3',
    name: 'I Tech Apple Mac Repair & Service',
    category: 'Computer Repair',
    rating: 4.6,
    reviewCount: 79,
    distance: '1.2 km',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
    address: 'Kala Pathar Marg Indirapuram',
    yearsInBusiness: '13 Years in Business',
    openTime: 'Open until 9:00 pm',
    reviewSnippet: 'The Only Place I\'ll Trust with My Apple Devices!...',
    responseTime: 'Responds in 1 hrs',
    about: 'Specialized in Apple MacBook, iPhone, and iPad repairs. We use genuine parts and offer warranty on all services.',
    products: [],
    offers: []
  }
];
