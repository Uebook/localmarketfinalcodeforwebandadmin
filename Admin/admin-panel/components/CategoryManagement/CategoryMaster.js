'use client';

import { useState } from 'react';

const categories = [
  { id: 1, name: 'Groceries', subCategories: ['Vegetables', 'Fruits', 'Dairy'], visible: true },
  { id: 2, name: 'Electronics', subCategories: ['Mobile', 'Laptops', 'Accessories'], visible: true },
  { id: 3, name: 'Clothing', subCategories: ['Men', 'Women', 'Kids'], visible: true },
  { id: 4, name: 'Medicines', subCategories: ['Prescription', 'OTC'], visible: false },
];

export default function CategoryMaster() {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', subCategories: [] });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Categories</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
        >
          + Create Category
        </button>
      </div>

      {/* Create Category Form */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Category</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter category name"
              />
            </div>
            <div className="flex gap-3">
              <button className="gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition">
                Save
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub-Categories</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {category.subCategories.map((sub, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {sub}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={category.visible}
                      className="sr-only peer"
                      readOnly
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



