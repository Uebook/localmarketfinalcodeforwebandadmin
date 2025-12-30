
import React from 'react';
import { Clock } from 'lucide-react';
import { RECENT_SEARCHES } from '../constants';

const RecentSearches: React.FC = () => {
  return (
    // Dark background with glass effect (Updated to bg-black/60)
    <section className="py-5 my-3 mx-4 bg-black/60 backdrop-blur-md rounded-2xl shadow-md border border-white/10">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-extrabold text-white uppercase tracking-widest opacity-90">Your Recent Searches</h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {RECENT_SEARCHES.map((search, index) => (
            <button 
              key={index}
              className="px-4 py-2 bg-white/10 text-slate-100 text-xs font-bold rounded-xl hover:bg-orange-600 hover:text-white transition-all duration-300 border border-white/10 shadow-sm active:scale-95 backdrop-blur-sm"
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentSearches;
