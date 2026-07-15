'use client';

import { useState, useEffect, useRef } from 'react';

export default function HomeImageManagement() {
  const [homeImage, setHomeImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const fileInputRef = useRef(null);

  const [textConfig, setTextConfig] = useState({
    headline: 'Your Entire',
    headline_color: '#FFFFFF',
    highlight_text: 'Local Market,',
    highlight_color: '#FF6B00',
    subheadline: 'Discover Instantly.',
    subheadline_color: '#FFFFFF',
    description: 'Find best deals, compare prices & locate your favorite local shops in seconds.',
    description_color: '#E5E7EB'
  });

  useEffect(() => {
    fetchHomeImage();
  }, []);

  const showStatus = (text, type = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const fetchHomeImage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/home-image');
      const data = await res.json();
      if (data.homeImage) {
        if (data.homeImage.image_url) setHomeImage(data.homeImage.image_url);
        setTextConfig({
          headline: data.homeImage.headline || 'Your Entire',
          headline_color: data.homeImage.headline_color || '#FFFFFF',
          highlight_text: data.homeImage.highlight_text || 'Local Market,',
          highlight_color: data.homeImage.highlight_color || '#FF6B00',
          subheadline: data.homeImage.subheadline || 'Discover Instantly.',
          subheadline_color: data.homeImage.subheadline_color || '#FFFFFF',
          description: data.homeImage.description || 'Find best deals, compare prices & locate your favorite local shops in seconds.',
          description_color: data.homeImage.description_color || '#E5E7EB'
        });
      }
    } catch (err) {
      console.error('Failed to fetch home config:', err);
      showStatus('Failed to load home configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showStatus('Please upload an image file', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'general');
      formData.append('folder', 'home-image');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || 'Failed to upload image');
      }

      const saveRes = await fetch('/api/home-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploadData.url })
      });

      if (!saveRes.ok) throw new Error('Failed to save home image');

      setHomeImage(uploadData.url);
      showStatus('Home image updated successfully!');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload Error:', err);
      showStatus(err.message || 'Error updating home image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('Are you sure you want to delete the home image?')) return;

    setUploading(true);
    try {
      const res = await fetch('/api/home-image', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      setHomeImage(null);
      showStatus('Home image deleted successfully!');
    } catch (err) {
      showStatus('Failed to delete home image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveText = async () => {
    setUploading(true);
    try {
      const res = await fetch('/api/home-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(textConfig)
      });
      if (!res.ok) throw new Error('Failed to save text');
      showStatus('Text configuration saved successfully!');
    } catch (err) {
      showStatus(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-gray-500 font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Home Hero Management</h1>
            <p className="text-gray-500 mt-1">Manage the hero background image and text displayed on the mobile app home screen.</p>
          </div>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-xl border ${statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Management */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Background Image</h2>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  id="home-image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="home-image-upload"
                  className={`px-4 py-2 text-sm rounded-lg font-medium text-white shadow-sm cursor-pointer transition-all ${
                    uploading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  Upload New Image
                </label>
              </div>
            </div>
            
            {homeImage ? (
              <div className="space-y-4 flex-1">
                <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[4/3] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={homeImage} 
                    alt="Home Hero" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 min-h-[250px]">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <span className="text-2xl">🖼️</span>
                </div>
                <p className="text-gray-500 font-medium mb-1">No custom home image active</p>
                <p className="text-sm text-gray-400 text-center px-4">The mobile app is currently using the default local asset.</p>
              </div>
            )}
          </div>

          {/* Text Management */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Hero Text Configuration</h2>
            
            <div className="space-y-4 flex-1">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Headline</label>
                  <input 
                    type="text" 
                    value={textConfig.headline}
                    onChange={(e) => setTextConfig({...textConfig, headline: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input 
                    type="color" 
                    value={textConfig.headline_color}
                    onChange={(e) => setTextConfig({...textConfig, headline_color: e.target.value})}
                    className="w-full h-[46px] p-1 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Text</label>
                  <input 
                    type="text" 
                    value={textConfig.highlight_text}
                    onChange={(e) => setTextConfig({...textConfig, highlight_text: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input 
                    type="color" 
                    value={textConfig.highlight_color}
                    onChange={(e) => setTextConfig({...textConfig, highlight_color: e.target.value})}
                    className="w-full h-[46px] p-1 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub-headline</label>
                  <input 
                    type="text" 
                    value={textConfig.subheadline}
                    onChange={(e) => setTextConfig({...textConfig, subheadline: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input 
                    type="color" 
                    value={textConfig.subheadline_color}
                    onChange={(e) => setTextConfig({...textConfig, subheadline_color: e.target.value})}
                    className="w-full h-[46px] p-1 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows="3"
                    value={textConfig.description}
                    onChange={(e) => setTextConfig({...textConfig, description: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input 
                    type="color" 
                    value={textConfig.description_color}
                    onChange={(e) => setTextConfig({...textConfig, description_color: e.target.value})}
                    className="w-full h-full min-h-[46px] p-1 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={handleSaveText}
                disabled={uploading}
                className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors"
              >
                {uploading ? 'Saving...' : 'Save Text Configuration'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
