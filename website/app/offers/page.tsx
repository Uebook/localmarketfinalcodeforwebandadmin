'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { NEARBY_BUSINESSES } from '@/lib/data';
import { Tag, Copy, Store, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function OffersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  // Get all offers from businesses
  const allOffers = NEARBY_BUSINESSES.flatMap((business) =>
    business.offers.map((offer) => ({ ...offer, business }))
  );

  const getOfferColor = (color: string) => {
    if (!color) return 'bg-blue-500';
    if (color.includes('purple')) return 'bg-purple-500';
    if (color.includes('blue')) return 'bg-blue-500';
    if (color.includes('red')) return 'bg-red-500';
    if (color.includes('green')) return 'bg-green-500';
    if (color.includes('orange')) return 'bg-orange-500';
    return 'bg-blue-500';
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
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 bg-orange-500 rounded" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Offers & Deals</h1>
          </div>
          <p className="text-gray-900 ml-3">Curated offers from local vendors nearby</p>
        </div>

        {/* Grid View */}
        {allOffers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {allOffers.map((offer) => (
              <Link
                key={offer.id}
                href={`/vendor/${offer.business.id}`}
                className="group"
              >
                <div className={`${getOfferColor(offer.color)} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col`}>
                  {/* Business Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={offer.business.imageUrl}
                      alt={offer.business.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg">
                        <Store size={14} className="text-white" />
                        <span className="text-white text-xs font-medium">{offer.business.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Offer Content */}
                  <div className="p-4 sm:p-6 text-white flex-1 flex flex-col">
                    <div className="mb-3">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">{offer.title}</h3>
                      <p className="text-white/90 text-sm sm:text-base">{offer.description}</p>
                    </div>

                    {/* Discount Badge */}
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg">
                        <Tag size={18} />
                        <span className="font-mono font-bold text-lg">{offer.code}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            navigator.clipboard.writeText(offer.code);
                            alert('Coupon code copied!');
                          }}
                          className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Redeem Button */}
                    <button className="mt-auto w-full py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                      <span>Redeem Now</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Tag className="text-gray-300 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Offers Available</h3>
            <p className="text-gray-900">Check back later for exciting deals!</p>
          </div>
        )}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => {
          setIsSidebarOpen(false);
          if (tab === 'home') router.push('/');
        }}
        userRole="customer"
      />
    </div>
  );
}
