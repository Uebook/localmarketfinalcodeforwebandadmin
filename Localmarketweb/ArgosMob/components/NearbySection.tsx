
import React from 'react';
import { Star, Phone, MapPin, ChevronRight } from 'lucide-react';
import { NEARBY_BUSINESSES } from '../constants';
import { Business } from '../types';

interface NearbySectionProps {
  onBusinessClick?: (business: Business) => void;
}

const NearbySection: React.FC<NearbySectionProps> = ({ onBusinessClick }) => {
  return (
    <section className="py-6 pt-2">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white drop-shadow-md">Shops Near You</h2>
          <button className="text-orange-200 text-sm font-bold flex items-center hover:text-white transition-colors">
            See All <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex overflow-x-auto px-4 pb-4 gap-4 no-scrollbar snap-x">
          {NEARBY_BUSINESSES.map((business, index) => (
            <div 
              key={business.id} 
              onClick={() => onBusinessClick && onBusinessClick(business)}
              // Dark Card Style - Updated to neutral-900
              className="flex-shrink-0 w-72 bg-neutral-900 rounded-xl overflow-hidden border border-white/10 snap-center transition-all hover:scale-[1.01] cursor-pointer shadow-lg opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="relative h-40">
                <img 
                  src={business.imageUrl} 
                  alt={business.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-white flex items-center shadow-sm border border-white/10">
                  <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
                  {business.rating}
                </div>
              </div>

              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-white truncate text-base">{business.name}</h3>
                    <p className="text-xs text-gray-400 truncate">{business.category}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 ml-2">
                     <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-1.5 py-0.5 rounded flex items-center whitespace-nowrap border border-white/10">
                       <MapPin className="w-3 h-3 mr-0.5 text-red-400 fill-current" />
                       {business.distance}
                     </span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button className="flex-1 bg-white/10 text-blue-300 border border-white/10 text-xs font-bold py-2.5 rounded-lg hover:bg-white/20 transition-all shadow-sm">
                    View Details
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Call logic
                    }}
                    className="w-9 h-9 flex items-center justify-center border border-green-900/50 bg-green-900/20 rounded-lg text-green-400 hover:bg-green-900/40 transition-colors"
                  >
                    <Phone className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NearbySection;
