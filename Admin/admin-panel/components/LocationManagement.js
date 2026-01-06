'use client';

import { useState } from 'react';
import { INDIAN_LOCATIONS, getStates, getCities, getTowns, getTehsils, getSubTehsils } from '@/constants/locations';

export default function LocationManagement() {
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
  });

  const states = getStates();
  const cities = selectedState ? getCities(selectedState) : [];
  const towns = selectedState && selectedCity ? getTowns(selectedState, selectedCity) : [];
  const tehsils = selectedState && selectedCity && selectedTown ? getTehsils(selectedState, selectedCity, selectedTown) : [];
  const subTehsils = selectedState && selectedCity && selectedTown && selectedTehsil ? getSubTehsils(selectedState, selectedCity, selectedTown, selectedTehsil) : [];

  const handleAddLocation = () => {
    // In production, this would send to API
    alert(`Location added: ${formData.state} > ${formData.city} > ${formData.town} > ${formData.tehsil} > ${formData.subTehsil}`);
    setFormData({ state: '', city: '', town: '', tehsil: '', subTehsil: '' });
    setShowAddForm(false);
  };

  const getLocationCount = () => {
    let count = 0;
    Object.keys(INDIAN_LOCATIONS).forEach(state => {
      Object.keys(INDIAN_LOCATIONS[state].cities).forEach(city => {
        Object.keys(INDIAN_LOCATIONS[state].cities[city].towns).forEach(town => {
          Object.keys(INDIAN_LOCATIONS[state].cities[city].towns[town].tehsils).forEach(tehsil => {
            count += INDIAN_LOCATIONS[state].cities[city].towns[town].tehsils[tehsil].subTehsils.length;
          });
        });
      });
    });
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total States</div>
          <div className="text-2xl font-bold text-gray-900">{states.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Cities</div>
          <div className="text-2xl font-bold text-gray-900">
            {Object.values(INDIAN_LOCATIONS).reduce((sum, state) => 
              sum + Object.keys(state.cities).length, 0
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Towns</div>
          <div className="text-2xl font-bold text-gray-900">
            {Object.values(INDIAN_LOCATIONS).reduce((sum, state) => 
              sum + Object.values(state.cities).reduce((citySum, city) => 
                citySum + Object.keys(city.towns).length, 0
              ), 0
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Locations</div>
          <div className="text-2xl font-bold text-gray-900">{getLocationCount()}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Town</label>
                <input
                  type="text"
                  value={formData.town}
                  onChange={(e) => setFormData({...formData, town: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter Town"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tehsil</label>
                <input
                  type="text"
                  value={formData.tehsil}
                  onChange={(e) => setFormData({...formData, tehsil: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter Tehsil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Tehsil</label>
                <input
                  type="text"
                  value={formData.subTehsil}
                  onChange={(e) => setFormData({...formData, subTehsil: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter Sub-Tehsil"
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">State</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">City</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Town</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Tehsil</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Sub-Tehsils</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {states.slice(0, 10).map(state => {
                const stateData = INDIAN_LOCATIONS[state];
                return Object.keys(stateData.cities).map(city => {
                  const cityData = stateData.cities[city];
                  return Object.keys(cityData.towns).map(town => {
                    const townData = cityData.towns[town];
                    return Object.keys(townData.tehsils).map(tehsil => {
                      const subTehsils = townData.tehsils[tehsil].subTehsils;
                      return (
                        <tr key={`${state}-${city}-${town}-${tehsil}`} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-900">{state}</td>
                          <td className="px-4 py-2 text-gray-900">{city}</td>
                          <td className="px-4 py-2 text-gray-900">{town}</td>
                          <td className="px-4 py-2 text-gray-900">{tehsil}</td>
                          <td className="px-4 py-2 text-gray-600">
                            <div className="flex flex-wrap gap-1">
                              {subTehsils.slice(0, 3).map((st, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                  {st}
                                </span>
                              ))}
                              {subTehsils.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                  +{subTehsils.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  });
                });
              })}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-4">Showing first 10 locations. Use filters above to find specific locations.</p>
      </div>
    </div>
  );
}
