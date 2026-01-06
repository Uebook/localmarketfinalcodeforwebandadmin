'use client';

import { ShoppingBag, Smartphone, Shirt, Pill, Zap, Home, Headphones, Trophy, Apple, Droplet, Gift, Camera, Music, Activity, Gamepad, Car, Bike, Palette, Square, Layers, Bed, Image, Sun, Utensils, Box, Star, Package, Heart, Leaf, Eye, Monitor } from 'lucide-react';
import { ALL_CATEGORIES, TOP_8_CATEGORIES } from '@/lib/categories';

interface CategoryGridProps {
  onCategorySelect: (categoryName: string) => void;
  variant?: 'light' | 'dark';
}

const iconMap: Record<string, any> = {
  ShoppingBag,
  Smartphone,
  Shirt,
  Pill,
  Zap,
  Home,
  FileText: Headphones, // Fallback
  Tool: Trophy, // Fallback
  Apple,
  Droplet,
  Gift,
  Camera,
  Music,
  Activity,
  Gamepad,
  Car,
  Bike,
  Circle: Square, // Fallback
  Palette,
  Square,
  Layers,
  Bed,
  Image,
  Sun,
  Utensils,
  Box,
  Star,
  Package,
  Heart,
  Leaf,
  Eye,
  Monitor,
  Drumstick: Gift, // Fallback
  Fish: Droplet, // Fallback
  Sparkles: Star, // Fallback
  Wind: Activity, // Fallback
  Gem: Star, // Fallback
  Footprints: Activity, // Fallback
  Toy: Gift, // Fallback
  Briefcase: Box, // Fallback
  Clock: Activity, // Fallback
};

export default function CategoryGrid({ onCategorySelect, variant = 'light', showAll = false }: CategoryGridProps & { showAll?: boolean }) {
  const isDark = variant === 'dark';
  const categoriesToShow = showAll ? ALL_CATEGORIES : TOP_8_CATEGORIES;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8">
      {categoriesToShow.map((category) => {
        const Icon = iconMap[category.iconName] || ShoppingBag;
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.name)}
            className={`flex flex-col items-center justify-center gap-4 sm:gap-5 p-6 sm:p-8 md:p-10 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl min-h-[180px] sm:min-h-[200px] md:min-h-[220px] ${
              isDark 
                ? 'bg-black/40 backdrop-blur-md border-2 border-white/20 hover:bg-black/50' 
                : 'bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/20'
            }`}
          >
            <div className={`p-4 sm:p-5 md:p-6 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-white/20'}`}>
              <Icon className={isDark ? 'text-white' : 'text-white'} size={48} />
            </div>
            <span className={`text-base sm:text-lg md:text-xl font-bold text-center line-clamp-2 break-words px-2 ${isDark ? 'text-white' : 'text-white'}`}>
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
