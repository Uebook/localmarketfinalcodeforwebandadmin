'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Target, Loader2, PlusCircle, CheckCircle, Tag, Package, Calendar, Clock, Star, Phone, MapPin, Check, Inbox } from 'lucide-react';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  budget_min: number | null;
  budget_max: number | null;
  status: 'active' | 'accepted' | 'expired';
  location_text: string;
  created_at: string;
}

interface Quotation {
  id: string;
  price: number;
  delivery_time: string;
  note: string;
  status: 'pending' | 'accepted' | 'rejected';
  vendors?: {
    name: string;
    rating: number;
    profile_image_url: string;
    city: string;
    contact_number: string;
  };
}

export default function MyRequirementsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null);

  const fetchRequirements = async () => {
    const rawUser = localStorage.getItem('localmarket_user');
    if (!rawUser) {
      router.push('/login?redirect=/requirements/my');
      return;
    }
    const user = JSON.parse(rawUser);

    try {
      setLoading(true);
      const res = await fetch(`/api/custom-requirements?buyer_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setRequirements(data.requirements || []);
        if (data.requirements && data.requirements.length > 0 && !selectedReq) {
          setSelectedReq(data.requirements[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch requirements:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotations = async (reqId: string) => {
    try {
      setLoadingQuotes(true);
      const res = await fetch(`/api/vendor-quotations?requirement_id=${reqId}`);
      const data = await res.json();
      if (data.success) {
        setQuotations(data.quotations || []);
      }
    } catch (err) {
      console.error('Failed to fetch quotations:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  useEffect(() => {
    if (selectedReq?.id) {
      fetchQuotations(selectedReq.id);
    } else {
      setQuotations([]);
    }
  }, [selectedReq]);

  const handleAccept = async (quote: Quotation) => {
    if (!selectedReq) return;
    if (!confirm(`Are you sure you want to accept the quote of ₹${quote.price} from ${quote.vendors?.name || 'Vendor'}?`)) {
      return;
    }

    try {
      setProcessing(true);
      setAcceptingQuoteId(quote.id);

      // Update quote status
      await fetch('/api/vendor-quotations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quote.id, status: 'accepted' })
      });

      // Update requirement status
      await fetch('/api/custom-requirements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedReq.id, status: 'accepted' })
      });

      alert('Quotation accepted successfully! Vendor contact details are now revealed.');
      fetchRequirements();
      if (selectedReq) {
        fetchQuotations(selectedReq.id);
      }
    } catch (err) {
      console.error('Failed to accept quotation:', err);
      alert('Failed to accept quotation.');
    } finally {
      setProcessing(false);
      setAcceptingQuoteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 bg-green-50 text-green-600 border border-green-200 text-xs font-black rounded-lg">ACTIVE</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-black rounded-lg">COMPLETED</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200 text-xs font-black rounded-lg">{status.toUpperCase()}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              🎯 My Requirements & Quotes
            </h1>
            <p className="text-slate-500 font-semibold text-sm mt-1">
              Monitor your posted requirements and review bids submitted by local vendors.
            </p>
          </div>
          <button
            onClick={() => router.push('/requirements/post')}
            className="flex items-center gap-2 px-5 py-3.5 bg-orange-500 text-white font-black uppercase tracking-wider text-xs rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 active:scale-95"
          >
            <PlusCircle size={16} />
            Post Requirement
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Loading your requirements...</p>
          </div>
        ) : requirements.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
              <Target size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No Requirements Posted</h3>
            <p className="text-slate-500 font-medium mb-8">
              Post a local requirement to let vendors near you submit quotations and bid for your order.
            </p>
            <button
              onClick={() => router.push('/requirements/post')}
              className="px-6 py-3.5 bg-orange-500 text-white font-black uppercase tracking-wider text-xs rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-100"
            >
              Post Your First Requirement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Requirements List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Requirements Feed</h2>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReq(req)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedReq?.id === req.id
                        ? 'bg-white border-orange-500 shadow-md'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-1 flex-1">{req.title}</h3>
                      {getStatusBadge(req.status)}
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-4 font-semibold">{req.description}</p>
                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold">
                      <span className="flex items-center gap-1"><Tag size={10} />{req.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Package size={10} />{req.quantity} {req.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Quotations Details */}
            <div className="lg:col-span-2 space-y-6">
              {selectedReq ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                  {/* Selected Req Meta */}
                  <div className="border-b border-slate-100 pb-6">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedReq.title}</h2>
                      {getStatusBadge(selectedReq.status)}
                    </div>
                    <p className="text-slate-600 text-sm font-semibold leading-relaxed mb-6">{selectedReq.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                        <p className="text-xs font-black text-slate-800">{selectedReq.category}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                        <p className="text-xs font-black text-slate-800">{selectedReq.quantity} {selectedReq.unit}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Budget</p>
                        <p className="text-xs font-black text-slate-800">
                          {selectedReq.budget_min || selectedReq.budget_max
                            ? `₹${selectedReq.budget_min || 0} - ₹${selectedReq.budget_max || 'Any'}`
                            : 'Not Specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Posted On</p>
                        <p className="text-xs font-black text-slate-800">
                          {new Date(selectedReq.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bids/Quotations List */}
                  <div>
                    <h3 className="text-sm font-black text-slate-900 mb-4">
                      Submitted Quotations ({quotations.length})
                    </h3>

                    {loadingQuotes ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mr-2" />
                        <span className="text-slate-500 font-bold text-sm">Fetching quotations...</span>
                      </div>
                    ) : quotations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                        <Inbox size={32} className="text-slate-300 mb-2" />
                        <p className="text-slate-400 text-xs font-bold">No quotations received yet. We will notify you once a vendor bids!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {quotations.map((quote) => {
                          const isAccepted = quote.status === 'accepted';
                          return (
                            <div
                              key={quote.id}
                              className={`p-5 rounded-2xl border-2 transition-all ${
                                isAccepted ? 'border-green-500 bg-green-50/10' : 'border-slate-100 bg-white hover:border-slate-200'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4 mb-3">
                                <div>
                                  <h4 className="font-black text-slate-800 text-sm">{quote.vendors?.name || 'Local Store'}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="flex items-center gap-0.5 text-xs text-amber-500 font-black">
                                      <Star size={12} fill="currentColor" />
                                      {quote.vendors?.rating || '4.5'}
                                    </span>
                                    <span className="text-slate-300 text-xs">·</span>
                                    <span className="text-xs text-slate-500 font-semibold">{quote.vendors?.city || 'Local Area'}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-black text-orange-500">₹{quote.price}</p>
                                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 justify-end"><Clock size={10} /> {quote.delivery_time || 'Immediate'}</span>
                                </div>
                              </div>

                              {quote.note && (
                                <p className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 font-medium italic mb-4">
                                  "{quote.note}"
                                </p>
                              )}

                              {isAccepted && quote.vendors && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-2xl space-y-2">
                                  <h5 className="text-xs font-black text-green-700 uppercase tracking-widest flex items-center gap-1">
                                    <CheckCircle size={14} /> Vendor Contact Information
                                  </h5>
                                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                    <a
                                      href={`tel:${quote.vendors.contact_number}`}
                                      className="flex items-center gap-2 text-xs font-black text-blue-600 hover:underline"
                                    >
                                      <Phone size={14} /> {quote.vendors.contact_number}
                                    </a>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                      <MapPin size={14} /> {quote.vendors.city}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {!isAccepted && selectedReq.status === 'active' && (
                                <button
                                  onClick={() => handleAccept(quote)}
                                  disabled={processing}
                                  className="w-full mt-2 py-3 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-md shadow-green-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                  {processing && acceptingQuoteId === quote.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check size={14} />
                                  )}
                                  Accept Quotation
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl p-12 bg-white">
                  <p className="text-slate-400 font-bold text-sm">Select a requirement from the list to view vendor quotations.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => {
          setIsSidebarOpen(false);
          router.push(`/${tab}`);
        }}
        userRole="customer"
      />
    </div>
  );
}
