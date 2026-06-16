'use client';

import { useState, useEffect } from 'react';
import { COLORS } from '../constants/colors';

export default function RequirementsManagement() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [selectedReq, setSelectedReq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/custom-requirements?admin=true');
      const data = await res.json();
      if (data.success) {
        setRequirements(data.requirements || []);
      } else {
        setError(data.error || 'Failed to fetch requirements');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBids = async (req) => {
    setSelectedReq(req);
    setShowModal(true);
    setLoadingQuotes(true);
    setQuotations([]);

    try {
      const res = await fetch(`/api/vendor-quotations?requirement_id=${req.id}`);
      const data = await res.json();
      if (data.success) {
        setQuotations(data.quotations || []);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error('Failed to fetch quotations:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'active' || s === 'accepted') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>;
    }
    if (s === 'expired') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Expired</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Local Leads / Requirements</h2>
          <p className="text-gray-500 text-sm mt-1">Manage user requirements and vendor quotations</p>
        </div>
        <button 
          onClick={fetchRequirements}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">Date Posted</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Buyer Info</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Requirement</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Location</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Loading requirements...</td>
                </tr>
              ) : requirements.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No requirements found.</td>
                </tr>
              ) : (
                requirements.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{formatDate(req.created_at)}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{req.users?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{req.users?.phone || 'No phone'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{req.title}</div>
                      <div className="text-sm text-gray-500">{req.category} • {req.quantity} {req.unit}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-700">{req.location_text}</div>
                      <div className="text-xs text-gray-500">{req.radius_km} km radius</div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleViewBids(req)}
                        className="px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Bids
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotations Modal */}
      {showModal && selectedReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Bids for "{selectedReq.title}"</h3>
                <p className="text-sm text-gray-500 mt-1">Buyer: {selectedReq.users?.full_name}</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {loadingQuotes ? (
                <div className="text-center py-8 text-gray-500">Loading bids...</div>
              ) : quotations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📥</div>
                  <h4 className="text-lg font-medium text-gray-800">No Bids Yet</h4>
                  <p className="text-gray-500">Vendors haven't submitted any quotations for this requirement.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotations.map(quote => (
                    <div key={quote.id} className={`p-4 border rounded-xl ${quote.status === 'accepted' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-lg text-gray-800">{quote.vendors?.name || 'Unknown Vendor'}</div>
                          <div className="text-sm text-gray-500">
                            {quote.vendors?.city} • ⭐️ {quote.vendors?.rating || 'New'}
                          </div>
                          {quote.status === 'accepted' && (
                            <div className="text-sm text-green-700 mt-1">
                              📞 {quote.vendors?.contact_number || 'No contact info'}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-orange-600">₹{quote.price}</div>
                          {quote.status === 'accepted' ? (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-200 text-green-800 text-xs font-bold rounded">ACCEPTED</span>
                          ) : (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded uppercase">{quote.status}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm flex items-start gap-4">
                        <div>
                          <span className="text-gray-500 block mb-1">Delivery Time</span>
                          <span className="font-medium text-gray-800">{quote.delivery_time || 'Standard'}</span>
                        </div>
                        {quote.note && (
                          <div className="flex-1 border-l pl-4 border-gray-200">
                            <span className="text-gray-500 block mb-1">Vendor Note</span>
                            <span className="italic text-gray-700">"{quote.note}"</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 text-xs text-gray-400 border-t pt-2 border-gray-200/60">
                        Submitted: {formatDate(quote.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
