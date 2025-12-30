'use client';

import { useState } from 'react';

const vendors = [
  {
    id: 1,
    name: 'My Awesome Shop',
    owner: 'John Doe',
    status: 'Active',
    kycStatus: 'Verified',
    productCount: 45,
    location: 'Delhi, India',
    joinedDate: '2024-01-15',
    lastActive: '2 hours ago',
  },
  {
    id: 2,
    name: 'Quick Mart',
    owner: 'Jane Smith',
    status: 'Pending',
    kycStatus: 'Pending',
    productCount: 0,
    location: 'Mumbai, India',
    joinedDate: '2024-12-20',
    lastActive: 'Never',
  },
  {
    id: 3,
    name: 'City Groceries',
    owner: 'Raj Kumar',
    status: 'Blocked',
    kycStatus: 'Verified',
    productCount: 120,
    location: 'Bangalore, India',
    joinedDate: '2023-11-10',
    lastActive: '5 days ago',
  },
];

const statusColors = {
  Active: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Blocked: 'bg-red-100 text-red-800',
};

export default function VendorList({ onViewProfile }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVendors = vendors.filter((vendor) => {
    const matchesFilter = filter === 'all' || vendor.status === filter;
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'Active', 'Pending', 'Blocked'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status === 'all' ? 'all' : status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === (status === 'all' ? 'all' : status)
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

      {/* Vendor Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                      <div className="text-sm text-gray-500">{vendor.owner}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[vendor.status]}`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vendor.kycStatus}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.productCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vendor.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewProfile(vendor)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {vendor.status === 'Active' && (
                        <button className="text-red-600 hover:text-red-900">
                          Block
                        </button>
                      )}
                      {vendor.status === 'Blocked' && (
                        <button className="text-green-600 hover:text-green-900">
                          Unblock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



