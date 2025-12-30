import React from 'react';
import { Store } from 'lucide-react';

interface ListBusinessCTAProps {
  onClick?: () => void;
}

const ListBusinessCTA: React.FC<ListBusinessCTAProps> = ({ onClick }) => {
  return (
    <section className="py-6 bg-white mb-8">
      <div className="max-w-7xl mx-auto px-4">
        <button 
          onClick={onClick}
          className="w-full bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-4 sm:p-6 shadow-xl shadow-red-100 flex items-center justify-between group transform transition-transform hover:scale-[1.01]"
        >
          <div className="text-left">
            <h3 className="text-white font-bold text-lg mb-1">Are you a local vendor?</h3>
            <p className="text-red-50 text-xs sm:text-sm">List your business here and reach thousands of customers.</p>
          </div>
          <div className="bg-white/20 p-2.5 rounded-full group-hover:bg-white/30 transition-colors">
            <Store className="w-6 h-6 text-white fill-current" />
          </div>
        </button>
      </div>
    </section>
  );
};

export default ListBusinessCTA;