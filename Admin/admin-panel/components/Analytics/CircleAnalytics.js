'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CircleAnalytics() {
  const [selectedCircle, setSelectedCircle] = useState('Connaught Place');
  
  const circles = ['Connaught Place', 'Saket', 'Vasant Kunj', 'Chandni Chowk'];
  
  const categoryDemandData = [
    { category: 'Groceries', searches: 2340, purchases: 890, contacts: 1200 },
    { category: 'Electronics', searches: 1890, purchases: 450, contacts: 780 },
    { category: 'Clothing', searches: 1560, purchases: 320, contacts: 650 },
    { category: 'Medicines', searches: 2100, purchases: 980, contacts: 1100 },
    { category: 'Appliances', searches: 980, purchases: 210, contacts: 450 },
  ];

  const circleUserLimits = [
    { circle: 'Connaught Place', maxUsers: 5000, currentUsers: 4234, percentage: 84.7 },
    { circle: 'Saket', maxUsers: 3000, currentUsers: 2890, percentage: 96.3 },
    { circle: 'Vasant Kunj', maxUsers: 2500, currentUsers: 2100, percentage: 84.0 },
    { circle: 'Chandni Chowk', maxUsers: 4000, currentUsers: 3890, percentage: 97.3 },
  ];

  const userEngagement = [
    { circle: 'Connaught Place', purchases: 2450, contacts: 3200, total: 5650 },
    { circle: 'Saket', purchases: 1890, contacts: 2400, total: 4290 },
    { circle: 'Vasant Kunj', purchases: 1200, contacts: 1800, total: 3000 },
    { circle: 'Chandni Chowk', purchases: 2100, contacts: 2800, total: 4900 },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Circle Analytics</h1>

      {/* Circle Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Circle</label>
        <select
          value={selectedCircle}
          onChange={(e) => setSelectedCircle(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          {circles.map(circle => (
            <option key={circle} value={circle}>{circle}</option>
          ))}
        </select>
      </div>

      {/* Category-wise Max Demanding Products */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Category-wise Max Demanding Products - {selectedCircle}</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={categoryDemandData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="searches" fill="#f97316" name="Searches" />
            <Bar dataKey="purchases" fill="#16a34a" name="Purchases" />
            <Bar dataKey="contacts" fill="#3b82f6" name="Contacts" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Searches</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Purchases</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Contacts</th>
              </tr>
            </thead>
            <tbody>
              {categoryDemandData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm font-semibold">{item.category}</td>
                  <td className="py-3 px-4 text-sm">{item.searches.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm">{item.purchases.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm">{item.contacts.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maximum Users per Circle */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Maximum Users per Circle</h2>
        <div className="space-y-4">
          {circleUserLimits.map((circle, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900">{circle.circle}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  circle.percentage > 90 ? 'bg-red-100 text-red-800' :
                  circle.percentage > 75 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {circle.percentage}% Full
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Current Users: {circle.currentUsers.toLocaleString()}</span>
                  <span>Max Users: {circle.maxUsers.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      circle.percentage > 90 ? 'bg-red-600' :
                      circle.percentage > 75 ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${circle.percentage}%` }}
                  />
                </div>
              </div>
              <button className="text-sm text-orange-600 hover:text-orange-700 font-semibold">
                Update Limit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* User Engagement Tracking */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">User Engagement (Purchases/Contacts)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={userEngagement}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="circle" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="purchases" fill="#16a34a" name="Purchases" />
            <Bar dataKey="contacts" fill="#3b82f6" name="Contacts" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
