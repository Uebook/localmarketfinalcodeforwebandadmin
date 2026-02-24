'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BusinessCard from '@/components/BusinessCard';
import CategoryCard from '@/components/CategoryCard';
import PromoCarousel from '@/components/PromoCarousel';
import { Search, MapPin, TrendingUp, Star, ShieldCheck, Zap, Gavel, Ticket } from 'lucide-react';
import { NEARBY_BUSINESSES, FEATURED_BUSINESSES, HOME_SERVICES, RECENT_SEARCHES } from '@/lib/data';
import { TOP_8_CATEGORIES } from '@/lib/categories';
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
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationState({ lat: null, lng: null, city: 'Delhi, India', loading: false, error: 'Geolocation not supported' });
      return;
    }

    setLocationState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          // Reverse geocode using OpenStreetMap Nominatim (free, no key required)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city =
            addr.suburb ||
            addr.neighbourhood ||
            addr.city_district ||
            addr.quarter ||
            addr.city ||
            addr.town ||
            addr.village ||
            addr.county ||
            'Your Area';
          const state = addr.state || '';
          const displayCity = state ? `${city}, ${state}` : city;

          setLocationState({ lat, lng, city: displayCity, loading: false, error: null });
        } catch {
          // Geocoding failed, show coordinates-based fallback
          setLocationState({ lat, lng, city: 'Your Location', loading: false, error: null });
        }
      },
      (err) => {
        // User denied or error — fall back gracefully
        const msg = err.code === 1 ? 'Location access denied' : 'Could not detect location';
        setLocationState({ lat: null, lng: null, city: 'Delhi, India', loading: false, error: msg });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Track search
      try {
        fetch('/api/search/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery.trim(),
            city: locationState.city,
            userId: JSON.parse(localStorage.getItem('localmarket_user') || '{}').id
          })
        });
      } catch (err) {
        console.warn('Failed to track search:', err);
      }

      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    router.push(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        locationState={locationState}
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 reveal">
              <TrendingUp size={16} className="text-primary" />
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest">The #1 Local Directory</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter reveal" style={{ animationDelay: '0.1s' }}>
              Find Anything <span className="text-gradient">Local.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed reveal" style={{ animationDelay: '0.2s' }}>
              Instantly connect with the best rated businesses, services and exclusive offers in your neighborhood.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto reveal" style={{ animationDelay: '0.3s' }}>
            <form onSubmit={handleSearch} className="relative group">
              <div className="flex gap-2 bg-white rounded-[2.5rem] p-2 shadow-2xl shadow-slate-200 border border-slate-100 group-focus-within:border-primary/30 transition-all duration-500">
                <div className="flex-1 flex items-center gap-4 px-6">
                  <Search className="text-slate-400 group-focus-within:text-primary transition-colors" size={24} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What are you looking for today?"
                    className="flex-1 py-4 outline-none text-slate-900 font-bold placeholder-slate-400 bg-transparent text-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-10 py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95"
                >
                  Search
                </button>
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {RECENT_SEARCHES.slice(0, 5).map((search, i) => (
                  <button
                    key={i}
                    onClick={() => handleCategorySelect(search)}
                    className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm"
                  >
                    #{search}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Top Categories Area */}
        <section className="mb-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-primary" />
                <span className="text-xs font-black text-primary uppercase tracking-widest">Fast Access</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Top Categories</h2>
            </div>
            <button
              onClick={() => router.push('/categories')}
              className="text-primary font-black text-sm uppercase tracking-widest hover:translate-x-2 transition-transform pb-2"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {categories.slice(0, 8).map((category: any, i: number) => (
              <CategoryCard
                key={category.id}
                category={category}
                onSelect={handleCategorySelect}
              />
            ))}
            {categories.length === 0 && TOP_8_CATEGORIES.map((category: any) => (
              <CategoryCard
                key={category.id}
                category={category}
                onSelect={handleCategorySelect}
              />
            ))}
          </div>
        </section>

        {/* Hero Promo Section */}
        <section className="mb-24 reveal">
          <PromoCarousel />
        </section>

        {/* Featured Businesses Section */}
        <section className="mb-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star size={18} className="text-yellow-500" />
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Handpicked</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Featured Excellence</h2>
            </div>
            <button
              onClick={() => router.push('/search')}
              className="text-primary font-black text-sm uppercase tracking-widest hover:translate-x-2 transition-transform pb-2"
            >
              Explore All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURED_BUSINESSES.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </section>

        {/* E-Auction & Draws Teaser Section */}
        <section className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-8 reveal">
          <div
            onClick={() => router.push('/eauction')}
            className="relative group h-64 rounded-[3rem] overflow-hidden cursor-pointer shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Gavel size={120} strokeWidth={1} className="text-white" />
            </div>
            <div className="relative h-full p-10 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live Now</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-2 leading-tight">Hyper-Local<br />E-Auctions</h3>
                <p className="text-slate-400 font-medium text-sm max-w-[240px]">Bid on exclusive inventory from verified local businesses.</p>
              </div>
              <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest">
                Start Bidding <TrendingUp size={16} />
              </div>
            </div>
          </div>

          <div
            onClick={() => router.push('/draws')}
            className="relative group h-64 rounded-[3rem] overflow-hidden cursor-pointer shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity">
              <Ticket size={120} strokeWidth={1} className="text-white" />
            </div>
            <div className="relative h-full p-10 flex flex-col justify-between text-white">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full mb-4">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Lucky Draws</span>
                </div>
                <h3 className="text-3xl font-black mb-2 leading-tight">Daily Online<br />Lucky Draws</h3>
                <p className="text-white/80 font-medium text-sm max-w-[240px]">Join local circles and win amazing prizes every single day.</p>
              </div>
              <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest">
                Try Your Luck →
              </div>
            </div>
          </div>
        </section>

        {/* Trust Metrics Section */}
        <section className="mb-24 py-16 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-wrap justify-around items-center gap-12 px-12 reveal">
          <div className="flex flex-col items-center text-center max-w-[200px]">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={32} className="text-blue-600" />
            </div>
            <h4 className="font-black text-xl text-slate-900 mb-1">100% Verified</h4>
            <p className="text-sm font-bold text-slate-500">Every business is manually checked.</p>
          </div>
          <div className="w-px h-24 bg-slate-100 hidden md:block" />
          <div className="flex flex-col items-center text-center max-w-[200px]">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Star size={32} className="text-yellow-500" strokeWidth={3} />
            </div>
            <h4 className="font-black text-xl text-slate-900 mb-1">Top Rated</h4>
            <p className="text-sm font-bold text-slate-500">Only the best services make the cut.</p>
          </div>
          <div className="w-px h-24 bg-slate-100 hidden md:block" />
          <div className="flex flex-col items-center text-center max-w-[200px]">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <MapPin size={32} className="text-primary" />
            </div>
            <h4 className="font-black text-xl text-slate-900 mb-1">Hyper Local</h4>
            <p className="text-sm font-bold text-slate-500">Connecting you to your neighbors.</p>
          </div>
        </section>

        {/* Services Sections */}
        <section className="mb-24">
          <div className="mb-10">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Quick Help</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Popular Services</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {HOME_SERVICES.map((service, i) => (
              <button
                key={service.id}
                onClick={() => handleCategorySelect(service.name)}
                className="group relative h-64 rounded-[2rem] overflow-hidden shadow-lg transition-all duration-500 hover:-translate-y-2 reveal"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Image
                  src={service.imageUrl}
                  alt={service.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                  <h3 className="text-white font-black text-xl tracking-wide">{service.name}</h3>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Book Now →</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => {
          setIsSidebarOpen(false);
          if (tab === 'logout') router.push('/login');
          else if (tab === 'register-business') router.push('/vendor/register');
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
