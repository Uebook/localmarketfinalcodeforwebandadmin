
import React, { useState, useEffect, useCallback } from 'react';
import { PROMO_BANNERS } from '../constants';

const PromoCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="py-4 my-2 mx-4">
      <div className="max-w-7xl mx-auto">
        {/* Changed text-slate-800 to text-white */}
        <h2 className="text-lg font-bold text-white mb-4 px-1 drop-shadow-md">Trending & Popular Special Offers</h2>
        <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden shadow-xl border border-white/20 group">
          {PROMO_BANNERS.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-2xl font-bold mb-1 drop-shadow-md">{banner.title}</h3>
                <p className="text-gray-100 text-sm mb-4 drop-shadow-sm font-medium">{banner.subtitle}</p>
                <button className="bg-white/90 text-red-600 px-6 py-2 rounded-full text-sm font-extrabold w-fit hover:bg-white transition-colors shadow-lg backdrop-blur-sm">
                  {banner.ctaText}
                </button>
              </div>
            </div>
          ))}
          
          {/* Indicators */}
          <div className="absolute bottom-4 right-4 z-20 flex gap-2">
            {PROMO_BANNERS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-1.5'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoCarousel;
