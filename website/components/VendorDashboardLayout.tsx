'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { INITIAL_VENDOR_DATA } from '@/lib/constants';
import { Activity, Package, MessageSquare, Star, User, Upload, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface VendorDashboardLayoutProps {
  children: React.ReactNode;
  hideTabs?: boolean;
}

export default function VendorDashboardLayout({ children, hideTabs = false }: VendorDashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const vendor = INITIAL_VENDOR_DATA;

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: Activity, href: '/vendor/dashboard/analytics' },
    { id: 'catalog', label: 'Catalog', icon: Package, href: '/vendor/dashboard/catalog' },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, href: '/vendor/dashboard/enquiries' },
    { id: 'reviews', label: 'Reviews', icon: Star, href: '/vendor/dashboard/reviews' },
    { id: 'profile', label: 'Profile', icon: User, href: '/vendor/dashboard/profile' },
    { id: 'bulk-update', label: 'Bulk Update', icon: Upload, href: '/vendor/dashboard/bulk-update' },
    { id: 'feedback', label: 'Feedback', icon: MessageCircle, href: '/vendor/dashboard/feedback' },
  ];

  const activeTab = tabs.find(tab => pathname.includes(tab.href))?.id || 'analytics';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        locationState={{ loading: false, error: null, city: vendor.city }}
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />
      
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-[#E86A2C] to-[#4A6CF7] text-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{vendor.name}</h1>
          <p className="text-white/90 text-sm sm:text-base">{vendor.category} • {vendor.address}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      {!hideTabs && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-orange-500 text-orange-500'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {children}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => {
          setIsSidebarOpen(false);
          if (tab === 'business-analytics') router.push('/vendor/dashboard/analytics');
          else if (tab === 'business-products') router.push('/vendor/dashboard/catalog');
          else if (tab === 'business-enquiries') router.push('/vendor/dashboard/enquiries');
          else if (tab === 'business-offers') router.push('/vendor/dashboard');
          else if (tab === 'business-details') router.push('/vendor/dashboard/profile');
          else if (tab === 'settings') router.push('/settings');
          else if (tab === 'logout') router.push('/login');
        }}
        userRole="vendor"
        userName={vendor.name}
        userLocation={vendor.address}
      />
    </div>
  );
}

