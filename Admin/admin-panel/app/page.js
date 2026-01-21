'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import UserManagement from '@/components/Dashboard/UserManagement';
import VendorManagement from '@/components/VendorManagement';
import CategoryManagement from '@/components/CategoryManagement';
import PriceVerification from '@/components/PriceVerification';
import Reports from '@/components/Reports';
import NotificationManagement from '@/components/NotificationManagement';
import LocationManagement from '@/components/LocationManagement';
import PaymentFeesManagement from '@/components/PaymentFeesManagement';
import FestiveOffersManagement from '@/components/FestiveOffersManagement';
import BannerManagement from '@/components/BannerManagement';
import EAuctionManagement from '@/components/EAuctionManagement';
import CircleAnalytics from '@/components/Analytics/CircleAnalytics';
import Settings from '@/components/Settings';

export default function AdminPanel() {
  // Public access - no authentication required
  const [isAuthenticated] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Authentication removed for public access
  // const handleLogin = () => {
  //   localStorage.setItem('admin_authenticated', 'true');
  //   setIsAuthenticated(true);
  // };

  const handleLogout = () => {
    // Logout disabled for public access
    // localStorage.removeItem('admin_authenticated');
    // setIsAuthenticated(false);
  };

  const getPageTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return 'Dashboard';
      case 'users':
        return 'User Management';
      case 'vendors':
        return 'Vendor Management';
      case 'categories':
        return 'Category & Products';
      case 'price-verification':
        return 'Price Verification';
      case 'reports':
        return 'Reports & Analytics';
      case 'notifications':
        return 'Notifications';
      case 'locations':
        return 'Location Management';
      case 'payment-fees':
        return 'Payment & Fees Management';
      case 'festive-offers':
        return 'Festive Offers Management';
      case 'banners':
        return 'Banner Management';
      case 'e-auction':
        return 'E-Auction & Online Draw';
      case 'circle-analytics':
        return 'Circle Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveSection} />;
      case 'users':
        return <UserManagement />;
      case 'vendors':
        return <VendorManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'price-verification':
        return <PriceVerification />;
      case 'reports':
        return <Reports />;
      case 'notifications':
        return <NotificationManagement />;
      case 'locations':
        return <LocationManagement />;
      case 'payment-fees':
        return <PaymentFeesManagement />;
      case 'festive-offers':
        return <FestiveOffersManagement />;
      case 'banners':
        return <BannerManagement />;
      case 'e-auction':
        return <EAuctionManagement />;
      case 'circle-analytics':
        return <CircleAnalytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Login page removed - public access enabled
  // if (!isAuthenticated) {
  //   return <LoginPage onLogin={handleLogin} />;
  // }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Full Width Header */}
      <Header currentPage={getPageTitle()} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
