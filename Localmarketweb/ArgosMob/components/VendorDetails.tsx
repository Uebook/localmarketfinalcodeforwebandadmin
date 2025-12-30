
import React, { useState } from 'react';
import { 
  ArrowLeft, Search, Share2, MoreVertical, Star, CheckCircle, 
  MapPin, Phone, MessageCircle, MessageSquare, Heart, Copy, Plus, ThumbsUp
} from 'lucide-react';
import { Business } from '../types';
import EnquiryModal from './EnquiryModal';

interface VendorDetailsProps {
  business: Business;
  onBack: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

const VendorDetails: React.FC<VendorDetailsProps> = ({ business, onBack, isSaved, onToggleSave }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  // Renamed 'Catalogue' to 'Products/Services'
  const tabs = ['Overview', 'Products/Services', 'Reviews', 'Quick Info'];

  return (
    <div className="bg-gray-50 min-h-screen pb-20 relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 bg-white shadow-sm flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] pb-0">
        <div className="w-full h-16 flex items-center justify-between">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-6 h-6 text-slate-800" />
            </button>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full"><Search className="w-5 h-5 text-slate-800" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-full"><Share2 className="w-5 h-5 text-slate-800" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical className="w-5 h-5 text-slate-800" /></button>
            </div>
        </div>
      </header>

      <div className="pt-[calc(4rem+env(safe-area-inset-top))]">
        {/* Main Info Card */}
        <div className="bg-white p-4 mb-2">
          <div className="flex justify-between items-start">
            <h1 className="text-xl font-bold text-slate-900 leading-tight flex-1 mr-2">{business.name}</h1>
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
               <img src={business.imageUrl} alt={business.name} className="w-full h-full object-cover" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-green-700 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center">
              {business.rating} <Star className="w-2.5 h-2.5 ml-0.5 fill-white" />
            </span>
            <span className="text-sm text-slate-600 font-medium">{business.reviewCount} Ratings</span>
            {business.isVerified && (
               <span className="text-blue-600 font-bold text-xs flex items-center bg-blue-50 px-1.5 py-0.5 rounded ml-1">
                 Verified <CheckCircle className="w-3 h-3 ml-0.5 fill-blue-600 text-white" />
               </span>
            )}
          </div>

          <p className="text-sm text-slate-600 mt-2 flex items-center">
             <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> 
             {business.address || 'Location Unavailable'}
             {business.landmark ? `, ${business.landmark}` : ''}
          </p>
          <p className="text-xs text-slate-500 mt-1 pl-4.5">
             {business.category} • {business.yearsInBusiness || 'New Business'}
          </p>
          <button className="text-xs text-slate-800 mt-2 font-medium flex items-center pl-4.5">
             {business.openTime || 'Open Now'} <span className="ml-1 text-gray-400">▼</span>
          </button>

          {/* Action Grid */}
          <div className="grid grid-cols-5 gap-2 mt-6 text-center">
             <button className="flex flex-col items-center gap-1 group">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-red-100 group-active:scale-95 transition-transform">
                  <Phone className="w-5 h-5 text-white fill-current" />
               </div>
               <span className="text-xs font-medium text-slate-700">Call</span>
             </button>

             <button className="flex flex-col items-center gap-1 group">
               <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-100 group-active:scale-95 transition-transform">
                  <MessageCircle className="w-5 h-5 text-white fill-current" />
               </div>
               <span className="text-xs font-medium text-slate-700">WhatsApp</span>
             </button>

             <button 
                onClick={() => setShowEnquiryModal(true)}
                className="flex flex-col items-center gap-1 group"
             >
               <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
                  <MessageSquare className="w-5 h-5 text-slate-700" />
               </div>
               <span className="text-xs font-medium text-slate-700">Enquiry</span>
             </button>

             <button 
                onClick={() => onToggleSave(business.id)}
                className="flex flex-col items-center gap-1 group"
             >
               <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
                  <Heart className={`w-5 h-5 ${isSaved ? 'text-red-600 fill-red-600' : 'text-slate-700'}`} />
               </div>
               <span className="text-xs font-medium text-slate-700">{isSaved ? 'Saved' : 'Save'}</span>
             </button>

             <button className="flex flex-col items-center gap-1 group">
               <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
                  <Star className="w-5 h-5 text-slate-700" />
               </div>
               <span className="text-xs font-medium text-slate-700">Review</span>
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white sticky top-[calc(4rem+env(safe-area-inset-top))] z-40 border-b border-gray-100 shadow-sm">
          <div className="flex px-4 gap-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-gray-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white min-h-[300px] mb-20">
          {/* ... (Content remains same) ... */}
          {activeTab === 'Overview' && (
            <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
               {/* Start Review */}
               <div>
                 <h3 className="font-bold text-slate-900 mb-2">Start a review</h3>
                 <div className="flex gap-3">
                   {[1, 2, 3, 4, 5].map((s) => (
                     <Star key={s} className="w-8 h-8 text-gray-300 stroke-1" />
                   ))}
                 </div>
               </div>
               
               {/* About */}
               {business.about && (
                   <div>
                     <h3 className="font-bold text-slate-900 mb-2">About Us</h3>
                     <p className="text-sm text-slate-600 leading-relaxed">
                       {business.about}
                     </p>
                   </div>
               )}

               {/* Address */}
               <div>
                  <h3 className="font-bold text-slate-900 mb-2">Address</h3>
                  <p className="text-sm text-slate-600 mb-1">{business.address}</p>
                  {business.landmark && <p className="text-xs text-gray-500">Near {business.landmark}</p>}
                  {business.city && business.pincode && <p className="text-xs text-gray-500">{business.city} - {business.pincode}</p>}
                  
                  <button className="flex items-center text-blue-600 text-xs font-bold gap-1 mt-2">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                  <div className="h-32 bg-gray-100 rounded-lg mt-3 flex items-center justify-center border border-gray-200">
                     <span className="text-xs font-bold text-gray-400 flex items-center">
                       <MapPin className="w-4 h-4 mr-1" /> Map Preview
                     </span>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'Products/Services' && (
            <div className="p-4 animate-in fade-in slide-in-from-bottom-2">
               <h3 className="font-bold text-slate-900 mb-4">Products & Services</h3>
               {business.products && business.products.length > 0 ? (
                 <div className="space-y-4">
                    {business.products.map((product) => (
                      <div key={product.id} className="flex gap-4 border border-gray-100 p-3 rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                           <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                           <h4 className="font-bold text-slate-800 text-sm mb-1">{product.name}</h4>
                           {product.description && (
                             <p className="text-xs text-gray-500 mb-1.5 line-clamp-2">{product.description}</p>
                           )}
                           <div className="flex items-center justify-between mt-auto">
                              <span className="text-red-600 font-bold text-sm">{product.price}</span>
                              <button className="p-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                <Plus className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="text-center py-10 bg-gray-50 rounded-xl">
                   <p className="text-sm text-gray-500">No products listed by this vendor yet.</p>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'Reviews' && (
             <div className="p-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">User Reviews</h3>
                  <span className="text-xs text-slate-500">{business.reviews?.length || 0} reviews</span>
                </div>

                <div className="space-y-4">
                  {business.reviews && business.reviews.length > 0 ? (
                    business.reviews.map((review) => (
                      <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xs border border-red-50">
                               {review.userName.charAt(0)}
                             </div>
                             <div>
                               <h4 className="font-bold text-slate-800 text-sm">{review.userName}</h4>
                               <div className="flex items-center">
                                 {[1,2,3,4,5].map(s => (
                                   <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                 ))}
                               </div>
                             </div>
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">{review.date}</span>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-3 pl-10 leading-relaxed">"{review.comment}"</p>
                        
                        {review.reply && (
                          <div className="ml-10 bg-gray-50 p-3 rounded-lg border-l-2 border-red-500 mb-2">
                             <div className="flex items-center gap-1 mb-1">
                               <MessageCircle className="w-3 h-3 text-red-600" />
                               <span className="text-xs font-bold text-slate-800">Response from Owner:</span>
                             </div>
                             <p className="text-xs text-slate-600 italic">{review.reply}</p>
                          </div>
                        )}
                        
                        <div className="pl-10 flex items-center gap-4 mt-2">
                           <button className="text-[10px] font-bold text-gray-400 flex items-center gap-1 hover:text-slate-600 transition-colors">
                              <ThumbsUp className="w-3 h-3" /> Helpful
                           </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                      <p className="text-sm text-gray-500 mb-2">No reviews yet.</p>
                      <button className="text-red-600 font-bold text-xs hover:underline">
                        Be the first to write a review
                      </button>
                    </div>
                  )}
                </div>
             </div>
          )}

          {activeTab === 'Quick Info' && (
             <div className="p-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Payment Modes</h4>
                      <p className="text-sm font-medium text-slate-800">Cash, UPI, Cards</p>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Amenities</h4>
                      <p className="text-sm font-medium text-slate-800">AC, Parking, Wifi</p>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Response Time</h4>
                      <p className="text-sm font-medium text-slate-800">{business.responseTime || 'Within 2 hours'}</p>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Year Est.</h4>
                      <p className="text-sm font-medium text-slate-800">{business.yearsInBusiness || 'N/A'}</p>
                   </div>
                   {business.weeklyOff && (
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Weekly Off</h4>
                        <p className="text-sm font-medium text-slate-800">{business.weeklyOff}</p>
                     </div>
                   )}
                   {business.circle && (
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Service Circle</h4>
                        <p className="text-sm font-medium text-slate-800">{business.circle}</p>
                     </div>
                   )}
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-3 border-t border-gray-200 z-50 flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
         <button className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-200 active:scale-95 transition-all">
           <Phone className="w-5 h-5 fill-current" /> Call Now
         </button>
         <button 
           onClick={() => setShowEnquiryModal(true)}
           className="flex-1 bg-white border border-red-600 text-red-600 font-bold py-3 rounded-lg hover:bg-red-50 active:scale-95 transition-transform"
         >
           Enquire Now
         </button>
         <button className="flex-1 bg-green-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 active:scale-95 transition-transform">
           <MessageCircle className="w-5 h-5 fill-current" /> WhatsApp
         </button>
      </div>

      {/* Enquiry Modal */}
      <EnquiryModal 
        isOpen={showEnquiryModal}
        businessName={business.name}
        onClose={() => setShowEnquiryModal(false)}
      />
    </div>
  );
};

export default VendorDetails;
