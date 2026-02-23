'use client';

import { useState, useEffect } from 'react';
import VendorDashboardLayout, { useVendor } from '@/components/VendorDashboardLayout';
import { Edit, MapPin, Phone, Mail, CheckCircle, XCircle, AlertCircle, Save, X, Loader2, Store } from 'lucide-react';

function ProfileContent() {
  const { vendor, profile, refresh, loading } = useVendor();
  const displayVendor = profile || vendor;
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (displayVendor) {
      setForm({
        name: displayVendor.name ?? '',
        owner_name: displayVendor.ownerName ?? '',
        category: displayVendor.category ?? '',
        email: displayVendor.email ?? '',
        contact_number: displayVendor.phone ?? '',
        address: displayVendor.address ?? '',
        city: displayVendor.city ?? '',
        pincode: displayVendor.pincode ?? '',
        about: displayVendor.about ?? '',
      });
    }
  }, [displayVendor]);

  const handleSave = async () => {
    if (!displayVendor?.id) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/vendor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: displayVendor.id, ...form }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save');
      } else {
        setSuccess('Profile updated!');
        setIsEditing(false);
        refresh();
        // Update localStorage session
        const session = JSON.parse(localStorage.getItem('localmarket_vendor') || '{}');
        localStorage.setItem('localmarket_vendor', JSON.stringify({ ...session, ...form, ownerName: form.owner_name }));
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Network error');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin" size={24} style={{ color: 'var(--primary)' }} /></div>;
  }
  if (!displayVendor) return null;

  const kycStatus = displayVendor.kycStatus ?? 'Pending';
  const activationStatus = displayVendor.status ?? 'Pending';

  const Field = ({ label, field, type = 'text' }: { label: string; field: string; type?: string }) => (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      {isEditing ? (
        <input
          type={type}
          value={form[field] ?? ''}
          onChange={e => setForm((p: any) => ({ ...p, [field]: e.target.value }))}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-400"
        />
      ) : (
        <p className="text-sm text-slate-800 font-medium">{form[field] || <span className="text-slate-300">—</span>}</p>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Business Profile</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your public listing information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ background: 'var(--primary)' }}
          >
            <Edit size={14} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setIsEditing(false); setError(''); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: 'var(--primary)' }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>
        )}
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      {success && <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">{success}</div>}

      {/* Business Identity */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ background: 'var(--primary)' }}>
            <Store size={22} />
          </div>
          <div>
            <p className="font-black text-slate-900">{displayVendor.name}</p>
            <p className="text-xs text-slate-400">{displayVendor.category}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Business Name" field="name" />
          <Field label="Owner Name" field="owner_name" />
          <Field label="Category" field="category" />
          {isEditing && <Field label="About / Description" field="about" />}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Phone size={16} /> Contact Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Mobile Number" field="contact_number" />
          <Field label="Email Address" field="email" type="email" />
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><MapPin size={16} /> Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Field label="Full Address" field="address" /></div>
          <Field label="City" field="city" />
          <Field label="Pincode" field="pincode" />
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="font-bold text-slate-900 mb-4">Account Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'KYC Status', value: kycStatus, isGreen: kycStatus === 'Approved', isRed: kycStatus === 'Rejected' },
            { label: 'Activation', value: activationStatus, isGreen: activationStatus === 'Active' },
          ].map(({ label, value, isGreen, isRed }) => (
            <div key={label}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isRed ? 'bg-red-50 text-red-700' : isGreen ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                {isRed ? <XCircle size={12} /> : isGreen ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                {value}
              </span>
            </div>
          ))}
        </div>
        {displayVendor.id && (
          <p className="text-xs text-slate-300 mt-3 font-mono">Vendor ID: {String(displayVendor.id).toUpperCase()}</p>
        )}
      </div>
    </div>
  );
}

export default function VendorProfilePage() {
  return (
    <VendorDashboardLayout>
      <ProfileContent />
    </VendorDashboardLayout>
  );
}
