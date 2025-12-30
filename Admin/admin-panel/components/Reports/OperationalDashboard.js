'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const metrics = [
  { label: 'Total Vendors Onboarded', value: '1,245', trend: '+12%', icon: '🏪' },
  { label: 'Daily Active Vendors', value: '892', trend: '+5%', icon: '✅' },
  { label: 'Total Products Listed', value: '15,678', trend: '+18%', icon: '📦' },
  { label: 'Search Volume (Today)', value: '8,234', trend: '+22%', icon: '🔍' },
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

export default function OperationalDashboard() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{metric.icon}</span>
              <span className="text-sm font-semibold text-green-600">{metric.trend}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
            <div className="text-sm text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Search Volume Trends */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}
