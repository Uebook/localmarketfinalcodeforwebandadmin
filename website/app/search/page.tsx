'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import BusinessCard from '@/components/BusinessCard';
import { SEARCH_RESULTS } from '@/lib/data';
import { Search, MapPin, SlidersHorizontal, ArrowLeft } from 'lucide-react';

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
      const lowerQuery = query.toLowerCase();
      const queryWords = lowerQuery.split(/[\s\/]+/).filter(w => w.length > 0);

      const filtered = SEARCH_RESULTS.filter((item) => {
        const itemName = item.name.toLowerCase();
        const itemCategory = item.category.toLowerCase();
        const matchesName = queryWords.some(word => itemName.includes(word));
        const matchesCategory = queryWords.some(word => itemCategory.includes(word)) ||
          itemCategory.includes(lowerQuery) ||
          lowerQuery.includes(itemCategory);
        const categoryInQuery = itemCategory && lowerQuery.includes(itemCategory.split(' ')[0]);
        const matchesProducts = item.products && item.products.some((p: any) =>
          queryWords.some(word => p.name.toLowerCase().includes(word))
        );
        return matchesName || matchesCategory || categoryInQuery || matchesProducts;
      });
      setResults(filtered);
    } else {
      setResults(SEARCH_RESULTS);
    }
  }, [searchParams]);

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleBusinessClick = (businessId: string) => {
    router.push(`/vendor/${businessId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        locationState={{ loading: false, error: null, city: 'Delhi, India' }}
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 blur-[80px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header Area */}
        <div className="mb-10 reveal">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors mb-4"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
                {searchQuery ? `Results for "${searchQuery}"` : 'Browse Everything'}
              </h1>
              <p className="text-slate-500 font-bold">
                Showing {results.length} verified {results.length === 1 ? 'business' : 'businesses'} matching your search.
              </p>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="flex-1 md:w-80">
                <SearchBar onSearch={handleSearch} />
              </div>
              <button className="px-6 py-3 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-sm font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                <SlidersHorizontal size={18} />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 reveal" style={{ animationDelay: '0.2s' }}>
            {results.map((business, i) => (
              <div key={business.id} className="reveal" style={{ animationDelay: `${i * 0.05 + 0.3}s` }}>
                <BusinessCard
                  business={business}
                  onClick={() => handleBusinessClick(business.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl shadow-slate-200/50 border border-slate-50 reveal" style={{ animationDelay: '0.2s' }}>
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Search className="text-slate-300" size={48} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Matches Found</h3>
            <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? `We couldn't find any results for "${searchQuery}". Maybe try a different keyword or browse categories?`
                : 'Start searching to find the best local businesses near you.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  router.push('/search');
                }}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
              >
                Clear Search & Try Again
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Searching...</span>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
