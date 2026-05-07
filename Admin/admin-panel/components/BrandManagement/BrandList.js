'use client';

import { useState, useEffect } from 'react';
import { COLORS } from '../../constants/colors';

export default function BrandList({ onManageProducts }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    logo_url: '',
    description: '',
    featured: false,
    status: 'Active',
    display_order: 0,
    address: '',
    phone: ''
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      if (data.success) {
        setBrands(data.brands);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingBrand ? 'PATCH' : 'POST';
    const body = editingBrand ? { ...formData, id: editingBrand.id } : formData;

    try {
      const res = await fetch('/api/brands', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingBrand(null);
        setFormData({
          name: '', category: '', logo_url: '', description: '', 
          featured: false, status: 'Active', display_order: 0, address: '', phone: ''
        });
        fetchBrands();
      }
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      category: brand.category || '',
      logo_url: brand.logo_url || '',
      description: brand.description || '',
      featured: brand.featured || false,
      status: brand.status || 'Active',
      display_order: brand.display_order || 0,
      address: brand.address || '',
      phone: brand.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      const res = await fetch(`/api/brands?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading brands...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Brand Management</h2>
          <p className="text-gray-500">Manage premium brand partnerships and their display</p>
        </div>
        <button
          onClick={() => {
            setEditingBrand(null);
            setFormData({
              name: '', category: '', logo_url: '', description: '', 
              featured: false, status: 'Active', display_order: 0, address: '', phone: ''
            });
            setShowModal(true);
          }}
          className="gradient-primary text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:opacity-90 transition-all"
        >
          + Add New Brand
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
            <div className="p-4 flex items-center gap-4 border-b border-gray-50">
              <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl">🏢</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{brand.name}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                  {brand.category || 'General'}
                </span>
              </div>
              <div className="flex flex-col items-end gap-2">
                {brand.featured && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-orange-100 text-orange-600 rounded">
                    Featured
                  </span>
                )}
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  brand.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {brand.status}
                </span>
              </div>
            </div>
            
            <div className="p-4 text-sm text-gray-600 line-clamp-2 h-14">
              {brand.description || 'No description provided.'}
            </div>

            <div className="p-4 bg-gray-50 flex gap-2">
              <button
                onClick={() => handleEdit(brand)}
                className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all text-sm"
              >
                Edit Details
              </button>
              <button
                onClick={() => onManageProducts(brand)}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-sm"
              >
                Manage Products
              </button>
              <button
                onClick={() => handleDelete(brand.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Brand Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Footwear, Electronics"
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    className="w-4 h-4 text-blue-600 rounded"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <label htmlFor="featured" className="text-sm font-semibold text-gray-700">Featured Brand</label>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    className="w-20 p-1 border border-gray-200 rounded bg-white outline-none"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</label>
                  <select
                    className="p-1 border border-gray-200 rounded bg-white outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 gradient-primary text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all"
                >
                  {editingBrand ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
