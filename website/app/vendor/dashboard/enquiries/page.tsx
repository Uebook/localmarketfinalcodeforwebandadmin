'use client';

import VendorDashboardLayout from '@/components/VendorDashboardLayout';
import { INITIAL_VENDOR_DATA } from '@/lib/constants';
import { MessageSquare, Phone, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function VendorEnquiriesPage() {
  const vendor = INITIAL_VENDOR_DATA;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'read':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'replied':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      case 'replied':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <VendorDashboardLayout>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Enquiries</h1>
            <p className="text-gray-900 mt-1">Manage customer enquiries and messages</p>
          </div>
        </div>

        {vendor.enquiries && vendor.enquiries.length > 0 ? (
          <div className="space-y-4">
            {vendor.enquiries.map((enquiry) => (
              <div key={enquiry.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{enquiry.senderName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(enquiry.status)} flex items-center gap-1.5`}>
                        {getStatusIcon(enquiry.status)}
                        <span className="capitalize">{enquiry.status}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <Phone size={16} />
                        <span>{enquiry.senderMobile}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        <span>{enquiry.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700">{enquiry.message}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                    <MessageSquare size={16} />
                    <span>Reply</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                    <Phone size={16} />
                    <span>Call</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    <Mail size={16} />
                    <span>Email</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MessageSquare className="text-gray-300 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Enquiries Yet</h3>
            <p className="text-gray-900">Customer enquiries will appear here</p>
          </div>
        )}
      </div>
    </VendorDashboardLayout>
  );
}
