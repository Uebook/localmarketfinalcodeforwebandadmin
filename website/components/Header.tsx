'use client';

import { Menu, MapPin, ChevronDown, Bell, User, ShoppingBag, LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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

interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function Header({
  locationState = { loading: false, error: null, city: 'Delhi, India' },
  onMenuClick,
  onNotificationClick,
  notificationCount = 2
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load session
  useEffect(() => {
    const raw = localStorage.getItem('localmarket_user');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
    // Listen for storage changes (login/logout from other tabs)
    const onStorage = () => {
      const u = localStorage.getItem('localmarket_user');
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener('storage', onStorage);
    // Also listen for a custom 'authchange' event for same-tab updates
    window.addEventListener('authchange', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('authchange', onStorage);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('localmarket_user');
    setUser(null);
    setMenuOpen(false);
    window.dispatchEvent(new Event('authchange'));
    router.push('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
      ? 'bg-white/80 backdrop-blur-md shadow-lg py-2'
      : 'bg-white border-b border-gray-100 py-4'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Location */}
          <div className="flex items-center gap-6">
            <button
              onClick={onMenuClick}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-all lg:hidden"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                <ShoppingBag className="text-white" size={22} />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors">LOCAL</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl cursor-not-allowed transition-colors">
              <MapPin className="text-primary" size={16} />
              <span className="text-xs font-bold text-slate-600">
                {locationState.loading ? 'Detecting...' : locationState.error ? 'Select Location' : locationState.city || 'Delhi, India'}
              </span>
              <ChevronDown className="text-slate-400" size={14} />
            </div>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-white border border-slate-100 p-1.5 rounded-2xl">
            {[
              { label: 'Home', href: '/' },
              { label: 'Categories', href: '/categories' },
              { label: 'Offers', href: '/offers' },
              { label: 'E-Auction', href: '/eauction' },
              { label: 'Draws', href: '/draws' },
              { label: 'Saved', href: '/saved' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-primary hover:bg-white hover:shadow-sm rounded-xl transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNotificationClick}
              className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>

            {user ? (
              /* Logged‑in user avatar + dropdown */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-slate-800 max-w-24 truncate">{user.name || 'User'}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.phone || user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                    >
                      <LayoutDashboard size={16} className="text-primary" style={{ color: 'var(--primary)' }} />
                      My Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                    >
                      <User size={16} className="text-slate-500" />
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium border-t border-slate-100"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in */
              <>
                <button
                  className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <User size={20} />
                </button>
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-all active:scale-95"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
