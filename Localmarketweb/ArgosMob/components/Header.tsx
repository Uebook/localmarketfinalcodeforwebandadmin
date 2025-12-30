
import React from 'react';
import { MapPin, User, Bell, ChevronDown, Menu } from 'lucide-react';
import { GeoLocationState } from '../types';

interface HeaderProps {
  locationState: GeoLocationState;
  onMenuClick: () => void;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  locationState, 
  onMenuClick, 
  onProfileClick,
  onNotificationClick,
  notificationCount = 2
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 bg-gradient-to-r from-orange-600 to-blue-600 transition-all duration-300 pt-[env(safe-area-inset-top)] shadow-lg">
      <div className="w-full px-4 h-16 flex items-center justify-between">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="p-1 text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
            aria-label="Menu"
          >
            <Menu className="w-7 h-7 drop-shadow-sm" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-white tracking-wide leading-none drop-shadow-md">LOCAL</h1>
            
            {/* Location Selector */}
            <button className="flex items-center text-white/90 text-xs font-medium mt-0.5 group hover:text-white transition-colors">
              <MapPin className="w-3 h-3 mr-1 fill-current opacity-90 drop-shadow-sm" />
              <span className="truncate max-w-[120px] sm:max-w-xs drop-shadow-sm">
                {locationState.loading
                  ? 'Detecting...'
                  : locationState.error
                  ? 'Select Location'
                  : locationState.city || 'Delhi, India'}
              </span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-80 group-hover:opacity-100 drop-shadow-sm" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onNotificationClick}
            className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
          >
            <Bell className="w-6 h-6 drop-shadow-sm" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white/50 shadow-sm"></span>
            )}
          </button>
          <button 
            onClick={onProfileClick}
            className="p-0.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors active:scale-95 border border-white/20"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-white/10">
                <User className="w-5 h-5 text-white fill-current drop-shadow-sm" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
