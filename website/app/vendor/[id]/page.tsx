'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { NEARBY_BUSINESSES } from '@/lib/data';
import { INITIAL_VENDOR_DATA } from '@/lib/constants';
import {
  MapPin, Star, Phone, MessageCircle, Heart, Share2, Clock, CheckCircle,
  ArrowLeft, Award, Package, ChevronRight, ShieldCheck, TrendingUp,
  Copy, ExternalLink, BadgeCheck, Users, Zap
} from 'lucide-react';
import Image from 'next/image';
import EnquiryModal from '@/components/EnquiryModal';

export default function VendorDetailsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const params = useParams();
  const router = useRouter();

  const business = NEARBY_BUSINESSES.find(b => b.id === params.id) || INITIAL_VENDOR_DATA;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products & Services' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'info', label: 'Contact Info' },
  ];

  const handleCall = () => {
    const phone = (business as any).contactNumber;
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = () => {
    const phone = (business as any).whatsappNumber || (business as any).contactNumber;
    if (phone) window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(business.address || '');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: business.name, text: `Check out ${business.name}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        locationState={{ loading: false, error: null, city: 'Delhi, India' }}
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ─── LEFT COLUMN ─── */}
          <div className="lg:col-span-8 space-y-5">

            {/* Hero Image */}
            <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden shadow-lg">
              <Image src={business.imageUrl} alt={business.name} fill className="object-cover" />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />

              {/* Top actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`p-3 rounded-2xl backdrop-blur-md border transition-all ${isSaved ? 'bg-red-500 border-red-500 text-white' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                    }`}
                >
                  <Heart className={isSaved ? 'fill-white' : ''} size={18} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md text-white hover:bg-white/30 transition-all"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Business info overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-gradient-primary text-white text-xs font-bold rounded-full">
                    {business.category}
                  </span>
                  {(business as any).isVerified && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                      <BadgeCheck size={12} />
                      Verified
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
                  {business.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-xl text-white">
                    <Star className="fill-yellow-400 text-yellow-400" size={14} />
                    <span className="font-bold text-sm">{business.rating}</span>
                    <span className="text-white/60 text-xs">{business.reviewCount} reviews</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
                    <MapPin size={14} className="text-primary" style={{ color: 'var(--primary)' }} />
                    {business.distance} Away
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-slate-100 px-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all relative flex-shrink-0 ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    style={activeTab === tab.id ? { color: 'var(--primary)' } : {}}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div
                        className="absolute bottom-0 left-5 right-5 h-0.5 rounded-full"
                        style={{ background: 'var(--primary)' }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 sm:p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* About */}
                    <div>
                      <h3 className="text-lg font-black text-slate-900 mb-3">About {business.name}</h3>
                      <p className="text-slate-500 leading-relaxed">
                        {business.about || 'A trusted local service provider committed to quality and customer satisfaction. We take pride in delivering exceptional service to our community.'}
                      </p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Location */}
                      <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin size={20} className="text-orange-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                          <p className="text-slate-800 font-semibold text-sm leading-snug">{business.address}</p>
                          <button
                            onClick={handleCopyAddress}
                            className="mt-2 flex items-center gap-1 text-xs font-bold hover:opacity-80 transition-colors"
                            style={{ color: 'var(--primary)' }}
                          >
                            <Copy size={11} />
                            Copy Address
                          </button>
                        </div>
                      </div>

                      {/* Hours */}
                      <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Clock size={20} className="text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Open Hours</p>
                          <p className="text-slate-800 font-semibold text-sm">{(business as any).openTime || '09:00 AM – 09:00 PM'}</p>
                          <span className="inline-block mt-2 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">Open Now</span>
                        </div>
                      </div>

                      {/* Verification */}
                      <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <ShieldCheck size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                          <p className="text-slate-800 font-semibold text-sm">Verified & Professional</p>
                          <p className="text-xs text-slate-400 mt-1">Background check passed.</p>
                        </div>
                      </div>

                      {/* Popularity */}
                      <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <TrendingUp size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Popularity</p>
                          <p className="text-slate-800 font-semibold text-sm">Elite Rating</p>
                          <p className="text-xs text-slate-400 mt-1">Top 5% in {business.category}.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(business as any).products?.map((product: any) => (
                      <div
                        key={product.id}
                        className="group flex gap-4 bg-slate-50 p-4 rounded-2xl hover:bg-white hover:shadow-md hover:border-slate-100 border border-transparent transition-all"
                      >
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                          <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <h4 className="font-bold text-slate-900 text-base leading-tight truncate">{product.name}</h4>
                          <span className="text-xs text-slate-400 font-medium mt-0.5 truncate">{product.category}</span>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="font-black text-lg" style={{ color: 'var(--primary)' }}>{product.price}</span>
                            {product.mrp && product.mrp !== product.price && (
                              <span className="text-slate-300 text-sm line-through">{product.mrp}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )) || (
                        <div className="col-span-full py-16 text-center text-slate-300">
                          <Package size={48} className="mx-auto mb-3" />
                          <p className="text-sm font-semibold">No products listed yet</p>
                        </div>
                      )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="py-12 text-center text-slate-300">
                    <Star size={48} className="mx-auto mb-3" />
                    <p className="text-sm font-semibold">No reviews yet. Be the first!</p>
                  </div>
                )}

                {activeTab === 'info' && (
                  <div className="space-y-4">
                    {[
                      { icon: Phone, label: 'Phone', value: (business as any).contactNumber || 'Not provided', action: handleCall, color: 'bg-green-50 text-green-600' },
                      { icon: MessageCircle, label: 'WhatsApp', value: (business as any).whatsappNumber || (business as any).contactNumber || 'Not provided', action: handleWhatsApp, color: 'bg-green-50 text-green-600' },
                      { icon: MapPin, label: 'Address', value: business.address, action: handleCopyAddress, color: 'bg-orange-50 text-orange-500' },
                    ].map(({ icon: Icon, label, value, action, color }) => (
                      <button
                        key={label}
                        onClick={action}
                        className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-2xl text-left transition-all group"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                          <p className="text-slate-800 font-semibold text-sm truncate">{value}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">

              {/* Book Service Card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-base font-black text-slate-900 mb-4">Book Service</h3>

                <div className="space-y-3">
                  {/* Call */}
                  <button
                    onClick={handleCall}
                    className="w-full flex items-center gap-3 px-4 py-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group text-left"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-shadow">
                      <Phone size={18} className="text-slate-600" />
                    </div>
                    <span className="flex-1 font-bold text-slate-800 text-sm">Call Vendor</span>
                    <ChevronRight size={16} className="text-slate-300" />
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={handleWhatsApp}
                    className="w-full flex items-center gap-3 px-4 py-3.5 bg-green-50 hover:bg-green-100 rounded-2xl transition-all group text-left"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageCircle size={18} className="text-white" />
                    </div>
                    <span className="flex-1 font-bold text-green-800 text-sm">WhatsApp Message</span>
                    <ChevronRight size={16} className="text-green-400" />
                  </button>

                  {/* Divider */}
                  <div className="border-t border-slate-100 my-1" />

                  {/* Enquiry CTA */}
                  <button
                    onClick={() => setIsEnquiryModalOpen(true)}
                    className="w-full py-3.5 bg-gradient-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all active:scale-95 shadow-md"
                  >
                    Direct Enquiry
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Star, value: business.rating, label: 'Rating', color: 'text-amber-500' },
                  { icon: Users, value: `${business.reviewCount}+`, label: 'Reviews', color: 'text-blue-500' },
                  { icon: Zap, value: '< 1hr', label: 'Response', color: 'text-green-500' },
                ].map(({ icon: Icon, value, label, color }) => (
                  <div key={label} className="bg-white rounded-2xl p-3 text-center border border-slate-100 shadow-sm">
                    <Icon size={18} className={`${color} mx-auto mb-1`} />
                    <p className="text-base font-black text-slate-900">{value}</p>
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                  </div>
                ))}
              </div>

              {/* Trust Badge */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Award size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trust Policy</p>
                    <p className="text-sm font-black text-slate-900">Purchase Protection</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Connect through us for premium support and guaranteed service quality.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-400">+150 Happy Customers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onNavigate={() => { }} userRole="customer" />
      {isEnquiryModalOpen && (
        <EnquiryModal isOpen={isEnquiryModalOpen} onClose={() => setIsEnquiryModalOpen(false)} businessName={business.name} />
      )}
    </div>
  );
}

