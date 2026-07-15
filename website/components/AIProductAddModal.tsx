'use client';

import { useState } from 'react';
import { X, Sparkles, PlusCircle, Search, ChevronDown } from 'lucide-react';
import { getAllCategoriesWithSuggestions, getSuggestedItemsByCategory, AIProductSuggestion } from '@/lib/aiDefaultItems';

interface AIProductAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectProduct: (product: AIProductSuggestion) => void;
}

export default function AIProductAddModal({ isOpen, onClose, onSelectProduct }: AIProductAddModalProps) {
    const categories = getAllCategoriesWithSuggestions().sort((a, b) => a.localeCompare(b));
    const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || '');
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const suggestions = selectedCategory ? getSuggestedItemsByCategory(selectedCategory) : [];
    
    const filteredSuggestions = suggestions.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-orange-100/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">AI Product Suggestions</h2>
                            <p className="text-sm font-bold text-slate-500 mt-1">Auto-fill your catalog quickly</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Category & Search Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6 border-b border-slate-100 bg-white">
                        {/* Category Dropdown */}
                        <div className="flex-1 relative">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Category</label>
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        setSearchQuery(''); // Reset search query when category changes
                                    }}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-50 transition-all font-bold text-slate-700 shadow-sm appearance-none cursor-pointer pr-10"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Search Box */}
                        <div className="flex-1 relative">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Search Products</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder={`Search in ${selectedCategory}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-50 transition-all font-medium text-slate-700 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Suggestions ScrollView */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
                        {filteredSuggestions.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                                {filteredSuggestions.map((item, index) => (
                                    <div 
                                        key={index}
                                        onClick={() => onSelectProduct(item)}
                                        className="bg-white rounded-2xl p-3 border border-slate-100 hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col"
                                    >
                                        <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3">
                                            <img 
                                                src={item.image_urls[0]} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                                            <p className="text-xs font-medium text-slate-500 mt-1 mb-2 line-clamp-2">{item.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                            <span className="font-black text-orange-600">₹{item.price}</span>
                                            <PlusCircle size={20} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-60 py-12">
                                <Search size={48} className="text-slate-300 mb-4" />
                                <p className="text-lg font-bold text-slate-500">No matching items found</p>
                                <p className="text-sm font-medium text-slate-400 mt-1">Try a different search term in {selectedCategory}</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

