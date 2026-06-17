'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useLocation } from '@/lib/hooks';
import { ArrowLeft, Target, Loader2, Sparkles, MapPin, ClipboardList, Package, CircleDollarSign, PlusCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

export default function PostRequirementPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { location: locationState, detectLocation } = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [radius, setRadius] = useState(5);
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const rawUser = localStorage.getItem('localmarket_user');
    if (!rawUser) {
      router.push('/login?redirect=/requirements/post');
      return;
    }

    // Set initial location from hook
    if (locationState.city) {
      setLocationName(locationState.city);
      setLat(locationState.lat);
      setLng(locationState.lng);
    }

    // Load categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategory(data.categories[0].name);
          }
        }
      })
      .catch(err => console.error('Failed to load categories:', err))
      .finally(() => setLoadingCategories(false));
  }, [locationState.city, locationState.lat, locationState.lng, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const rawUser = localStorage.getItem('localmarket_user');
    if (!rawUser) {
      setError('You must be logged in to post a requirement.');
      return;
    }

    const user = JSON.parse(rawUser);

    if (!title.trim() || !description.trim() || !category) {
      setError('Please fill in all mandatory fields (Title, Description, Category)');
      return;
    }

    if (!lat || !lng) {
      setError('Please allow location access or select a location before posting.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/custom-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category,
          quantity: parseInt(quantity) || 1,
          unit,
          budget_min: budgetMin ? parseFloat(budgetMin) : null,
          budget_max: budgetMax ? parseFloat(budgetMax) : null,
          lat,
          lng,
          location_text: locationName,
          radius_km: radius,
          photos: []
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post requirement');

      setSuccess(true);
      setTimeout(() => {
        router.push('/requirements/my');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 sm:p-10 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Target size={28} className="text-white animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-md">RFQ System</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Post Local Requirement</h1>
              <p className="text-white/80 font-medium text-sm sm:text-base">
                Describe what product or service you need. Local vendors nearby will see your request and send bids directly to you!
              </p>
            </div>
          </div>

          {success ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <Sparkles size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Requirement Posted!</h2>
              <p className="text-slate-500 font-semibold mb-6">Nearby vendors will be notified. Redirecting you to your active requirements...</p>
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-semibold text-sm rounded-2xl">
                  {error}
                </div>
              )}

              {/* Basic Details */}
              <div className="space-y-5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList size={16} /> 1. Requirement Details
                </h3>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Need 50 custom printed t-shirts for event"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={80}
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                  />
                  <span className="block text-right text-xs text-slate-400 mt-1">{title.length}/80 characters</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-slate-800 text-sm bg-white transition-colors"
                    >
                      {loadingCategories ? (
                        <option>Loading...</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Unit</label>
                      <input
                        type="text"
                        placeholder="pcs, kg, liters..."
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your requirement in detail. Include any specifications like size, color, brand, or specific delivery expectations."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors resize-none"
                  />
                  <span className="block text-right text-xs text-slate-400 mt-1">{description.length}/500 characters</span>
                </div>
              </div>

              {/* Budget Details */}
              <div className="space-y-5 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <CircleDollarSign size={16} /> 2. Budget Range (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Min Budget (₹)</label>
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Max Budget (₹)</label>
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-5 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={16} /> 3. Target Area & Location
                </h3>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Location *</label>
                  <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-700 text-sm font-bold">
                      <MapPin size={16} className="text-orange-500" />
                      <span className="truncate">{locationName || 'Location not selected'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => detectLocation()}
                      className="px-4 py-3 bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-wider text-xs rounded-xl transition-all"
                    >
                      Detect
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Search Radius</label>
                    <span className="text-orange-500 text-sm font-black">{radius} KM</span>
                  </div>
                  <div className="flex gap-2 justify-between">
                    {[1, 5, 10, 15, 20].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRadius(val)}
                        className={`flex-1 py-3 text-sm font-black border-2 rounded-xl transition-all ${
                          radius === val
                            ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100'
                            : 'border-slate-100 text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        {val} KM
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-orange-500 text-white font-black uppercase tracking-wider rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      Post Requirement
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => {
          setIsSidebarOpen(false);
          router.push(`/${tab}`);
        }}
        userRole="customer"
      />
    </div>
  );
}
