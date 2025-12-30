'use client';

import { useState } from 'react';

const users = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 9876543210',
    location: 'Delhi, India',
    joinedDate: '2024-01-15',
    lastActive: '2 hours ago',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '+91 9876543211',
    location: 'Mumbai, India',
    joinedDate: '2024-02-20',
    lastActive: '1 day ago',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Amit Kumar',
    email: 'amit@example.com',
    phone: '+91 9876543212',
    location: 'Bangalore, India',
    joinedDate: '2024-03-10',
    lastActive: '5 days ago',
    status: 'Inactive',
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    phone: '+91 9876543213',
    location: 'Hyderabad, India',
    joinedDate: '2024-04-05',
    lastActive: '3 hours ago',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '+91 9876543214',
    location: 'Pune, India',
    joinedDate: '2024-05-12',
    lastActive: '1 week ago',
    status: 'Inactive',
  },
];

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <div className="space-y-6">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to User List
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedUser.name}</h2>
              <p className="text-gray-600">{selectedUser.email}</p>
            </div>
            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
              selectedUser.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {selectedUser.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
              <p className="text-gray-900 font-medium">{selectedUser.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
              <p className="text-gray-900 font-medium">{selectedUser.location}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Joined Date</label>
              <p className="text-gray-900 font-medium">{selectedUser.joinedDate}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Active</label>
              <p className="text-gray-900 font-medium">{selectedUser.lastActive}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'Active', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status === 'all' ? 'all' : status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === (status === 'all' ? 'all' : status)
                    ? 'gradient-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.joinedDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.lastActive}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total Users</div>
          <div className="text-3xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Active Users</div>
          <div className="text-3xl font-bold text-green-600">
            {users.filter(u => u.status === 'Active').length}
          </div>
        </div>
      </div>
    </div>
  );
}
