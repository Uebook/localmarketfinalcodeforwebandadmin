/**
 * Location API Service
 * Fetches Indian states and cities from free APIs
 * Falls back to local data if API fails
 */

const API_BASE_URL = 'https://api.countrystatecity.in/v1';
// Note: This API requires a free API key. For now, we'll use local data.
// To use this API, sign up at https://countrystatecity.in/ and get a free API key

/**
 * Fetch states from API (requires API key)
 * @param {string} apiKey - API key from countrystatecity.in
 * @returns {Promise<Array<string>>}
 */
export const fetchStatesFromAPI = async (apiKey) => {
  try {
    const response = await fetch(`${API_BASE_URL}/countries/IN/states`, {
      headers: {
        'X-CSCAPI-KEY': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.map(state => state.name).sort();
  } catch (error) {
    console.error('Error fetching states from API:', error);
    throw error;
  }
};

/**
 * Fetch cities from API (requires API key)
 * @param {string} apiKey - API key from countrystatecity.in
 * @param {string} stateCode - State code (e.g., 'DL' for Delhi)
 * @returns {Promise<Array<string>>}
 */
export const fetchCitiesFromAPI = async (apiKey, stateCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/countries/IN/states/${stateCode}/cities`, {
      headers: {
        'X-CSCAPI-KEY': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.map(city => city.name).sort();
  } catch (error) {
    console.error('Error fetching cities from API:', error);
    throw error;
  }
};

/**
 * Alternative: Fetch from a public JSON endpoint
 * Using a public GitHub Gist or JSON file
 */
export const fetchStatesFromPublicAPI = async () => {
  try {
    // Using a public JSON file with Indian states and cities
    // This is a fallback option that doesn't require API keys
    const response = await fetch('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries.json');
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const countries = await response.json();
    const india = countries.find(country => country.name === 'India' || country.iso2 === 'IN');
    
    if (!india || !india.states) {
      throw new Error('India data not found');
    }

    return india.states.map(state => state.name).sort();
  } catch (error) {
    console.error('Error fetching states from public API:', error);
    throw error;
  }
};

/**
 * Fetch cities from public API
 */
export const fetchCitiesFromPublicAPI = async (stateName) => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries.json');
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const countries = await response.json();
    const india = countries.find(country => country.name === 'India' || country.iso2 === 'IN');
    
    if (!india || !india.states) {
      throw new Error('India data not found');
    }

    const state = india.states.find(s => s.name === stateName);
    
    if (!state || !state.cities) {
      return [];
    }

    return state.cities.map(city => city.name).sort();
  } catch (error) {
    console.error('Error fetching cities from public API:', error);
    throw error;
  }
};

/**
 * Enhanced location service that tries API first, falls back to local data
 */
export const getLocationsWithFallback = async (useAPI = false) => {
  if (!useAPI) {
    // Use local data by default
    const { getAllStates, getCitiesByState } = require('../constants/indianStatesCities');
    return {
      getStates: () => getAllStates(),
      getCities: (state) => getCitiesByState(state),
      source: 'local',
    };
  }

  try {
    // Try to fetch from public API
    const states = await fetchStatesFromPublicAPI();
    return {
      getStates: () => states,
      getCities: async (stateName) => {
        try {
          return await fetchCitiesFromPublicAPI(stateName);
        } catch (error) {
          console.error('Error fetching cities, falling back to local data:', error);
          const { getCitiesByState } = require('../constants/indianStatesCities');
          return getCitiesByState(stateName);
        }
      },
      source: 'api',
    };
  } catch (error) {
    console.error('Error fetching from API, falling back to local data:', error);
    // Fallback to local data
    const { getAllStates, getCitiesByState } = require('../constants/indianStatesCities');
    return {
      getStates: () => getAllStates(),
      getCities: (state) => getCitiesByState(state),
      source: 'local',
    };
  }
};
