'use client';

import { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import VendorManagement from '@/components/VendorManagement';
import CategoryManagement from '@/components/CategoryManagement';
import PriceVerification from '@/components/PriceVerification';
import Reports from '@/components/Reports';
import NotificationManagement from '@/components/NotificationManagement';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('admin_authenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  const getPageTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return 'Dashboard';
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
      default:
        return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
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
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
