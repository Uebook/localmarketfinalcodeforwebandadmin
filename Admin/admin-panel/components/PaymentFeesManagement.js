'use client';

import { useState, useEffect } from 'react';

export default function PaymentFeesManagement() {
  const [feesConfig, setFeesConfig] = useState({
    monthly: 999,
    sixMonthly: 4999,
    yearly: 8999,
    gracePeriod: 7,
    autoBlockEnabled: true,
  });

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
    loadVendors();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/payment-fees/config');
      if (res.ok) {
        const config = await res.json();
        setFeesConfig({
          monthly: config.monthly_fee || 999,
          sixMonthly: config.six_monthly_fee || 4999,
          yearly: config.yearly_fee || 8999,
          gracePeriod: config.grace_period_days || 7,
          autoBlockEnabled: config.auto_block_enabled !== false,
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payment-fees/vendors');
      if (res.ok) {
        const billing = await res.json();
        setVendors(billing.map(b => ({
          id: b.id,
          vendorId: b.vendors?.vendor_id || 'N/A',
          name: b.vendors?.name || 'Unknown',
          plan: b.plan,
          status: b.status,
          dueDate: b.due_date,
          amount: parseFloat(b.amount),
        })));
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFees = (plan, value) => {
    setFeesConfig(prev => ({
      ...prev,
      [plan]: parseFloat(value) || 0,
    }));
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/payment-fees/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthly_fee: feesConfig.monthly,
          six_monthly_fee: feesConfig.sixMonthly,
          yearly_fee: feesConfig.yearly,
          grace_period_days: feesConfig.gracePeriod,
          auto_block_enabled: feesConfig.autoBlockEnabled,
        }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        alert('Configuration saved successfully!');
      } else {
        const errorMessage = data.error || `Failed to save config (${res.status})`;
        console.error('Save config error:', errorMessage);
        alert(`Failed to save configuration: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert(`Failed to save configuration: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBlockVendor = async (vendorId) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) return;

      const res = await fetch('/api/payment-fees/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendor.vendorId,
          status: 'blocked',
        }),
      });

      if (res.ok) {
        await loadVendors();
        alert('Vendor blocked successfully');
      } else {
        throw new Error('Failed to block vendor');
      }
    } catch (error) {
      console.error('Error blocking vendor:', error);
      alert('Failed to block vendor');
    }
  };

  const handleActivateVendor = async (vendorId) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) return;

      const nextDueDate = calculateNextDueDate(new Date(), vendor.plan);

      const res = await fetch('/api/payment-fees/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendor.vendorId,
          status: 'paid',
          plan: vendor.plan,
          amount: feesConfig[vendor.plan === 'monthly' ? 'monthly' : vendor.plan === 'six_monthly' ? 'sixMonthly' : 'yearly'],
          due_date: nextDueDate,
        }),
      });

      if (res.ok) {
        await loadVendors();
        alert('Vendor activated successfully');
      } else {
        throw new Error('Failed to activate vendor');
      }
    } catch (error) {
      console.error('Error activating vendor:', error);
      alert('Failed to activate vendor');
    }
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
        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Vendor Payment Status */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Vendor Payment Status</h2>
          <button
            onClick={loadVendors}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading vendor billing...</div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No vendor billing records found</div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
