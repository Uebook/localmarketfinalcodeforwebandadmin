'use client';

import { useState } from 'react';
import UserManagement from './Dashboard/UserManagement';
import SendNotification from './SendNotification';
import ValueFeedback from './FeedbackManagement/ValueFeedback';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const stats = [
  { label: 'Total Vendors', value: '1,245', change: '+12%', icon: '🏪' },
  { label: 'Active Vendors', value: '892', change: '+5%', icon: '✅' },
  { label: 'Pending Approvals', value: '23', change: '-8%', icon: '⏳' },
  { label: 'Total Products', value: '15,678', change: '+18%', icon: '📦' },
  { label: 'Flagged Products', value: '45', change: '+3', icon: '⚠️' },
  { label: 'Daily Searches', value: '8,234', change: '+22%', icon: '🔍' },
  { label: 'Total Users', value: '45,234', change: '+15%', icon: '👥' },
];

// Sample data for search volume trends (last 7 days)
const searchVolumeData = [
  { date: 'Dec 14', searches: 7200 },
  { date: 'Dec 15', searches: 7500 },
  { date: 'Dec 16', searches: 6800 },
  { date: 'Dec 17', searches: 8100 },
  { date: 'Dec 18', searches: 7900 },
  { date: 'Dec 19', searches: 8500 },
  { date: 'Dec 20', searches: 8234 },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'User Management' },
    { id: 'notifications', label: 'Send Notification' },
    { id: 'feedback', label: 'Value Feedback' },
  ];

  return (
    <div className="p-8">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                  <span className={`text-sm font-semibold ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Search Volume Trends */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Search Volume Trends</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={searchVolumeData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: '600' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="searches" 
                    name="Search Volume"
                    stroke="#E86A2C" 
                    strokeWidth={3}
                    dot={{ fill: '#E86A2C', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Vendors with High Views</h3>
              <div className="text-2xl font-bold text-blue-600 mb-1">234</div>
              <p className="text-sm text-gray-600">But low listing completeness</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Most Price Updates</h3>
              <div className="text-2xl font-bold text-orange-600 mb-1">156</div>
              <p className="text-sm text-gray-600">Vendors in last 7 days</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pending Actions</h3>
              <div className="text-2xl font-bold text-red-600 mb-1">23</div>
              <p className="text-sm text-gray-600">Require immediate attention</p>
            </div>
          </div>

          {/* Vendor Performance Insights Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Vendor Performance Insights Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-900 mb-1">High Views, Low Conversions</div>
                <div className="text-2xl font-bold text-blue-600">234</div>
                <div className="text-xs text-blue-700 mt-1">Vendors need pricing/display improvements</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm font-medium text-yellow-900 mb-1">High Demand, Low Views</div>
                <div className="text-2xl font-bold text-yellow-600">156</div>
                <div className="text-xs text-yellow-700 mt-1">Listing quality issues detected</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-900 mb-1">Price Updates Needed</div>
                <div className="text-2xl font-bold text-green-600">89</div>
                <div className="text-xs text-green-700 mt-1">Vendors haven't updated in 30+ days</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm font-medium text-purple-900 mb-1">Low Category Demand</div>
                <div className="text-2xl font-bold text-purple-600">45</div>
                <div className="text-xs text-purple-700 mt-1">Need popular product suggestions</div>
              </div>
            </div>
          </div>

          {/* Interpretation Guidance */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Interpretation Guidance for Admin</h2>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-1">If: Users high + views high + conversions low</p>
                <p className="text-sm text-blue-700">→ Vendor needs to improve pricing / display / offer incentives</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-semibold text-yellow-900 mb-1">If: Users high + category demand high + views low</p>
                <p className="text-sm text-yellow-700">→ Listing quality problem (image, title, relevance) - Admin should guide vendor</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900 mb-1">If: Users low in area</p>
                <p className="text-sm text-green-700">→ Market stage early — Admin should assure & retain vendors</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-semibold text-purple-900 mb-1">If: Category demand low</p>
                <p className="text-sm text-purple-700">→ Admin should suggest additional popular products to vendors</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-900 mb-1">If: Vendor never updates price</p>
                <p className="text-sm text-red-700">→ Users don't trust outdated listings - Admin should notify vendor</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                Review Pending Vendors
              </button>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Check Flagged Products
              </button>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                View Reports
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'notifications' && <SendNotification />}
      {activeTab === 'feedback' && <ValueFeedback />}
    </div>
  );
}
