
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchHeader from './components/SearchHeader';
import BottomNav from './components/BottomNav';
import SearchBar from './components/SearchBar';
import CategoryGrid from './components/CategoryGrid';
import NearbySection from './components/NearbySection';
import FeaturedSection from './components/FeaturedSection';
import RecentSearches from './components/RecentSearches';
import PromoCarousel from './components/PromoCarousel';
import ListBusinessCTA from './components/ListBusinessCTA';
import HorizontalSection from './components/HorizontalSection';
import SearchResults from './components/SearchResults';
import Sidebar from './components/Sidebar';
import VendorDetails from './components/VendorDetails';
import SplashScreen from './components/SplashScreen'; 
import LoginScreen from './components/LoginScreen';   
import VendorRegistration from './components/VendorRegistration';
import VendorDashboard from './components/MyBusiness/VendorDashboard';
import SettingsScreen from './components/SettingsScreen';
import HelpSupport from './components/HelpSupport';
import TermsPrivacy from './components/TermsPrivacy';
import ThemeController from './components/ThemeController';
import Notifications from './components/Notifications';
import { GeoLocationState, Business, VendorProfile, ThemeOption, CustomerProfile, Offer } from './types';
import { ShoppingBag, Heart, Gift, Tag, Percent, Store } from 'lucide-react';
import {
  HOME_SERVICES,
  EDUCATION_SERVICES,
  DAILY_ESSENTIALS,
  HEALTH_FITNESS,
  BEAUTY_SPA,
  NEARBY_BUSINESSES,
  FEATURED_BUSINESSES,
  SEARCH_RESULTS,
  INITIAL_VENDOR_DATA,
  IT_COMPANIES
} from './constants';

// Wrapper for all content to simulate mobile frame on desktop
const MobileWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  // Updated Background: Dark Orange to Slate Gradient
  <div className="w-full max-w-md mx-auto min-h-screen bg-gradient-to-b from-orange-900 to-slate-900 shadow-2xl overflow-hidden relative font-sans text-slate-900">
    {children}
  </div>
);

