'use client';

import { useState } from 'react';

export default function BannerManagement() {
  const [banners, setBanners] = useState([
    { id: 'b1', title: 'Diwali Festival', type: 'festive', image: '/banner1.jpg', status: 'active', startDate: '2024-11-01', endDate: '2024-11-15' },
    { id: 'b2', title: 'E-Auction Event', type: 'e-auction', image: '/banner2.jpg', status: 'active', startDate: '2024-12-20', endDate: '2024-12-25' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'festive', // festive, e-auction, online-draw
    image: null,
    startDate: '',
    endDate: '',
    targetCircle: '',
    link: '',
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBanner = () => {
    const newBanner = {
      id: `b${Date.now()}`,
      ...formData,
      status: 'active',
    };
    setBanners([...banners, newBanner]);
    setShowForm(false);
    setFormData({
      title: '',
      type: 'festive',
      image: null,
      startDate: '',
      endDate: '',
      targetCircle: '',
      link: '',
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition"
        >
          {showForm ? 'Cancel' : '+ Upload Banner'}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Upload New Banner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Diwali Festival"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="festive">Festive</option>
                <option value="e-auction">E-Auction</option>
                <option value="online-draw">Online Draw</option>
              </select>
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Circle (Optional)</label>
              <input
                type="text"
                value={formData.targetCircle}
                onChange={(e) => setFormData({ ...formData, targetCircle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Leave empty for all circles"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (Optional)</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-2 max-w-xs rounded-lg" />
              )}
            </div>
          </div>
          <button
            onClick={handleCreateBanner}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition"
          >
            Upload Banner
          </button>
        </div>
      )}

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">{banner.title}</span>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  banner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {banner.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Type: <span className="font-semibold capitalize">{banner.type}</span></p>
              <p className="text-sm text-gray-600 mb-2">{banner.startDate} to {banner.endDate}</p>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700">
                  Edit
                </button>
                <button className="flex-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
