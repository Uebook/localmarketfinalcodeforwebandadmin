'use client';

import { useState, useEffect } from 'react';
import VendorDashboardLayout, { useVendor } from '@/components/VendorDashboardLayout';
import { Target, Clock, MessageSquare, Loader2, Inbox, Eye, Edit3, Send, CheckCircle2, ChevronRight, X, AlertCircle } from 'lucide-react';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  budget_min: number | null;
  budget_max: number | null;
  location_text: string;
  radius_km: number;
  created_at: string;
  users?: {
    full_name: string;
    phone: string;
  };
}

interface Quotation {
  id: string;
  requirement_id: string;
  vendor_id: string;
  price: number;
  delivery_time: string;
  note: string;
  status: 'pending' | 'accepted' | 'rejected';
  custom_requirements?: Requirement;
}

function RequirementsContent() {
  const { vendor, profile, loading: vendorLoading } = useVendor();
  const displayVendor = profile || vendor;

  const [activeTab, setActiveTab] = useState<'feed' | 'bids'>('feed');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [myBids, setMyBids] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [existingQuote, setExistingQuote] = useState<Quotation | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  
  // Bid Form states
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchData = async () => {
    if (!displayVendor?.id) return;
    setLoading(true);
    try {
      const lat = displayVendor.lat || 31.6340;
      const lng = displayVendor.lng || 74.8723;
      
      const reqsUrl = `/api/custom-requirements?lat=${lat}&lng=${lng}&category=${encodeURIComponent(displayVendor.category || '')}&radius=15`;
      const bidsUrl = `/api/vendor-quotations?vendor_id=${displayVendor.id}`;

      const [reqsRes, bidsRes] = await Promise.all([
        fetch(reqsUrl),
        fetch(bidsUrl)
      ]);

      if (reqsRes.ok && bidsRes.ok) {
        const reqsData = await reqsRes.json();
        const bidsData = await bidsRes.json();

        const activeBids = bidsData.quotations || [];
        setMyBids(activeBids);

        const biddedIds = activeBids.map((q: Quotation) => q.requirement_id);
        const feedReqs = (reqsData.requirements || []).filter((req: Requirement) => !biddedIds.includes(req.id));
        setRequirements(feedReqs);
      }
    } catch (err) {
      console.error('Failed to load local leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [displayVendor?.id]);

  const openBidModal = (req: Requirement, quote?: Quotation) => {
    setSelectedReq(req);
    if (quote) {
      setExistingQuote(quote);
      setPrice(quote.price.toString());
      setDeliveryTime(quote.delivery_time);
      setNote(quote.note || '');
    } else {
      setExistingQuote(null);
      setPrice('');
      setDeliveryTime('');
      setNote('');
    }
    setFormError('');
    setFormSuccess('');
    setShowBidModal(true);
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!price.trim()) {
      setFormError('Please enter a quotation price.');
      return;
    }

    if (!displayVendor?.id || !selectedReq) return;

    setSubmitting(true);
    try {
      if (existingQuote) {
        // Edit Bid
        const res = await fetch('/api/vendor-quotations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existingQuote.id,
            price: parseFloat(price),
            delivery_time: deliveryTime.trim() || 'Standard time',
            note: note.trim()
          })
        });

        if (res.ok) {
          setFormSuccess('Your bid was updated successfully!');
          setTimeout(() => {
            setShowBidModal(false);
            fetchData();
          }, 1500);
        } else {
          const data = await res.json();
          setFormError(data.error || 'Failed to update bid.');
        }
      } else {
        // Create Bid
        const res = await fetch('/api/vendor-quotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requirement_id: selectedReq.id,
            vendor_id: displayVendor.id,
            price: parseFloat(price),
            delivery_time: deliveryTime.trim() || 'Standard time',
            note: note.trim()
          })
        });

        if (res.ok) {
          setFormSuccess('Your bid has been submitted to the buyer!');
          setTimeout(() => {
            setShowBidModal(false);
            fetchData();
          }, 1500);
        } else {
          const data = await res.json();
          setFormError(data.error || 'Failed to submit bid.');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (vendorLoading || loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={32} />
        <p className="text-slate-500 font-bold text-sm">Loading local leads feed...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-50 text-green-600 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            🎯 Local Leads & Quotations
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Bid on requests posted by customers near your store</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
              activeTab === 'feed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            New Leads ({requirements.length})
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
              activeTab === 'bids' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            My Bids ({myBids.length})
          </button>
        </div>
      </div>

      {activeTab === 'feed' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
              <Inbox size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold text-slate-700">No new leads nearby</p>
              <p className="text-xs text-slate-400 mt-1">We will notify you when buyers post requirements matching your area.</p>
            </div>
          ) : (
            requirements.map((req) => (
              <div key={req.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-black rounded-lg uppercase tracking-wider">
                      {req.category}
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-800 mb-2 line-clamp-1">{req.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold mb-6 line-clamp-3 leading-relaxed">{req.description}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span>Quantity Required:</span>
                    <span className="text-slate-800 font-black">{req.quantity} {req.unit}</span>
                  </div>
                  {req.budget_max && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>Buyer Budget:</span>
                      <span className="text-green-600 font-black">Up to ₹{req.budget_max}</span>
                    </div>
                  )}

                  <button
                    onClick={() => openBidModal(req)}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-wider text-xs rounded-2xl transition-all shadow-md shadow-orange-100 flex items-center justify-center gap-1"
                  >
                    <span>Bid On This Request</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myBids.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
              <Inbox size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold text-slate-700">No bids submitted yet</p>
              <p className="text-xs text-slate-400 mt-1">Submit bids on active customer requests to receive orders.</p>
            </div>
          ) : (
            myBids.map((bid) => {
              const req = bid.custom_requirements;
              if (!req) return null;
              return (
                <div key={bid.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2.5 py-1 border text-[10px] font-black rounded-lg uppercase tracking-wider ${getStatusColor(bid.status)}`}>
                        {bid.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-800 mb-1 line-clamp-1">{req.title}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mb-4">
                      <span>{req.category}</span>
                      <span>·</span>
                      <span>{req.quantity} {req.unit}</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl mb-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-400">Your Bid:</span>
                        <span className="font-black text-orange-500 text-sm">₹{bid.price}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-400">Delivery:</span>
                        <span className="font-bold text-slate-700">{bid.delivery_time}</span>
                      </div>
                    </div>

                    {bid.status === 'accepted' && req.users && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-2xl space-y-2">
                        <h4 className="text-xs font-black text-green-700 uppercase tracking-widest">Customer Contact</h4>
                        <p className="text-xs font-black text-slate-800">{req.users.full_name}</p>
                        <a href={`tel:${req.users.phone}`} className="text-xs font-black text-blue-600 hover:underline">{req.users.phone}</a>
                      </div>
                    )}
                  </div>

                  {bid.status === 'pending' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                      <button
                        onClick={() => openBidModal(req, bid)}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black uppercase tracking-wider text-[10px] rounded-xl transition-all flex items-center justify-center gap-1"
                      >
                        <Edit3 size={12} />
                        Edit Bid
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Bidding / Detail Modal */}
      {showBidModal && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setShowBidModal(false)} />
          
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white flex justify-between items-center">
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">
                  {existingQuote ? 'Modify Bid Details' : 'Submit Quotation Bid'}
                </p>
                <h3 className="text-lg font-black leading-tight line-clamp-1">{selectedReq.title}</h3>
              </div>
              <button
                onClick={() => setShowBidModal(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBidSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <AlertCircle size={16} /> {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> {formSuccess}
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">{selectedReq.description}</p>
                <div className="flex gap-4 pt-2 text-[10px] text-slate-400 font-black">
                  <span>Qty: {selectedReq.quantity} {selectedReq.unit}</span>
                  {selectedReq.budget_max && <span>Budget: Up to ₹{selectedReq.budget_max}</span>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Your Quotation Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-slate-800 text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Delivery / Completion Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. Today by 5 PM, or 2 Days"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-slate-800 text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Additional Note for Buyer
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. We use premium materials and offer a 1-year warranty..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors resize-none"
                />
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="flex-1 py-3.5 border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-black uppercase tracking-wider text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-md shadow-orange-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  {existingQuote ? 'Update Bid' : 'Submit Bid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequirementsPage() {
  return (
    <VendorDashboardLayout>
      <RequirementsContent />
    </VendorDashboardLayout>
  );
}
