
import React from 'react';
import { Home, Grid, Search, Bookmark, Activity, Package, MessageSquare, Star, User, Percent } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole?: 'customer' | 'vendor' | null;
  activeVendorTab?: string;
  onVendorTabChange?: (tab: any) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  onTabChange,
  userRole,
  activeVendorTab,
  onVendorTabChange
}) => {
  // Common active style classes
  const getIconClass = (isActive: boolean) => 
    `w-6 h-6 transition-all duration-300 ${isActive ? 'text-orange-600 fill-orange-600/20 scale-110' : 'text-slate-400 hover:text-slate-600'}`;
  
  // Updated text class to be darker (slate-900) and bolder (font-extrabold) when active
  const getTextClass = (isActive: boolean) => 
    `text-[10px] font-medium mt-1 transition-all duration-300 ${isActive ? 'text-slate-900 font-extrabold translate-y-0' : 'text-slate-400 translate-y-0.5'}`;

  // Vendor Navigation
  if (userRole === 'vendor') {
    const vendorTabs = [
      { id: 'overview', label: 'Analytics', icon: Activity },
      { id: 'products', label: 'Catalog', icon: Package },
      { id: 'enquiries', label: 'Enquiries', icon: MessageSquare },
      { id: 'reviews', label: 'Reviews', icon: Star },
      { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass z-50 h-[4.5rem] pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-full max-w-7xl mx-auto px-2">
          {vendorTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeVendorTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onVendorTabChange && onVendorTabChange(tab.id)}
                className="flex flex-col items-center justify-center w-full h-full active:scale-95 transition-transform group"
              >
                <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-orange-50' : 'bg-transparent'}`}>
                  <Icon className={getIconClass(isActive)} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
                </div>
                <span className={getTextClass(isActive)}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // Customer Navigation
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'offers', label: 'Offers', icon: Percent },
    { id: 'saved', label: 'Saved', icon: Bookmark },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass z-50 h-[4.5rem] pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-full max-w-7xl mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center w-full h-full active:scale-90 transition-transform duration-200 group"
            >
              <div className={`relative p-1.5 rounded-2xl transition-all duration-500 ease-out ${isActive ? 'bg-gradient-to-br from-orange-50 to-blue-50 shadow-sm translate-y-[-4px]' : 'bg-transparent'}`}>
                <Icon 
                  className={getIconClass(isActive)} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </div>
              <span className={getTextClass(isActive)}>
                {tab.label}
              </span>
              
              {/* Active Indicator Dot */}
              <div className={`absolute bottom-1 w-1 h-1 rounded-full bg-gradient-to-r from-orange-500 to-blue-500 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
