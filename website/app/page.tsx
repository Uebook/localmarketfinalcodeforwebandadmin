'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BusinessCard from '@/components/BusinessCard';
import CategoryCard from '@/components/CategoryCard';
import PromoCarousel from '@/components/PromoCarousel';
import { Search, MapPin, TrendingUp, Star, ShieldCheck, Zap, Tag, ChevronRight, TrendingDown, Mic, Store, Home as HomeIcon } from 'lucide-react';
import { NEARBY_BUSINESSES, FEATURED_BUSINESSES, HOME_SERVICES, RECENT_SEARCHES } from '@/lib/data';
import { TOP_9_CATEGORIES } from '@/lib/categories';
import Image from 'next/image';
import { useLocation } from '@/lib/hooks';
import CategoryGrid from '@/components/CategoryGrid';
import SalesSection from '@/components/SalesSection';

// ──────────────────────────────────────────
// Static data for new LOKALL sections
// ──────────────────────────────────────────
const POPULAR_SEARCHES = [
  { label: 'Milk', icon: '🥛' },
  { label: 'Cooking Oil', icon: '🫙' },
  { label: 'Rice', icon: '🍚' },
  { label: 'Atta', icon: '🌾' },
  { label: 'Mobile Charger', icon: '🔌' },
  { label: 'Shampoo', icon: '🧴' },
  { label: 'Gas Stove', icon: '🔥' },
  { label: 'Soap', icon: '🧼' },
];

const NEARBY_MARKETS = [
  { id: 1, name: 'Hall Bazaar', shops: '200+', color: 'from-orange-500 to-amber-400', emoji: '🏛️' },
  { id: 2, name: 'Lawrence Road', shops: '150+', color: 'from-violet-500 to-purple-400', emoji: '🛍️' },
  { id: 3, name: 'Putligarh Market', shops: '100+', color: 'from-emerald-500 to-green-400', emoji: '🥦' },
  { id: 4, name: 'Katra Jaimal Singh', shops: '180+', color: 'from-amber-500 to-yellow-400', emoji: '⭐' },
  { id: 5, name: 'Novelty Chowk', shops: '120+', color: 'from-red-500 to-rose-400', emoji: '🧃' },
  { id: 6, name: 'Ranjit Avenue', shops: '90+', color: 'from-blue-500 to-sky-400', emoji: '☕' },
];

const TODAY_DEALS = [
  { id: 1, name: 'Cooking Oil 1L', price: '₹160', shop: 'Singh Mart', distance: '800m', savings: '₹15 off', tag: 'Best Price' },
  { id: 2, name: 'Surf Excel 500g', price: '₹185', shop: 'Gupta Store', distance: '1.1 km', savings: '₹20 off', tag: 'Hot Deal' },
  { id: 3, name: 'Basmati Rice 5kg', price: '₹520', shop: 'Sharma Foods', distance: '600m', savings: '₹30 off', tag: 'Popular' },
  { id: 4, name: 'Milk 1L', price: '₹56', shop: 'Gupta Dairy', distance: '400m', savings: '₹4 off', tag: 'Daily Need' },
];

const VERIFIED_SHOPS = [
  { id: 1, name: 'Gupta General Store', category: 'Grocery', rating: 4.5, reviews: 128, distance: '500m' },
  { id: 2, name: 'Sharma Electronics', category: 'Electronics', rating: 4.3, reviews: 89, distance: '1.2 km' },
  { id: 3, name: 'Singh Dairy', category: 'Dairy', rating: 4.6, reviews: 204, distance: '300m' },
  { id: 4, name: 'Kumar Pharmacy', category: 'Medical', rating: 4.4, reviews: 156, distance: '700m' },
];

const PRICE_DROPS = [
  { id: 1, name: 'Amul Butter 500g', old: '₹245', new: '₹230', pct: '6%' },
  { id: 2, name: 'Basmati Rice 5kg', old: '₹600', new: '₹550', pct: '8%' },
  { id: 3, name: 'Surf Excel 1kg', old: '₹340', new: '₹310', pct: '9%' },
  { id: 4, name: 'Sunflower Oil 1L', old: '₹175', new: '₹158', pct: '10%' },
];

