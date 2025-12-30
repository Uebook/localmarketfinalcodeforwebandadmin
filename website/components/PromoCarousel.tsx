'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PROMO_BANNERS } from '@/lib/data';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 5000); // Auto-rotate every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length);
  };

  return (
    <div className="relative w-full">
      <div className="relative h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
        {PROMO_BANNERS.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 text-white">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{banner.title}</h3>
              <p className="text-white/90 text-sm sm:text-base md:text-lg mb-4">{banner.subtitle}</p>
              <button className="px-6 py-3 bg-orange-500 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-sm sm:text-base">
                {banner.ctaText}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <button
        onClick={prev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors z-20"
        aria-label="Previous banner"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors z-20"
        aria-label="Next banner"
      >
        <ChevronRight size={20} />
      </button>
      
      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {PROMO_BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 sm:h-2.5 rounded-full transition-all ${
              index === currentIndex 
                ? 'w-8 sm:w-10 bg-orange-500' 
                : 'w-2 sm:w-2.5 bg-gray-400 hover:bg-gray-300'
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
