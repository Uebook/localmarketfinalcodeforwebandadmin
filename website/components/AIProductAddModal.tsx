'use client';

import { useState } from 'react';
import { X, Sparkles, PlusCircle, Search } from 'lucide-react';
import Image from 'next/image';
import { getAllCategoriesWithSuggestions, getSuggestedItemsByCategory, AIProductSuggestion } from '@/lib/aiDefaultItems';

interface AIProductAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectProduct: (product: AIProductSuggestion) => void;
}

export default function AIProductAddModal({ isOpen, onClose, onSelectProduct }: AIProductAddModalProps) {
    const categories = getAllCategoriesWithSuggestions();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
                    {/* Category Selector */}
                    <div className="p-4 sm:p-6 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border-2 whitespace-nowrap ${
                                        selectedCategory === cat 
                                        ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
                                        : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Suggestions Grid */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
                        {selectedCategory ? (
                            <div className="p-4 sm:p-6 flex-1 flex flex-col">
                                {/* Search Bar */}
                                <div className="relative mb-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text"
                                        placeholder={`Search in ${selectedCategory}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-50 transition-all font-medium text-slate-700 shadow-sm"
                                    />
                                </div>

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
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 py-12">
                                    <Search size={48} className="text-slate-300 mb-4" />
                                    <p className="text-lg font-bold text-slate-500">No matching items found</p>
                                    <p className="text-sm font-medium text-slate-400 mt-1">Try a different search term in {selectedCategory}</p>
                                </div>
                            )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-12">
                                <Sparkles size={48} className="text-slate-300 mb-4" />
                                <p className="text-lg font-bold text-slate-500">Select a category above</p>
                                <p className="text-sm font-medium text-slate-400 mt-1">to see AI suggestions for your shop</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
