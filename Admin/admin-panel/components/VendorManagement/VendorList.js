'use client';

import { useEffect, useMemo, useState } from 'react';
import { getStates, getCities, getTowns, getTehsils, getSubTehsils } from '@/constants/locations';

const statusColors = {
  Active: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Blocked: 'bg-red-100 text-red-800',
};

export default function VendorList({ onViewProfile }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVendor, setEditingVendor] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [locationFilters, setLocationFilters] = useState({
    state: 'All',
    city: 'All',
    town: 'All',
    tehsil: 'All',
    subTehsil: 'All',
  });

  const states = ['All', ...getStates()];
  const cities = locationFilters.state === 'All' ? ['All'] : ['All', ...getCities(locationFilters.state)];
  const towns = locationFilters.state === 'All' || locationFilters.city === 'All'
    ? ['All']
    : ['All', ...getTowns(locationFilters.state, locationFilters.city)];
  const tehsils = locationFilters.state === 'All' || locationFilters.city === 'All' || locationFilters.town === 'All'
    ? ['All']
    : ['All', ...getTehsils(locationFilters.state, locationFilters.city, locationFilters.town)];
  const subTehsils = locationFilters.state === 'All' || locationFilters.city === 'All' || locationFilters.town === 'All' || locationFilters.tehsil === 'All'
    ? ['All']
    : ['All', ...getSubTehsils(locationFilters.state, locationFilters.city, locationFilters.town, locationFilters.tehsil)];

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filter && filter !== 'all') params.set('status', filter);
    if (searchQuery) params.set('q', searchQuery);

    if (locationFilters.state && locationFilters.state !== 'All') params.set('state', locationFilters.state);
    if (locationFilters.city && locationFilters.city !== 'All') params.set('city', locationFilters.city);
    if (locationFilters.town && locationFilters.town !== 'All') params.set('town', locationFilters.town);
    if (locationFilters.tehsil && locationFilters.tehsil !== 'All') params.set('tehsil', locationFilters.tehsil);
    if (locationFilters.subTehsil && locationFilters.subTehsil !== 'All') params.set('subTehsil', locationFilters.subTehsil);

    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.limit));

    return params.toString();
  }, [filter, searchQuery, locationFilters, pagination.page, pagination.limit]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/vendors${queryString ? `?${queryString}` : ''}`, {
          cache: 'no-store',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Failed to load vendors');
        if (!cancelled) {
          setVendors(Array.isArray(data?.vendors) ? data.vendors : []);
          if (data.pagination) {
            setPagination(data.pagination);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load vendors');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const t = setTimeout(load, searchQuery ? 250 : 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [queryString, searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filter, searchQuery, locationFilters.state, locationFilters.city, locationFilters.town, locationFilters.tehsil, locationFilters.subTehsil]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: Number(newLimit), page: 1 }));
  };

  const handleLocationFilterChange = (key, value) => {
    setLocationFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // Reset dependent filters
      if (key === 'state') {
        newFilters.city = 'All';
        newFilters.town = 'All';
        newFilters.tehsil = 'All';
        newFilters.subTehsil = 'All';
      } else if (key === 'city') {
        newFilters.town = 'All';
        newFilters.tehsil = 'All';
        newFilters.subTehsil = 'All';
      } else if (key === 'town') {
        newFilters.tehsil = 'All';
        newFilters.subTehsil = 'All';
      } else if (key === 'tehsil') {
        newFilters.subTehsil = 'All';
      }
      return newFilters;
    });
  };

  const handleStatusChange = async (vendorId, newStatus) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }

    try {
      setUpdatingStatus(vendorId);
      const res = await fetch('/api/vendors/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendorId, status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to update status');

      // Update local state
      setVendors(prev => prev.map(v =>
        v.id === vendorId ? { ...v, status: newStatus } : v
      ));
    } catch (e) {
      alert(`Failed to update status: ${e.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor({ ...vendor });
  };

  const handleSaveEdit = async () => {
    if (!editingVendor.name?.trim()) {
      alert('Vendor name is required');
      return;
    }

    try {
      const res = await fetch('/api/vendors/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingVendor.id,
          name: editingVendor.name,
          owner: editingVendor.owner,
          owner_name: editingVendor.owner,
          status: editingVendor.status,
          kycStatus: editingVendor.kycStatus,
          contactNumber: editingVendor.contactNumber,
          email: editingVendor.email,
          state: editingVendor.state,
          city: editingVendor.city,
          category: editingVendor.category,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to update vendor');

      // Reload vendors with current pagination
      const reloadParams = new URLSearchParams();
      if (filter && filter !== 'all') reloadParams.set('status', filter);
      if (searchQuery) reloadParams.set('q', searchQuery);
      if (locationFilters.state && locationFilters.state !== 'All') reloadParams.set('state', locationFilters.state);
      if (locationFilters.city && locationFilters.city !== 'All') reloadParams.set('city', locationFilters.city);
      if (locationFilters.town && locationFilters.town !== 'All') reloadParams.set('town', locationFilters.town);
      if (locationFilters.tehsil && locationFilters.tehsil !== 'All') reloadParams.set('tehsil', locationFilters.tehsil);
      if (locationFilters.subTehsil && locationFilters.subTehsil !== 'All') reloadParams.set('subTehsil', locationFilters.subTehsil);
      reloadParams.set('page', String(pagination.page));
      reloadParams.set('limit', String(pagination.limit));

      const loadRes = await fetch(`/api/vendors?${reloadParams.toString()}`, { cache: 'no-store' });
      const loadData = await loadRes.json().catch(() => ({}));
      if (loadRes.ok) {
        if (Array.isArray(loadData?.vendors)) {
          setVendors(loadData.vendors);
        }
        if (loadData.pagination) {
          setPagination(loadData.pagination);
        }
      }

      setEditingVendor(null);
      alert('Vendor updated successfully');
    } catch (e) {
      alert(`Failed to update vendor: ${e.message}`);
    }
  };

  // Filter vendors (server-side filtering is already done, but we can do client-side filtering for search)

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <div className="font-semibold">Failed to load vendors</div>
          <div className="text-sm mt-1">{error}</div>
          <div className="text-xs mt-2 text-red-700">
            Check admin env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only).
          </div>
        </div>
      )}

      {/* Search and Status Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Vendors ({vendors.length})</h2>
          {vendors.length > 0 && (
            <button
              onClick={async () => {
                try {
                  const params = new URLSearchParams();
                  if (filter !== 'all') params.set('status', filter);
                  if (locationFilters.state !== 'All') params.set('state', locationFilters.state);
                  if (locationFilters.city !== 'All') params.set('city', locationFilters.city);
                  const res = await fetch(`/api/vendors/export?${params.toString()}`, { cache: 'no-store' });
                  if (!res.ok) throw new Error('Failed to export');
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `vendors_export_${new Date().toISOString().split('T')[0]}.xlsx`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                } catch (e) {
                  alert(`Failed to export: ${e.message}`);
                }
              }}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              📥 Export Vendors
            </button>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 items-center">
            {['all', 'Active', 'Pending', 'Blocked'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status === 'all' ? 'all' : status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${filter === (status === 'all' ? 'all' : status)
                  ? 'gradient-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status}
              </button>
            ))}
            {loading && <span className="text-sm text-gray-600 ml-2">Loading…</span>}
          </div>
        </div>
      </div>

      {/* Location Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Location Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <select
              value={locationFilters.state}
              onChange={(e) => handleLocationFilterChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select
              value={locationFilters.city}
              onChange={(e) => handleLocationFilterChange('city', e.target.value)}
              disabled={locationFilters.state === 'All'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Town</label>
            <select
              value={locationFilters.town}
              onChange={(e) => handleLocationFilterChange('town', e.target.value)}
              disabled={locationFilters.city === 'All'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {towns.map(town => (
                <option key={town} value={town}>{town}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tehsil</label>
            <select
              value={locationFilters.tehsil}
              onChange={(e) => handleLocationFilterChange('tehsil', e.target.value)}
              disabled={locationFilters.town === 'All'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {tehsils.map(tehsil => (
                <option key={tehsil} value={tehsil}>{tehsil}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Tehsil</label>
            <select
              value={locationFilters.subTehsil}
              onChange={(e) => handleLocationFilterChange('subTehsil', e.target.value)}
              disabled={locationFilters.tehsil === 'All'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {subTehsils.map(subTehsil => (
                <option key={subTehsil} value={subTehsil}>{subTehsil}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Total: {pagination.total} vendor(s)
          </p>
          <button
            onClick={() => setLocationFilters({
              state: 'All',
              city: 'All',
              town: 'All',
              tehsil: 'All',
              subTehsil: 'All',
            })}
            className="text-sm text-orange-600 hover:text-orange-800 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            {searchQuery || filter !== 'all' || Object.values(locationFilters).some(f => f !== 'All')
              ? 'No vendors found matching your filters.'
              : 'No vendors found.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KYC Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{vendor.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{vendor.owner || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{vendor.contactNumber || '-'}</div>
                        {vendor.email && (
                          <div className="text-xs text-gray-500">{vendor.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {[vendor.city, vendor.state].filter(Boolean).join(', ') || '-'}
                        </div>
                        {(vendor.town || vendor.tehsil) && (
                          <div className="text-xs text-gray-500">
                            {[vendor.town, vendor.tehsil].filter(Boolean).join(' > ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{vendor.category || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={vendor.status || 'Pending'}
                          onChange={(e) => handleStatusChange(vendor.id, e.target.value)}
                          disabled={updatingStatus === vendor.id}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${vendor.status === 'Active' ? 'bg-green-100 text-green-800' :
                            vendor.status === 'Blocked' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            } ${updatingStatus === vendor.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Blocked">Blocked</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{vendor.kycStatus || 'Pending'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{vendor.productCount || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(vendor)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onViewProfile(vendor)}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} vendors
                  </span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => handleLimitChange(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 text-sm border rounded-lg transition ${pagination.page === pageNum
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Vendor Modal */}
      {editingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Vendor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name *</label>
                <input
                  type="text"
                  value={editingVendor.name || ''}
                  onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter vendor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                <input
                  type="text"
                  value={editingVendor.owner || ''}
                  onChange={(e) => setEditingVendor({ ...editingVendor, owner: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter owner name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editingVendor.status || 'Pending'}
                    onChange={(e) => setEditingVendor({ ...editingVendor, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
                  <select
                    value={editingVendor.kycStatus || 'Pending'}
                    onChange={(e) => setEditingVendor({ ...editingVendor, kycStatus: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="text"
                    value={editingVendor.contactNumber || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, contactNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter contact number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingVendor.email || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={editingVendor.state || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={editingVendor.city || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={editingVendor.category || ''}
                  onChange={(e) => setEditingVendor({ ...editingVendor, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter category"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingVendor(null)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



