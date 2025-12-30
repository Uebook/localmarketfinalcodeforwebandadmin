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
    <div className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer h-[400px] w-full flex flex-col">
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={business.imageUrl}
          alt={business.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {business.isVerified && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white p-1.5 rounded-full">
            <CheckCircle size={16} />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{business.name}</h3>
        <p className="text-gray-900 text-sm mb-3 font-medium">{business.category}</p>
        <div className="flex items-center gap-4 text-sm text-gray-900 mb-3">
          <div className="flex items-center gap-1">
            <Star className="text-yellow-400 fill-yellow-400" size={16} />
            <span className="font-semibold">{business.rating}</span>
            <span className="text-gray-900">({business.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{business.distance}</span>
          </div>
        </div>
        {business.openTime && (
          <div className="flex items-center gap-1 text-sm text-gray-900">
            <Clock size={14} />
            <span>{business.openTime}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick}>
        {CardContent}
      </div>
    );
  }

  return (
    <Link href={`/vendor/${business.id}`}>
      {CardContent}
    </Link>
  );
}

