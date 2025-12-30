
import React, { useState, useMemo } from 'react';
import { 
  Phone, Star, MapPin, CheckCircle, SlidersHorizontal, Search, Heart, Share2, X
} from 'lucide-react';
import { SEARCH_RESULTS, NEARBY_BUSINESSES, FEATURED_BUSINESSES, IT_COMPANIES } from '../constants';
import { Business } from '../types';

interface SearchResultsProps {
  onBusinessClick?: (business: Business) => void;
  savedIds?: string[];
  onToggleSave?: (id: string) => void;
  results?: Business[];
  isSavedTab?: boolean;
  query?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  onBusinessClick, 
  savedIds = [], 
  onToggleSave,
  results: propResults,
  isSavedTab = false,
  query
}) => {
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'distance'>('default');
  const [maxDistance, setMaxDistance] = useState<number>(21);
  const [filterTopRated, setFilterTopRated] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Helper to parse "2.5 km" string to number 2.5
  const parseDistance = (distStr: string): number => {
    return parseFloat(distStr.toLowerCase().replace(' km', '').trim()) || 0;
  };
  
  // Consolidate all available businesses for search if no specific results are passed
  const allBusinesses = useMemo(() => {
    const combined = [...SEARCH_RESULTS, ...NEARBY_BUSINESSES, ...FEATURED_BUSINESSES, ...IT_COMPANIES];
    // Deduplicate by ID
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
  }, []);

  const baseResults = propResults || allBusinesses;

  const filteredResults = useMemo(() => {
    let results = [...baseResults];
    
    // 1. Text Search Filter
    if (query && !propResults) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        item.products?.some(p => p.name.toLowerCase().includes(lowerQuery))
      );
    }

    // 2. Distance Filter
    results = results.filter(item => parseDistance(item.distance) <= maxDistance);

    // 3. Top Rated Filter
    if (filterTopRated) {
      results = results.filter((item) => item.rating >= 4.0);
    }

    // 4. Verified Filter
    if (filterVerified) {
        results = results.filter(item => item.isVerified);
    }

    // 5. Sorting
    if (sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'distance') {
      results.sort((a, b) => parseDistance(a.distance) - parseDistance(b.distance));
    }

    return results;
  }, [baseResults, sortBy, filterTopRated, filterVerified, maxDistance, query, propResults]);

  return (
    <div className="pb-24 min-h-screen bg-gray-50 pt-[72px]">
      
      {/* --- Filter Panel (Fixed below header) --- */}
      <div className="bg-white border-b border-gray-200 fixed top-[calc(4rem+env(safe-area-inset-top))] left-0 right-0 max-w-md mx-auto z-40 shadow-sm animate-in fade-in slide-in-from-top-2">
         <div className="px-4 py-3 space-y-4">
            
            {/* Row 1: Action Buttons (Solid Tiles) */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar items-center pb-1">
                <button 
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`p-2 border rounded-lg flex-shrink-0 transition-colors ${
                    showFilterPanel 
                      ? 'bg-slate-800 text-white border-slate-800' 
                      : 'border-gray-300 text-slate-600 bg-white hover:bg-gray-50'
                  }`}
                >
                   {showFilterPanel ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
                </button>
                
                <button 
                  onClick={() => setSortBy(prev => prev === 'rating' ? 'default' : 'rating')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors ${
                     sortBy === 'rating' 
                       ? 'bg-slate-800 text-white border-slate-800' 
                       : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                   Sort by
                </button>

                <button 
                   onClick={() => setShowFilterPanel(true)}
                   className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border bg-blue-600 text-white border-blue-600 flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                >
                   <MapPin className="w-3 h-3 fill-current" /> Within {maxDistance} km
                </button>

                <button 
                   onClick={() => setFilterTopRated(!filterTopRated)}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors flex items-center gap-1 ${
                      filterTopRated 
                        ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                        : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
                   }`}
                >
                   <Star className={`w-3 h-3 ${filterTopRated ? 'fill-white' : 'fill-slate-400 text-slate-400'}`} /> Top Rated
                </button>

                <button 
                   onClick={() => setFilterVerified(!filterVerified)}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors flex items-center gap-1 ${
                      filterVerified 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
                   }`}
                >
                   <CheckCircle className={`w-3 h-3 ${filterVerified ? 'text-white' : 'text-slate-400'}`} /> Verified
                </button>
            </div>

            {/* Row 2: Expanded Filter Panel (Collapsible) */}
            {showFilterPanel && (
              <div className="animate-in slide-in-from-top-5 fade-in bg-gray-50 p-3 rounded-lg border border-gray-100">
                 <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Distance Range</h3>
                    <span className="text-xs font-bold text-blue-600 bg-white px-2 py-1 rounded border border-blue-100 shadow-sm">
                       0 - {maxDistance} km
                    </span>
                 </div>
                 <div className="relative h-8 flex items-center px-1">
                    <input 
                      type="range" 
                      min="1" 
                      max="50" 
                      value={maxDistance} 
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="absolute left-1 bottom-0 text-[9px] text-gray-400 font-bold">1 km</div>
                    <div className="absolute right-1 bottom-0 text-[9px] text-gray-400 font-bold">50 km</div>
                 </div>
              </div>
            )}
         </div>
      </div>

      {/* Results Header Text */}
      <div className="px-4 py-4">
         <h2 className="text-lg font-bold text-slate-800">
            {filteredResults.length} Result{filteredResults.length !== 1 ? 's' : ''} for your search
         </h2>
      </div>

      {/* Result Cards */}
      <div className="space-y-4 px-4">
        {filteredResults.map((item, index) => (
           <div 
             key={item.id}
             onClick={() => onBusinessClick && onBusinessClick(item)}
             className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.98] transition-all duration-300 hover:shadow-md opacity-0 animate-slide-up"
             style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
           >
             <div className="flex p-3 gap-3">
                {/* Left: Image */}
                <div className="w-24 h-24 flex-shrink-0 relative">
                   <img 
                     src={item.imageUrl} 
                     alt={item.name} 
                     className="w-full h-full object-cover rounded-lg"
                   />
                   {item.isVerified && (
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-600/90 text-white text-[8px] font-bold text-center py-0.5 rounded-b-lg backdrop-blur-sm">
                         Verified Partner
                      </div>
                   )}
                </div>

                {/* Right: Content */}
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base font-bold text-slate-900 truncate pr-2">{item.name}</h3>
                      <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-blue-700 transition-colors flex-shrink-0">
                         <Phone className="w-3 h-3 fill-current" /> Call
                      </button>
                   </div>
                   
                   <p className="text-xs text-gray-500 mb-2 truncate">{item.category} • {item.address}</p>
                   
                   {/* Badges */}
                   <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 flex items-center">
                         {item.rating} <Star className="w-2.5 h-2.5 ml-0.5 fill-current" />
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">({item.reviewCount} Ratings)</span>
                   </div>

                   {/* Footer Info */}
                   <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-100">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                         <MapPin className="w-3 h-3 text-red-500" />
                         {item.distance}
                      </div>
                      <div className="flex gap-3">
                         <button 
                           onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(item.id); }}
                           className={`transition-colors ${savedIds.includes(item.id) ? 'text-red-500' : 'text-gray-300 hover:text-gray-500'}`}
                         >
                            <Heart className={`w-4 h-4 ${savedIds.includes(item.id) ? 'fill-current' : ''}`} />
                         </button>
                         <button className="text-gray-300 hover:text-gray-500">
                            <Share2 className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           </div>
        ))}
        
        {/* Empty State */}
        {filteredResults.length === 0 && (
           <div className="text-center py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1">No matches found</h3>
              <p className="text-gray-500 text-sm">Try increasing the distance or changing filters.</p>
              <button 
                 onClick={() => { setMaxDistance(50); setFilterTopRated(false); setFilterVerified(false); setShowFilterPanel(true); }}
                 className="mt-4 text-red-600 font-bold text-sm hover:underline"
              >
                 Reset Filters
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
