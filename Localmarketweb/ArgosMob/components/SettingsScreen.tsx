
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Palette, User, Phone, MapPin, Mail, Edit3, Camera, LogOut, Store } from 'lucide-react';
import { ThemeOption, CustomerProfile, VendorProfile } from '../types';

interface SettingsScreenProps {
  currentTheme: ThemeOption;
  onThemeChange: (theme: ThemeOption) => void;
  onBack: () => void;
  userRole: 'customer' | 'vendor' | null;
  profileData: CustomerProfile | VendorProfile;
  onUpdateProfile: (data: any) => void;
  onLogout: () => void;
  onNavigateToBusiness?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  currentTheme, 
  onThemeChange, 
  onBack, 
  userRole,
  profileData,
  onUpdateProfile,
  onLogout,
  onNavigateToBusiness
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    // Initialize form data based on role
    if (userRole === 'vendor') {
      const v = profileData as VendorProfile;
      setFormData({
        name: v.ownerName, // Vendor user name is typically the owner name
        mobile: v.contactNumber,
        location: v.address,
        email: v.email,
        photo: v.ownerPhotoUrl
      });
    } else {
      const c = profileData as CustomerProfile;
      setFormData({
        name: c.name,
        mobile: c.mobile,
        location: c.location,
        email: c.email,
        photo: c.profilePhotoUrl
      });
    }
  }, [profileData, userRole]);

  const handleSave = () => {
    // Map back to specific structure
    if (userRole === 'vendor') {
      const v = profileData as VendorProfile;
      onUpdateProfile({
        ...v,
        ownerName: formData.name,
        contactNumber: formData.mobile,
        address: formData.location,
        email: formData.email,
        ownerPhotoUrl: formData.photo
      });
    } else {
      onUpdateProfile({
        ...profileData,
        name: formData.name,
        mobile: formData.mobile,
        location: formData.location,
        email: formData.email,
        profilePhotoUrl: formData.photo
      });
    }
    setIsEditing(false);
  };

  const getDisplayImage = () => {
    if (formData.photo) return formData.photo;
    
    if (userRole === 'vendor') {
       const v = profileData as VendorProfile;
       // Fallback to business image if owner photo is missing
       return v.ownerPhotoUrl || v.imageUrl;
    } else {
       const c = profileData as CustomerProfile;
       return c.profilePhotoUrl;
    }
  };

  const displayImageUrl = getDisplayImage();

  const themes: { id: ThemeOption; name: string; color: string }[] = [
    { id: 'default', name: 'Red & Orange (Default)', color: 'bg-gradient-to-r from-red-600 to-orange-600' },
    { id: 'blue', name: 'Ocean Blue', color: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
    { id: 'green', name: 'Nature Green', color: 'bg-gradient-to-r from-green-600 to-emerald-600' },
    { id: 'purple', name: 'Royal Purple', color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
    { id: 'dark', name: 'Midnight Dark', color: 'bg-gradient-to-r from-gray-800 to-gray-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-10 relative">
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-white shadow-sm h-16 flex items-center px-4 gap-3 z-50 pt-[env(safe-area-inset-top)]">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
           <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Profile & Settings</h1>
        {isEditing ? (
           <button onClick={handleSave} className="ml-auto text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
             Save
           </button>
        ) : (
           <button onClick={() => setIsEditing(true)} className="ml-auto p-2 text-slate-500 hover:bg-gray-100 rounded-full transition-colors">
             <Edit3 className="w-5 h-5" />
           </button>
        )}
      </header>

      <div className="p-4 pt-[calc(4rem+env(safe-area-inset-top)+1rem)] max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="h-24 bg-gradient-to-r from-red-600 to-orange-600 relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                 <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 relative">
                    {displayImageUrl ? (
                      <img src={displayImageUrl} className="w-full h-full rounded-full object-cover" alt="Profile" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 p-1.5 bg-slate-800 rounded-full text-white border-2 border-white">
                        <Camera className="w-3 h-3" />
                      </button>
                    )}
                 </div>
              </div>
           </div>
           
           <div className="pt-12 pb-6 px-4 text-center">
              {!isEditing ? (
                <>
                  <h2 className="text-xl font-bold text-slate-800">{formData.name || 'User'}</h2>
                  <p className="text-sm text-gray-500 font-medium capitalize flex items-center justify-center gap-1 mt-1">
                    {userRole === 'vendor' ? <Store className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {userRole === 'vendor' ? 'Local+ Account' : 'Customer Account'}
                  </p>
                </>
              ) : (
                 <input 
                   type="text" 
                   value={formData.name || ''}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="text-center font-bold text-lg border-b border-gray-300 focus:border-red-500 outline-none pb-1 w-full max-w-[200px]"
                   placeholder="Enter Name"
                 />
              )}
           </div>

           {/* Personal Info Fields */}
           <div className="px-6 pb-6 space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <Phone className="w-4 h-4" />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">Mobile Number</p>
                    {isEditing ? (
                       <input 
                         type="tel" 
                         value={formData.mobile || ''}
                         onChange={e => setFormData({...formData, mobile: e.target.value})}
                         className="w-full font-medium text-slate-800 border-b border-gray-200 outline-none focus:border-red-500 py-0.5"
                       />
                    ) : (
                       <p className="font-medium text-slate-800">{formData.mobile}</p>
                    )}
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <Mail className="w-4 h-4" />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
                    {isEditing ? (
                       <input 
                         type="email" 
                         value={formData.email || ''}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                         className="w-full font-medium text-slate-800 border-b border-gray-200 outline-none focus:border-red-500 py-0.5"
                         placeholder="Add Email"
                       />
                    ) : (
                       <p className="font-medium text-slate-800">{formData.email || 'Not Added'}</p>
                    )}
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <MapPin className="w-4 h-4" />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                    {isEditing ? (
                       <input 
                         type="text" 
                         value={formData.location || ''}
                         onChange={e => setFormData({...formData, location: e.target.value})}
                         className="w-full font-medium text-slate-800 border-b border-gray-200 outline-none focus:border-red-500 py-0.5"
                       />
                    ) : (
                       <p className="font-medium text-slate-800">{formData.location}</p>
                    )}
                 </div>
              </div>
           </div>

           {userRole === 'vendor' && onNavigateToBusiness && (
             <div className="px-6 pb-6 pt-2 border-t border-gray-50">
                <button 
                  onClick={onNavigateToBusiness}
                  className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Store className="w-4 h-4" /> Manage Business Profile
                </button>
             </div>
           )}
        </div>

        {/* Theme Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
           <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <Palette className="w-5 h-5 text-gray-500" />
              <h2 className="font-bold text-slate-800">App Theme</h2>
           </div>
           
           <div className="space-y-2">
             {themes.map(theme => (
               <button 
                 key={theme.id}
                 onClick={() => onThemeChange(theme.id)}
                 className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                   currentTheme === theme.id 
                     ? 'border-slate-800 bg-slate-50 shadow-sm' 
                     : 'border-transparent bg-white hover:bg-gray-50'
                 }`}
               >
                 <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-full shadow-sm ${theme.color}`}></div>
                   <span className={`font-medium text-sm ${currentTheme === theme.id ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                     {theme.name}
                   </span>
                 </div>
                 {currentTheme === theme.id && (
                   <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center">
                     <Check className="w-3 h-3 text-white" />
                   </div>
                 )}
               </button>
             ))}
           </div>
        </div>

        {/* Logout Button */}
        <button 
           onClick={onLogout}
           className="w-full bg-white border border-gray-200 text-red-600 font-bold py-3 rounded-xl shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
           <LogOut className="w-4 h-4" /> Log Out
        </button>

        <p className="text-center text-xs text-gray-400">
          Local App v1.0.3
        </p>
      </div>
    </div>
  );
};

export default SettingsScreen;
