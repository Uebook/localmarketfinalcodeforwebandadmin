'use client';

import { ShoppingBag, Smartphone, Shirt, Pill, Zap, Home, Headphones, Trophy } from 'lucide-react';

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
  Headphones,
  Trophy,
};

export default function CategoryCard({ category, onSelect }: CategoryCardProps) {
  const Icon = iconMap[category.iconName] || ShoppingBag;

  return (
    <button
      onClick={() => onSelect(category.name)}
      className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="text-orange-500" size={28} />
      </div>
      <span className="font-semibold text-gray-900 text-sm">{category.name}</span>
    </button>
  );
}

