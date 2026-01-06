// Default Indian States, Cities, Towns, Tehsils, and Sub-tehsils
export const INDIAN_LOCATIONS = {
  "Delhi": {
    cities: {
      "New Delhi": {
        towns: {
          "Central Delhi": {
            tehsils: {
              "Connaught Place": {
                subTehsils: ["CP", "Janpath", "Parliament Street"]
              },
              "Chandni Chowk": {
                subTehsils: ["Old Delhi", "Red Fort", "Jama Masjid"]
              }
            }
          },
          "South Delhi": {
            tehsils: {
              "Saket": {
                subTehsils: ["Malviya Nagar", "Hauz Khas", "Green Park"]
              },
              "Vasant Kunj": {
                subTehsils: ["Vasant Vihar", "Munirka", "RK Puram"]
              }
            }
          }
        }
      }
    }
  },
  "Maharashtra": {
    cities: {
      "Mumbai": {
        towns: {
          "Mumbai Suburban": {
            tehsils: {
              "Andheri": {
                subTehsils: ["Andheri East", "Andheri West", "Jogeshwari"]
              },
              "Bandra": {
                subTehsils: ["Bandra East", "Bandra West", "Khar"]
              }
            }
          },
          "Thane": {
            tehsils: {
              "Thane": {
                subTehsils: ["Thane West", "Thane East", "Kopri"]
              }
            }
          }
        }
      },
      "Pune": {
        towns: {
          "Pune": {
            tehsils: {
              "Pune City": {
                subTehsils: ["Shivajinagar", "Kothrud", "Hinjewadi"]
              }
            }
          }
        }
      }
    }
  },
  "Karnataka": {
    cities: {
      "Bangalore": {
        towns: {
          "Bangalore Urban": {
            tehsils: {
              "Bangalore North": {
                subTehsils: ["Hebbal", "Yelahanka", "Yeshwanthpur"]
              },
              "Bangalore South": {
                subTehsils: ["Koramangala", "HSR Layout", "BTM Layout"]
              }
            }
          }
        }
      }
    }
  },
  "Gujarat": {
    cities: {
      "Ahmedabad": {
        towns: {
          "Ahmedabad": {
            tehsils: {
              "Ahmedabad City": {
                subTehsils: ["Navrangpura", "Maninagar", "Vastrapur"]
              }
            }
          }
        }
      }
    }
  },
  "Tamil Nadu": {
    cities: {
      "Chennai": {
        towns: {
          "Chennai": {
            tehsils: {
              "Chennai North": {
                subTehsils: ["T Nagar", "Anna Nagar", "Kilpauk"]
              }
            }
          }
        }
      }
    }
  },
  "West Bengal": {
    cities: {
      "Kolkata": {
        towns: {
          "Kolkata": {
            tehsils: {
              "Kolkata North": {
                subTehsils: ["Salt Lake", "New Town", "Rajarhat"]
              }
            }
          }
        }
      }
    }
  },
  "Rajasthan": {
    cities: {
      "Jaipur": {
        towns: {
          "Jaipur": {
            tehsils: {
              "Jaipur City": {
                subTehsils: ["Malviya Nagar", "Vaishali Nagar", "C Scheme"]
              }
            }
          }
        }
      }
    }
  },
  "Uttar Pradesh": {
    cities: {
      "Lucknow": {
        towns: {
          "Lucknow": {
            tehsils: {
              "Lucknow City": {
                subTehsils: ["Gomti Nagar", "Hazratganj", "Aliganj"]
              }
            }
          }
        }
      }
    }
  },
  "Telangana": {
    cities: {
      "Hyderabad": {
        towns: {
          "Hyderabad": {
            tehsils: {
              "Hyderabad Central": {
                subTehsils: ["Banjara Hills", "Jubilee Hills", "Hitech City"]
              }
            }
          }
        }
      }
    }
  },
  "Punjab": {
    cities: {
      "Chandigarh": {
        towns: {
          "Chandigarh": {
            tehsils: {
              "Chandigarh": {
                subTehsils: ["Sector 17", "Sector 35", "Sector 22"]
              }
            }
          }
        }
      }
    }
  }
};

// Helper functions to get location lists
export const getStates = () => Object.keys(INDIAN_LOCATIONS);

export const getCities = (state) => {
  if (!state || !INDIAN_LOCATIONS[state]) return [];
  return Object.keys(INDIAN_LOCATIONS[state].cities);
};

export const getTowns = (state, city) => {
  if (!state || !city || !INDIAN_LOCATIONS[state]?.cities[city]) return [];
  return Object.keys(INDIAN_LOCATIONS[state].cities[city].towns);
};

export const getTehsils = (state, city, town) => {
  if (!state || !city || !town || !INDIAN_LOCATIONS[state]?.cities[city]?.towns[town]) return [];
  return Object.keys(INDIAN_LOCATIONS[state].cities[city].towns[town].tehsils);
};

export const getSubTehsils = (state, city, town, tehsil) => {
  if (!state || !city || !town || !tehsil || !INDIAN_LOCATIONS[state]?.cities[city]?.towns[town]?.tehsils[tehsil]) return [];
  return INDIAN_LOCATIONS[state].cities[city].towns[town].tehsils[tehsil].subTehsils;
};

// Get all locations in a flat structure for easy filtering
export const getAllLocations = () => {
  const locations = [];
  Object.keys(INDIAN_LOCATIONS).forEach(state => {
    Object.keys(INDIAN_LOCATIONS[state].cities).forEach(city => {
      Object.keys(INDIAN_LOCATIONS[state].cities[city].towns).forEach(town => {
        Object.keys(INDIAN_LOCATIONS[state].cities[city].towns[town].tehsils).forEach(tehsil => {
          const subTehsils = INDIAN_LOCATIONS[state].cities[city].towns[town].tehsils[tehsil].subTehsils;
          subTehsils.forEach(subTehsil => {
            locations.push({
              state,
              city,
              town,
              tehsil,
              subTehsil,
              fullPath: `${state} > ${city} > ${town} > ${tehsil} > ${subTehsil}`
            });
          });
        });
      });
    });
  });
  return locations;
};
