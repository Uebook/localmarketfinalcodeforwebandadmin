'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const notifications = [
    { id: '1', title: 'New enquiry received', message: 'You have a new enquiry from a customer', time: '2 hours ago', read: false },
    { id: '2', title: 'Review received', message: 'A customer left a 5-star review', time: '1 day ago', read: true },
    { id: '3', title: 'Offer ending soon', message: 'Your promotional offer ends in 2 days', time: '2 days ago', read: true },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-orange-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 bg-white rounded-lg shadow-sm ${!notification.read ? 'border-l-4 border-orange-500' : ''
                }`}
            >
              <h3 className="font-semibold mb-1 text-gray-900">{notification.title}</h3>
              <p className="text-gray-900 text-sm mb-2">{notification.message}</p>
              <p className="text-gray-900 text-xs">{notification.time}</p>
            </div>
          ))}
        </div>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => {
          setIsSidebarOpen(false);
          if (tab === 'home') router.push('/');
        }}
        userRole="customer"
      />
    </div>
  );
}

