'use client';

import { useState } from 'react';
import VendorDashboardLayout from '@/components/VendorDashboardLayout';
import ProductFormModal from '@/components/ProductFormModal';
import { INITIAL_VENDOR_DATA } from '@/lib/constants';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import Image from 'next/image';

export default function VendorCatalogPage() {
  const [vendor, setVendor] = useState(INITIAL_VENDOR_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = vendor.products?.filter(p => p.id !== productId) || [];
      setVendor(prev => ({
        ...prev,
        products: updatedProducts,
      }));
    }
  };

  const handleSaveProduct = (product: any) => {
    if (editingProduct) {
      // Update existing product
      const updatedProducts = vendor.products?.map(p =>
        p.id === editingProduct.id ? product : p
      ) || [];
      setVendor(prev => ({
        ...prev,
        products: updatedProducts,
      }));
    } else {
      // Add new product
      setVendor(prev => ({
        ...prev,
        products: [...(prev.products || []), product],
      }));
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const filteredProducts = vendor.products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <VendorDashboardLayout>
      <div className="p-4 sm:p-6">
        {/* Header with Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Catalog</h1>
              <p className="text-gray-900 mt-1">Manage your products and services</p>
            </div>
            <button
              onClick={handleAddProduct}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              <Plus size={20} />
              <span>Add Product</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={20} />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative h-48">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.inStock && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                      In Stock
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-gray-900">{product.name}</h3>
                  {product.category && (
                    <p className="text-gray-900 text-sm mb-2 font-medium">{product.category}</p>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-orange-500 font-bold text-lg">{product.price}</p>
                      {product.mrp && product.mrp !== product.price && (
                        <p className="text-gray-400 text-sm line-through">{product.mrp}</p>
                      )}
                    </div>
                    {product.stockQty && (
                      <span className="text-gray-900 text-sm font-medium">Qty: {product.stockQty}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No products found' : 'No Products Yet'}
            </h3>
            <p className="text-gray-900 mb-6">
              {searchQuery ? 'Try a different search term' : 'Start by adding your first product to the catalog'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleAddProduct}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showProductForm}
        onClose={() => {
          setShowProductForm(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />
    </VendorDashboardLayout>
  );
}
