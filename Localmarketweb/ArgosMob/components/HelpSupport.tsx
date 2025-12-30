
import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, FileText, Shield, Mail } from 'lucide-react';
import Chatbot from './Chatbot';

interface HelpSupportProps {
  onBack: () => void;
}

const FAQS = [
  {
    question: "How do I register as a Local+ Vendor?",
    answer: "Go to the menu (or login screen) and click 'Register as Local+'. Fill in your basic details, shop location, and upload the required KYC documents. Your account will be approved within 24-48 hours."
  },
  {
    question: "Is there a fee for listing?",
    answer: "Currently, listing your business on Local is free for the first 3 months. After that, nominal charges may apply."
  },
  {
    question: "How can I change my shop location?",
    answer: "Go to 'Local+ Dashboard' > 'Profile & Settings'. Click 'Edit' and update your address or drag the pin on the map."
  },
  {
    question: "My category is not listed. What to do?",
    answer: "Select 'Others' in the category dropdown during registration or editing. You can type a new category name, which will be sent for Super Admin approval."
  },
  {
    question: "How do I reply to reviews?",
    answer: "In your Local+ Dashboard, go to the 'Reviews' tab. You will see an option to 'Reply' under each customer review."
  }
];

const HelpSupport: React.FC<HelpSupportProps> = ({ onBack }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-white shadow-sm h-16 flex items-center px-4 gap-3 z-50 pt-[env(safe-area-inset-top)]">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
           <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Help & Support</h1>
      </header>

      <div className="pt-[calc(4rem+env(safe-area-inset-top)+1rem)] max-w-3xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Contact Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                 <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Email Support</h3>
              <p className="text-xs text-gray-500">support@local.com</p>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                 <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Trust & Safety</h3>
              <p className="text-xs text-gray-500">safety@local.com</p>
           </div>
        </div>

        {/* FAQ Section */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
           <HelpCircle className="w-5 h-5 text-red-600" /> Frequently Asked Questions
        </h2>

        <div className="space-y-3">
           {FAQS.map((faq, index) => (
             <div key={index} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                   <span className="font-bold text-slate-700 text-sm">{faq.question}</span>
                   {openIndex === index ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {openIndex === index && (
                   <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed bg-gray-50/50">
                      {faq.answer}
                   </div>
                )}
             </div>
           ))}
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default HelpSupport;