const MEGA_SAVINGS = [
  { id: 's1', name: 'Premium Coffee Maker', online: 4500, offline: 3800, shop: 'Modern Electronics', distance: '1.2 km', image: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&w=400&q=80' },
  { id: 's2', name: 'Cotton Bed Sheet Set', online: 1200, offline: 850, shop: 'Royal Handloom', distance: '0.5 km', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80' },
  { id: 's3', name: 'Android Tablet 10"', online: 15000, offline: 13500, shop: 'Tech Hub', distance: '2.1 km', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80' },
  { id: 's4', name: 'Pure Leather Wallet', online: 1800, offline: 1200, shop: 'Leather World', distance: '0.8 km', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80' },
];

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { location: locationState, detectLocation } = useLocation();
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('localmarket_location');
    if (!saved) detectLocation();
  }, [detectLocation]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        fetch('/api/search/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery.trim(), city: locationState.city }),
        });
      } catch { }
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategorySelect = (name: string) => router.push(`/search?q=${encodeURIComponent(name)}`);

  const cityDisplay = locationState.city
    ? locationState.city.split(',')[0]
    : 'Your City';
  const areaDisplay = locationState.city || 'Detecting location...';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header
        locationState={locationState}
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />

      {/* ─── STICKY LOCATION BAR ─── */}
      <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Location</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-slate-900 leading-none">{cityDisplay}</p>
                <span className="text-slate-300 text-xs">·</span>
                <p className="text-xs font-semibold text-slate-500 leading-none truncate max-w-[150px] sm:max-w-none">{areaDisplay}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => detectLocation()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-orange-600 transition-all shadow-sm shadow-orange-200 active:scale-95"
          >
            <MapPin size={10} />
            Change
          </button>
        </div>
      </div>

      {/* ─── FLOATING HOME BUTTON (MOBILE) ─── */}
      <button
        onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); router.push('/'); }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-full shadow-2xl lg:hidden active:scale-90 transition-transform hover:bg-primary"
      >
        <HomeIcon size={24} />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {/* ─── CHEAPEST MARKET CARD ─── */}
        <div className="mt-6 mb-2">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 shadow-xl shadow-orange-200/60 p-6 cursor-pointer hover:-translate-y-1 transition-all duration-300"
            onClick={() => router.push('/search?q=Hall Bazaar')}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4" />
            <div className="absolute bottom-0 right-16 w-24 h-24 bg-white/10 rounded-full translate-y-1/3" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Today's Cheapest Market</span>
                </div>
                <h2 className="text-4xl font-black text-white mb-1 tracking-tight">Hall Bazaar</h2>
                <p className="text-white/85 font-semibold text-sm">
                  <span className="font-black text-white">8% cheaper</span> than nearby markets today
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-4 py-2">
                  <span className="text-white text-xs font-bold">Explore Deals</span>
                  <ChevronRight size={13} className="text-white" />
                </div>
              </div>
              <div className="text-7xl opacity-25 select-none">🏷️</div>
            </div>
          </div>
        </div>

        {/* ─── LARGE SEARCH BAR ─── */}
        <div className="my-6">
          <form onSubmit={handleSearch} className="relative group">
            <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-lg shadow-slate-200/80 border-2 border-slate-100 group-focus-within:border-orange-300 transition-all duration-300">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="text-orange-400" size={22} />
                <input
                  id="main-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, markets or shops..."
                  className="flex-1 py-3.5 outline-none text-slate-900 font-bold placeholder-slate-400 bg-transparent text-base"
                />
                <button type="button" className="p-2 rounded-xl hover:bg-slate-100 transition-colors" title="Voice search">
                  <Mic size={18} className="text-slate-400" />
                </button>
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 bg-orange-500 text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-orange-600 transition-all shadow-md shadow-orange-200 active:scale-95"
              >
                Search
              </button>
            </div>
            {/* Quick suggestion chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {['Milk', 'Cooking Oil', 'Atta', 'Mobile Charger', 'Shampoo'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => { setSearchQuery(chip); router.push(`/search?q=${encodeURIComponent(chip)}`); }}
                  className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full text-xs font-bold hover:bg-orange-100 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* ─── CATEGORY ICONS ─── */}
        <section className="mb-8">
          <CategoryGrid
            onCategorySelect={handleCategorySelect}
            categories={categories.length > 0 ? categories : undefined}
          />
        </section>

        {/* ─── FIND CHEAPEST BUTTON ─── */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/search?q=cheapest&sort=price_asc')}
            className="w-full flex items-center gap-4 bg-slate-900 text-white rounded-2xl px-6 py-5 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.99] group"
          >
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Tag size={22} className="text-orange-400" />
            </div>
            <div className="text-left flex-1">
              <p className="font-black text-base leading-none mb-1">Find Cheapest Items Near Me</p>
              <p className="text-slate-400 text-xs font-semibold">Compare prices across local shops instantly</p>
            </div>
            <ChevronRight size={20} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ─── POPULAR SEARCHES ─── */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">🔥 Popular Today</h2>
            <p className="text-slate-400 text-sm font-medium mt-0.5">What people near you are searching</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((item) => (
              <button
                key={item.label}
                onClick={() => handleCategorySelect(item.label)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-700 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm"
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* ─── NEARBY MARKETS ─── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">🏛️ Nearby Markets</h2>
              <p className="text-slate-400 text-sm font-medium mt-0.5">Tap a market to see all shops inside</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {NEARBY_MARKETS.map((market) => (
              <button
                key={market.id}
                onClick={() => router.push(`/search?q=${encodeURIComponent(market.name)}`)}
                className="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${market.color} flex items-center justify-center text-xl mb-3 shadow-sm`}>
                  {market.emoji}
                </div>
                <p className="text-xs font-bold text-slate-800 text-center leading-tight mb-1">{market.name}</p>
                <p className="text-[10px] font-semibold text-slate-400">{market.shops} shops</p>
              </button>
            ))}
          </div>
        </section>

        {/* ─── SALES SECTION ─── */}
        <SalesSection />

        {/* ─── TODAY'S DEALS ─── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">🏷️ Today's Deals Near You</h2>
              <p className="text-slate-400 text-sm font-medium mt-0.5">Lowest prices from shops around you</p>
            </div>
            <button onClick={() => router.push('/offers')} className="text-orange-500 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              All Deals <ChevronRight size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TODAY_DEALS.map((deal) => (
              <div
                key={deal.id}
                onClick={() => router.push(`/search?q=${encodeURIComponent(deal.name)}`)}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg">{deal.tag}</span>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg">{deal.savings}</span>
                </div>
                <p className="font-bold text-slate-800 text-sm mb-1">{deal.name}</p>
                <p className="text-2xl font-black text-orange-500 mb-2">{deal.price}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Store size={11} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500">{deal.shop}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={10} className="text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-400">{deal.distance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PROMO CAROUSEL ─── */}
        <section className="mb-8">
          <PromoCarousel />
        </section>

        {/* ─── VERIFIED SHOPS ─── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-500" /> Verified Shops Near You
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-0.5">Manually verified for quality & trust</p>
            </div>
            <button onClick={() => router.push('/search?q=verified')} className="text-orange-500 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              See All <ChevronRight size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VERIFIED_SHOPS.map((shop) => (
              <div key={shop.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Store size={18} className="text-blue-500" />
                  </div>
                  <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                    <ShieldCheck size={11} className="text-blue-500" />
                    <span className="text-[9px] font-black text-blue-600 uppercase">Verified</span>
                  </div>
                </div>
                <p className="font-bold text-slate-800 text-sm mb-0.5">{shop.name}</p>
                <p className="text-[11px] text-slate-400 font-semibold mb-2">{shop.category}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-black text-slate-700">{shop.rating}</span>
                    <span className="text-[10px] text-slate-400">({shop.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={10} className="text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-400">{shop.distance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PRICE DROP ALERTS ─── */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              📉 Price Drops
              <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-black rounded-lg uppercase tracking-wide">New</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-0.5">Recent price reductions near you</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PRICE_DROPS.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-1 mb-3">
                  <TrendingDown size={13} className="text-red-500" />
                  <span className="text-xs font-black text-red-500">{item.pct} drop</span>
                </div>
                <p className="font-bold text-slate-800 text-sm mb-3 leading-tight">{item.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-400 line-through">{item.old}</span>
                  <ChevronRight size={12} className="text-slate-300" />
                  <span className="text-lg font-black text-green-600">{item.new}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── MEGA SAVINGS: LOCAL VS ONLINE ─── */}
        <section className="mb-14 reveal">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-green-500" size={24} />
                Mega Savings: Local vs Online
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-0.5">Huge savings when you buy from local shops instead of online</p>
            </div>
            <div className="flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full">
              <ShieldCheck size={14} className="text-green-600" />
              <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Verified Savings</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MEGA_SAVINGS.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                onClick={() => router.push(`/search?q=${encodeURIComponent(item.name)}`)}
              >
                <div className="relative h-48">
                  <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Save ₹{item.online - item.offline}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-black text-slate-900 text-lg mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                    <Store size={10} /> {item.shop} • {item.distance}
                  </p>

                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Online</p>
                      <p className="text-sm font-bold text-slate-300 line-through">₹{item.online}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="text-right">
                      <p className="text-[9px] font-black text-green-600 uppercase tracking-tighter">Lokall</p>
                      <p className="text-xl font-black text-slate-900">₹{item.offline}</p>
                    </div>
                  </div>
                </div>
              </div>
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
