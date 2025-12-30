
import React, { useState } from 'react';
import { ArrowLeft, Mic, Share2, Search } from 'lucide-react';

interface SearchHeaderProps {
  query: string;
  onBack: () => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ query, onBack }) => {
  return (
    <header className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 bg-gradient-to-r from-orange-600 to-blue-600 shadow-lg border-b border-white/10 transition-all pt-[env(safe-area-inset-top)]">
      <div className="w-full px-4 h-16 flex items-center gap-3">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="p-1 text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Search Input Area */}
        <div className="flex-1 h-11 bg-white/20 border border-white/20 rounded-lg flex items-center px-3 shadow-inner transition-all backdrop-blur-sm">
          <Search className="w-5 h-5 text-white/70 mr-2" />
          <div className="flex-1 flex flex-col justify-center overflow-hidden">
             <input 
               type="text" 
               value={query} 
               readOnly 
               className="text-sm font-bold text-white outline-none bg-transparent w-full truncate drop-shadow-sm"
             />
             <span className="text-[10px] text-white/80 leading-none truncate">Haibatpur, Sector 4</span>
          </div>
          <Mic className="w-5 h-5 text-white ml-2 drop-shadow-md" />
        </div>

        {/* Share Action */}
        <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-95">
          <Share2 className="w-6 h-6 drop-shadow-sm" />
        </button>
      </div>
    </header>
  );
};

export default SearchHeader;
