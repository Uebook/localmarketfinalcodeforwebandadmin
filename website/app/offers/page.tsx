'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { NEARBY_BUSINESSES } from '@/lib/data';
import { Tag, Copy, Store, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function OffersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchOffers() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/festive-offers');
        if (res.ok) {
          const data = await res.json();
          // Transform festive offers to match the UI format
          const transformedOffers = data.map((offer: any) => {
            // Find a business if vendor_ids is present
            let business = null;
            if (offer.vendor_ids && offer.vendor_ids.length > 0) {
              business = NEARBY_BUSINESSES.find(b => b.id === offer.vendor_ids[0]);
            }

            return {
              id: offer.id,
              title: offer.title,
              description: offer.description,
              code: offer.discount_percent ? `${offer.discount_percent}% OFF` : 'FESTIVE',
              color: 'bg-gradient-primary', // Use theme gradient
              business: business || {
                name: 'Local Market',
                imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
              }
            };
          });
          setOffers(transformedOffers);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOffers();
  }, []);

  const getOfferColor = (color: string) => {
    return 'bg-gradient-primary'; // Force theme gradient for all
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 bg-primary rounded" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Offers & Deals</h1>
          </div>
          <p className="text-gray-900 ml-3">Curated offers from local vendors nearby</p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Fetching best deals for you...</p>
          </div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {offers.map((offer) => (
              <Link
                key={offer.id}
                href={offer.business?.id ? `/vendor/${offer.business.id}` : '#'}
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
