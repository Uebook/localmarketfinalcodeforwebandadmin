'use client';

import { useState } from 'react';

const topSearches = [
  { product: 'Rice', count: 1234, location: 'Delhi', trend: '+15%' },
  { product: 'Mobile Phone', count: 987, location: 'Mumbai', trend: '+8%' },
  { product: 'Vegetables', count: 856, location: 'Bangalore', trend: '+22%' },
  { product: 'Laptop', count: 743, location: 'Delhi', trend: '+5%' },
  { product: 'Milk', count: 692, location: 'Mumbai', trend: '+18%' },
];

export default function SearchReports() {
  const [filterLocation, setFilterLocation] = useState('all');

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Location</label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Locations</option>
              <option value="delhi">Delhi</option>
              <option value="mumbai">Mumbai</option>
              <option value="bangalore">Bangalore</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Top Searched Products */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Highest Searched Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Search Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topSearches.map((search, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{search.product}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{search.count.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{search.location}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-green-600">{search.trend}</span>
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



