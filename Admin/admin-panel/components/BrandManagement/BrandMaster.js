'use client';

import { useEffect, useState, useRef } from 'react';

export default function BrandMaster() {
  const [isCreating, setIsCreating] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', category: '', logoUrl: '', description: '', featured: false });
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBrand, setEditingBrand] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const logoFileInputRef = useRef(null);
  const editLogoFileInputRef = useRef(null);

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/brands', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Failed to load brands');
      } else {
        setBrands(Array.isArray(data?.brands) ? data.brands : []);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleLogoUpload = async (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'general');
      formData.append('folder', 'brand-logos');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      if (isEdit && editingBrand) {
        setEditingBrand({ ...editingBrand, logoUrl: data.url });
      } else {
        setNewBrand({ ...newBrand, logoUrl: data.url });
      }
    } catch (err) {
      alert(`Logo upload failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrand.name?.trim()) {
      alert('Brand name is required');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrand),
      });
      if (!res.ok) throw new Error('Failed to create brand');
      await loadBrands();
      setIsCreating(false);
      setNewBrand({ name: '', category: '', logoUrl: '', description: '', featured: false });
      alert('Brand created successfully');
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBrand = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/brands?id=${editingBrand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBrand),
      });
      if (!res.ok) throw new Error('Failed to update brand');
      await loadBrands();
      setEditingBrand(null);
      alert('Brand updated successfully');
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/brands?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await loadBrands();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Premium Brands ({brands.length})</h2>
          <p className="text-gray-500">Manage premium brands visible on the mobile home page</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition"
        >
          + Add New Brand
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
          <h3 className="text-lg font-bold">Add Brand</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="border p-2 rounded"
              placeholder="Brand Name"
              value={newBrand.name}
              onChange={e => setNewBrand({...newBrand, name: e.target.value})}
            />
            <input
              className="border p-2 rounded"
              placeholder="Category (e.g. Footwear)"
              value={newBrand.category}
              onChange={e => setNewBrand({...newBrand, category: e.target.value})}
            />
          </div>
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Description"
            value={newBrand.description}
            onChange={e => setNewBrand({...newBrand, description: e.target.value})}
          />
          <div className="flex items-center gap-4">
             <input
               type="file"
               onChange={e => handleLogoUpload(e, false)}
               className="text-sm"
             />
             <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newBrand.featured}
                  onChange={e => setNewBrand({...newBrand, featured: e.target.checked})}
                />
                Featured on Home
             </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateBrand} disabled={saving} className="bg-orange-600 text-white px-4 py-2 rounded">Save</button>
            <button onClick={() => setIsCreating(false)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Brand</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map(brand => (
              <tr key={brand.id} className="border-t">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {brand.logoUrl && <img src={brand.logoUrl} className="w-10 h-10 rounded-lg object-contain bg-gray-50 border" />}
                    <span className="font-semibold">{brand.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-600">{brand.category}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${brand.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {brand.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">{brand.featured ? '✅ Yes' : '❌ No'}</td>
                <td className="p-4">
                  <button onClick={() => setEditingBrand(brand)} className="text-blue-600 mr-3">Edit</button>
                  <button onClick={() => handleDeleteBrand(brand.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {editingBrand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white p-6 rounded-xl max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Edit Brand</h3>
              <div className="space-y-4">
                <input
                  className="w-full border p-2 rounded"
                  value={editingBrand.name}
                  onChange={e => setEditingBrand({...editingBrand, name: e.target.value})}
                />
                <input
                  className="w-full border p-2 rounded"
                  value={editingBrand.category}
                  onChange={e => setEditingBrand({...editingBrand, category: e.target.value})}
                />
                <textarea
                  className="w-full border p-2 rounded"
                  value={editingBrand.description}
                  onChange={e => setEditingBrand({...editingBrand, description: e.target.value})}
                />
                <div className="flex justify-end gap-2">
                   <button onClick={handleUpdateBrand} className="bg-orange-600 text-white px-4 py-2 rounded">Update</button>
                   <button onClick={() => setEditingBrand(null)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
