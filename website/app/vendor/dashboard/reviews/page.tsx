'use client';

import { useState } from 'react';
import VendorDashboardLayout from '@/components/VendorDashboardLayout';
import { INITIAL_VENDOR_DATA } from '@/lib/constants';
import { Star, MessageSquare, ThumbsUp, Reply, Filter, Search, X, Send, TrendingUp, TrendingDown } from 'lucide-react';

export default function VendorReviewsPage() {
  const vendor = INITIAL_VENDOR_DATA;
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);

  // Filter reviews
  const filteredReviews = vendor.reviews?.filter((review: any) => {
    const matchesSearch = review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  }) || [];

  // Calculate review statistics
  const reviewStats = {
    total: vendor.reviews?.length || 0,
    average: vendor.rating || 0,
    fiveStar: vendor.reviews?.filter((r: any) => r.rating === 5).length || 0,
    fourStar: vendor.reviews?.filter((r: any) => r.rating === 4).length || 0,
    threeStar: vendor.reviews?.filter((r: any) => r.rating === 3).length || 0,
    twoStar: vendor.reviews?.filter((r: any) => r.rating === 2).length || 0,
    oneStar: vendor.reviews?.filter((r: any) => r.rating === 1).length || 0,
    withReply: vendor.reviews?.filter((r: any) => r.reply).length || 0,
    withoutReply: vendor.reviews?.filter((r: any) => !r.reply).length || 0,
  };

  const handleReply = (review: any) => {
    setSelectedReview(review);
    setReplyText(review.reply || '');
    setShowReplyModal(true);
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }
    // In real app, this would update the review with the reply
    console.log('Reply submitted:', { reviewId: selectedReview?.id, reply: replyText });
    setShowReplyModal(false);
    setReplyText('');
    setSelectedReview(null);
    alert('Reply submitted successfully!');
  };

  return (
    <VendorDashboardLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header with Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reviews & Ratings</h1>
            <p className="text-gray-600 mt-1">Manage customer reviews and respond to feedback</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <Star className="text-yellow-400 fill-yellow-400" size={24} />
              <div>
                <span className="text-2xl font-bold text-gray-900">{vendor.rating}</span>
                <span className="text-gray-600 text-sm ml-1">({reviewStats.total} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-600" size={20} />
              <span className="text-sm font-medium text-gray-600">5 Star</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{reviewStats.fiveStar}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-blue-600" size={20} />
              <span className="text-sm font-medium text-gray-600">4 Star</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{reviewStats.fourStar}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="text-orange-600" size={20} />
              <span className="text-sm font-medium text-gray-600">Replied</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{reviewStats.withReply}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="text-red-600" size={20} />
              <span className="text-sm font-medium text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{reviewStats.withoutReply}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((review: any) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{review.userName}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        review.rating >= 4 ? 'bg-green-100 text-green-800' :
                        review.rating >= 3 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {review.rating} Star{review.rating !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                            size={18}
                          />
                        ))}
                      </div>
                      <span className="text-gray-500 text-sm">{review.date}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
                
                {review.reply ? (
                  <div className="ml-0 sm:ml-4 pl-4 border-l-4 border-orange-500 bg-orange-50 rounded-r-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-orange-900">Your Reply</span>
                      <button
                        onClick={() => handleReply(review)}
                        className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-orange-800">{review.reply}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleReply(review)}
                    className="flex items-center gap-2 text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors mb-4"
                  >
                    <Reply size={16} />
                    <span>Reply to Review</span>
                  </button>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-gray-600 text-sm hover:text-gray-900 transition-colors">
                    <ThumbsUp size={16} />
                    <span>Helpful ({Math.floor(Math.random() * 10)})</span>
                  </button>
                  {!review.reply && (
                    <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                      Reply Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Star className="text-gray-300 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery || ratingFilter !== 'all' ? 'No Reviews Found' : 'No Reviews Yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery || ratingFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Customer reviews will appear here'}
            </p>
          </div>
        )}

        {/* Reply Modal */}
        {showReplyModal && selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Reply to Review</h2>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyText('');
                    setSelectedReview(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Review Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{selectedReview.userName}</h3>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={i < selectedReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                          size={16}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{selectedReview.comment}</p>
                </div>

                {/* Reply Textarea */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Your Reply <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Write your reply to this review..."
                  />
                  <p className="text-right text-xs text-gray-500 mt-1">{replyText.length}/500</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplyText('');
                      setSelectedReview(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim()}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorDashboardLayout>
  );
}
