// All data constants from mobile app
export const NEARBY_BUSINESSES = [
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

export const FEATURED_BUSINESSES = [
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

export const RECENT_SEARCHES = [
  'Plumber',
  'Restaurants',
  'AC Repair',
  'Hotels',
  'Electrician',
  'Car Wash',
];

export const PROMO_BANNERS = [
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

export const HOME_SERVICES = [
  { id: 'hs1', name: 'Cleaning', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80' },
  { id: 'hs2', name: 'Plumber', imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=400&q=80' },
  { id: 'hs3', name: 'Electrician', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80' },
  { id: 'hs4', name: 'Painting', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80' },
  { id: 'hs5', name: 'Carpenter', imageUrl: 'https://images.unsplash.com/photo-1622295023576-e413e7073364?auto=format&fit=crop&w=400&q=80' },
];

export const EDUCATION_SERVICES = [
  { id: 'ed1', name: 'Tutors', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=400&q=80' },
  { id: 'ed2', name: 'Music Class', imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80' },
  { id: 'ed3', name: 'Dance', imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=400&q=80' },
  { id: 'ed4', name: 'Coaching', imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=400&q=80' },
  { id: 'ed5', name: 'Art School', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80' },
];

export const DAILY_ESSENTIALS = [
  { id: 'de1', name: 'Grocery', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' },
  { id: 'de2', name: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=400&q=80' },
  { id: 'de3', name: 'Milk', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80' },
  { id: 'de4', name: 'Medicines', imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80' },
  { id: 'de5', name: 'Meat', imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80' },
];

export const HEALTH_FITNESS = [
  { id: 'hf1', name: 'Gym', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80' },
  { id: 'hf2', name: 'Yoga', imageUrl: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&w=400&q=80' },
  { id: 'hf3', name: 'Doctors', imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80' },
  { id: 'hf4', name: 'Labs', imageUrl: 'https://images.unsplash.com/photo-1579165466741-7f35a4755657?auto=format&fit=crop&w=400&q=80' },
  { id: 'hf5', name: 'Dietician', imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80' },
];

export const BEAUTY_SPA = [
  { id: 'bs1', name: 'Salon', imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=400&q=80' },
  { id: 'bs2', name: 'Massage', imageUrl: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=400&q=80' },
  { id: 'bs3', name: 'Makeup', imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80' },
  { id: 'bs4', name: 'Nails', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80' },
  { id: 'bs5', name: 'Skincare', imageUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=80' },
];

// Simplified SEARCH_RESULTS - full list would be too long
export const SEARCH_RESULTS = [
  { id: 'g1', name: 'Daily Fresh Market', category: 'Groceries', rating: 4.5, reviewCount: 120, distance: '0.5 km', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Sector 18, Noida' },
  { id: 'e1', name: 'Tech World', category: 'Electronics', rating: 4.6, reviewCount: 340, distance: '1.5 km', imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Nehru Place' },
  { id: 'c1', name: 'Fashion Hub', category: 'Clothing', rating: 4.5, reviewCount: 250, distance: '1.0 km', imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80', isVerified: true, address: 'Sarojini Nagar' },
];

