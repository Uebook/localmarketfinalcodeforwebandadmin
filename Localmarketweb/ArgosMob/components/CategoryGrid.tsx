
import React from 'react';
import { 
  ShoppingBag, Smartphone, Shirt, Pill, Zap, 
  Home, Headphones, Trophy
} from 'lucide-react';
import { CATEGORIES } from '../constants';

// Map icon strings to components
const IconMap: Record<string, React.ElementType> = {
  ShoppingBag, Smartphone, Shirt, Pill, Zap,
  Home, Headphones, Trophy
};

// Map categories to specific gradients
const colorMap: Record<string, string> = {
  'Groceries': 'from-orange-400 to-red-500',
  'Electronics': 'from-blue-500 to-purple-600',
  'Clothing': 'from-sky-400 to-blue-500',
  'Medicines': 'from-pink-400 to-rose-500',
  'Appliances': 'from-yellow-400 to-amber-500',
  'Home': 'from-emerald-400 to-teal-600',
  'Accessories': 'from-cyan-400 to-blue-500',
  'Sports': 'from-indigo-500 to-violet-600',
};

interface CategoryGridProps {
  onCategorySelect?: (categoryName: string) => void;
  variant?: 'light' | 'dark';
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategorySelect, variant = 'light' }) => {
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-4 gap-4">
        {CATEGORIES.map((cat, index) => {
          const IconComponent = IconMap[cat.iconName] || Home;
          const gradientClass = colorMap[cat.name] || 'from-gray-400 to-gray-600';
          
          // Updated to white text for visibility on vibrant background
          // When variant is dark (e.g. category page), stick to dark text or handle appropriately, 
          // but for home screen (default light variant logic in parent), we need white.
          const textColorClass = variant === 'dark' ? 'text-slate-800' : 'text-white';

          return (
            <button 
              key={cat.id} 
              onClick={() => onCategorySelect && onCategorySelect(cat.name)}
              className="flex flex-col items-center justify-start gap-2 group opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div 
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white shadow-lg shadow-black/10 hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95 border border-white/20`}
              >
                <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-md" strokeWidth={2} />
              </div>
              <span className={`text-[11px] sm:text-xs font-bold ${textColorClass} text-center leading-tight tracking-wide drop-shadow-md`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGrid;
