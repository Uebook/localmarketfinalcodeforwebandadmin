'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface CircleItem {
  id: string;
  name: string;
  town?: string;
  city?: string;
  shops?: number;
  icon?: string;
  imageUrl?: string;
  color?: string;
  emoji?: string;
}

interface NearbyCirclesSectionProps {
  circles: CircleItem[];
  loading: boolean;
}

export default function NearbyCirclesSection({ circles, loading }: NearbyCirclesSectionProps) {
  if (loading) {
    return (
      <div className="py-8 text-center text-slate-400 font-bold text-sm">
        Loading nearby circles...
      </div>
    );
  }

  if (circles.length === 0) {
    return null;
  }

  // Preset gradients and emojis for circles
  const gradientPresets = [
    { color: 'from-orange-500 to-amber-500', emoji: '🏛️' },
    { color: 'from-blue-600 to-cyan-500', emoji: '🛍️' },
    { color: 'from-emerald-500 to-teal-500', emoji: '🧺' },
    { color: 'from-purple-600 to-pink-500', emoji: '👔' },
    { color: 'from-rose-500 to-orange-400', emoji: '🍔' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
        <h2 className="text-xl font-black text-slate-900 tracking-tight">📍 Nearby Market Circles</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {circles.map((circle, index) => {
          const preset = gradientPresets[index % gradientPresets.length];
          const colorClass = circle.color || preset.color;
          const emoji = circle.emoji || preset.emoji;

          return (
            <Link
              key={circle.id || circle.name}
              href={`/market/${encodeURIComponent(circle.name)}`}
              className={`block relative overflow-hidden rounded-3xl bg-gradient-to-r ${colorClass} shadow-lg shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 cursor-pointer`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                    {circle.town || circle.city || 'LOCAL AREA'}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1 mb-1 tracking-tight">
                    {circle.name}
                  </h3>
                  <p className="text-white/80 font-bold text-xs">
                    {circle.shops !== undefined ? (
                      circle.shops === 0 ? '0 Active Stores' : `${circle.shops}+ Active Stores`
                    ) : '10+ Active Stores'}
                  </p>
                  
                  <div className="mt-4 inline-flex items-center gap-1 bg-white/20 border border-white/30 rounded-full px-3 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    <span>Explore Area</span>
                    <ChevronRight size={10} />
                  </div>
                </div>
                
                <span className="text-5xl opacity-20 select-none">{emoji}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
