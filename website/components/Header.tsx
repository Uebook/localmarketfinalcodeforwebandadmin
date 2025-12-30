'use client';

import { Menu, MapPin, ChevronDown, Bell, User, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface HeaderProps {
  locationState?: {
    loading: boolean;
    error: string | null;
    city: string;
  };
  onMenuClick?: () => void;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
}

export default function Header({ 
  locationState = { loading: false, error: null, city: 'Delhi, India' },
  onMenuClick,
  onProfileClick,
  onNotificationClick,
  notificationCount = 2
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo & Location */}
          <div className="flex items-center gap-6">
            <button 
              onClick={onMenuClick}
              className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-blue-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">LOCAL</span>
            </Link>
            <div className="hidden md:flex items-center gap-2 text-gray-900">
              <MapPin size={16} />
              <span className="text-sm">
                {locationState.loading
                  ? 'Detecting...'
                  : locationState.error
                  ? 'Select Location'
                  : locationState.city || 'Delhi, India'}
              </span>
              <ChevronDown size={16} />
            </div>
          </div>

          {/* Center: Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-gray-900 hover:text-orange-500 font-medium transition-colors">
              Home
            </Link>
            <Link href="/categories" className="text-gray-900 hover:text-orange-500 font-medium transition-colors">
              Categories
            </Link>
            <Link href="/offers" className="text-gray-900 hover:text-orange-500 font-medium transition-colors">
              Offers
            </Link>
            <Link href="/saved" className="text-gray-900 hover:text-orange-500 font-medium transition-colors">
              Saved
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onNotificationClick}
              className="relative p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={22} />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <button 
              onClick={onProfileClick}
              className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User size={22} />
            </button>
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
