'use client';

import { useEffect, useState, useRef } from 'react';

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    startDate: '',
    endDate: '',
    targetCircle: '',
    link: '',
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        if (!res.ok) {
          setError(data?.error || 'Failed to load banners');
        } else if (!cancelled) {
          setBanners(Array.isArray(data?.banners) ? data.banners : []);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load banners');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData({ ...formData, imageUrl: base64String });
      setImagePreview(base64String);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateBanner = async () => {
    try {
      setError('');
      if (!formData.imageUrl) {
        setError('Please upload an image or provide an image URL');
        return;
      }

      setUploading(true);
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          image_url: formData.imageUrl,
          link_url: formData.link || null,
          start_at: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          end_at: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          active: true,
          sort_order: 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Failed to create banner');
        return;
      }

      if (data.warning) {
        alert('Saved locally: ' + data.warning);
        setShowForm(false);
        setFormData({ title: '', imageUrl: '', startDate: '', endDate: '', targetCircle: '', link: '' });
        setImagePreview(null);
        return;
      }

      // Reload banners to get the latest
      const reloadRes = await fetch('/api/banners', { cache: 'no-store' });
      const reloadData = await reloadRes.json().catch(() => ({}));
      if (reloadRes.ok) {
        setBanners(Array.isArray(reloadData?.banners) ? reloadData.banners : []);
      }

      setShowForm(false);
      setFormData({ title: '', imageUrl: '', startDate: '', endDate: '', targetCircle: '', link: '' });
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      setError(e?.message || 'Failed to create banner');
    } finally {
      setUploading(false);
    }
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      imageUrl: banner.image_url || '',
      startDate: banner.start_at ? new Date(banner.start_at).toISOString().split('T')[0] : '',
      endDate: banner.end_at ? new Date(banner.end_at).toISOString().split('T')[0] : '',
      targetCircle: banner.target_circle || '',
      link: banner.link_url || '',
    });
    setImagePreview(banner.image_url || null);
    setShowForm(true);
  };

  const handleUpdateBanner = async () => {
    try {
      setError('');
      if (!formData.imageUrl) {
        setError('Please upload an image or provide an image URL');
        return;
      }

      setUploading(true);
      const res = await fetch('/api/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBanner.id,
          title: formData.title,
          image_url: formData.imageUrl,
          link_url: formData.link || null,
          start_at: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          end_at: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to update banner');

      // Reload banners to get the latest
      const reloadRes = await fetch('/api/banners', { cache: 'no-store' });
      const reloadData = await reloadRes.json().catch(() => ({}));
      if (reloadRes.ok) {
        setBanners(Array.isArray(reloadData?.banners) ? reloadData.banners : []);
      }

      setShowForm(false);
      setEditingBanner(null);
      setFormData({ title: '', imageUrl: '', startDate: '', endDate: '', targetCircle: '', link: '' });
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      setError(e?.message || 'Failed to update banner');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBanner(null);
    setFormData({ title: '', imageUrl: '', startDate: '', endDate: '', targetCircle: '', link: '' });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleActive = async (banner) => {
    try {
      setError('');
      const res = await fetch('/api/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: banner.id, active: !banner.active }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Failed to update banner');
        return;
      }

      if (data.warning) {
        alert('Action pending: ' + data.warning);
        return;
      }
      setBanners(prev => prev.map(b => (b.id === banner.id ? data.banner : b)));
    } catch (e) {
      setError(e?.message || 'Failed to update banner');
    }
  };

  return (
    <div className="p-8">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <div className="font-semibold">Banner API error</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition"
          >
            + Upload Banner
          </button>
        )}
      </div>

      {/* Upload/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingBanner ? 'Edit Banner' : 'Upload New Banner'}
          </h2>
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
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="banner-image-upload"
                  />
                  <label
                    htmlFor="banner-image-upload"
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm font-medium"
                  >
                    Upload Image
                  </label>
                  <span className="text-sm text-gray-500 self-center">or</span>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      if (e.target.value) setImagePreview(e.target.value);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter image URL..."
                  />
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 w-full object-cover rounded-lg border border-gray-200 bg-white"
                      onError={() => {
                        setError('Failed to load image. Please check the URL or upload a file.');
                        setImagePreview(null);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={editingBanner ? handleUpdateBanner : handleCreateBanner}
              disabled={uploading}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {uploading ? 'Saving...' : editingBanner ? 'Update Banner' : 'Upload Banner'}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Banners List */}
      {loading && <div className="text-sm text-gray-600 mb-4">Loading banners…</div>}
      {!loading && banners.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No banners found. Click "+ Upload Banner" to create one.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="h-48 bg-white relative overflow-hidden border-b border-gray-100">
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full ${banner.image_url ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-r from-orange-400 to-red-500`}
              >
                <span className="text-white text-lg font-semibold">{banner.title || 'No Title'}</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{banner.title || 'Untitled Banner'}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {banner.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {banner.link_url && (
                <p className="text-xs text-blue-600 mb-2 truncate" title={banner.link_url}>
                  Link: {banner.link_url}
                </p>
              )}
              <p className="text-sm text-gray-600 mb-2">
                {banner.start_at ? new Date(banner.start_at).toLocaleDateString('en-IN') : '—'} to {banner.end_at ? new Date(banner.end_at).toLocaleDateString('en-IN') : '—'}
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEditBanner(banner)}
                  className="flex-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(banner)}
                  className={`flex-1 px-3 py-1 text-white text-xs rounded ${banner.active
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  {banner.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
