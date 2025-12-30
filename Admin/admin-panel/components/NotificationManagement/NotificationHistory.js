'use client';

import { useState, useEffect } from 'react';

export default function NotificationHistory() {
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    type: 'All',
    recipientType: 'All',
    dateRange: 'All',
  });

  useEffect(() => {
    // Load history from localStorage
    const storedHistory = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
    setHistory(storedHistory);
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         item.message.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === 'All' || item.type === filters.type.toLowerCase();
    const matchesRecipient = filters.recipientType === 'All' || item.recipientType === filters.recipientType.toLowerCase();
    
    let matchesDate = true;
    if (filters.dateRange !== 'All') {
      const itemDate = new Date(item.sentAt);
      const now = new Date();
      const diffDays = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
      
      if (filters.dateRange === 'Today' && diffDays !== 0) matchesDate = false;
      if (filters.dateRange === 'Last 7 days' && diffDays > 7) matchesDate = false;
      if (filters.dateRange === 'Last 30 days' && diffDays > 30) matchesDate = false;
    }
    
    return matchesSearch && matchesType && matchesRecipient && matchesDate;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getRecipientTypeLabel = (type) => {
    switch (type) {
      case 'all':
        return 'All Users & Vendors';
      case 'users':
        return 'Users';
      case 'vendors':
        return 'Vendors';
      case 'custom':
        return 'Custom Selection';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Notification History</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search notifications..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="All">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <select
            value={filters.recipientType}
            onChange={(e) => setFilters({ ...filters, recipientType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="All">All Recipients</option>
            <option value="all">All</option>
            <option value="users">Users</option>
            <option value="vendors">Vendors</option>
            <option value="custom">Custom</option>
          </select>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">No notifications sent yet</p>
            <p className="text-sm mt-2">Notifications you send will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredHistory.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">
                    {getNotificationIcon(item.type)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'Sent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{item.message}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>
                        <span className="font-medium">Type:</span> {item.type}
                      </span>
                      <span>
                        <span className="font-medium">Recipients:</span> {getRecipientTypeLabel(item.recipientType)}
                        {typeof item.recipients === 'number' && ` (${item.recipients})`}
                      </span>
                      <span>
                        <span className="font-medium">Sent:</span> {formatDate(item.sentAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredHistory.length}</div>
              <div className="text-sm text-gray-600">Total Notifications</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredHistory.filter(h => h.status === 'Sent').length}
              </div>
              <div className="text-sm text-gray-600">Sent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredHistory.filter(h => h.recipientType === 'all').length}
              </div>
              <div className="text-sm text-gray-600">Broadcast</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredHistory.filter(h => h.recipientType === 'users' || h.recipientType === 'vendors').length}
              </div>
              <div className="text-sm text-gray-600">Targeted</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



