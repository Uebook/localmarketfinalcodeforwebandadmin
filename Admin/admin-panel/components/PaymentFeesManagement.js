'use client';

import { useState } from 'react';

export default function PaymentFeesManagement() {
  const [feesConfig, setFeesConfig] = useState({
    monthly: 999,
    sixMonthly: 4999,
    yearly: 8999,
    gracePeriod: 7, // days
    autoBlockEnabled: true,
  });

  const [vendors, setVendors] = useState([
    { id: 'v1', name: 'ABC Store', vendorId: 'VEND-123456', plan: 'monthly', status: 'paid', dueDate: '2024-01-15', amount: 999 },
    { id: 'v2', name: 'XYZ Shop', vendorId: 'VEND-123457', plan: 'yearly', status: 'overdue', dueDate: '2023-12-20', amount: 8999 },
    { id: 'v3', name: 'Local Mart', vendorId: 'VEND-123458', plan: 'six_monthly', status: 'paid', dueDate: '2024-06-15', amount: 4999 },
  ]);

  const handleUpdateFees = (plan, value) => {
    setFeesConfig(prev => ({
      ...prev,
      [plan]: parseFloat(value) || 0,
    }));
  };

  const handleBlockVendor = (vendorId) => {
    setVendors(prev => prev.map(v => 
      v.id === vendorId ? { ...v, status: 'blocked' } : v
    ));
  };

  const handleActivateVendor = (vendorId) => {
    setVendors(prev => prev.map(v => 
      v.id === vendorId ? { ...v, status: 'paid', dueDate: calculateNextDueDate(new Date(), v.plan) } : v
    ));
  };

  const calculateNextDueDate = (currentDate, plan) => {
    const date = new Date(currentDate);
    if (plan === 'monthly') date.setMonth(date.getMonth() + 1);
    else if (plan === 'six_monthly') date.setMonth(date.getMonth() + 6);
    else if (plan === 'yearly') date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment & Fees Management</h1>

      {/* Fees Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Association Fees Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Fee (₹)</label>
            <input
              type="number"
              value={feesConfig.monthly}
              onChange={(e) => handleUpdateFees('monthly', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Six-Monthly Fee (₹)</label>
            <input
              type="number"
              value={feesConfig.sixMonthly}
              onChange={(e) => handleUpdateFees('sixMonthly', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Yearly Fee (₹)</label>
            <input
              type="number"
              value={feesConfig.yearly}
              onChange={(e) => handleUpdateFees('yearly', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={feesConfig.autoBlockEnabled}
              onChange={(e) => setFeesConfig(prev => ({ ...prev, autoBlockEnabled: e.target.checked }))}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">Enable Auto-Block for Non-Payment</span>
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Grace Period (days):</label>
            <input
              type="number"
              value={feesConfig.gracePeriod}
              onChange={(e) => setFeesConfig(prev => ({ ...prev, gracePeriod: parseInt(e.target.value) || 0 }))}
              className="w-20 px-2 py-1 border border-gray-300 rounded"
            />
          </div>
        </div>
        <button className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition">
          Save Configuration
        </button>
      </div>

      {/* Vendor Payment Status */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Vendor Payment Status</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vendor ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vendor Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-mono">{vendor.vendorId}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{vendor.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 capitalize">{vendor.plan}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(vendor.status)}`}>
                      {vendor.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{vendor.dueDate}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-semibold">₹{vendor.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {vendor.status === 'overdue' && (
                        <button
                          onClick={() => handleBlockVendor(vendor.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Block
                        </button>
                      )}
                      {vendor.status === 'blocked' && (
                        <button
                          onClick={() => handleActivateVendor(vendor.id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Activate
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
