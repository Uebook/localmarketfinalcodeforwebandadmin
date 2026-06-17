'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

interface CheapestMarketCardProps {
  city: string;
  circle: string;
  onLocationChange: () => void;
}

export default function CheapestMarketCard({ city, circle, onLocationChange }: CheapestMarketCardProps) {
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState({
    name: circle || city || 'Your Market',
    city: city || 'Local',
    shopsCount: 120,
    avgSavings: 150,
    trendingDeals: 240,
  });

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      if (!circle && !city) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/market?name=${encodeURIComponent(circle || city)}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data.success) {
            setMarketData({
              name: circle || city || 'Your Market',
              city: city || 'Local',
              shopsCount: data.market.vendorCount || 45,
              avgSavings: data.market.productCount > 0 ? 180 : 120,
              trendingDeals: data.market.productCount || 85,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching market stats:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [city, circle]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex items-center justify-center gap-3 min-h-[200px]">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        <span className="text-slate-400 font-bold text-sm">Fetching market statistics...</span>
      </div>
    );
  }

  const exploreUrl = circle && circle !== city 
    ? `/market/${encodeURIComponent(circle)}` 
    : `/search?q=all`;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-8 overflow-hidden relative">
      <div className="flex-1 space-y-4">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-md">
            YOUR CURRENT MARKET
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {marketData.name}
          </h2>
          <p className="text-slate-500 font-bold text-sm mt-0.5">{marketData.city}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">Live</span>
          </div>
          <span className="text-xs font-bold text-slate-500">{marketData.shopsCount}+ shops active</span>
        </div>

        <div className="flex gap-6 py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100">
              <Briefcase size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Avg. savings</p>
              <p className="text-sm font-black text-slate-800 leading-none">₹{marketData.avgSavings}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Trending deals</p>
              <p className="text-sm font-black text-slate-800 leading-none">{marketData.trendingDeals}+</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href={exploreUrl}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-100 active:scale-95 transition-all"
          >
            <span>Explore Market</span>
            <ArrowRight size={14} />
          </Link>
          
          <button
            onClick={onLocationChange}
            className="flex items-center gap-1.5 text-xs font-black text-blue-600 hover:underline uppercase tracking-wider"
          >
            <MapPin size={14} />
            Change Location
          </button>
        </div>
      </div>

      {/* Map Pin Graphic */}
      <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center border-2 border-white shadow-inner relative flex-shrink-0">
        <div className="w-24 h-24 bg-blue-100/60 rounded-full flex items-center justify-center border-2 border-white">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg shadow-blue-100">
            <MapPin size={32} className="text-blue-500 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
