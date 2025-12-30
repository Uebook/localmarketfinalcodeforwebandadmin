'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Settings, User, Bell, Shield, HelpCircle, LogOut, ShoppingBag, ChevronRight, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { 
      icon: User, 
      label: 'Profile', 
      description: 'Manage your personal information',
      href: '/settings/profile',
      color: 'text-blue-600'
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      description: 'Control notification preferences',
      href: '/settings/notifications',
      color: 'text-orange-600'
    },
    { 
      icon: Shield, 
      label: 'Privacy & Security', 
      description: 'Manage your privacy settings',
      href: '/settings/privacy',
      color: 'text-green-600'
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      description: 'Get help and contact support',
      href: '/help',
      color: 'text-purple-600'
    },
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        locationState={{ loading: false, error: null, city: 'Delhi, India' }}
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-900 text-sm sm:text-base">Manage your account settings and preferences</p>
        </div>

        {/* Settings Menu */}
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200 mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-4 p-4 sm:p-6 hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0`}>
                  <Icon className={item.color} size={24} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 text-base sm:text-lg mb-1">{item.label}</p>
                  <p className="text-gray-900 text-sm">{item.description}</p>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" size={20} />
              </button>
            );
          })}
        </div>

        {/* App Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShoppingBag className="text-white" size={32} />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <CheckCircle className="text-white" size={14} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Local Market</h3>
          <p className="text-gray-900 text-sm sm:text-base mb-1">Your local business directory</p>
          <p className="text-gray-900 text-xs sm:text-sm font-medium">Version 1.0.0</p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-md text-base sm:text-lg"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => {
          setIsSidebarOpen(false);
          if (tab === 'home') router.push('/');
          else if (tab === 'settings') router.push('/settings');
          else if (tab === 'categories') router.push('/categories');
          else if (tab === 'saved') router.push('/saved');
        }}
        userRole="customer"
      />
    </div>
  );
}
