'use client';

import { useState } from 'react';
import { getStates, getCities, getTowns, getTehsils, getSubTehsils } from '@/constants/locations';
import { VENDORS } from '@/constants/vendors';

const vendors = VENDORS;

const statusColors = {
  Active: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Blocked: 'bg-red-100 text-red-800',
};

export default function VendorList({ onViewProfile }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilters, setLocationFilters] = useState({
    state: 'All',
    city: 'All',
    town: 'All',
    tehsil: 'All',
    subTehsil: 'All',
    circle: 'All',
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
  const circles = ['All', 'North Circle', 'South Circle', 'East Circle', 'West Circle', 'Central Circle'];

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

  const filteredVendors = vendors.filter((vendor) => {
    const matchesFilter = filter === 'all' || vendor.status === filter;
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = locationFilters.state === 'All' || vendor.state === locationFilters.state;
    const matchesCity = locationFilters.city === 'All' || vendor.city === locationFilters.city;
    const matchesTown = locationFilters.town === 'All' || vendor.town === locationFilters.town;
    const matchesTehsil = locationFilters.tehsil === 'All' || vendor.tehsil === locationFilters.tehsil;
    const matchesSubTehsil = locationFilters.subTehsil === 'All' || vendor.subTehsil === locationFilters.subTehsil;
    const matchesCircle = locationFilters.circle === 'All' || vendor.circle === locationFilters.circle;
    
    return matchesFilter && matchesSearch && matchesState && matchesCity && matchesTown && 
           matchesTehsil && matchesSubTehsil && matchesCircle;
  });

  return (
    <div className="space-y-6">
      {/* Search and Status Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
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
          <div className="flex gap-2">
            {['all', 'Active', 'Pending', 'Blocked'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status === 'all' ? 'all' : status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === (status === 'all' ? 'all' : status)
                    ? 'gradient-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Location Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Circle</label>
            <select
              value={locationFilters.circle}
              onChange={(e) => handleLocationFilterChange('circle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              {circles.map(circle => (
                <option key={circle} value={circle}>{circle}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredVendors.length} vendor(s)
          </p>
          <button
            onClick={() => setLocationFilters({
              state: 'All',
              city: 'All',
              town: 'All',
              tehsil: 'All',
              subTehsil: 'All',
              circle: 'All',
            })}
            className="text-sm text-orange-600 hover:text-orange-800 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Vendor Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
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
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Circle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                      <div className="text-sm text-gray-500">{vendor.owner}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[vendor.status]}`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vendor.kycStatus}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.productCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">{vendor.city}, {vendor.state}</div>
                      <div className="text-xs text-gray-400">{vendor.town} {'>'} {vendor.tehsil}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vendor.circle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewProfile(vendor)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {vendor.status === 'Active' && (
                        <button className="text-red-600 hover:text-red-900">
                          Block
                        </button>
                      )}
                      {vendor.status === 'Blocked' && (
                        <button className="text-green-600 hover:text-green-900">
                          Unblock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



