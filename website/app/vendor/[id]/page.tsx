'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { NEARBY_BUSINESSES } from '@/lib/data';
import { INITIAL_VENDOR_DATA } from '@/lib/constants';
import { 
  MapPin, Star, Phone, MessageCircle, Heart, Share2, Clock, CheckCircle, 
  ArrowLeft, Mail, Calendar, Award, Package, MessageSquare, ThumbsUp,
  Copy, ExternalLink, ChevronRight, Send, X
} from 'lucide-react';
import Image from 'next/image';
import EnquiryModal from '@/components/EnquiryModal';

export default function VendorDetailsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [userName, setUserName] = useState('');
  const params = useParams();
  const router = useRouter();

  // Find business by ID
  const business = NEARBY_BUSINESSES.find(b => b.id === params.id) || INITIAL_VENDOR_DATA;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products & Services' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'info', label: 'Quick Info' },
  ];

  const handleCall = () => {
    const contactNumber = (business as any).contactNumber;
    if (contactNumber) {
      window.location.href = `tel:${contactNumber}`;
    }
  };

  const handleWhatsApp = () => {
    const phone = (business as any).whatsappNumber || (business as any).contactNumber;
    if (phone) {
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(business.address || '');
    alert('Address copied to clipboard!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: `Check out ${business.name} on Local Market`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSubmitReview = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!reviewComment.trim()) {
      alert('Please write a review comment');
      return;
    }
    // In real app, this would submit to backend
    console.log('Review submitted:', {
      vendorId: business.id,
      userName,
      rating: reviewRating,
      comment: reviewComment,
    });
    alert('Thank you for your review! It will be published after verification.');
    setShowReviewForm(false);
    setReviewRating(5);
    setReviewComment('');
    setUserName('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        locationState={{ loading: false, error: null, city: 'Delhi, India' }}
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />

      {/* Hero Image Section */}
      <div className="relative h-96 w-full">
        <Image
          src={business.imageUrl}
          alt={business.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30 transition-colors"
          >
            <Heart className={isSaved ? 'fill-red-500 text-red-500' : ''} size={24} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30 transition-colors"
          >
            <Share2 size={24} />
          </button>
        </div>

        {/* Business Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{business.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="fill-yellow-400 text-yellow-400" size={18} />
                <span className="font-semibold">{business.rating}</span>
                <span className="text-white/80">({business.reviewCount} reviews)</span>
              </div>
              {(business as any).isVerified && (
                <div className="flex items-center gap-1 bg-blue-500 px-3 py-1 rounded-full">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleCall}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors">
              <Phone className="text-green-500 group-hover:text-white transition-colors" size={24} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Call Now</p>
              <p className="text-sm text-gray-900">{(business as any).contactNumber || 'Not available'}</p>
            </div>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors">
              <MessageCircle className="text-green-500 group-hover:text-white transition-colors" size={24} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">WhatsApp</p>
              <p className="text-sm text-gray-900">Send a message</p>
            </div>
          </button>

          <button
            onClick={() => setIsEnquiryModalOpen(true)}
            className="flex items-center gap-3 p-4 bg-orange-500 text-white rounded-xl shadow-sm hover:bg-orange-600 transition-all group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <div className="text-left">
              <p className="font-semibold">Send Enquiry</p>
              <p className="text-sm text-white/90">Get in touch</p>
            </div>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-500'
                      : 'border-transparent text-gray-900 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">About</h3>
                  <p className="text-gray-900 leading-relaxed">{business.about || 'No description available.'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Address</p>
                        <p className="text-gray-900">{business.address}</p>
                        {(business as any).landmark && (
                          <p className="text-gray-900">Near {(business as any).landmark}</p>
                        )}
                        <button
                          onClick={handleCopyAddress}
                          className="mt-2 flex items-center gap-1 text-orange-500 text-sm hover:text-orange-600"
                        >
                          <Copy size={14} />
                          <span>Copy Address</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Opening Hours</p>
                        <p className="text-gray-900">{business.openTime || 'Open Now'}</p>
                        {(business as any).weeklyOff && (
                          <p className="text-gray-900 text-sm">Weekly Off: {(business as any).weeklyOff}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Award className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Category</p>
                        <p className="text-gray-900">{business.category}</p>
                        {(business as any).yearsInBusiness && (
                          <p className="text-gray-900 text-sm mt-1">In business for {(business as any).yearsInBusiness}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Star className="text-yellow-400 fill-yellow-400 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Rating & Reviews</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{business.rating}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={i < Math.floor(business.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                size={16}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-900 text-sm">{business.reviewCount} reviews</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                {(business as any).products && (business as any).products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(business as any).products.map((product: any) => (
                      <div key={product.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                        <div className="relative h-48">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-lg mb-1">{product.name}</h4>
                          {product.category && (
                            <p className="text-gray-900 text-sm mb-2 font-medium">{product.category}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-orange-500 font-bold text-lg">{product.price}</p>
                              {product.mrp && product.mrp !== product.price && (
                                <p className="text-gray-400 text-sm line-through">{product.mrp}</p>
                              )}
                            </div>
                            {(product as any).inStock && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                In Stock
                              </span>
                            )}
                          </div>
                          {product.description && (
                            <p className="text-gray-900 text-sm mt-2 line-clamp-2">{product.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="text-gray-300 mx-auto mb-4" size={48} />
                    <p className="text-gray-900">No products available yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Write Review Button */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Customer Reviews</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {business.reviewCount} review{business.reviewCount !== 1 ? 's' : ''} • {business.rating} average rating
                    </p>
                  </div>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
                  >
                    <MessageSquare size={18} />
                    <span>Write a Review</span>
                  </button>
                </div>

                {/* Reviews List */}
                {(business as any).reviews && (business as any).reviews.length > 0 ? (
                  <div className="space-y-6">
                    {(business as any).reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-lg mb-1">{review.userName}</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                    size={16}
                                  />
                                ))}
                              </div>
                              <span className="text-gray-500 text-sm">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                        {review.reply && (
                          <div className="ml-4 pl-4 border-l-4 border-orange-500 bg-orange-50 rounded-r-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-orange-900">Business Response</span>
                            </div>
                            <p className="text-orange-800">{review.reply}</p>
                          </div>
                        )}
                        <div className="mt-3">
                          <button className="text-gray-600 text-sm font-medium hover:text-gray-900 flex items-center gap-1">
                            <ThumbsUp size={14} />
                            <span>Helpful ({Math.floor(Math.random() * 10)})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <MessageSquare className="text-gray-300 mx-auto mb-4" size={48} />
                    <p className="text-gray-900 mb-2">No reviews yet.</p>
                    <p className="text-gray-600 text-sm">Be the first to review this business!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="text-gray-400" size={20} />
                      <p className="font-semibold">Contact Number</p>
                    </div>
                    <p className="text-gray-900">{(business as any).contactNumber || 'Not available'}</p>
                  </div>

                  {(business as any).alternateMobile && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="text-gray-400" size={20} />
                        <p className="font-semibold">Alternate Mobile</p>
                      </div>
                      <p className="text-gray-900">{(business as any).alternateMobile}</p>
                    </div>
                  )}

                  {(business as any).email && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="text-gray-400" size={20} />
                        <p className="font-semibold">Email</p>
                      </div>
                      <a href={`mailto:${(business as any).email}`} className="text-orange-500 hover:text-orange-600">
                        {(business as any).email}
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="text-gray-400" size={20} />
                      <p className="font-semibold">Full Address</p>
                    </div>
                    <p className="text-gray-900">
                      {business.address}
                      {(business as any).landmark && `, ${(business as any).landmark}`}
                    </p>
                    {(business as any).city && (
                      <p className="text-gray-900">{(business as any).city}, {(business as any).pincode}</p>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="text-gray-400" size={20} />
                      <p className="font-semibold">Business Hours</p>
                    </div>
                    <p className="text-gray-900">{business.openTime || 'Open Now'}</p>
                    {(business as any).openingTime && (business as any).closingTime && (
                      <p className="text-gray-900 text-sm mt-1">
                        {(business as any).openingTime} - {(business as any).closingTime}
                      </p>
                    )}
                    {(business as any).weeklyOff && (
                      <p className="text-gray-900 text-sm mt-1">Closed on: {(business as any).weeklyOff}</p>
                    )}
                  </div>

                  {(business as any).yearsInBusiness && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="text-gray-400" size={20} />
                        <p className="font-semibold">Years in Business</p>
                      </div>
                      <p className="text-gray-900">{(business as any).yearsInBusiness}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Offers Section */}
        {(business as any).offers && (business as any).offers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Current Offers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(business as any).offers.map((offer: any) => (
                <div key={offer.id} className={`p-4 rounded-lg ${offer.color || 'bg-orange-500'} text-white`}>
                  <h4 className="font-bold text-lg mb-1">{offer.title}</h4>
                  <p className="text-white/90 mb-3">{offer.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white/20 rounded-lg font-mono text-sm">
                      {offer.code}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(offer.code);
                        alert('Coupon code copied!');
                      }}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => {
          setIsSidebarOpen(false);
          if (tab === 'home') router.push('/');
        }}
        userRole="customer"
      />

      {isEnquiryModalOpen && (
        <EnquiryModal
          isOpen={isEnquiryModalOpen}
          onClose={() => setIsEnquiryModalOpen(false)}
          businessName={business.name}
        />
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewRating(5);
                  setReviewComment('');
                  setUserName('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Business Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{business.name}</h3>
                <p className="text-sm text-gray-600">{business.category}</p>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Rating Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setReviewRating(rating)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={rating <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        size={40}
                      />
                    </button>
                  ))}
                  <span className="ml-4 text-gray-700 font-medium">
                    {reviewRating === 5 && 'Excellent'}
                    {reviewRating === 4 && 'Very Good'}
                    {reviewRating === 3 && 'Good'}
                    {reviewRating === 2 && 'Fair'}
                    {reviewRating === 1 && 'Poor'}
                  </span>
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={6}
                  placeholder="Share your experience with this business..."
                />
                <p className="text-right text-xs text-gray-500 mt-1">{reviewComment.length}/500</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewRating(5);
                    setReviewComment('');
                    setUserName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={!userName.trim() || !reviewComment.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  <span>Submit Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
