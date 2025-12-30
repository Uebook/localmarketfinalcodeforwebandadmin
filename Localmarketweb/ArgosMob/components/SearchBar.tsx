
import React, { useState } from 'react';
import { Search, Mic } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="px-4 py-4 sticky top-[calc(4rem+env(safe-area-inset-top))] z-40 transition-all duration-300">
      <form onSubmit={handleSearch} className="relative max-w-7xl mx-auto group">
        <div className="relative flex items-center w-full h-12 rounded-xl bg-slate-900 border border-slate-700 shadow-xl shadow-slate-200/50 overflow-hidden transition-all transform group-hover:scale-[1.01] group-focus-within:ring-2 group-focus-within:ring-orange-500/50 group-focus-within:border-orange-500">
          
          {/* Search Icon */}
          <div className="grid place-items-center h-full w-12 text-slate-400 group-focus-within:text-orange-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>

          {/* Input Field */}
          <input
            className="peer h-full w-full outline-none text-sm text-white pr-12 bg-transparent placeholder-slate-400 font-medium tracking-wide"
            type="text"
            id="search"
            placeholder="Search for the lowest price..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* Mic Icon / Action */}
          <div className="absolute right-0 h-full w-12 grid place-items-center cursor-pointer hover:bg-white/5 transition-colors rounded-r-xl">
             <Mic className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
