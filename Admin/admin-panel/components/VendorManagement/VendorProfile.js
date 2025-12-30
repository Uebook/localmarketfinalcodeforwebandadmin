'use client';

import { useState } from 'react';

export default function VendorProfile({ vendor, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock performance data
  const performanceData = {
    totalUsers1KM: 1240,
    activeUsersSearching: 820,
    searchesInCategory: 410,
    shopViews: 56,
    usersComparedPrices: 38,
    usersClickedContact: 7,
    conversionEstimate: '1-3 sales',
    pricePosition: 'Higher',
    rating: '4.0',
    priceUpdates: 1,
  };

  // Competition analysis data
  const competitionData = [
    {
      item: 'Basmati Rice 5kg',
      userSearches: 120,
      avgMarketPrice: 720,
      lowestPriceNearby: 680,
      yourPrice: 760,
      status: 'Higher',
      isReasonable: false,
    },
    {
      item: 'Mustard Oil 1L',
      userSearches: 96,
      avgMarketPrice: 155,
      lowestPriceNearby: 148,
      yourPrice: 150,
      status: 'Reasonable',
      isReasonable: true,
    },
    {
      item: 'Atta 10kg',
      userSearches: 88,
      avgMarketPrice: 480,
      lowestPriceNearby: 450,
      yourPrice: 520,
      status: 'Higher',
      isReasonable: false,
    },
    {
      item: 'Mobile Charger',
      userSearches: 54,
      avgMarketPrice: 210,
      lowestPriceNearby: 180,
      yourPrice: 190,
      status: 'Competitive',
      isReasonable: true,
    },
  ];

  // Motivation graph data
  const motivationData = [
    { month: 'Month 1', users: 800, searches: 300, views: 15, clicks: 2 },
    { month: 'Month 2', users: 1200, searches: 450, views: 38, clicks: 7 },
  ];

  // Auto recommendations
  const recommendations = [
    {
      type: 'pricing',
      title: 'Pricing Suggestion',
      message: 'Your price is ₹40 higher than market average. Try reducing to ₹720 for Basmati Rice 5kg',
      icon: '💰',
      color: 'orange',
    },
    {
      type: 'product',
      title: 'Product Suggestion',
      message: 'Users are searching for "Toor Dal 1kg". Add this product to increase visibility.',
      icon: '📦',
      color: 'blue',
    },
    {
      type: 'engagement',
      title: 'Engagement Tip',
      message: 'Shops with weekly price updates get 4x more views. Update your prices regularly.',
      icon: '📈',
      color: 'green',
    },
    {
      type: 'visibility',
      title: 'Visibility Improvement',
      message: 'Upload shop photo to improve listing trust and get more views.',
      icon: '📷',
      color: 'orange',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance Insights' },
    { id: 'competition', label: 'Competition Analysis' },
    { id: 'recommendations', label: 'Recommendations' },
  ];

  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
      >
        ← Back to Vendor List
      </button>

      {/* Vendor Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{vendor.name}</h1>
            <p className="text-gray-600">Owner: {vendor.owner}</p>
          </div>
          <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
            vendor.status === 'Active' ? 'bg-green-100 text-green-800' :
            vendor.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {vendor.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-500">KYC Status</label>
            <p className="text-gray-900 font-medium">{vendor.kycStatus}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Product Count</label>
            <p className="text-gray-900 font-medium">{vendor.productCount}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Location</label>
            <p className="text-gray-900">{vendor.location}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Active</label>
            <p className="text-gray-900">{vendor.lastActive}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {vendor.status === 'Active' && (
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
              Block Vendor
            </button>
          )}
          {vendor.status === 'Blocked' && (
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
              Unblock Vendor
            </button>
          )}
          <button className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition">
            Add Internal Note
          </button>
        </div>
      </div>

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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900 mb-1">{performanceData.shopViews}</div>
              <div className="text-sm text-gray-600">Shop Views</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900 mb-1">{performanceData.usersComparedPrices}</div>
              <div className="text-sm text-gray-600">Price Comparisons</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900 mb-1">{performanceData.usersClickedContact}</div>
              <div className="text-sm text-gray-600">Contact Clicks</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900 mb-1">{performanceData.rating}</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Logs</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Price change detected</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <span className="text-xs text-yellow-600 font-medium">Flagged</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Product added</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
                <span className="text-xs text-green-600 font-medium">Normal</span>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Performance Insight Report */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">VENDOR PERFORMANCE INSIGHT REPORT</h2>
            <div className="mb-6 pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Market: {vendor.location || 'Delhi, India'}</p>
              <p className="text-sm text-gray-600 mb-1">Vendor: {vendor.name}</p>
              <p className="text-sm text-gray-600">Date Range: Last 30 Days</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <div className="font-semibold text-gray-900">Metric</div>
                <div className="font-semibold text-gray-900 text-right">Value</div>
                <div className="font-semibold text-gray-900 text-right">Meaning</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <div className="text-sm text-gray-700">Total Users Within 1 KM Radius</div>
                <div className="text-sm font-semibold text-gray-900 text-right">{performanceData.totalUsers1KM.toLocaleString()}</div>
                <div className="text-sm text-gray-500 text-right italic">Real users near your shop</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <div className="text-sm text-gray-700">Active Users Searching in This Area</div>
                <div className="text-sm font-semibold text-gray-900 text-right">{performanceData.activeUsersSearching.toLocaleString()}</div>
                <div className="text-sm text-gray-500 text-right italic">Users actually browsing</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <div className="text-sm text-gray-700">Searches in Your Category</div>
                <div className="text-sm font-semibold text-gray-900 text-right">{performanceData.searchesInCategory.toLocaleString()}</div>
                <div className="text-sm text-gray-500 text-right italic">Users interested in your category</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <div className="text-sm text-gray-700">Your Shop Views</div>
                <div className="text-sm font-semibold text-gray-900 text-right">{performanceData.shopViews}</div>
                <div className="text-sm text-gray-500 text-right italic">Users who opened your listing</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <div className="text-sm text-gray-700">Users Who Compared Prices</div>
                <div className="text-sm font-semibold text-gray-900 text-right">{performanceData.usersComparedPrices}</div>
                <div className="text-sm text-gray-500 text-right italic">Users shortlisted shops</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <div className="text-sm text-gray-700">Users Who Clicked "Navigate / Contact"</div>
                <div className="text-sm font-semibold text-gray-900 text-right">{performanceData.usersClickedContact}</div>
                <div className="text-sm text-gray-500 text-right italic">Potential conversions</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <div className="text-sm text-gray-700">Conversion Estimate</div>
                <div className="text-sm font-semibold text-gray-900 text-right">{performanceData.conversionEstimate}</div>
                <div className="text-sm text-gray-500 text-right italic">Expected offline visits</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <div className="text-sm text-gray-700">Your Price Position</div>
                <div className={`text-sm font-semibold text-right ${
                  performanceData.pricePosition === 'Higher' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {performanceData.pricePosition}
                </div>
                <div className="text-sm text-gray-500 text-right italic">Compared to competitors</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <div className="text-sm text-gray-700">Rating / Feedback</div>
                <div className="text-sm font-semibold text-gray-900 text-right flex items-center justify-end gap-1">
                  {performanceData.rating} ⭐
                </div>
                <div className="text-sm text-gray-500 text-right italic">If applicable</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3">
                <div className="text-sm text-gray-700">Price Updates</div>
                <div className="text-sm font-semibold text-gray-900 text-right">{performanceData.priceUpdates} time in 30 days</div>
                <div className="text-sm text-gray-500 text-right italic">Vendor activity level</div>
              </div>
            </div>
          </div>

          {/* Motivation Graph */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">MOTIVATION GRAPH</h2>
            <p className="text-sm text-gray-500 mb-4 italic">Vendor sees improvement → stays motivated instead of quitting</p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-900">
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-900">Metric</th>
                    <th className="text-center py-3 px-4 text-sm font-bold text-gray-900">Month 1</th>
                    <th className="text-center py-3 px-4 text-sm font-bold text-gray-900">Month 2</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(motivationData[0]).filter(key => key !== 'month').map((metric) => (
                    <tr key={metric} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-700 capitalize">{metric}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-center">{motivationData[0][metric]}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600 text-center">{motivationData[1][metric]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'competition' && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">USER CHOICE & COMPETITION ANALYSIS</h2>
          <p className="text-sm text-gray-500 mb-6 italic">Shows vendor clearly why or why not users are choosing them</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-900">Item / Category</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-900">User Searches</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-900">Avg Market Price</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-900">Lowest Price Nearby</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-900">Your Price</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {competitionData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{item.item}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 text-center">{item.userSearches}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 text-center">₹{item.avgMarketPrice}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 text-center">₹{item.lowestPriceNearby}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 text-center">₹{item.yourPrice}</td>
                    <td className="py-3 px-4 text-center">
                      {item.isReasonable ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                          ✓ {item.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                          ☐ {item.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">AUTO RECOMMENDATIONS</h2>
          <p className="text-sm text-gray-500 mb-6 italic">System automatically suggests improvements</p>

          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className={`text-2xl ${rec.color === 'orange' ? 'text-orange-600' : rec.color === 'blue' ? 'text-blue-600' : 'text-green-600'}`}>
                  {rec.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
                  <p className="text-sm text-gray-600">{rec.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interpretation Guidance */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Interpretation Guidance</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-1">If: Users high + views high + conversions low</p>
                <p className="text-blue-700">→ Improve pricing / display / offer incentives</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-semibold text-yellow-900 mb-1">If: Users high + category demand high + views low</p>
                <p className="text-yellow-700">→ Listing quality problem (image, title, relevance)</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900 mb-1">If: Users low in area</p>
                <p className="text-green-700">→ Market stage early — assure & retain</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-semibold text-purple-900 mb-1">If: Category demand low</p>
                <p className="text-purple-700">→ Suggest additional popular products</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-900 mb-1">If: Vendor never updates price</p>
                <p className="text-red-700">→ Users don't trust outdated listings</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
