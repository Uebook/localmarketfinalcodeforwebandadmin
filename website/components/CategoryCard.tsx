'use client';

import { ShoppingBag, Smartphone, Shirt, Pill, Zap, Home, Headphones, Trophy, Apple, Droplet, Gift, Camera, Music, Activity, Gamepad, Car, Bike, Palette, Square, Layers, Bed, Image, Sun, Utensils, Box, Star, Package, Heart, Leaf, Eye, Monitor } from 'lucide-react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    iconName: string;
  };
  onSelect: (name: string) => void;
}

const iconMap: Record<string, any> = {
  ShoppingBag,
  Smartphone,
  Shirt,
  Pill,
  Zap,
  Home,
  FileText: Headphones,
  Tool: Trophy,
  Apple,
  Droplet,
  Gift,
  Camera,
  Music,
  Activity,
  Gamepad,
  Car,
  Bike,
  Circle: Square,
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

export default function CategoryCard({ category, onSelect }: CategoryCardProps) {
  const Icon = iconMap[category.iconName] || ShoppingBag;

  return (
    <button
      onClick={() => onSelect(category.name)}
      className="flex flex-col items-center gap-3 p-4 sm:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group w-full"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
        <Icon className="text-orange-500" size={28} />
      </div>
      <span className="font-semibold text-gray-900 text-xs sm:text-sm text-center line-clamp-2 break-words px-1 w-full min-h-[2.5rem] flex items-center justify-center">
        {category.name}
      </span>
    </button>
  );
}

