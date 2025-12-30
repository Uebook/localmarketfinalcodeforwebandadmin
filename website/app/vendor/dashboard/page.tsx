'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VendorDashboardLayout from '@/components/VendorDashboardLayout';
import { INITIAL_VENDOR_DATA } from '@/lib/constants';
import { Activity, Package, MessageSquare, Star, Search, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function VendorDashboardPage() {
  const router = useRouter();
  const vendor = INITIAL_VENDOR_DATA;
  const profileCompletion = 85;

  return (
    <VendorDashboardLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Profile Completion */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Profile Completion</h3>
              <p className="text-sm text-gray-900">Complete your profile to get more visibility</p>
            </div>
            <span className="text-2xl font-bold text-orange-500">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">Store Views</p>
                <p className="text-xl font-bold text-gray-900">1,245</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">Appearances</p>
                <p className="text-xl font-bold text-gray-900">3.5k</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-900 mb-1 font-medium">Items</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{vendor.products?.length || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-900 mb-1 font-medium">Enquiries</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{vendor.enquiries?.length || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-900 mb-1 font-medium">Reviews</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{vendor.reviews?.length || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-900 mb-1 font-medium">Rating</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{vendor.rating}</p>
                <Star className="text-yellow-400 fill-yellow-400" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-gray-900" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Account Status</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-900 mb-2 font-medium">KYC Status</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                vendor.kycStatus === 'Approved' 
                  ? 'bg-green-100 text-green-700' 
                  : vendor.kycStatus === 'Rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {vendor.kycStatus === 'Approved' ? (
                  <CheckCircle size={14} />
                ) : vendor.kycStatus === 'Rejected' ? (
                  <XCircle size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}
                {vendor.kycStatus || 'Pending'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-900 mb-2 font-medium">Activation</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                vendor.activationStatus === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {vendor.activationStatus === 'Active' ? (
                  <CheckCircle size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}
                {vendor.activationStatus || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => router.push('/vendor/dashboard/catalog')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Package className="text-orange-500" size={24} />
              <span className="text-sm font-medium text-gray-700">Add Product</span>
            </button>
            <button
              onClick={() => router.push('/vendor/dashboard/enquiries')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="text-blue-500" size={24} />
              <span className="text-sm font-medium text-gray-700">View Enquiries</span>
            </button>
            <button
              onClick={() => router.push('/vendor/dashboard/profile')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Star className="text-yellow-500" size={24} />
              <span className="text-sm font-medium text-gray-700">Edit Profile</span>
            </button>
          </div>
        </div>
      </div>
    </VendorDashboardLayout>
  );
}
