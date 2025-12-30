
import React from 'react';
import { ServiceItem } from '../types';

interface HorizontalSectionProps {
  title: string;
  items: ServiceItem[];
  onItemClick?: (itemName: string) => void;
  containerClass?: string; // New prop for custom styling
}

const HorizontalSection: React.FC<HorizontalSectionProps> = ({ title, items, onItemClick, containerClass }) => {
  return (
    <section className={`py-5 my-3 mx-4 rounded-2xl shadow-md transition-transform hover:scale-[1.005] ${containerClass || 'bg-white'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="px-5 mb-4">
          {/* Changed text color to allow overriding or default to white if on dark bg */}
          <h2 className="text-sm font-extrabold text-white uppercase tracking-widest drop-shadow-sm opacity-90">{title}</h2>
        </div>
        
        <div className="flex overflow-x-auto px-4 pb-2 gap-4 no-scrollbar snap-x">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              onClick={() => onItemClick && onItemClick(item.name)}
              className="flex-shrink-0 w-24 flex flex-col items-center gap-2.5 snap-start group cursor-pointer active:scale-95 transition-transform opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm border-2 border-white/20 group-hover:shadow-lg group-hover:border-white transition-all duration-300">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <span className="text-xs font-bold text-slate-100 text-center line-clamp-2 leading-tight group-hover:text-white transition-colors drop-shadow-sm">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HorizontalSection;
