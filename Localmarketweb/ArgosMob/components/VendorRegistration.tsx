import React, { useState } from 'react';
import { 
  ArrowRight, ArrowLeft, Store, User, Phone, Mail, MapPin, 
  Clock, Hash, CheckCircle, Camera, ShieldCheck, FileText, AlertCircle
} from 'lucide-react';
import { VendorProfile } from '../types';

interface VendorRegistrationProps {
  onComplete: (data: VendorProfile) => void;
  onCancel: () => void;
}

const VendorRegistration: React.FC<VendorRegistrationProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false); // New state for success screen
  const [formData, setFormData] = useState<Partial<VendorProfile>>({
    name: '',
    ownerName: '',
    contactNumber: '',
    category: '',
    products: [],
    enquiries: [],
    reviews: []
  });
  
  // State for Custom Category input
  const [customCategory, setCustomCategory] = useState('');

  const updateField = (key: keyof VendorProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    // Basic validation
    if (step === 1) {
      if (!formData.name || !formData.ownerName || !formData.contactNumber) {
        alert("Please fill required fields (Shop Name, Owner Name, Mobile)");
        return;
      }
    }
    if (step === 2) {
      if (!formData.category || !formData.address || !formData.pincode) {
        alert("Please fill required Shop Details");
        return;
      }
      if (formData.category === 'Others' && !customCategory) {
        alert("Please specify your business category");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    // If Custom Category was used, use that value but flag it (in a real app)
    // Here we just save it as the category string
    const finalCategory = formData.category === 'Others' ? customCategory : formData.category;

    // Create final data payload
    const finalData: VendorProfile = {
      ...formData,
      category: finalCategory,
      id: `v${Date.now()}`,
      rating: 0,
      reviewCount: 0,
      distance: '0 km',
      imageUrl: formData.shopFrontPhotoUrl || 'https://placehold.co/400x300?text=New+Shop',
      isVerified: false,
      kycStatus: 'Pending', // Force pending
      activationStatus: 'Pending' // Force pending
    } as VendorProfile;
    
    // Pass data back to App state but DON'T log in yet.
    // Instead show local success screen.
    setIsSubmitted(true);
    
    // We delay the onComplete call until the user clicks "Back to Login"
    // So that the App logic updates the vendor data in the background
    onComplete(finalData);
  };

  // Helper for file upload simulation
  const FileUploadField = ({ label, fieldKey }: { label: string, fieldKey: keyof VendorProfile }) => (
    <label className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer group flex flex-col items-center justify-center gap-2 relative h-32">
       {formData[fieldKey] ? (
          <>
            <img 
              src={formData[fieldKey] as string} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-50 group-hover:opacity-40 transition-opacity"
            />
            <div className="flex items-center gap-2 text-green-700 font-bold text-sm z-10 bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm">
               <CheckCircle className="w-5 h-5" /> Uploaded
            </div>
          </>
       ) : (
          <>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <Camera className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
            </div>
            <p className="text-xs text-gray-500 font-medium group-hover:text-red-600 text-center">{label}</p>
          </>
       )}
       <input 
         type="file" 
         accept="image/*"
         className="hidden" 
         onChange={(e) => {
           if (e.target.files?.[0]) {
              // Simulate upload by setting a fake URL/string
              updateField(fieldKey, URL.createObjectURL(e.target.files[0]));
           }
         }}
       />
    </label>
  );

  // --- Success Screen View ---
  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <ShieldCheck className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Registration Successful!</h2>
        <p className="text-gray-600 max-w-sm mb-8 leading-relaxed">
          Thank you for information, we will review and get back yo you in <span className="font-bold text-slate-900">48-72 hrs</span>.
        </p>
        <button 
          onClick={onCancel} // This closes the modal and returns to Login because App.tsx activeTab will remain on Login
          className="w-full max-w-xs bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-red-700 transition-all"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      {/* Container wrapper to mimic app inside full screen modal context */}
      <div className="min-h-screen flex flex-col w-full max-w-md mx-auto bg-white shadow-xl relative">
        
        {/* Header */}
        <div className="sticky top-0 bg-white z-20 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
           <button onClick={onCancel} className="text-sm font-bold text-gray-500 hover:text-slate-800">
             Cancel
           </button>
           <h1 className="text-lg font-bold text-slate-800">Local+ Registration</h1>
           <div className="text-sm font-bold text-red-600">Step {step}/3</div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100 w-full">
           <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(step/3)*100}%` }} />
        </div>

        <div className="p-6 pb-24 flex-1">
          
          {/* STEP 1: BASIC INFORMATION */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
               <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-2">
                  <p className="text-red-600 text-lg font-bold">Basic Local+ Information</p>
               </div>

               <div className="space-y-4">
                  <InputField 
                    label="Shop Name" 
                    icon={Store} 
                    value={formData.name} 
                    onChange={v => updateField('name', v)} 
                    required 
                  />
                  <InputField 
                    label="Owner / Proprietor Name" 
                    icon={User} 
                    value={formData.ownerName} 
                    onChange={v => updateField('ownerName', v)} 
                    required 
                  />
                  <InputField 
                    label="Registered Mobile Number" 
                    icon={Phone} 
                    type="tel"
                    value={formData.contactNumber} 
                    onChange={v => updateField('contactNumber', v)} 
                    required 
                  />
                  <InputField 
                    label="Alternate Mobile Number (Optional)" 
                    icon={Phone} 
                    type="tel"
                    value={formData.alternateMobile} 
                    onChange={v => updateField('alternateMobile', v)} 
                  />
                  <InputField 
                    label="WhatsApp Number (Optional)" 
                    icon={Phone} 
                    type="tel"
                    value={formData.whatsappNumber} 
                    onChange={v => updateField('whatsappNumber', v)} 
                  />
                  <InputField 
                    label="Email Address (Optional)" 
                    icon={Mail} 
                    type="email"
                    value={formData.email} 
                    onChange={v => updateField('email', v)} 
                  />
                  <InputField 
                    label="Referral Code (Optional)" 
                    icon={Hash} 
                    value={formData.referralCode} 
                    onChange={v => updateField('referralCode', v)} 
                  />
               </div>
            </div>
          )}

          {/* STEP 2: SHOP DETAILS */}
          {step === 2 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
               <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-2">
                  <p className="text-orange-600 text-lg font-bold">Shop Details</p>
               </div>

               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Business Category</label>
                    <select 
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-red-500 outline-none bg-white font-medium text-slate-800"
                      value={formData.category}
                      onChange={e => updateField('category', e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {['Grocery', 'Fruits & Vegetables', 'Electronics', 'Mobile Accessories', 'Garments', 'Hardware', 'General Store', 'Others'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    {/* Custom Category Input for 'Others' */}
                    {formData.category === 'Others' && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-100 p-3 rounded-lg animate-in fade-in">
                         <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Request New Category</label>
                         <input 
                           type="text" 
                           className="w-full border border-yellow-200 rounded-lg p-2 text-sm focus:border-yellow-500 outline-none bg-white"
                           value={customCategory}
                           onChange={e => setCustomCategory(e.target.value)}
                           placeholder="Type category name..."
                         />
                         <div className="flex items-start gap-1 mt-2 text-xs text-yellow-700">
                           <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                           <p>New categories require <span className="font-bold">Super Admin Approval</span>. This may delay your activation.</p>
                         </div>
                      </div>
                    )}
                  </div>

                  <InputField 
                    label="Shop Address" 
                    icon={MapPin} 
                    value={formData.address} 
                    onChange={v => updateField('address', v)} 
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Landmark" icon={MapPin} value={formData.landmark} onChange={v => updateField('landmark', v)} />
                    <InputField label="Pincode" icon={MapPin} type="number" value={formData.pincode} onChange={v => updateField('pincode', v)} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="City" icon={MapPin} value={formData.city} onChange={v => updateField('city', v)} />
                    <InputField label="District" icon={MapPin} value={formData.district} onChange={v => updateField('district', v)} />
                  </div>

                  <InputField 
                    label="Circle (Micro-region)" 
                    icon={MapPin} 
                    value={formData.circle} 
                    onChange={v => updateField('circle', v)} 
                    placeholder="e.g. Connaught Place"
                  />

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                     <p className="text-xs font-bold text-gray-500 uppercase mb-2">Shop Location</p>
                     <button className="flex items-center gap-2 text-red-600 font-bold text-sm bg-white px-4 py-2 rounded-lg border border-red-100 shadow-sm w-full justify-center">
                        <MapPin className="w-4 h-4" /> Drop Pin on Map
                     </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <InputField label="Opening Time" icon={Clock} type="time" value={formData.openingTime} onChange={v => updateField('openingTime', v)} />
                     <InputField label="Closing Time" icon={Clock} type="time" value={formData.closingTime} onChange={v => updateField('closingTime', v)} />
                  </div>
                  <InputField label="Weekly Off" icon={Clock} value={formData.weeklyOff} onChange={v => updateField('weeklyOff', v)} />
               </div>
             </div>
          )}

          {/* STEP 3: KYC & DOCUMENTS */}
          {step === 3 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
               <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-2">
                  <p className="text-green-600 text-lg font-bold">KYC & Verification</p>
               </div>

               {/* Photos */}
               <div>
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-gray-400" /> Photos
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <FileUploadField label="Owner Photo" fieldKey="ownerPhotoUrl" />
                     <FileUploadField label="Shop Front Photo" fieldKey="shopFrontPhotoUrl" />
                     <div className="col-span-2">
                       <FileUploadField label="Inside Shop Photo (Optional)" fieldKey="insideShopPhotoUrl" />
                     </div>
                  </div>
               </div>

               {/* ID Proof */}
               <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" /> Valid ID Proof
                  </h3>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">ID Type</label>
                        <select 
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-red-500 outline-none bg-white font-medium text-slate-800"
                          value={formData.idProofType}
                          onChange={e => updateField('idProofType', e.target.value)}
                        >
                          <option value="">Select ID Type</option>
                          <option value="Aadhaar">Aadhaar Card</option>
                          <option value="PAN">PAN Card</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="Driving Licence">Driving Licence</option>
                        </select>
                     </div>
                     <FileUploadField label="Upload ID Proof" fieldKey="idProofUrl" />
                  </div>
               </div>

               {/* Shop Proof */}
               <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Store className="w-5 h-5 text-gray-400" /> Proof of Ownership
                  </h3>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Proof Type</label>
                        <select 
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-red-500 outline-none bg-white font-medium text-slate-800"
                          value={formData.shopProofType}
                          onChange={e => updateField('shopProofType', e.target.value)}
                        >
                          <option value="">Select Proof Type</option>
                          <option value="GST Certificate">GST Certificate</option>
                          <option value="Shop License">Shop License</option>
                          <option value="Rent Agreement">Rent Agreement</option>
                          <option value="Utility Bill">Utility Bill (Electricity/Water)</option>
                        </select>
                     </div>
                     <FileUploadField label="Upload Shop Proof" fieldKey="shopProofUrl" />
                  </div>
               </div>

               {/* Tax Info */}
               <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400" /> Tax Details
                  </h3>
                  <div className="space-y-4">
                     <InputField label="GST Number (If applicable)" icon={Hash} value={formData.gstNumber} onChange={v => updateField('gstNumber', v)} />
                     <InputField label="PAN Number (Optional)" icon={Hash} value={formData.panNumber} onChange={v => updateField('panNumber', v)} />
                  </div>
               </div>
             </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 flex gap-4 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
           {step > 1 && (
             <button 
               onClick={handleBack}
               className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
             >
               <ArrowLeft className="w-4 h-4" /> Back
             </button>
           )}
           <button 
             onClick={step === 3 ? handleSubmit : handleNext}
             className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 shadow-lg shadow-red-200 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
           >
             {step === 3 ? (
                <>Submit & Register <ShieldCheck className="w-4 h-4" /></>
             ) : (
                <>Next Step <ArrowRight className="w-4 h-4" /></>
             )}
           </button>
        </div>

      </div>
    </div>
  );
};

// Helper Input Component
const InputField = ({ 
  label, icon: Icon, value, onChange, type = "text", required, placeholder 
}: { 
  label: string; icon: any; value: any; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; 
}) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-400 text-slate-800"
        placeholder={placeholder || `Enter ${label}`}
      />
    </div>
  </div>
);

export default VendorRegistration;