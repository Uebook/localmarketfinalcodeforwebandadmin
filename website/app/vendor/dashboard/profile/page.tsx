'use client';

import { useState } from 'react';
import VendorDashboardLayout from '@/components/VendorDashboardLayout';
import { INITIAL_VENDOR_DATA } from '@/lib/constants';
import { Edit, MapPin, Phone, Mail, Clock, Calendar, Award, Save, X } from 'lucide-react';
import Image from 'next/image';

export default function VendorProfilePage() {
  const [vendor, setVendor] = useState(INITIAL_VENDOR_DATA);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(vendor);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(vendor);
  };

  const handleSave = () => {
    setVendor(editedData);
    setIsEditing(false);
    // In a real app, you would save to backend here
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditedData(vendor);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <VendorDashboardLayout>
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={editedData.imageUrl}
                alt={editedData.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="text-2xl sm:text-3xl font-bold mb-2 w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">{vendor.name}</h1>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="text-gray-900 w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <p className="text-gray-900">{vendor.category}</p>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    <Save size={20} />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    <X size={20} />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  <Edit size={20} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Address</p>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editedData.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 mb-2"
                      />
                      <input
                        type="text"
                        value={editedData.landmark || ''}
                        onChange={(e) => handleChange('landmark', e.target.value)}
                        placeholder="Landmark"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 mb-2"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editedData.city || ''}
                          onChange={(e) => handleChange('city', e.target.value)}
                          placeholder="City"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                        />
                        <input
                          type="text"
                          value={editedData.pincode || ''}
                          onChange={(e) => handleChange('pincode', e.target.value)}
                          placeholder="Pincode"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-900">{vendor.address}</p>
                      {vendor.landmark && (
                        <p className="text-gray-900 text-sm">Near {vendor.landmark}</p>
                      )}
                      {vendor.city && (
                        <p className="text-gray-900">{vendor.city}, {vendor.pincode}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Contact</p>
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        value={editedData.contactNumber || ''}
                        onChange={(e) => handleChange('contactNumber', e.target.value)}
                        placeholder="Contact Number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 mb-2"
                      />
                      <input
                        type="tel"
                        value={editedData.alternateMobile || ''}
                        onChange={(e) => handleChange('alternateMobile', e.target.value)}
                        placeholder="Alternate Mobile"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 mb-2"
                      />
                      <input
                        type="email"
                        value={editedData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="Email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-gray-900">{vendor.contactNumber}</p>
                      {vendor.alternateMobile && (
                        <p className="text-gray-900 text-sm">Alt: {vendor.alternateMobile}</p>
                      )}
                      {vendor.email && (
                        <a href={`mailto:${vendor.email}`} className="text-orange-500 hover:text-orange-600 text-sm">
                          {vendor.email}
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Timings</p>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editedData.openTime || ''}
                        onChange={(e) => handleChange('openTime', e.target.value)}
                        placeholder="e.g., 9:00 AM - 9:00 PM"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 mb-2"
                      />
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="time"
                          value={editedData.openingTime || ''}
                          onChange={(e) => handleChange('openingTime', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                        />
                        <input
                          type="time"
                          value={editedData.closingTime || ''}
                          onChange={(e) => handleChange('closingTime', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                        />
                      </div>
                      <input
                        type="text"
                        value={editedData.weeklyOff || ''}
                        onChange={(e) => handleChange('weeklyOff', e.target.value)}
                        placeholder="Weekly Off (e.g., Sunday)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-gray-900">{vendor.openTime || 'Open Now'}</p>
                      {vendor.openingTime && vendor.closingTime && (
                        <p className="text-gray-900 text-sm">
                          {vendor.openingTime} - {vendor.closingTime}
                        </p>
                      )}
                      {vendor.weeklyOff && (
                        <p className="text-gray-900 text-sm">Weekly Off: {vendor.weeklyOff}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {vendor.yearsInBusiness && (
                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Years in Business</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.yearsInBusiness || ''}
                        onChange={(e) => handleChange('yearsInBusiness', e.target.value)}
                        placeholder="Years in Business"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                      />
                    ) : (
                      <p className="text-gray-900">{vendor.yearsInBusiness}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Award className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Category</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.category || ''}
                      onChange={(e) => handleChange('category', e.target.value)}
                      placeholder="Category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                    />
                  ) : (
                    <>
                      <p className="text-gray-900">{vendor.category}</p>
                      {vendor.secondaryCategories && vendor.secondaryCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {vendor.secondaryCategories.map((cat, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-900 rounded text-xs">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">About</h2>
          {isEditing ? (
            <textarea
              value={editedData.about || ''}
              onChange={(e) => handleChange('about', e.target.value)}
              placeholder="Write about your business..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-gray-900"
            />
          ) : (
            <p className="text-gray-900 leading-relaxed">{vendor.about}</p>
          )}
        </div>
      </div>
    </VendorDashboardLayout>
  );
}
