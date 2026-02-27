/** @deprecated Use database categories via API instead */
export const TOP_8_CATEGORIES = [];

/** @deprecated Use database categories via API instead */
export const ALL_CATEGORIES = [];

// Get category by ID
export const getCategoryById = (id) => {
  return ALL_CATEGORIES.find(cat => cat.id === id);
};

// Get category by name
export const getCategoryByName = (name) => {
  return ALL_CATEGORIES.find(cat => cat.name === name);
};
