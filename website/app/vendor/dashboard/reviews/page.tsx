'use client';

import VendorDashboardLayout from '@/components/VendorDashboardLayout';
import { INITIAL_VENDOR_DATA } from '@/lib/constants';
import { Star, MessageSquare, ThumbsUp, Reply } from 'lucide-react';

export default function VendorReviewsPage() {
  const vendor = INITIAL_VENDOR_DATA;

  return (
    <VendorDashboardLayout>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reviews</h1>
            <p className="text-gray-900 mt-1">Manage customer reviews and ratings</p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-400 fill-yellow-400" size={24} />
              <span className="text-2xl font-bold">{vendor.rating}</span>
              <span className="text-gray-900">({vendor.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {vendor.reviews && vendor.reviews.length > 0 ? (
          <div className="space-y-4">
            {vendor.reviews.map((review: any) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border-b border-gray-100 last:border-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{review.userName}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                            size={18}
                          />
                        ))}
                      </div>
                      <span className="text-gray-900 text-sm">{review.date}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{review.comment}</p>
                
                {review.reply ? (
                  <div className="ml-0 sm:ml-4 pl-4 border-l-4 border-orange-500 bg-orange-50 rounded-r-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-orange-900">Your Reply</span>
                    </div>
                    <p className="text-orange-800">{review.reply}</p>
                  </div>
                ) : (
                  <button className="flex items-center gap-2 text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors">
                    <Reply size={16} />
                    <span>Reply to Review</span>
                  </button>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-gray-900 text-sm hover:text-gray-700 transition-colors">
                    <ThumbsUp size={16} />
                    <span>Helpful ({Math.floor(Math.random() * 10)})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Star className="text-gray-300 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-900">Customer reviews will appear here</p>
          </div>
        )}
      </div>
    </VendorDashboardLayout>
  );
}
