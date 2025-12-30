'use client';

import NotificationBell from './NotificationBell';

export default function Header({ currentPage, currentSubPage }) {
  return (
    <div 
      className="w-full p-6 text-white"
      style={{
        background: 'linear-gradient(to right, #E86A2C, #4A6CF7)'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">LOCAL</h1>
          <p className="text-base opacity-90">Admin Panel</p>
        </div>
        <div className="flex items-center gap-4">
          {currentPage && (
            <div className="text-right">
              <h2 className="text-2xl font-bold mb-1">{currentPage}</h2>
              {currentSubPage && (
                <p className="text-sm opacity-90">{currentSubPage}</p>
              )}
            </div>
          )}
          <NotificationBell />
        </div>
      </div>
    </div>
  );
}