function App() {
  // --- App Initialization States ---
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'customer' | 'vendor' | null>(null);
  
  // Custom Theme State
  const [customTheme, setCustomTheme] = useState<ThemeOption | null>(null);

  // Theme derived from role or custom selection
  const getTheme = (): ThemeOption => {
    if (customTheme) return customTheme;
    return 'default'; // Enforce new Orange-Blue theme
  };

  // --- Registration State ---
  const [isRegistering, setIsRegistering] = useState(false);

  // --- Main App Logic States ---
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Vendor Specific Tab State
  const [vendorDashboardTab, setVendorDashboardTab] = useState<'overview' | 'products' | 'enquiries' | 'reviews' | 'profile' | 'offers'>('overview');
  const [vendorAddProductTrigger, setVendorAddProductTrigger] = useState(false);
  const [vendorAddType, setVendorAddType] = useState<'product' | 'service'>('product');

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [savedBusinessIds, setSavedBusinessIds] = useState<string[]>([]);

  // Vendor Data State
  const [vendorData, setVendorData] = useState<VendorProfile>(INITIAL_VENDOR_DATA);

  // Customer Data State
  const [customerData, setCustomerData] = useState<CustomerProfile>({
    name: 'Rahul Kumar',
    mobile: '9876543210',
    location: 'Connaught Place, Delhi',
    email: 'rahul.k@example.com'
  });

  const [locationState, setLocationState] = useState<GeoLocationState>({
    lat: null,
    lng: null,
    city: '',
    loading: true,
    error: null,
  });

  // Handle Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); 
    return () => clearTimeout(timer);
  }, []);

  // Handle Login
  const handleLogin = (role: 'customer' | 'vendor') => {
    setUserRole(role);
    setIsAuthenticated(true);
    setCustomTheme(null);
    
    if (role === 'vendor') {
      setActiveTab('business');
    } else {
      setActiveTab('home');
    }
  };

  // Handle Logout (passed to sidebar)
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setActiveTab('home');
    setIsSidebarOpen(false);
  };

  // Handle Vendor Registration Completion
  const handleRegistrationComplete = (newVendor: VendorProfile) => {
    setVendorData(newVendor);
    setIsRegistering(false);
  };

  const allBusinesses = [...NEARBY_BUSINESSES, ...FEATURED_BUSINESSES, ...SEARCH_RESULTS, ...IT_COMPANIES];

  // Mock geolocation detection on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            setLocationState({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              city: 'Connaught Place, Delhi',
              loading: false,
              error: null,
            });
          }, 1500);
        },
        (error) => {
          setLocationState({
            lat: null,
            lng: null,
            city: '',
            loading: false,
            error: error.message,
          });
        }
      );
    } else {
      setLocationState({
        lat: null,
        lng: null,
        city: '',
        loading: false,
        error: "Geolocation not supported",
      });
    }
  }, []);

  const handleCategorySelect = (categoryName: string) => {
    setSearchQuery(categoryName);
    setActiveTab('search');
    setSelectedBusiness(null);
    window.scrollTo(0, 0);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
    setSelectedBusiness(null);
    window.scrollTo(0, 0);
  }

  const handleSearchBack = () => {
    setSearchQuery(null);
  };

  const handleBusinessClick = (business: Business) => {
    setSelectedBusiness(business);
  };

  const handleDetailsBack = () => {
    setSelectedBusiness(null);
  };

  const toggleSave = (id: string) => {
    setSavedBusinessIds(prev => 
      prev.includes(id) ? prev.filter(savedId => savedId !== id) : [...prev, id]
    );
  };

  const handleSidebarNavigation = (tab: string) => {
    if (tab === 'logout') {
      handleLogout();
    } else if (tab === 'settings') {
      setActiveTab('settings');
    } else if (tab === 'register-business') {
      setIsRegistering(true);
    } else if (tab === 'business-analytics') {
      setVendorDashboardTab('overview');
      setActiveTab('business');
      setVendorAddProductTrigger(false);
    } else if (tab === 'business-details') {
      setVendorDashboardTab('profile');
      setActiveTab('business');
      setVendorAddProductTrigger(false);
    } else if (tab === 'business-products') {
      setVendorDashboardTab('products');
      setActiveTab('business');
      setVendorAddProductTrigger(false);
    } else if (tab === 'business-add-product') {
      setVendorDashboardTab('products');
      setActiveTab('business');
      setVendorAddType('product');
      setVendorAddProductTrigger(true);
    } else if (tab === 'business-add-service') {
      setVendorDashboardTab('products');
      setActiveTab('business');
      setVendorAddType('service');
      setVendorAddProductTrigger(true);
    } else if (tab === 'business-enquiries') {
      setVendorDashboardTab('enquiries');
      setActiveTab('business');
      setVendorAddProductTrigger(false);
    } else if (tab === 'business-offers') {
      setVendorDashboardTab('offers');
      setActiveTab('business');
      setVendorAddProductTrigger(false);
    } else {
      setActiveTab(tab);
      setSelectedBusiness(null);
      if (tab !== 'search') setSearchQuery(null);
      setVendorAddProductTrigger(false);
    }
  };

  // --- Render Conditionals for App Entry ---

  if (showSplash) {
    return (
      <MobileWrapper>
        <ThemeController theme="default" />
        <SplashScreen />
      </MobileWrapper>
    );
  }

  if (isRegistering) {
    return (
      <MobileWrapper>
        <ThemeController theme={getTheme()} />
        <VendorRegistration 
          onComplete={handleRegistrationComplete}
          onCancel={() => setIsRegistering(false)}
        />
      </MobileWrapper>
    );
  }

  if (!isAuthenticated) {
    return (
      <MobileWrapper>
        <ThemeController theme="default" />
        <LoginScreen 
          onLogin={handleLogin} 
          onRegister={() => setIsRegistering(true)}
          vendorActivationStatus={vendorData.activationStatus} 
          onSimulateAdminApproval={() => setVendorData(prev => ({ ...prev, activationStatus: 'Active' }))}
        />
      </MobileWrapper>
    );
  }

  // --- Main Application Content ---

  const renderContent = () => {
    if (activeTab === 'settings') {
      return (
        <SettingsScreen 
          currentTheme={getTheme()} 
          onThemeChange={setCustomTheme}
          onBack={() => setActiveTab('home')}
          userRole={userRole}
          profileData={userRole === 'vendor' ? vendorData : customerData}
          onUpdateProfile={(updatedData) => {
             if (userRole === 'vendor') {
               setVendorData(updatedData);
             } else {
               setCustomerData(updatedData);
             }
          }}
          onLogout={handleLogout}
          onNavigateToBusiness={() => {
            setVendorDashboardTab('profile');
            setActiveTab('business');
          }}
        />
      );
    }
    
    if (activeTab === 'help') {
      return (
        <HelpSupport onBack={() => setActiveTab('home')} />
      );
    }

    if (activeTab === 'terms') {
      return (
        <TermsPrivacy onBack={() => setActiveTab('home')} />
      );
    }

    if (selectedBusiness) {
      return (
        <VendorDetails 
          business={selectedBusiness} 
          onBack={handleDetailsBack} 
          isSaved={savedBusinessIds.includes(selectedBusiness.id)}
          onToggleSave={toggleSave}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <div className="animate-fade-in pb-20 space-y-4">
            <div className="animate-slide-up opacity-0 fill-mode-forwards z-40 relative" style={{ animationDelay: '100ms' }}>
              <SearchBar onSearch={handleSearch} />
            </div>
            
            <div className="animate-slide-up opacity-0 fill-mode-forwards" style={{ animationDelay: '150ms' }}>
              <CategoryGrid onCategorySelect={handleCategorySelect} />
            </div>

            {/* Home Services - Darker Background */}
            <div className="animate-slide-up opacity-0 fill-mode-forwards" style={{ animationDelay: '200ms' }}>
              <HorizontalSection 
                 title="Home Services" 
                 items={HOME_SERVICES} 
                 onItemClick={handleCategorySelect}
                 containerClass="bg-black/60 backdrop-blur-md border border-white/5"
              />
            </div>

            {/* Recent Searches - Has its own style in component */}
            <div className="animate-slide-up opacity-0 fill-mode-forwards" style={{ animationDelay: '250ms' }}>
               <RecentSearches />
            </div>

            {/* Education - Darker Background */}
            <div className="animate-slide-up opacity-0 fill-mode-forwards" style={{ animationDelay: '300ms' }}>
               <HorizontalSection 
                 title="Education" 
                 items={EDUCATION_SERVICES} 
                 onItemClick={handleCategorySelect}
                 containerClass="bg-black/60 backdrop-blur-md border border-white/5"
              />
            </div>

            {/* Daily Essentials - Darker Background */}
            <div className="animate-slide-up opacity-0 fill-mode-forwards" style={{ animationDelay: '350ms' }}>
               <HorizontalSection 
                 title="Daily Essentials" 
                 items={DAILY_ESSENTIALS} 
                 onItemClick={handleCategorySelect}
                 containerClass="bg-black/60 backdrop-blur-md border border-white/5"
               />
            </div>

            {/* Health - Darker Background */}
            <div className="animate-slide-up opacity-0 fill-mode-forwards" style={{ animationDelay: '400ms' }}>
               <HorizontalSection 
                 title="Health & Fitness" 
                 items={HEALTH_FITNESS} 
                 onItemClick={handleCategorySelect}
                 containerClass="bg-black/60 backdrop-blur-md border border-white/5"
               />
            </div>

            <div className="animate-slide-up opacity-0 fill-mode-forwards" style={{ animationDelay: '450ms' }}>
               <NearbySection onBusinessClick={handleBusinessClick} />
            </div>

            {/* Beauty - Darker Background */}
            <div className="animate-slide-up opacity-0 fill-mode-forwards" style={{ animationDelay: '500ms' }}>
               <HorizontalSection 
                 title="Beauty & Spa" 
                 items={BEAUTY_SPA} 
                 onItemClick={handleCategorySelect}
                 containerClass="bg-black/60 backdrop-blur-md border border-white/5"
               />
            </div>

            <div className="animate-slide-up opacity-0 fill-mode-forwards" style={{ animationDelay: '550ms' }}>
               <PromoCarousel />
            </div>
          </div>
        );
      case 'categories':
        return (
          <div className="flex flex-col min-h-full animate-fade-in bg-white/95">
             <div className="p-4 pt-6 flex-grow">
               <h2 className="text-xl font-bold text-slate-800 mb-6 px-2 border-l-4 border-red-600 pl-3">
                 All Categories
               </h2>
               <CategoryGrid onCategorySelect={handleCategorySelect} variant="dark" />
               <div className="mt-12 text-center">
                 <p className="text-gray-500 text-sm mb-4">Can't find what you're looking for?</p>
                 <button onClick={() => setActiveTab('search')} className="text-red-600 font-bold text-sm hover:underline">
                   Search for it
                 </button>
               </div>
             </div>
          </div>
        );
      case 'search':
        if (searchQuery) {
          return (
            <SearchResults 
              onBusinessClick={handleBusinessClick}
              savedIds={savedBusinessIds}
              onToggleSave={toggleSave}
              query={searchQuery}
            />
          );
        }
        return (
          <div className="flex flex-col min-h-full animate-fade-in">
            <SearchBar onSearch={handleSearch} />
            <div className="flex-grow">
              <RecentSearches />
              <div className="mt-12 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-white/90 rounded-xl mx-4 backdrop-blur-sm">
                 <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6 border border-gray-300">
                   <ShoppingBag className="w-10 h-10 text-gray-400" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-700">What are you looking for?</h3>
                 <p className="text-sm mt-2 max-w-xs mx-auto text-slate-500">
                   Search for products, services, or local businesses nearby.
                 </p>
              </div>
            </div>
          </div>
        );
      case 'offers':
        const allOffers: { offer: Offer, businessName: string, businessId: string }[] = [];
        
        if (vendorData.offers) {
           vendorData.offers.forEach(o => {
             allOffers.push({ offer: o, businessName: vendorData.name, businessId: vendorData.id });
           });
        }
        
        NEARBY_BUSINESSES.forEach(b => {
           if (b.offers) {
             b.offers.forEach(o => {
                allOffers.push({ offer: o, businessName: b.name, businessId: b.id });
             });
           }
        });

        return (
           <div className="min-h-screen bg-white/95 pb-20 animate-fade-in">
              <header className="bg-white p-4 shadow-sm sticky top-0 z-40 pt-[calc(1rem+env(safe-area-inset-top))]">
                 <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Gift className="w-6 h-6 text-red-600" /> Festive Offers for You
                 </h1>
                 <p className="text-xs text-gray-500">Curated offers from local vendors nearby</p>
              </header>
              <div className="p-4 space-y-4">
                 {allOffers.length > 0 ? (
                    allOffers.map(({ offer, businessName, businessId }, index) => (
                      <div 
                         key={index} 
                         onClick={() => {
                             const business = allBusinesses.find(b => b.id === businessId);
                             if (business) handleBusinessClick(business);
                         }}
                         className={`${offer.color || 'bg-blue-600'} rounded-2xl p-4 text-white shadow-lg relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform`}
                      >
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-colors"></div>
                         <div className="relative z-10">
                            <div className="flex justify-between items-start mb-1">
                               <h3 className="text-2xl font-black italic">{offer.title}</h3>
                               <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                                  <Store className="w-3 h-3" /> {businessName}
                               </span>
                            </div>
                            <p className="font-medium opacity-90 mb-4 text-sm">{offer.description}</p>
                            <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 inline-flex items-center gap-2 border border-white/30 border-dashed">
                               <Tag className="w-4 h-4" />
                               <span className="font-mono font-bold tracking-widest">{offer.code}</span>
                            </div>
                            <button className="absolute bottom-4 right-4 bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:scale-105 transition-transform">
                               Redeem Now
                            </button>
                         </div>
                      </div>
                    ))
                 ) : (
                    <div className="text-center py-12 text-gray-500">
                       <p>No active offers found nearby.</p>
                    </div>
                 )}
                 
                 <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">More offers coming soon...</p>
                 </div>
              </div>
           </div>
        );
      case 'saved':
        const savedItems = allBusinesses.filter(b => savedBusinessIds.includes(b.id));
        const uniqueSavedItems = Array.from(new Set(savedItems.map(a => a.id)))
            .map(id => savedItems.find(a => a.id === id));

        if (uniqueSavedItems.length > 0) {
           return (
             <SearchResults 
               results={uniqueSavedItems as Business[]} 
               onBusinessClick={handleBusinessClick}
               savedIds={savedBusinessIds}
               onToggleSave={toggleSave}
               isSavedTab={true}
             />
           );
        }
        return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 p-6 text-center animate-fade-in bg-white/90 m-4 rounded-2xl">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-200">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Saved Items Yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8">
              Tap the heart icon on any business or product to save it here for later.
            </p>
            <button 
              onClick={() => setActiveTab('home')}
              className="px-6 py-2.5 bg-red-600 text-white rounded-full font-bold text-sm hover:bg-red-700 transition-colors shadow-lg"
            >
              Start Exploring
            </button>
          </div>
        );
      case 'business':
        return (
          <div className="bg-white min-h-screen">
            <VendorDashboard 
              vendor={vendorData} 
              isVendor={userRole === 'vendor'}
              onUpdateVendor={setVendorData}
              onBecomeVendor={() => setUserRole('vendor')}
              onPreview={handleBusinessClick}
              targetTab={vendorDashboardTab}
              launchAddProduct={vendorAddProductTrigger}
              launchAddProductType={vendorAddType} // Pass type preference
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderHeader = () => {
    if (selectedBusiness || activeTab === 'settings' || activeTab === 'help' || activeTab === 'terms' || activeTab === 'offers') return null;

    if (activeTab === 'search' && !!searchQuery) {
       return <SearchHeader query={searchQuery} onBack={handleSearchBack} />;
    }
    return (
      <Header 
        locationState={locationState} 
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => setActiveTab('settings')}
        onNotificationClick={() => setShowNotifications(true)}
      />
    );
  };

  const shouldShowBottomNav = !selectedBusiness && activeTab !== 'settings' && activeTab !== 'help' && activeTab !== 'terms';

  return (
    <MobileWrapper>
      <ThemeController theme={getTheme()} />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={handleSidebarNavigation}
        userRole={userRole}
        userName={userRole === 'vendor' ? vendorData.name : customerData.name}
        userLocation={userRole === 'vendor' ? vendorData.address : customerData.location}
      />

      {showNotifications && (
        <Notifications onClose={() => setShowNotifications(false)} />
      )}

      {renderHeader()}
      
      <main className={`${(selectedBusiness || activeTab === 'settings' || activeTab === 'help' || activeTab === 'terms' || activeTab === 'offers') ? '' : 'pt-[calc(4rem+env(safe-area-inset-top))]'} min-h-screen`}>
        {renderContent()}
      </main>

      {shouldShowBottomNav && (
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          userRole={userRole}
          activeVendorTab={vendorDashboardTab}
          onVendorTabChange={setVendorDashboardTab}
        />
      )}
    </MobileWrapper>
  );
}

export default App;
