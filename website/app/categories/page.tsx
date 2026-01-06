'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import CategoryGrid from '@/components/CategoryGrid';
import { ALL_CATEGORIES, TOP_8_CATEGORIES } from '@/lib/categories';

export default function CategoriesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [locationState] = useState({
    lat: null,
    lng: null,
    city: 'Delhi, India',
    loading: false,
    error: null,
  });
  const router = useRouter();

  const handleCategorySelect = (categoryName: string) => {
    router.push(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  const handleSidebarNavigation = (tab: string) => {
    setIsSidebarOpen(false);
    if (tab === 'logout') {
      router.push('/login');
    } else if (tab === 'register-business') {
      router.push('/vendor/register');
    } else if (tab === 'settings') {
      router.push('/settings');
    } else if (tab === 'help') {
      router.push('/help');
    } else if (tab === 'home') {
      router.push('/');
    } else if (tab === 'categories') {
      router.push('/categories');
    } else if (tab === 'saved') {
      router.push('/saved');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E86A2C] to-[#4A6CF7]">
      <Header
        locationState={locationState}
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex items-center gap-3 mb-8 sm:mb-12">
          <div className="w-1.5 h-8 sm:h-10 bg-white rounded" />
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">All Categories</h1>
        </div>
        
        {/* Top 8 Priority Categories */}
        <div className="mb-12">
          <h2 className="text-white text-2xl font-bold mb-6">Top 8 Priority Categories</h2>
          <CategoryGrid onCategorySelect={handleCategorySelect} variant="dark" />
        </div>
        
        {/* View All Categories Toggle */}
        <div className="mb-8 text-center">
          <button
            onClick={() => router.push('/search')}
            className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/30 transition-colors"
          >
            View All {ALL_CATEGORIES.length} Categories
          </button>
        </div>
        
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-white/90 mb-3 text-lg sm:text-xl">Can't find what you're looking for?</p>
          <button
            onClick={() => router.push('/search')}
            className="text-white font-bold text-lg sm:text-xl underline hover:text-white/80 transition-colors"
          >
            Search for it
          </button>
        </div>
      </div>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={handleSidebarNavigation}
        userRole="customer"
      />
    </div>
  );
}
