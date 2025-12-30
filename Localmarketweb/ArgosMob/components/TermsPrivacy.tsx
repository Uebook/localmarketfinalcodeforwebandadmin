
import React from 'react';
import { ArrowLeft, Shield, FileText, Lock } from 'lucide-react';

interface TermsPrivacyProps {
  onBack: () => void;
}

const TermsPrivacy: React.FC<TermsPrivacyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-white shadow-sm h-16 flex items-center px-4 gap-3 z-50 pt-[env(safe-area-inset-top)]">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
           <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Terms & Privacy</h1>
      </header>

      <div className="pt-[calc(4rem+env(safe-area-inset-top)+1rem)] max-w-3xl mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Terms of Service Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
             <FileText className="w-5 h-5 text-red-600" />
             <h2 className="text-lg font-bold text-slate-800">Terms of Service</h2>
           </div>
           <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
             <p>
               <strong>1. Acceptance of Terms:</strong> By accessing and using the Local app, you accept and agree to be bound by the terms and provision of this agreement.
             </p>
             <p>
               <strong>2. User Accounts:</strong> You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
             </p>
             <p>
               <strong>3. Local+ Listings:</strong> Local+ partners are responsible for the accuracy of their product listings, prices, and shop information. Local reserves the right to remove listings that violate our community guidelines.
             </p>
             <p>
               <strong>4. Limitation of Liability:</strong> Local is a platform connecting users and vendors. We are not responsible for the quality of goods or services provided by vendors.
             </p>
           </div>
        </section>

        {/* Privacy Policy Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
             <Shield className="w-5 h-5 text-green-600" />
             <h2 className="text-lg font-bold text-slate-800">Privacy Policy</h2>
           </div>
           <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
             <p>
               <strong>1. Information Collection:</strong> We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.
             </p>
             <p>
               <strong>2. Location Data:</strong> To provide location-based services (like finding nearby vendors), we collect and process information about your actual location.
             </p>
             <p>
               <strong>3. Data Usage:</strong> We use the information we collect to provide, maintain, and improve our services, and to communicate with you.
             </p>
             <p>
               <strong>4. Data Security:</strong> We implement appropriate technical and organizational measures to protect the security of your personal information.
             </p>
             <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
               <Lock className="w-4 h-4" />
               Your data is encrypted and handled securely.
             </div>
           </div>
        </section>
        
        <p className="text-center text-xs text-gray-400 pt-4">
          Last updated: June 12, 2025
        </p>
      </div>
    </div>
  );
};

export default TermsPrivacy;
