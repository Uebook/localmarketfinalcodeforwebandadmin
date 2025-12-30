'use client';

import { Search, Mic } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
        <Search className="text-white/80 mr-3" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for services, products..."
          className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
        />
        <button
          type="button"
          className="ml-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Mic className="text-white/80" size={20} />
        </button>
      </div>
    </form>
  );
}

