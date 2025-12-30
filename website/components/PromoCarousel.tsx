'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PROMO_BANNERS } from '@/lib/data';
import { useState } from 'react';
import Image from 'next/image';

export default function PromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length);
  };

  return (
    <div className="relative">
      <div className="relative h-48 rounded-xl overflow-hidden">
        {PROMO_BANNERS.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-1">{banner.title}</h3>
              <p className="text-white/90 mb-3">{banner.subtitle}</p>
              <button className="px-4 py-2 bg-orange-500 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                {banner.ctaText}
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
      >
        <ChevronRight size={20} />
      </button>
      <div className="flex justify-center gap-2 mt-4">
        {PROMO_BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-8 bg-orange-500' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

