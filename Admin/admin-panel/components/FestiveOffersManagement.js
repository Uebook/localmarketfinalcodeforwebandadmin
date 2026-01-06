'use client';

import { useState } from 'react';

export default function FestiveOffersManagement() {
  const [offers, setOffers] = useState([
    { id: 'o1', title: 'Diwali Special', type: 'vendor', target: 'all', status: 'active', startDate: '2024-11-01', endDate: '2024-11-15' },
    { id: 'o2', title: 'New Year Sale', type: 'user', target: 'circle', circle: 'Connaught Place', status: 'active', startDate: '2024-12-25', endDate: '2025-01-05' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'vendor', // vendor or user
    target: 'all', // all, circle, specific
    circle: '',
    vendorIds: [],
    startDate: '',
    endDate: '',
    discount: '',
    description: '',
  });

  const handleCreateOffer = () => {
    const newOffer = {
      id: `o${Date.now()}`,
      ...formData,
      status: 'active',
    };
    setOffers([...offers, newOffer]);
    setShowForm(false);
    setFormData({
      title: '',
      type: 'vendor',
      target: 'all',
      circle: '',
      vendorIds: [],
      startDate: '',
      endDate: '',
      discount: '',
      description: '',
    });
  };

  const handleToggleStatus = (offerId) => {
    setOffers(prev => prev.map(o => 
      o.id === offerId ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' } : o
    ));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Festive Offers Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition"
        >
          {showForm ? 'Cancel' : '+ Create Offer'}
        </button>
      </div>

      {/* Create Offer Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Create New Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Offer Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Diwali Special"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Offer Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="vendor">Vendor-wise</option>
                <option value="user">User-wise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All</option>
                <option value="circle">Circle-wise</option>
                <option value="specific">Specific</option>
              </select>
            </div>
            {formData.target === 'circle' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Circle</label>
                <input
                  type="text"
                  value={formData.circle}
                  onChange={(e) => setFormData({ ...formData, circle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter circle name"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Offer description..."
              />
            </div>
          </div>
          <button
            onClick={handleCreateOffer}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition"
          >
            Create Offer
          </button>
        </div>
      )}

      {/* Offers List */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Active Offers</h2>
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <span>Type: <span className="font-semibold capitalize">{offer.type}-wise</span></span>
                    <span>Target: <span className="font-semibold capitalize">{offer.target}</span></span>
                    {offer.circle && <span>Circle: <span className="font-semibold">{offer.circle}</span></span>}
                    <span>Period: {offer.startDate} to {offer.endDate}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    offer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {offer.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(offer.id)}
                    className={`px-3 py-1 rounded text-xs ${
                      offer.status === 'active' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                    }`}
                  >
                    {offer.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
