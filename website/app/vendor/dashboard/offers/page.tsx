'use client';

import { useState, useEffect } from 'react';
import VendorDashboardLayout, { useVendor } from '@/components/VendorDashboardLayout';
import { Plus, Tag, Calendar, Trash2, Edit2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

function OffersContent() {
    const { vendor, profile, loading: vendorLoading } = useVendor();
    const displayVendor = profile || vendor;

    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingOffer, setEditingOffer] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        discount_percent: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
    });

    useEffect(() => {
        if (displayVendor?.id) {
            loadOffers();
        }
    }, [displayVendor?.id]);

    const loadOffers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/festive-offers?vendorId=${displayVendor.id}&status=all`);
            if (res.ok) {
                const data = await res.json();
                setOffers(data);
            }
        } catch (err) {
            console.error('Failed to load offers', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayVendor?.id) return;

        setSaving(true);
        setError('');
        try {
            const payload = {
                ...form,
                type: 'vendor',
                target: 'specific',
                vendor_ids: [displayVendor.id],
                status: 'active',
                discount_percent: form.discount_percent ? parseFloat(form.discount_percent) : null,
            };

            const url = '/api/festive-offers';
            const method = editingOffer ? 'PATCH' : 'POST';
            const body = editingOffer ? { id: editingOffer.id, ...payload } : payload;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setSuccess(editingOffer ? 'Offer updated!' : 'Offer created!');
                setShowForm(false);
                setEditingOffer(null);
                setForm({
                    title: '',
                    description: '',
                    discount_percent: '',
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: '',
                });
                loadOffers();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save offer');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this offer?')) return;

        try {
            const res = await fetch('/api/festive-offers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'inactive' }),
            });
            if (res.ok) {
                loadOffers();
                setSuccess('Offer deleted');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError('Failed to delete');
        }
    };

    if (vendorLoading || loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="animate-spin" size={24} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">Manage Offers</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Create and manage your shop promotions</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
                        style={{ background: 'var(--primary)' }}
                    >
                        <Plus size={16} /> Create Offer
                    </button>
                )}
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            {success && (
                <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle size={16} /> {success}
                </div>
            )}

            {showForm && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-slate-900">{editingOffer ? 'Edit Offer' : 'New Offer'}</h3>
                        <button onClick={() => { setShowForm(false); setEditingOffer(null); }} className="text-slate-400 hover:text-slate-600">
                            <Plus size={20} className="rotate-45" />
                        </button>
                    </div>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Offer Title</label>
                                <input
                                    required
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Summer Sale, 20% Off"
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-400"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Details about the offer..."
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-400 min-h-[80px]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Discount (%)</label>
                                <input
                                    type="number"
                                    value={form.discount_percent}
                                    onChange={e => setForm({ ...form, discount_percent: e.target.value })}
                                    placeholder="e.g. 15"
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">End Date</label>
                                <input
                                    required
                                    type="date"
                                    value={form.end_date}
                                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-400"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingOffer(null); }}
                                className="px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                                style={{ background: 'var(--primary)' }}
                            >
                                {saving && <Loader2 size={14} className="animate-spin" />}
                                {editingOffer ? 'Save Changes' : 'Create Offer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                        <Tag size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No active offers found</p>
                        <p className="text-xs mt-1">Create your first offer to attract more customers</p>
                    </div>
                ) : (
                    offers.map((offer) => (
                        <div key={offer.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                        <Tag size={20} />
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${offer.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {offer.status}
                                    </span>
                                </div>
                                <h3 className="font-black text-slate-900 mb-1">{offer.title}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{offer.description || 'No description provided'}</p>

                                <div className="space-y-2 mb-6">
                                    {offer.discount_percent && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                            {offer.discount_percent}% Discount
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                        <Calendar size={14} className="text-slate-400" />
                                        Until {new Date(offer.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                                <button
                                    onClick={() => {
                                        setEditingOffer(offer);
                                        setForm({
                                            title: offer.title,
                                            description: offer.description || '',
                                            discount_percent: offer.discount_percent?.toString() || '',
                                            start_date: offer.start_date,
                                            end_date: offer.end_date,
                                        });
                                        setShowForm(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <Edit2 size={12} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(offer.id)}
                                    className="flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default function OffersPage() {
    return (
        <VendorDashboardLayout>
            <OffersContent />
        </VendorDashboardLayout>
    );
}
