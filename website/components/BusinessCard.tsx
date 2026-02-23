'use client';

import { MapPin, Star, Clock, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BusinessCardProps {
  business: {
    id: string;
    name: string;
    category: string;
    rating: number;
    reviewCount: number;
    distance: string;
    imageUrl: string;
    address?: string;
    openTime?: string;
    isVerified?: boolean;
  };
  onClick?: () => void;
}

export default function BusinessCard({ business, onClick }: BusinessCardProps) {
  const CardContent = (
    <div className="premium-card rounded-2xl overflow-hidden group h-full flex flex-col bg-white">
      <div className="relative w-full h-48 sm:h-52 overflow-hidden">
        <Image
          src={business.imageUrl}
          alt={business.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {business.isVerified && (
          <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-sm text-white p-1.5 rounded-xl shadow-lg">
            <CheckCircle size={14} strokeWidth={3} />
          </div>
        )}
        <div className="absolute bottom-3 left-3 px-3 py-1 glass-pill rounded-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-white">{business.category}</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-black text-lg text-slate-900 leading-tight group-hover:text-primary transition-colors flex-1 line-clamp-1">
            {business.name}
          </h3>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
            <Star className="text-green-600 fill-green-600" size={12} />
            <span className="text-xs font-black text-green-700">{business.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-primary" />
            <span>{business.distance} Away</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>{business.reviewCount} Reviews</span>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-tighter">
            <Clock size={12} className="text-slate-400" />
            <span>{business.openTime || 'Open Now'}</span>
          </div>
          <span className="text-primary text-xs font-black group-hover:translate-x-1 transition-transform">
            DETAILS →
          </span>
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="h-full">
        {CardContent}
      </div>
    );
  }

  return (
    <Link href={`/vendor/${business.id}`} className="h-full block">
      {CardContent}
    </Link>
  );
}

