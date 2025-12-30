
import React from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { FEATURED_BUSINESSES } from '../constants';
import { Business } from '../types';

interface FeaturedSectionProps {
  onBusinessClick?: (business: Business) => void;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ onBusinessClick }) => {
  return (
    <section className="py-6 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-red-100 rounded-full">
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Trending & Popular</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURED_BUSINESSES.map((business) => (
            <div 
              key={business.id} 
              onClick={() => onBusinessClick && onBusinessClick(business)}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-row h-32 md:h-40 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-32 md:w-48 h-full relative flex-shrink-0">
                <img 
                  src={business.imageUrl} 
                  alt={business.name} 
                  className="w-full h-full object-cover"
                />
                 {business.isPromoted && (
                  <div className="absolute top-0 left-0 bg-yellow-400 text-[10px] font-bold px-2 py-0.5 text-yellow-900 rounded-br-lg z-10">
                    Ad
                  </div>
                )}
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 line-clamp-1">{business.name}</h3>
                    <div className="flex items-center text-xs font-bold text-slate-700">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                        {business.rating}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{business.category} • {business.reviewCount} reviews</p>
                </div>
                
                <button className="self-start mt-2 text-red-600 text-xs font-bold hover:underline">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
