'use client';

import { useEffect, useMemo, useState } from 'react';
import LocationImport from './LocationManagement/LocationImport';

export default function LocationManagement() {
  const [activeTab, setActiveTab] = useState('browse');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    state: '',
    city: '',
    town: '',
    tehsil: '',
    subTehsil: '',
    circle: '',
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/locations?limit=2000', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Failed to load locations');
        if (!cancelled) setLocations(Array.isArray(data?.locations) ? data.locations : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load locations');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const states = useMemo(() => {
    return Array.from(new Set(locations.map(l => l.state))).sort();
  }, [locations]);

  const cities = useMemo(() => {
    if (!selectedState) return [];
    return Array.from(new Set(locations.filter(l => l.state === selectedState).map(l => l.city))).sort();
  }, [locations, selectedState]);

  const towns = useMemo(() => {
    if (!selectedState || !selectedCity) return [];
    return Array.from(new Set(locations.filter(l => l.state === selectedState && l.city === selectedCity).map(l => l.town))).sort();
  }, [locations, selectedState, selectedCity]);

  const tehsils = useMemo(() => {
    if (!selectedState || !selectedCity || !selectedTown) return [];
    return Array.from(new Set(locations.filter(l => l.state === selectedState && l.city === selectedCity && l.town === selectedTown).map(l => l.tehsil))).sort();
  }, [locations, selectedState, selectedCity, selectedTown]);

  const subTehsils = useMemo(() => {
    if (!selectedState || !selectedCity || !selectedTown || !selectedTehsil) return [];
    return Array.from(
      new Set(
        locations
          .filter(l => l.state === selectedState && l.city === selectedCity && l.town === selectedTown && l.tehsil === selectedTehsil)
          .map(l => l.sub_tehsil)
      )
    ).sort();
  }, [locations, selectedState, selectedCity, selectedTown, selectedTehsil]);

  const handleAddLocation = async () => {
    try {
      setResult(null);
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to add location');
      setLocations(prev => [data.location, ...prev]);
      setFormData({ state: '', city: '', town: '', tehsil: '', subTehsil: '', circle: '' });
      setShowAddForm(false);
      setResult({ success: true, message: 'Location added successfully.' });
    } catch (e) {
      setResult({ success: false, message: e?.message || 'Failed to add location' });
    }
  };

  const [result, setResult] = useState(null);

  const locationCount = locations.length;
  const cityCount = useMemo(() => new Set(locations.map(l => `${l.state}::${l.city}`)).size, [locations]);
  const townCount = useMemo(() => new Set(locations.map(l => `${l.state}::${l.city}::${l.town}`)).size, [locations]);

  const reloadLocations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/locations?limit=2000', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to load locations');
      setLocations(Array.isArray(data?.locations) ? data.locations : []);
    } catch (e) {
      setError(e?.message || 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'browse', label: 'Browse Locations' },
    { id: 'import', label: 'Import Locations' },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <div className="font-semibold">Location API error</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      )}
      {result && (
        <div className={`rounded-lg p-4 ${result.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {result.message}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === tab.id
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <LocationImport onImportSuccess={reloadLocations} />
      )}

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total States</div>
              <div className="text-2xl font-bold text-gray-900">{states.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Cities</div>
              <div className="text-2xl font-bold text-gray-900">{cityCount}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Towns</div>
              <div className="text-2xl font-bold text-gray-900">{townCount}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Locations</div>
              <div className="text-2xl font-bold text-gray-900">{locationCount}</div>
            </div>
          </div>

          {/* Location Browser */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Location Browser</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="gradient-primary text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                {showAddForm ? 'Cancel' : '+ Add Location'}
              </button>
            </div>

            {/* Add Location Form */}
            {showAddForm && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-4">Add New Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Town</label>
                    <input
                      type="text"
                      value={formData.town}
                      onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter Town"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tehsil</label>
                    <input
                      type="text"
                      value={formData.tehsil}
                      onChange={(e) => setFormData({ ...formData, tehsil: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter Tehsil"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Tehsil</label>
                    <input
                      type="text"
                      value={formData.subTehsil}
                      onChange={(e) => setFormData({ ...formData, subTehsil: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter Sub-Tehsil"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Circle (Optional)</label>
                    <input
                      type="text"
                      value={formData.circle}
                      onChange={(e) => setFormData({ ...formData, circle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., North Circle"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddLocation}
                  className="mt-4 gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Add Location
                </button>
              </div>
            )}

            {/* Location Hierarchy Browser */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select State</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity('');
                    setSelectedTown('');
                    setSelectedTehsil('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">-- Select State --</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {selectedState && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedTown('');
                      setSelectedTehsil('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">-- Select City --</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedState && selectedCity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Town</label>
                  <select
                    value={selectedTown}
                    onChange={(e) => {
                      setSelectedTown(e.target.value);
                      setSelectedTehsil('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">-- Select Town --</option>
                    {towns.map(town => (
                      <option key={town} value={town}>{town}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedState && selectedCity && selectedTown && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Tehsil</label>
                  <select
                    value={selectedTehsil}
                    onChange={(e) => setSelectedTehsil(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">-- Select Tehsil --</option>
                    {tehsils.map(tehsil => (
                      <option key={tehsil} value={tehsil}>{tehsil}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedState && selectedCity && selectedTown && selectedTehsil && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Tehsils</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {subTehsils.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {subTehsils.map((subTehsil, index) => (
                          <div key={index} className="bg-white px-3 py-2 rounded border border-gray-200">
                            {subTehsil}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No sub-tehsils available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location List */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Locations</h2>
            {loading ? (
              <div className="text-sm text-gray-600">Loading locations…</div>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">State</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">City</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Town</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Tehsil</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Sub-Tehsil</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Circle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {locations.slice(0, 500).map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">{l.state}</td>
                      <td className="px-4 py-2 text-gray-900">{l.city}</td>
                      <td className="px-4 py-2 text-gray-900">{l.town}</td>
                      <td className="px-4 py-2 text-gray-900">{l.tehsil}</td>
                      <td className="px-4 py-2 text-gray-900">{l.sub_tehsil}</td>
                      <td className="px-4 py-2 text-gray-700">{l.circle || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4">Showing first {Math.min(500, locations.length)} locations.</p>
          </div>
        </>
      )}
    </div>
  );
}
