'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BusinessCard from '@/components/BusinessCard';
import { NEARBY_BUSINESSES, FEATURED_BUSINESSES } from '@/lib/data';
import { Heart } from 'lucide-react';

export default function SavedPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedBusinesses] = useState([...NEARBY_BUSINESSES.slice(0, 2), ...FEATURED_BUSINESSES]);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        locationState={{ loading: false, error: null, city: 'Delhi, India' }}
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 bg-orange-500 rounded" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Saved Items</h1>
          </div>
          <p className="text-gray-900 ml-3">
            {savedBusinesses.length} {savedBusinesses.length === 1 ? 'business' : 'businesses'} saved
          </p>
        </div>

        {/* Grid View */}
        {savedBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {savedBusinesses.map((business) => (
              <div key={business.id} className="relative">
                <BusinessCard business={business} />
                <div className="absolute top-3 right-3 z-10">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Heart className="text-red-500 fill-red-500" size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Heart className="text-gray-300 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Saved Items</h3>
            <p className="text-gray-900 mb-6">Start saving businesses you like!</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Explore Businesses
            </button>
          </div>
        )}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => {
          setIsSidebarOpen(false);
          if (tab === 'home') router.push('/');
          else if (tab === 'categories') router.push('/categories');
          else if (tab === 'saved') router.push('/saved');
        }}
        userRole="customer"
      />
    </div>
  );
}
