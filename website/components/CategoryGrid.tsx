'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { ShoppingBag, Smartphone, Shirt, Pill, Zap, Home, Headphones, Trophy, Apple, Droplet, Gift, Camera, Music, Activity, Gamepad, Car, Bike, Palette, Square, Layers, Bed, Image, Sun, Utensils, Box, Star, Package, Heart, Leaf, Eye, Monitor, ChevronDown, ChevronUp } from 'lucide-react';
import { ALL_CATEGORIES, TOP_9_CATEGORIES } from '@/lib/categories';

interface CategoryGridProps {
  onCategorySelect: (categoryName: string) => void;
  variant?: 'light' | 'dark';
  showAll?: boolean;
  categories?: any[];
}

const iconMap: Record<string, any> = {
  ShoppingBag, Smartphone, Shirt, Pill, Zap, Home,
  FileText: Headphones,
  Tool: Trophy,
  Apple, Droplet, Gift, Camera, Music, Activity, Gamepad, Car, Bike,
  Circle: Square,
  Palette, Square, Layers, Bed, Image, Sun, Utensils, Box, Star, Package, Heart, Leaf, Eye, Monitor,
  Drumstick: Gift,
  Fish: Droplet,
  Sparkles: Star,
  Wind: Activity,
  Gem: Star,
  Footprints: Activity,
  Toy: Gift,
  Briefcase: Box,
  Clock: Activity,
};

// Subtle colored icon backgrounds per category index
const iconColors = [
  { bg: 'bg-orange-50', text: 'text-orange-500' },
  { bg: 'bg-blue-50', text: 'text-blue-500' },
  { bg: 'bg-green-50', text: 'text-green-600' },
  { bg: 'bg-purple-50', text: 'text-purple-500' },
  { bg: 'bg-rose-50', text: 'text-rose-500' },
  { bg: 'bg-amber-50', text: 'text-amber-500' },
  { bg: 'bg-teal-50', text: 'text-teal-600' },
  { bg: 'bg-indigo-50', text: 'text-indigo-500' },
];

export default function CategoryGrid({ onCategorySelect, variant = 'light', showAll: initialShowAll = false, categories }: CategoryGridProps) {
  const [isExpanded, setIsExpanded] = useState(initialShowAll);
  const router = useRouter();

  const handleCategoryClick = (categoryName: string) => {
    // Slugify category name for pretty URLs
    const slug = categoryName.toLowerCase()
      .replace(/ \/ /g, '-')
      .replace(/ & /g, '-')
      .replace(/ /g, '-');

    router.push(`/${slug}`);
    if (onCategorySelect) {
      onCategorySelect(categoryName);
    }
  };

  const baseCategories = categories || ALL_CATEGORIES;
  const categoriesToShow = isExpanded
    ? baseCategories
    : baseCategories.slice(0, 9);

  const isDark = variant === 'dark';

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
        {categoriesToShow.map((category: any, i: number) => {
          const Icon = iconMap[category.iconName] || ShoppingBag;
          const color = iconColors[i % iconColors.length];

          if (isDark) {
            // Dark variant for use on colored backgrounds
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className="group relative flex flex-col items-center justify-center gap-4 p-6 rounded-3xl transition-all duration-400 hover:-translate-y-1 min-h-[170px] overflow-hidden reveal bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="relative p-4 rounded-2xl bg-white/20 text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon size={32} strokeWidth={1.5} />
                </div>
                <span className="text-sm font-bold text-white text-center line-clamp-2 leading-tight">
                  {category.name}
                </span>
              </button>
            );
          }

          // Light variant — premium white card
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.name)}
              className="group relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl min-h-[160px] overflow-hidden reveal bg-white border border-slate-100 shadow-sm"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              {/* Subtle hover gradient overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, var(--primary)08, var(--secondary)06)' }}
              />

              {/* Icon */}
              <div className={`relative z-10 p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${color.bg} ${color.text}`}>
                <Icon size={30} strokeWidth={1.5} />
              </div>

              {/* Label */}
              <div className="relative z-10 text-center">
                <span className="text-sm font-bold text-slate-800 group-hover:text-slate-900 line-clamp-2 leading-tight transition-colors">
                  {category.name}
                </span>
              </div>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-10 rounded-full transition-all duration-400"
                style={{ background: 'var(--primary)' }}
              />
            </button>
          );
        })}
      </div>

      {!initialShowAll && baseCategories.length > 9 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-700 hover:bg-slate-50 hover:border-primary/30 transition-all shadow-sm active:scale-95 group"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={18} className="text-primary" />
                Show Fewer Categories
              </>
            ) : (
              <>
                <ChevronDown size={18} className="text-primary" />
                Explore {baseCategories.length - 9} More Categories
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
