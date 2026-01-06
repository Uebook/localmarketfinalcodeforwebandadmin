// Comprehensive location data structure for India
// States/Cities/Towns/Tehsils/Sub-tehsils

export const LOCATION_DATA = {
  'Delhi': {
    cities: {
      'New Delhi': {
        towns: {
          'Connaught Place': {
            tehsils: {
              'CP Central': {
                subTehsils: ['CP North', 'CP South', 'CP East', 'CP West']
              },
              'CP Outer': {
                subTehsils: ['CP Outer North', 'CP Outer South']
              }
            }
          },
          'Karol Bagh': {
            tehsils: {
              'Karol Bagh Main': {
                subTehsils: ['KB North', 'KB South', 'KB East', 'KB West']
              }
            }
          }
        }
      },
      'South Delhi': {
        towns: {
          'Saket': {
            tehsils: {
              'Saket Main': {
                subTehsils: ['Saket North', 'Saket South']
              }
            }
          },
          'Hauz Khas': {
            tehsils: {
              'Hauz Khas Main': {
                subTehsils: ['HK North', 'HK South']
              }
            }
          }
        }
      },
      'East Delhi': {
        towns: {
          'Laxmi Nagar': {
            tehsils: {
              'Laxmi Nagar Main': {
                subTehsils: ['LN North', 'LN South']
              }
            }
          },
          'Mayur Vihar': {
            tehsils: {
              'Mayur Vihar Main': {
                subTehsils: ['MV Phase 1', 'MV Phase 2', 'MV Phase 3']
              }
            }
          }
        }
      },
      'North Delhi': {
        towns: {
          'Rohini': {
            tehsils: {
              'Rohini Main': {
                subTehsils: ['Rohini Sector 1-10', 'Rohini Sector 11-20']
              }
            }
          },
          'Pitampura': {
            tehsils: {
              'Pitampura Main': {
                subTehsils: ['Pitampura North', 'Pitampura South']
              }
            }
          }
        }
      },
      'West Delhi': {
        towns: {
          'Dwarka': {
            tehsils: {
              'Dwarka Main': {
                subTehsils: ['Dwarka Sector 1-10', 'Dwarka Sector 11-20']
              }
            }
          },
          'Rajouri Garden': {
            tehsils: {
              'Rajouri Garden Main': {
                subTehsils: ['RG North', 'RG South']
              }
            }
          }
        }
      }
    }
  },
  'Uttar Pradesh': {
    cities: {
      'Noida': {
        towns: {
          'Sector 18': {
            tehsils: {
              'Sector 18 Main': {
                subTehsils: ['Sector 18 North', 'Sector 18 South']
              }
            }
          },
          'Sector 62': {
            tehsils: {
              'Sector 62 Main': {
                subTehsils: ['Sector 62 North', 'Sector 62 South']
              }
            }
          }
        }
      },
      'Ghaziabad': {
        towns: {
          'Vaishali': {
            tehsils: {
              'Vaishali Main': {
                subTehsils: ['Vaishali Sector 1', 'Vaishali Sector 2']
              }
            }
          }
        }
      }
    }
  },
  'Haryana': {
    cities: {
      'Gurgaon': {
        towns: {
          'Cyber City': {
            tehsils: {
              'Cyber City Main': {
                subTehsils: ['Cyber City Phase 1', 'Cyber City Phase 2']
              }
            }
          },
          'Sector 29': {
            tehsils: {
              'Sector 29 Main': {
                subTehsils: ['Sector 29 North', 'Sector 29 South']
              }
            }
          }
        }
      }
    }
  },
  'Maharashtra': {
    cities: {
      'Mumbai': {
        towns: {
          'Andheri': {
            tehsils: {
              'Andheri East': {
                subTehsils: ['Andheri East Main', 'Andheri East Sub']
              },
              'Andheri West': {
                subTehsils: ['Andheri West Main', 'Andheri West Sub']
              }
            }
          },
          'Bandra': {
            tehsils: {
              'Bandra Main': {
                subTehsils: ['Bandra North', 'Bandra South']
              }
            }
          }
        }
      }
    }
  },
  'Karnataka': {
    cities: {
      'Bangalore': {
        towns: {
          'Koramangala': {
            tehsils: {
              'Koramangala Main': {
                subTehsils: ['Koramangala 1st Block', 'Koramangala 5th Block']
              }
            }
          }
        }
      }
    }
  }
};

// Helper functions to get location lists
export const getStates = () => Object.keys(LOCATION_DATA);

export const getCities = (state) => {
  if (!state || !LOCATION_DATA[state]) return [];
  return Object.keys(LOCATION_DATA[state].cities || {});
};

export const getTowns = (state, city) => {
  if (!state || !city || !LOCATION_DATA[state]?.cities?.[city]) return [];
  return Object.keys(LOCATION_DATA[state].cities[city].towns || {});
};

export const getTehsils = (state, city, town) => {
  if (!state || !city || !town || !LOCATION_DATA[state]?.cities?.[city]?.towns?.[town]) return [];
  return Object.keys(LOCATION_DATA[state].cities[city].towns[town].tehsils || {});
};

export const getSubTehsils = (state, city, town, tehsil) => {
  if (!state || !city || !town || !tehsil || !LOCATION_DATA[state]?.cities?.[city]?.towns?.[town]?.tehsils?.[tehsil]) return [];
  return LOCATION_DATA[state].cities[city].towns[town].tehsils[tehsil].subTehsils || [];
};

// Format full address
export const formatLocation = (location) => {
  const parts = [];
  if (location.subTehsil) parts.push(location.subTehsil);
  if (location.tehsil) parts.push(location.tehsil);
  if (location.town) parts.push(location.town);
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.pincode) parts.push(location.pincode);
  return parts.join(', ');
};
