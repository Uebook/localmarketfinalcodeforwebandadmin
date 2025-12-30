'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BusinessCard from '@/components/BusinessCard';
import CategoryCard from '@/components/CategoryCard';
import { Search } from 'lucide-react';
import { NEARBY_BUSINESSES, FEATURED_BUSINESSES, HOME_SERVICES, EDUCATION_SERVICES, DAILY_ESSENTIALS, HEALTH_FITNESS, BEAUTY_SPA, RECENT_SEARCHES } from '@/lib/data';
import { CATEGORIES } from '@/lib/constants';
import Image from 'next/image';

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationState, setLocationState] = useState({
    lat: null as number | null,
    lng: null as number | null,
    city: '',
    loading: true,
    error: null as string | null,
  });
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setLocationState({
        lat: 28.6139,
        lng: 77.2090,
        city: 'Connaught Place, Delhi',
        loading: false,
        error: null,
      });
    }, 1500);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    router.push(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        locationState={locationState}
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-blue-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Local Businesses Near You
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Find the best products, services, and deals from trusted local businesses in your area
            </p>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex gap-2 bg-white rounded-xl p-2 shadow-lg">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services, products, or businesses..."
                  className="flex-1 py-3 outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onSelect={handleCategorySelect}
              />
            ))}
          </div>
        </section>

        {/* Featured Businesses */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Businesses</h2>
            <button
              onClick={() => router.push('/search')}
              className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_BUSINESSES.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </section>

        {/* Nearby Businesses */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Nearby Businesses</h2>
            <button
              onClick={() => router.push('/search')}
              className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {NEARBY_BUSINESSES.slice(0, 4).map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </section>

        {/* Services Sections */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {HOME_SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => handleCategorySelect(service.name)}
                className="group relative h-48 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Image
                  src={service.imageUrl}
                  alt={service.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg">{service.name}</h3>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Searches */}
        {RECENT_SEARCHES.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Searches</h2>
            <div className="flex flex-wrap gap-3">
              {RECENT_SEARCHES.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleCategorySelect(search)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 hover:border-orange-500 hover:text-orange-500 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => {
          setIsSidebarOpen(false);
          if (tab === 'logout') router.push('/login');
          else if (tab === 'register-business') {
            router.push('/vendor/register');
          }
          else if (tab === 'settings') router.push('/settings');
          else if (tab === 'help') router.push('/help');
          else if (tab === 'home') router.push('/');
          else if (tab === 'categories') router.push('/categories');
          else if (tab === 'saved') router.push('/saved');
        }}
        userRole="customer"
      />
    </div>
  );
}
