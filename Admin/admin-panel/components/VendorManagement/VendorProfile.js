'use client';

import { useState, useEffect, useCallback } from 'react';

const STATUS_OPTIONS = ['Pending', 'Active', 'Blocked'];
const KYC_OPTIONS = ['Pending', 'Submitted', 'Approved', 'Rejected'];

const statusColors = {
  Active: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Blocked: 'bg-red-100 text-red-800',
};
const kycColors = {
  Approved: 'bg-green-100 text-green-800',
  Submitted: 'bg-blue-100 text-blue-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Rejected: 'bg-red-100 text-red-800',
};

export default function VendorProfile({ vendor: initialVendor, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [vendor, setVendor] = useState(initialVendor);
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingField, setUpdatingField] = useState(null); // 'status' | 'kyc' | 'block'

  // Fetch live vendor data from DB
  const fetchVendorData = useCallback(async () => {
    if (!initialVendor?.id) return;
    setLoadingData(true);
    try {
      const res = await fetch(
        `/api/vendors/${initialVendor.id}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.vendor) setVendor(prev => ({ ...prev, ...data.vendor }));
        setProducts(Array.isArray(data.products) ? data.products : []);
        setEnquiries(Array.isArray(data.enquiries) ? data.enquiries : []);
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      }
    } catch (e) {
      console.error('Failed to fetch vendor data:', e);
    }
    setLoadingData(false);
  }, [initialVendor?.id]);

  useEffect(() => { fetchVendorData(); }, [fetchVendorData]);

  // Patch vendor status or kycStatus
  const patchVendor = async (payload, field) => {
    setUpdatingField(field);
    try {
      const res = await fetch('/api/vendors/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendor.id, ...payload }),
      });
      const data = await res.json();
      if (res.ok && data.vendor) {
        setVendor(prev => ({
          ...prev,
          status: data.vendor.status ?? prev.status,
          kycStatus: data.vendor.kyc_status ?? prev.kycStatus,
        }));
      }
    } catch (e) {
      console.error('Patch failed:', e);
    }
    setUpdatingField(null);
  };

  // Average rating from real reviews
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
    : (vendor.rating ?? 0).toFixed(1);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: `Products (${products.length})` },
    { id: 'enquiries', label: `Enquiries (${enquiries.length})` },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="p-6 max-w-5xl">
      <button onClick={onBack} className="mb-5 text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm">
        ← Back to Vendor List
      </button>

      {/* ── Vendor Header Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{vendor.name}</h1>
            <p className="text-gray-500 text-sm">Owner: {vendor.ownerName ?? vendor.owner ?? '—'}</p>
            <p className="text-gray-400 text-xs mt-0.5">{vendor.category} · {vendor.city}</p>
          </div>
          {/* Activation Status Dropdown */}
          <div className="flex flex-col items-end gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Activation Status</label>
            <div className="relative">
              <select
                value={vendor.status ?? 'Pending'}
                disabled={updatingField === 'status'}
                onChange={e => patchVendor({ status: e.target.value }, 'status')}
                className={`appearance-none pr-8 pl-3 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer focus:outline-none ${statusColors[vendor.status] ?? 'bg-gray-100 text-gray-700'}`}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {updatingField === 'status' && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">⏳</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {/* KYC Status Dropdown */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">KYC Status</label>
            <select
              value={vendor.kycStatus ?? 'Pending'}
              disabled={updatingField === 'kyc'}
              onChange={e => patchVendor({ kycStatus: e.target.value }, 'kyc')}
              className={`appearance-none w-full px-3 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer focus:outline-none ${kycColors[vendor.kycStatus] ?? 'bg-gray-100 text-gray-700'}`}
            >
              {KYC_OPTIONS.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Products</label>
            <p className="text-sm font-bold text-gray-900">{products.length}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Reviews</label>
            <p className="text-sm font-bold text-gray-900">{reviews.length} ({avgRating}★)</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Enquiries</label>
            <p className="text-sm font-bold text-gray-900">{enquiries.length}</p>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Address</label>
            <p className="text-sm text-gray-700">{[vendor.address, vendor.city, vendor.pincode].filter(Boolean).join(', ') || '—'}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Phone</label>
            <p className="text-sm text-gray-700">{vendor.phone ?? vendor.contactNumber ?? '—'}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Email</label>
            <p className="text-sm text-gray-700">{vendor.email || '—'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
          {vendor.status !== 'Blocked' ? (
            <button
              onClick={() => patchVendor({ status: 'Blocked' }, 'block')}
              disabled={!!updatingField}
              className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {updatingField === 'block' ? 'Blocking…' : 'Block Vendor'}
            </button>
          ) : (
            <button
              onClick={() => patchVendor({ status: 'Active' }, 'block')}
              disabled={!!updatingField}
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {updatingField === 'block' ? 'Unblocking…' : 'Unblock Vendor'}
            </button>
          )}
          {vendor.status === 'Pending' && (
            <button
              onClick={() => patchVendor({ status: 'Active' }, 'block')}
              disabled={!!updatingField}
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              Approve & Activate
            </button>
          )}
          {vendor.phone && (
            <a
              href={`tel:${vendor.phone}`}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Call Vendor
            </a>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Products Listed', value: products.length },
              { label: 'Enquiries Received', value: enquiries.length },
              { label: 'Total Reviews', value: reviews.length },
              { label: 'Avg Rating', value: `${avgRating} ★` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Registration Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Registration Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-400">Vendor ID</span><p className="font-mono font-medium text-gray-800 text-xs mt-0.5">{vendor.id}</p></div>
              <div><span className="text-gray-400">Registered</span><p className="font-medium text-gray-800 mt-0.5">{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('en-IN') : '—'}</p></div>
              <div><span className="text-gray-400">Category</span><p className="font-medium text-gray-800 mt-0.5">{vendor.category || '—'}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* ── Products Tab ── */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loadingData ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 font-medium">No products listed yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Category', 'Price', 'MRP', 'Stock'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{p.name ?? p.product_name}</td>
                    <td className="py-3 px-4 text-gray-500">{p.category ?? '—'}</td>
                    <td className="py-3 px-4 text-green-700 font-semibold">₹{p.price ?? p.selling_price ?? '—'}</td>
                    <td className="py-3 px-4 text-gray-400 line-through">₹{p.mrp ?? '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{p.stock_qty ?? p.quantity ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Enquiries Tab ── */}
      {activeTab === 'enquiries' && (
        <div className="space-y-3">
          {loadingData ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : enquiries.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <p className="text-gray-400 font-medium">No enquiries yet</p>
            </div>
          ) : (
            enquiries.map(e => {
              const name = e.customer_name ?? e.name ?? e.senderName ?? 'Customer';
              const phone = e.customer_phone ?? e.phone ?? e.senderMobile ?? '';
              const msg = e.message ?? e.service ?? '';
              const date = e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN') : '';
              return (
                <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-gray-900">{name}</p>
                    <span className="text-xs text-gray-400">{date}</span>
                  </div>
                  {phone && <p className="text-xs text-gray-500 mb-2">📞 {phone}</p>}
                  <p className="text-sm text-gray-700">{msg || '—'}</p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Reviews Tab ── */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {loadingData ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <p className="text-gray-400 font-medium">No reviews yet</p>
            </div>
          ) : (
            reviews.map(r => {
              const name = r.reviewer_name ?? r.customer_name ?? r.userName ?? 'Customer';
              const comment = r.comment ?? r.review ?? r.text ?? '';
              const rating = r.rating ?? r.stars ?? 0;
              const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '';
              return (
                <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{name}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rating >= 4 ? 'bg-green-50 text-green-700' : rating >= 3 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                        {Math.round(rating)}★
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{date}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment || '—'}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
