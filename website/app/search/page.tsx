'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import BusinessCard from '@/components/BusinessCard';
import { SEARCH_RESULTS } from '@/lib/data';

function SearchContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(SEARCH_RESULTS);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    if (query) {
      // Filter results based on query
      const filtered = SEARCH_RESULTS.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    }
  }, [searchParams]);

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleBusinessClick = (businessId: string) => {
    router.push(`/vendor/${businessId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        locationState={{ loading: false, error: null, city: 'Delhi, India' }}
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Results Header */}
        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Search Results
            </h2>
            <p className="text-gray-900">
              Found {results.length} {results.length === 1 ? 'result' : 'results'} for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* Grid View */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {results.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onClick={() => handleBusinessClick(business.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="text-gray-400" width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-900 mb-6">
              {searchQuery 
                ? `We couldn't find any results for "${searchQuery}". Try a different search term.`
                : 'Start searching to find local businesses near you.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  router.push('/search');
                }}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Clear Search
              </button>
            )}
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900">Loading...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
