'use client';

import { useState } from 'react';
import { sendNotification, sendNotificationToTopic } from '@/lib/firebaseAdmin';

// Sample users data
const users = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 9876543210', location: 'Delhi', status: 'Active', joinedDate: '2024-01-15' },
  { id: 2, name: 'Priya Patel', email: 'priya@example.com', phone: '+91 9876543211', location: 'Mumbai', status: 'Active', joinedDate: '2024-02-20' },
  { id: 3, name: 'Amit Kumar', email: 'amit@example.com', phone: '+91 9876543212', location: 'Bangalore', status: 'Inactive', joinedDate: '2024-03-10' },
  { id: 4, name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 9876543213', location: 'Hyderabad', status: 'Active', joinedDate: '2024-04-05' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 9876543214', location: 'Pune', status: 'Inactive', joinedDate: '2024-05-12' },
];

// Sample vendors data
const vendors = [
  { id: 1, name: 'My Awesome Shop', owner: 'John Doe', email: 'john@example.com', phone: '+91 9876543220', location: 'Delhi', status: 'Active', kycStatus: 'Verified' },
  { id: 2, name: 'Quick Mart', owner: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543221', location: 'Mumbai', status: 'Pending', kycStatus: 'Pending' },
  { id: 3, name: 'City Groceries', owner: 'Raj Kumar', email: 'raj@example.com', phone: '+91 9876543222', location: 'Bangalore', status: 'Active', kycStatus: 'Verified' },
  { id: 4, name: 'Tech World', owner: 'Amit Patel', email: 'amit@example.com', phone: '+91 9876543223', location: 'Ahmedabad', status: 'Active', kycStatus: 'Verified' },
  { id: 5, name: 'Fresh Groceries', owner: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 9876543224', location: 'Hyderabad', status: 'Blocked', kycStatus: 'Verified' },
];

const locations = ['All', 'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad'];
const statuses = ['All', 'Active', 'Inactive', 'Pending', 'Blocked'];

export default function SendNotificationForm() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    recipientType: 'all', // 'all', 'users', 'vendors', 'custom'
  });

  const [userFilters, setUserFilters] = useState({
    search: '',
    location: 'All',
    status: 'All',
  });

  const [vendorFilters, setVendorFilters] = useState({
    search: '',
    location: 'All',
    status: 'All',
    kycStatus: 'All',
  });

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(userFilters.search.toLowerCase()) ||
                         user.email.toLowerCase().includes(userFilters.search.toLowerCase());
    const matchesLocation = userFilters.location === 'All' || user.location === userFilters.location;
    const matchesStatus = userFilters.status === 'All' || user.status === userFilters.status;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  // Filter vendors
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(vendorFilters.search.toLowerCase()) ||
                         vendor.owner.toLowerCase().includes(vendorFilters.search.toLowerCase());
    const matchesLocation = vendorFilters.location === 'All' || vendor.location === vendorFilters.location;
    const matchesStatus = vendorFilters.status === 'All' || vendor.status === vendorFilters.status;
    const matchesKyc = vendorFilters.kycStatus === 'All' || vendor.kycStatus === vendorFilters.kycStatus;
    return matchesSearch && matchesLocation && matchesStatus && matchesKyc;
  });

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleVendorToggle = (vendorId) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleSelectAllVendors = () => {
    if (selectedVendors.length === filteredVendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(filteredVendors.map(v => v.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const notification = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        id: Date.now(),
      };

      let response;
      
      if (formData.recipientType === 'all') {
        // Send to all (topic)
        response = await sendNotificationToTopic('all', notification);
      } else if (formData.recipientType === 'users') {
        // Send to selected users
        // In real implementation, you would get FCM tokens for selected users
        response = await sendNotificationToTopic('users', notification);
      } else if (formData.recipientType === 'vendors') {
        // Send to selected vendors
        response = await sendNotificationToTopic('vendors', notification);
      } else {
        // Send to custom selection
        response = await sendNotificationToTopic('custom', notification);
      }

      // Save to history
      const historyItem = {
        id: Date.now(),
        title: formData.title,
        message: formData.message,
        type: formData.type,
        recipientType: formData.recipientType,
        recipients: formData.recipientType === 'users' ? selectedUsers.length :
                   formData.recipientType === 'vendors' ? selectedVendors.length : 'All',
        sentAt: new Date().toISOString(),
        status: 'Sent',
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
      existingHistory.unshift(historyItem);
      localStorage.setItem('notificationHistory', JSON.stringify(existingHistory));

      setResult({ success: true, message: 'Notification sent successfully!' });
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'info',
        recipientType: 'all',
      });
      setSelectedUsers([]);
      setSelectedVendors([]);
    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Send Notification</h2>

        <div className="space-y-6">
          {/* Notification Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Notification title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Notification message"
              rows={4}
              required
            />
          </div>

          {/* Recipient Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send To <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['all', 'users', 'vendors', 'custom'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, recipientType: type })}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    formData.recipientType === type
                      ? 'gradient-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* User Selection */}
          {formData.recipientType === 'users' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Select Users</h3>
                <button
                  type="button"
                  onClick={handleSelectAllUsers}
                  className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                >
                  {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* User Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userFilters.search}
                  onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <select
                  value={userFilters.location}
                  onChange={(e) => setUserFilters({ ...userFilters, location: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <select
                  value={userFilters.status}
                  onChange={(e) => setUserFilters({ ...userFilters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* User List */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email} • {user.location}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Selected: {selectedUsers.length} user(s)
              </p>
            </div>
          )}

          {/* Vendor Selection */}
          {formData.recipientType === 'vendors' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Select Vendors</h3>
                <button
                  type="button"
                  onClick={handleSelectAllVendors}
                  className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                >
                  {selectedVendors.length === filteredVendors.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Vendor Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={vendorFilters.search}
                  onChange={(e) => setVendorFilters({ ...vendorFilters, search: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <select
                  value={vendorFilters.location}
                  onChange={(e) => setVendorFilters({ ...vendorFilters, location: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <select
                  value={vendorFilters.status}
                  onChange={(e) => setVendorFilters({ ...vendorFilters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select
                  value={vendorFilters.kycStatus}
                  onChange={(e) => setVendorFilters({ ...vendorFilters, kycStatus: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="All">All KYC</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* Vendor List */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredVendors.map((vendor) => (
                  <label
                    key={vendor.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedVendors.includes(vendor.id)}
                      onChange={() => handleVendorToggle(vendor.id)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                      <div className="text-xs text-gray-500">{vendor.owner} • {vendor.location}</div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        vendor.status === 'Active' ? 'bg-green-100 text-green-800' :
                        vendor.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {vendor.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        vendor.kycStatus === 'Verified' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vendor.kycStatus}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Selected: {selectedVendors.length} vendor(s)
              </p>
            </div>
          )}

          {/* Custom Selection (Both Users and Vendors) */}
          {formData.recipientType === 'custom' && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Select Users</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userFilters.search}
                    onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <select
                    value={userFilters.location}
                    onChange={(e) => setUserFilters({ ...userFilters, location: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <select
                    value={userFilters.status}
                    onChange={(e) => setUserFilters({ ...userFilters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Select Vendors</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={vendorFilters.search}
                    onChange={(e) => setVendorFilters({ ...vendorFilters, search: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <select
                    value={vendorFilters.location}
                    onChange={(e) => setVendorFilters({ ...vendorFilters, location: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <select
                    value={vendorFilters.status}
                    onChange={(e) => setVendorFilters({ ...vendorFilters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select
                    value={vendorFilters.kycStatus}
                    onChange={(e) => setVendorFilters({ ...vendorFilters, kycStatus: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="All">All KYC</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredVendors.map((vendor) => (
                    <label
                      key={vendor.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(vendor.id)}
                        onChange={() => handleVendorToggle(vendor.id)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                        <div className="text-xs text-gray-500">{vendor.owner}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Selected: {selectedUsers.length} user(s) and {selectedVendors.length} vendor(s)
              </p>
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-lg ${
              result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {result.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (formData.recipientType === 'users' && selectedUsers.length === 0) ||
                     (formData.recipientType === 'vendors' && selectedVendors.length === 0) ||
                     (formData.recipientType === 'custom' && selectedUsers.length === 0 && selectedVendors.length === 0)}
            className="w-full gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  );
}



