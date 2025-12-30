import React from 'react';
import { Globe, Shield, HelpCircle, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:flex md:justify-between mb-8">
          <div>
            <h4 className="text-white font-bold mb-4">Local</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
             <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Help & Support</a></li>
              <li><a href="#" className="hover:text-white">Trust & Safety</a></li>
              <li><a href="#" className="hover:text-white">Selling Tips</a></li>
            </ul>
          </div>
          <div>
             <h4 className="text-white font-bold mb-4">Legal</h4>
             <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2024 Local. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1 hover:text-white">
              <Globe className="w-4 h-4" /> English
            </button>
            <button className="flex items-center gap-1 hover:text-white">
              <Mail className="w-4 h-4" /> Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;