'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase, CheckCircle, Upload, Image as ImageIcon, FileText, X } from 'lucide-react';
import Link from 'next/link';

export default function VendorRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    category: '',
    subCategory: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    idProof: null as File | null,
    businessPhoto: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/vendor/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }
      // Save vendor session
      localStorage.setItem('localmarket_vendor', JSON.stringify(data.vendor));
      window.dispatchEvent(new Event('authchange'));
      setSuccess(`Welcome, ${data.vendor.name}! Your registration is submitted and under review.`);
      setTimeout(() => router.push('/vendor/dashboard/analytics'), 1500);
    } catch {
      setError('Network error. Please check your connection.');
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const SERVICE_CATEGORIES = [
    'Carpenter', 'Plumber', 'Electrician', 'Painter', 'AC Repair', 'Cleaning', 'Pest Control', 'Gardening'
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-900 mb-6 transition-colors font-medium hover:opacity-70"
        >
          <ArrowLeft size={20} />
          <span>Back to Login</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-primary p-6 sm:p-8 text-white text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase size={32} style={{ color: 'var(--primary)' }} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Register Your Business</h1>
            <p className="text-white/90">Join Local Market and grow your business</p>
          </div>

          {/* Progress Steps */}
          <div className="px-6 sm:px-8 pt-6">
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${step >= s ? 'text-white' : 'border-gray-300 text-gray-900'}`}
                    style={step >= s ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
                  >
                    {step > s ? <CheckCircle size={20} /> : s}
                  </div>
                  {s < 4 && (
                    <div
                      className="flex-1 h-1 mx-2 transition-colors rounded-full"
                      style={{ background: step > s ? 'var(--primary)' : '#d1d5db' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-8">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Business Information</h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter owner name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Select category</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Services">Services (Plumber, Carpenter, etc.)</option>
                  </select>
                </div>
                {formData.category === 'Services' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => handleChange('subCategory', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
                    >
                      <option value="" className="text-gray-400">Select specialization</option>
                      {SERVICE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors" style={{ background: 'var(--primary)' }}
                >
                  Next Step
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      maxLength={10}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 placeholder:text-gray-400"
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors" style={{ background: 'var(--primary)' }}
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Address Information</h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 placeholder:text-gray-400 resize-none"
                    placeholder="Enter full address"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 placeholder:text-gray-400"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 placeholder:text-gray-400"
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors" style={{ background: 'var(--primary)' }}
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Verification & Documents</h2>

                {/* ID Proof Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    ID Proof (Aadhar/PAN/Voter ID) <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${formData.idProof ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary'
                    }`}>
                    {formData.idProof ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500 text-white rounded-lg">
                            <FileText size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{formData.idProof.name}</p>
                            <p className="text-xs text-gray-500">{(formData.idProof.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button onClick={() => handleFileChange('idProof', null)} className="p-1 hover:bg-green-100 rounded-full text-green-600">
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer">
                        <Upload className="text-gray-400 mb-2" size={32} />
                        <span className="text-sm font-medium text-gray-900">Click to upload ID proof</span>
                        <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</span>
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange('idProof', e.target.files?.[0] || null)} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Business Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Business Photo / Self Photo <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${formData.businessPhoto ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary'
                    }`}>
                    {formData.businessPhoto ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500 text-white rounded-lg">
                            <ImageIcon size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{formData.businessPhoto.name}</p>
                            <p className="text-xs text-gray-500">{(formData.businessPhoto.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button onClick={() => handleFileChange('businessPhoto', null)} className="p-1 hover:bg-green-100 rounded-full text-green-600">
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer">
                        <ImageIcon className="text-gray-400 mb-2" size={32} />
                        <span className="text-sm font-medium text-gray-900">Click to upload business photo</span>
                        <span className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</span>
                        <input type="file" className="hidden" accept=".jpg,.jpeg,.png" onChange={(e) => handleFileChange('businessPhoto', e.target.files?.[0] || null)} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !formData.idProof || !formData.businessPhoto}
                    className="flex-1 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--primary)' }}
                  >
                    {isLoading ? 'Registering...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

