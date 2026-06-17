'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, User, Phone, Mail, Lock, Shield, MapPin, Briefcase, Camera, Loader2, Sparkles } from 'lucide-react';

const SERVICE_TYPES = ['AC Repair', 'Carpenter', 'Electrician', 'Mechanic', 'Other', 'Painter', 'Plumber'];

export default function ServiceProviderRegisterPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    serviceType: '',
    name: '',
    contactNumber: '',
    alternateMobile: '',
    whatsappNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    pincode: '',
    experience: '',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80', // Default high quality headshot placeholder
    idProofUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=256&q=80', // Default ID document placeholder
  });

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!formData.serviceType) {
        setError('Please select a Service Type.');
        return;
      }
      if (!formData.name.trim() || !formData.contactNumber.trim()) {
        setError('Please fill in Name and Mobile Number.');
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.address.trim() || !formData.city.trim() || !formData.pincode.trim()) {
        setError('Please fill in all address details.');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/vendor/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: `${formData.name} (${formData.serviceType})`,
          ownerName: formData.name,
          category: 'Services',
          subCategory: formData.serviceType,
          mobile: formData.contactNumber,
          email: formData.email || undefined,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          idProofUrl: formData.idProofUrl,
          businessPhotoUrl: formData.photoUrl,
          password: formData.password,
          latitude: 31.6340, // Default Amritsar coordinates for service provider location matching
          longitude: 74.8723,
          circle: formData.city
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setSuccess('Registration successful! Redirecting to dashboard...');
      localStorage.setItem('localmarket_vendor', JSON.stringify(data.vendor));
      setTimeout(() => {
        router.push('/vendor/dashboard/analytics');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => router.push('/settings')}
        onNotificationClick={() => router.push('/notifications')}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
          {/* Header Progress Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 sm:p-10 text-white relative">
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase size={28} className="text-white animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-md">Join as Service Provider</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Register Your Services</h1>
              <p className="text-white/80 font-medium text-sm sm:text-base">
                Get jobs, submit quotes, and grow your local client base.
              </p>
            </div>
            
            {/* Steps Visual Progress */}
            <div className="mt-8 flex items-center justify-between text-xs font-black tracking-widest text-white/50">
              <span className={step >= 1 ? 'text-white' : ''}>1. DETAILS</span>
              <div className="flex-1 h-0.5 mx-4 bg-white/20 relative">
                <div className="absolute top-0 left-0 h-full bg-white transition-all" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
              </div>
              <span className={step >= 2 ? 'text-white' : ''}>2. LOCATION</span>
              <div className="flex-1 h-0.5 mx-4 bg-white/20 relative">
                <div className="absolute top-0 left-0 h-full bg-white transition-all" style={{ width: step === 3 ? '100%' : '0%' }} />
              </div>
              <span className={step >= 3 ? 'text-white' : ''}>3. UPLOADS</span>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-semibold text-sm rounded-2xl mb-6">
                {error}
              </div>
            )}

            {success ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                  <Sparkles size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Registration Complete!</h2>
                <p className="text-slate-500 font-semibold mb-6">{success}</p>
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              </div>
            ) : (
              <div>
                {/* STEP 1: SERVICE TYPE & BASIC INFO */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Select Service Type *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {SERVICE_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => updateField('serviceType', type)}
                            className={`py-3 text-xs font-black border-2 rounded-xl transition-all ${
                              formData.serviceType === type
                                ? 'bg-blue-50 border-blue-600 text-blue-600'
                                : 'border-slate-100 text-slate-600 hover:border-slate-200'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="text"
                              placeholder="Enter your name"
                              value={formData.name}
                              onChange={(e) => updateField('name', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number *</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="tel"
                              placeholder="Enter mobile number"
                              value={formData.contactNumber}
                              onChange={(e) => updateField('contactNumber', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Number</label>
                          <input
                            type="tel"
                            placeholder="WhatsApp number"
                            value={formData.whatsappNumber}
                            onChange={(e) => updateField('whatsappNumber', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="email"
                              placeholder="Email address"
                              value={formData.email}
                              onChange={(e) => updateField('email', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Password *</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="password"
                              placeholder="Choose password"
                              value={formData.password}
                              onChange={(e) => updateField('password', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password *</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="password"
                              placeholder="Re-enter password"
                              value={formData.confirmPassword}
                              onChange={(e) => updateField('confirmPassword', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: LOCATION & SERVICE EXPERIENCE */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Full Address *</label>
                      <textarea
                        rows={3}
                        placeholder="Enter your detailed home or office address"
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">City/Town *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="text"
                            placeholder="e.g. Amritsar"
                            value={formData.city}
                            onChange={(e) => updateField('city', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Pincode *</label>
                        <input
                          type="text"
                          placeholder="Pincode"
                          value={formData.pincode}
                          onChange={(e) => updateField('pincode', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Years of Experience</label>
                      <input
                        type="text"
                        placeholder="e.g. 5 Years"
                        value={formData.experience}
                        onChange={(e) => updateField('experience', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:outline-none font-bold text-slate-800 text-sm placeholder-slate-400 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: DOCUMENT UPLOADS */}
                {step === 3 && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Professional Headshot Photo *</label>
                      <div className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                          <Camera size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-700 mb-1">Upload headshot photo</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">ID Proof Document (Aadhaar / PAN Card) *</label>
                      <div className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                          <Shield size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-700 mb-1">Upload Aadhaar or PAN Card</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PDF, PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8 pt-8 border-t border-slate-100">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep((prev) => prev - 1)}
                      className="flex-1 py-3.5 border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-black uppercase tracking-wider text-xs rounded-xl transition-all"
                    >
                      Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-md shadow-blue-100"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1.5"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Register & Join
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => {
          setIsSidebarOpen(false);
          router.push(`/${tab}`);
        }}
        userRole="vendor"
      />
    </div>
  );
}
