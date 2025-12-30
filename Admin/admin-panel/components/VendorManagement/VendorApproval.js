'use client';

import { useState } from 'react';

const pendingVendors = [
  {
    id: 1,
    name: 'Quick Mart',
    owner: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 9876543210',
    location: 'Mumbai, India',
    submittedDate: '2024-12-20',
    documents: {
      aadhar: 'Verified',
      pan: 'Verified',
      shopLicense: 'Pending',
    },
  },
  {
    id: 2,
    name: 'Fresh Groceries',
    owner: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 9876543211',
    location: 'Ahmedabad, India',
    submittedDate: '2024-12-19',
    documents: {
      aadhar: 'Verified',
      pan: 'Verified',
      shopLicense: 'Verified',
    },
  },
];

export default function VendorApproval({ onViewProfile }) {
  const [selectedVendor, setSelectedVendor] = useState(null);

  const handleApprove = (vendorId) => {
    // Handle approval logic
    console.log('Approving vendor:', vendorId);
  };

  const handleReject = (vendorId) => {
    // Handle rejection logic
    console.log('Rejecting vendor:', vendorId);
  };

  const handleHold = (vendorId) => {
    // Handle hold logic
    console.log('Putting vendor on hold:', vendorId);
  };

  if (selectedVendor) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <button
          onClick={() => setSelectedVendor(null)}
          className="mb-4 text-gray-600 hover:text-gray-900"
        >
          ← Back to List
        </button>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedVendor.name}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Owner Name</label>
                <p className="text-gray-900">{selectedVendor.owner}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{selectedVendor.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{selectedVendor.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-900">{selectedVendor.location}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Documents</h3>
            <div className="space-y-3">
              {Object.entries(selectedVendor.documents).map(([doc, status]) => (
                <div key={doc} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {doc.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleApprove(selectedVendor.id)}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Approve
            </button>
            <button
              onClick={() => handleHold(selectedVendor.id)}
              className="flex-1 bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition"
            >
              Put on Hold
            </button>
            <button
              onClick={() => handleReject(selectedVendor.id)}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Approvals</h2>
        <div className="space-y-4">
          {pendingVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                  <p className="text-sm text-gray-600">{vendor.owner} • {vendor.location}</p>
                  <p className="text-xs text-gray-500 mt-1">Submitted: {vendor.submittedDate}</p>
                </div>
                <button
                  onClick={() => setSelectedVendor(vendor)}
                  className="gradient-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
                >
                  Review KYC
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



