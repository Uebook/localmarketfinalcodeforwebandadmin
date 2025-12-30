
import React, { useState, useEffect } from 'react';
import { 
  Store, Package, Edit3, Plus, Trash2, Save, Image as ImageIcon, 
  DollarSign, MapPin, Phone, User, Settings, MessageSquare, Clock, CheckCircle2,
  Star, MessageCircle, Reply, ExternalLink, Eye, Mail, Hash, Map, Navigation,
  ShieldCheck, Lock, Activity, Tag, List, ToggleRight, ToggleLeft, Layers, AlertCircle,
  Share2, TrendingUp, ChevronRight, Camera, Search, Briefcase, Ticket, X
} from 'lucide-react';
import { VendorProfile, Product, Enquiry, Offer } from '../../types';

interface VendorDashboardProps {
  vendor: VendorProfile;
  onUpdateVendor: (vendor: VendorProfile) => void;
  onBecomeVendor: () => void;
  isVendor: boolean;
  onPreview?: (vendor: VendorProfile) => void;
  targetTab?: 'overview' | 'products' | 'enquiries' | 'reviews' | 'profile' | 'offers';
  launchAddProduct?: boolean;
  launchAddProductType?: 'product' | 'service';
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ 
  vendor, 
  onUpdateVendor, 
  onBecomeVendor,
  isVendor,
  onPreview,
  targetTab,
  launchAddProduct,
  launchAddProductType
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'enquiries' | 'reviews' | 'profile' | 'offers'>('overview');
  
  // Sync prop change to local state
  useEffect(() => {
    if (targetTab) {
      setActiveTab(targetTab);
    }
  }, [targetTab]);

  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  // Handle auto-launch of Add Product with Type
  useEffect(() => {
    if (launchAddProduct) {
      setIsAddingProduct(true);
      setIsEditingProduct(null);
      // Default type based on nav param
      const defaultType = launchAddProductType || 'product';
      setProductForm({ inStock: true, isFastMoving: false, type: defaultType }); 
    }
  }, [launchAddProduct, launchAddProductType]);

  // Form states for Product
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  // New Product Custom Category State
  const [newProductCategory, setNewProductCategory] = useState('');

  // Form states for Profile
  const [profileForm, setProfileForm] = useState<Partial<VendorProfile>>({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Custom Category State (Shop)
  const [customCategory, setCustomCategory] = useState('');

  // State for Review Reply
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  // Offer Form State
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [offerForm, setOfferForm] = useState<Partial<Offer>>({});

  // Mock Profile Completion
  const profileCompletion = 85;

  // --- Handlers ---

  const handleEditProfile = () => {
    setProfileForm({ ...vendor });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    const updatedProfile = { ...vendor, ...profileForm };
    if (profileForm.category === 'Others' && customCategory) {
      updatedProfile.category = customCategory;
    }
    onUpdateVendor(updatedProfile as VendorProfile);
    setIsEditingProfile(false);
  };

  const handleAddProductClick = () => {
    setProductForm({ inStock: true, isFastMoving: false, type: 'product' }); // Default values
    setNewProductCategory('');
    setIsAddingProduct(true);
    setIsEditingProduct(null);
  };

  const handleEditProductClick = (product: Product) => {
    setProductForm({ ...product });
    setIsEditingProduct(product);
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedProducts = (vendor.products || []).filter(p => p.id !== productId);
      onUpdateVendor({ ...vendor, products: updatedProducts });
    }
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price) {
      alert("Name and Price are required!");
      return;
    }

    // Determine final category
    const finalCategory = productForm.category === 'Other' ? newProductCategory : productForm.category;

    if (productForm.category === 'Other' && !newProductCategory) {
        alert("Please enter a category name");
        return;
    }

    let updatedProducts = [...(vendor.products || [])];

    // Helper to format Product
    const formatProduct = (base: Partial<Product>): Product => ({
        id: base.id || `p${Date.now()}`,
        name: base.name || '',
        price: base.price || '',
        mrp: base.mrp,
        category: finalCategory,
        stockQty: base.type === 'service' ? undefined : base.stockQty, // Ensure no stock for services
        imageUrl: base.imageUrl || 'https://placehold.co/200x200?text=Item',
        description: base.description || '',
        uom: base.uom,
        brand: base.type === 'service' ? undefined : base.brand,
        isFastMoving: base.type === 'service' ? false : base.isFastMoving,
        inStock: base.inStock,
        type: base.type || 'product'
    });

    if (isEditingProduct) {
      // Update existing
      updatedProducts = updatedProducts.map(p => 
        p.id === isEditingProduct.id ? { ...p, ...formatProduct(productForm) } : p
      );
    } else {
      // Add new
      updatedProducts.push(formatProduct(productForm));
    }

    // Simulate notification if new category was requested
    if (productForm.category === 'Other') {
        alert(`New category "${newProductCategory}" sent for Admin Approval. Item saved.`);
    }

    onUpdateVendor({ ...vendor, products: updatedProducts });
    setIsAddingProduct(false);
    setIsEditingProduct(null);
    setNewProductCategory('');
  };

  const handleStatusChange = (enquiryId: string, status: 'read' | 'replied') => {
    const updatedEnquiries = (vendor.enquiries || []).map(enq => 
      enq.id === enquiryId ? { ...enq, status } : enq
    );
    onUpdateVendor({ ...vendor, enquiries: updatedEnquiries });
  };

  const handlePostReply = (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text) return;

    const updatedReviews = (vendor.reviews || []).map(r => 
      r.id === reviewId ? { ...r, reply: text } : r
    );
    onUpdateVendor({ ...vendor, reviews: updatedReviews });
    setReplyText({ ...replyText, [reviewId]: '' });
  };

  const handleSaveOffer = () => {
    if (!offerForm.title || !offerForm.code || !offerForm.discountAmount) {
      alert("Please fill all required offer fields.");
      return;
    }

    const newOffer: Offer = {
      id: `o${Date.now()}`,
      title: offerForm.title || '',
      description: offerForm.description || '',
      code: offerForm.code || '',
      discountAmount: offerForm.discountAmount || '',
      validUntil: offerForm.validUntil || '2025-12-31',
      isActive: true,
      color: 'bg-purple-600' // default color
    };

    const updatedOffers = [...(vendor.offers || []), newOffer];
    onUpdateVendor({ ...vendor, offers: updatedOffers });
    setIsAddingOffer(false);
    setOfferForm({});
  };

  const handleDeleteOffer = (id: string) => {
     const updatedOffers = (vendor.offers || []).filter(o => o.id !== id);
     onUpdateVendor({ ...vendor, offers: updatedOffers });
  };

  // Helper to calculate discount percentage
  const getDiscount = (priceStr: string, mrpStr?: string) => {
    if (!mrpStr) return null;
    const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    const mrp = parseFloat(mrpStr.replace(/[^0-9.]/g, ''));
    if (isNaN(price) || isNaN(mrp) || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const SHOP_TYPES = [
    'Grocery',
    'Fruits & Vegetables',
    'Electronics',
    'Mobile Accessories',
    'Garments',
    'Hardware',
    'General Store',
    'Others'
  ];

  const PRODUCT_CATEGORIES = [
    'Snacks',
    'Beverages',
    'Dairy',
    'Personal Care',
    'Household',
    'Staples',
    'Other'
  ];
  
  const PRODUCT_UOMS = [
    'Pc', 'Kg', 'Litre', 'Pack', 'Gram', 'Box', 'Dozen', 'Meter'
  ];

  const SERVICE_UOMS = [
    'Hour', 'Day', 'Session', 'Visit', 'Service', 'Job'
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* RICH HEADER SECTION */}
      <div className="relative bg-white pb-4 shadow-sm border-b border-gray-100">
        {/* Cover Image */}
        <div className="h-32 w-full bg-slate-200 relative overflow-hidden group">
          <img 
            src={vendor.imageUrl || 'https://images.unsplash.com/photo-1556740758-90de2742dd61?auto=format&fit=crop&w=800&q=80'} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          <button 
             onClick={() => { setActiveTab('profile'); handleEditProfile(); }}
             className="absolute top-4 right-4 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 backdrop-blur-sm transition-colors"
          >
             <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-4 relative -mt-10 flex justify-between items-end">
           <div className="flex items-end gap-3">
              <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-white overflow-hidden relative">
                 <img 
                    src={vendor.ownerPhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'} 
                    alt="Owner" 
                    className="w-full h-full object-cover"
                 />
              </div>
              <div className="mb-1">
                 <h1 className="text-xl font-bold text-slate-800 flex items-center gap-1">
                    {vendor.name} 
                    {vendor.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />}
                 </h1>
                 <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {vendor.address}
                 </p>
              </div>
           </div>
           
           <div className="mb-2">
              <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                 vendor.activationStatus === 'Active' 
                   ? 'bg-green-50 text-green-700 border-green-200' 
                   : 'bg-yellow-50 text-yellow-700 border-yellow-200'
              }`}>
                 {vendor.activationStatus === 'Active' ? '● Open' : '● Review'}
              </span>
           </div>
        </div>

        {/* Profile Completion */}
        <div className="px-4 mt-4">
           <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-bold text-slate-600">Profile Completion</p>
              <p className="text-xs font-bold text-red-600">{profileCompletion}%</p>
           </div>
           <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
           </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 px-4 mt-4">
           <button className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-100 group-hover:bg-red-100 transition-colors">
                 <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-600">Share</span>
           </button>
           {onPreview && (
            <button onClick={() => onPreview(vendor)} className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 group-hover:bg-orange-100 transition-colors">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-600">Preview</span>
            </button>
           )}
           <button onClick={() => setActiveTab('offers')} className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 group-hover:bg-purple-100 transition-colors">
                 <Ticket className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-600">Offers</span>
           </button>
           <button onClick={() => { setActiveTab('profile'); handleEditProfile(); }} className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-slate-600 border border-gray-200 group-hover:bg-gray-100 transition-colors">
                 <Settings className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-600">Settings</span>
           </button>
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-in fade-in">
             
             {/* Main Analytics Cards */}
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                         <Activity className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-500">Store Views</span>
                   </div>
                   <div className="flex items-end gap-2">
                      <h3 className="text-2xl font-bold text-slate-800">1,245</h3>
                      <span className="text-xs text-green-600 font-bold mb-1 flex items-center">
                         <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
                      </span>
                   </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                         <Search className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-500">Appearances</span>
                   </div>
                   <div className="flex items-end gap-2">
                      <h3 className="text-2xl font-bold text-slate-800">3.5k</h3>
                      <span className="text-xs text-green-600 font-bold mb-1 flex items-center">
                         <TrendingUp className="w-3 h-3 mr-0.5" /> +5%
                      </span>
                   </div>
                </div>
             </div>

             {/* Detailed Stats Row */}
             <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex divide-x divide-gray-100">
                <div className="flex-1 text-center px-2">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Items</p>
                   <p className="text-xl font-bold text-slate-800">{vendor.products?.length || 0}</p>
                </div>
                <div className="flex-1 text-center px-2">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Enquiries</p>
                   <p className="text-xl font-bold text-slate-800">{vendor.enquiries?.length || 0}</p>
                </div>
                <div className="flex-1 text-center px-2">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reviews</p>
                   <p className="text-xl font-bold text-slate-800">{vendor.reviews?.length || 0}</p>
                </div>
                <div className="flex-1 text-center px-2">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rating</p>
                   <p className="text-xl font-bold text-slate-800 flex items-center justify-center gap-1">
                      {vendor.rating} <Star className="w-3 h-3 text-yellow-500 fill-current" />
                   </p>
                </div>
             </div>
             
             {/* Section 4: Account Access Status */}
             <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                   <ShieldCheck className="w-4 h-4" /> Account Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">Login Username</p>
                      <p className="text-sm font-bold text-slate-800">{vendor.username || vendor.contactNumber}</p>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">OTP Verified</p>
                      <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
                         <CheckCircle2 className="w-4 h-4" /> Verified
                      </div>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">KYC Status</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                        vendor.kycStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                        vendor.kycStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {vendor.kycStatus || 'Pending'}
                      </span>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">Activation Status</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                        vendor.activationStatus === 'Active' ? 'bg-green-100 text-green-700' :
                        vendor.activationStatus === 'Blocked' ? 'bg-red-100 text-red-700' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {vendor.activationStatus || 'Pending'}
                      </span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
               <button onClick={() => { setActiveTab('products'); handleAddProductClick(); }} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-red-50 transition-colors group">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-slate-700">Add Item</span>
               </button>
               <button onClick={() => setActiveTab('offers')} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-purple-50 transition-colors group">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-slate-700">Add Offer</span>
               </button>
             </div>
          </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
           <div className="animate-in fade-in">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-800">Your Catalog ({vendor.products?.length || 0})</h3>
                 <button 
                    onClick={handleAddProductClick}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-700"
                 >
                    <Plus className="w-3 h-3" /> Add Item
                 </button>
              </div>

              {/* Add/Edit Product Form */}
              {isAddingProduct && (
                 <div className="bg-white p-4 rounded-xl shadow-lg border border-red-100 mb-6 animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                       <h4 className="font-bold text-slate-800">{isEditingProduct ? 'Edit Item' : 'Add New Item'}</h4>
                       <button onClick={() => { setIsAddingProduct(false); setIsEditingProduct(null); }} className="p-1 rounded-full hover:bg-gray-100">
                          <X className="w-4 h-4 text-gray-500" />
                       </button>
                    </div>

                    <div className="space-y-4">
                       <div className="flex gap-4">
                          <div className="w-1/3">
                             <div className="aspect-square bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors">
                                <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                                <span className="text-[10px] text-gray-500 font-medium">Add Photo</span>
                             </div>
                          </div>
                          <div className="w-2/3 space-y-3">
                             <input 
                               type="text" 
                               placeholder="Item Name *"
                               className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-red-500 outline-none"
                               value={productForm.name || ''}
                               onChange={e => setProductForm({...productForm, name: e.target.value})}
                             />
                             <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Price *"
                                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-red-500 outline-none"
                                  value={productForm.price || ''}
                                  onChange={e => setProductForm({...productForm, price: e.target.value})}
                                />
                                <input 
                                  type="text" 
                                  placeholder="MRP"
                                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-red-500 outline-none"
                                  value={productForm.mrp || ''}
                                  onChange={e => setProductForm({...productForm, mrp: e.target.value})}
                                />
                             </div>
                          </div>
                       </div>

                       {/* Type Selector */}
                       <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
                          <button 
                             onClick={() => setProductForm({...productForm, type: 'product'})}
                             className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${productForm.type !== 'service' ? 'bg-white shadow-sm text-slate-800' : 'text-gray-400'}`}
                          >
                             Product
                          </button>
                          <button 
                             onClick={() => setProductForm({...productForm, type: 'service'})}
                             className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${productForm.type === 'service' ? 'bg-white shadow-sm text-slate-800' : 'text-gray-400'}`}
                          >
                             Service
                          </button>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                          <select 
                             className="border border-gray-200 rounded-lg p-2 text-sm focus:border-red-500 outline-none bg-white"
                             value={productForm.category || ''}
                             onChange={e => setProductForm({...productForm, category: e.target.value})}
                          >
                             <option value="">Category</option>
                             {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          
                          {/* Unit Selector based on type */}
                          <select 
                             className="border border-gray-200 rounded-lg p-2 text-sm focus:border-red-500 outline-none bg-white"
                             value={productForm.uom || ''}
                             onChange={e => setProductForm({...productForm, uom: e.target.value})}
                          >
                             <option value="">Unit</option>
                             {(productForm.type === 'service' ? SERVICE_UOMS : PRODUCT_UOMS).map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                       </div>

                       {/* Custom Category Input */}
                       {productForm.category === 'Other' && (
                          <input 
                             type="text" 
                             placeholder="Enter New Category Name"
                             className="w-full border border-yellow-200 bg-yellow-50 rounded-lg p-2 text-sm focus:border-yellow-500 outline-none"
                             value={newProductCategory}
                             onChange={e => setNewProductCategory(e.target.value)}
                          />
                       )}

                       <textarea 
                          placeholder="Description (Optional)"
                          rows={2}
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-red-500 outline-none resize-none"
                          value={productForm.description || ''}
                          onChange={e => setProductForm({...productForm, description: e.target.value})}
                       />
                       
                       {/* Switches */}
                       <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                             <div className={`w-8 h-4 rounded-full relative transition-colors ${productForm.inStock ? 'bg-green-500' : 'bg-gray-300'}`} onClick={() => setProductForm({...productForm, inStock: !productForm.inStock})}>
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${productForm.inStock ? 'left-4.5' : 'left-0.5'}`}></div>
                             </div>
                             <span className="text-xs font-bold text-slate-600">In Stock</span>
                          </label>

                          {productForm.type !== 'service' && (
                             <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${productForm.isFastMoving ? 'bg-blue-500' : 'bg-gray-300'}`} onClick={() => setProductForm({...productForm, isFastMoving: !productForm.isFastMoving})}>
                                   <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${productForm.isFastMoving ? 'left-4.5' : 'left-0.5'}`}></div>
                                </div>
                                <span className="text-xs font-bold text-slate-600">Best Seller</span>
                             </label>
                          )}
                       </div>

                       <button 
                          onClick={handleSaveProduct}
                          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-100"
                       >
                          {isEditingProduct ? 'Update Item' : 'Save Item'}
                       </button>
                    </div>
                 </div>
              )}

              {/* Product List */}
              <div className="space-y-3">
                 {(vendor.products || []).map(product => {
                    const discount = getDiscount(product.price, product.mrp);
                    return (
                       <div key={product.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex gap-3 relative overflow-hidden">
                          {product.type === 'service' && (
                             <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                Service
                             </div>
                          )}
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                             <img src={product.imageUrl} className="w-full h-full object-cover rounded-lg" alt={product.name} />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-slate-800 text-sm truncate">{product.name}</h4>
                             <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                             <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800">{product.price}</span>
                                {product.mrp && <span className="text-xs text-gray-400 line-through">{product.mrp}</span>}
                                {discount && <span className="text-[10px] text-green-600 font-bold">{discount}% OFF</span>}
                             </div>
                             <div className="flex items-center gap-2 mt-2">
                                <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-[10px] text-gray-400 font-medium">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                             </div>
                          </div>
                          <div className="flex flex-col justify-between items-end pl-2">
                             <button onClick={() => handleEditProductClick(product)} className="p-1.5 bg-gray-50 text-slate-600 rounded-lg hover:bg-gray-100">
                                <Edit3 className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                    );
                 })}
                 {(vendor.products || []).length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                       <p className="text-gray-400 text-sm mb-2">Your catalog is empty.</p>
                       <button onClick={handleAddProductClick} className="text-red-600 font-bold text-sm hover:underline">Add your first item</button>
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* --- ENQUIRIES TAB --- */}
        {activeTab === 'enquiries' && (
           <div className="animate-in fade-in space-y-4">
              <h3 className="font-bold text-slate-800 mb-4">Customer Enquiries</h3>
              {(vendor.enquiries || []).length > 0 ? (
                 vendor.enquiries.map(enquiry => (
                    <div key={enquiry.id} className={`bg-white border rounded-xl p-4 shadow-sm ${enquiry.status === 'new' ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500">
                                <User className="w-4 h-4" />
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-800 text-sm">{enquiry.senderName}</h4>
                                <p className="text-[10px] text-gray-500">{enquiry.date}</p>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <a href={`tel:${enquiry.senderMobile}`} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                                <Phone className="w-4 h-4" />
                             </a>
                             <a href={`https://wa.me/${enquiry.senderMobile.replace(/\D/g,'')}`} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                <MessageCircle className="w-4 h-4" />
                             </a>
                          </div>
                       </div>
                       <p className="text-sm text-slate-600 bg-gray-50 p-3 rounded-lg mb-3">"{enquiry.message}"</p>
                       
                       <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                             enquiry.status === 'new' ? 'bg-red-100 text-red-600' :
                             enquiry.status === 'replied' ? 'bg-green-100 text-green-600' :
                             'bg-gray-100 text-gray-600'
                          }`}>
                             {enquiry.status}
                          </span>
                          
                          {enquiry.status !== 'replied' && (
                             <button 
                               onClick={() => handleStatusChange(enquiry.id, 'replied')}
                               className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                             >
                               <CheckCircle2 className="w-3 h-3" /> Mark as Replied
                             </button>
                          )}
                       </div>
                    </div>
                 ))
              ) : (
                 <div className="text-center py-12 text-gray-400">No enquiries yet.</div>
              )}
           </div>
        )}

        {/* --- REVIEWS TAB --- */}
        {activeTab === 'reviews' && (
           <div className="animate-in fade-in space-y-4">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-slate-800">Customer Reviews</h3>
                 <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {vendor.rating} <span className="text-gray-400 font-normal">({vendor.reviewCount})</span>
                 </div>
              </div>

              {(vendor.reviews || []).map(review => (
                 <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                             {review.userName.charAt(0)}
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-800 text-sm">{review.userName}</h4>
                             <div className="flex">
                                {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}
                             </div>
                          </div>
                       </div>
                       <span className="text-[10px] text-gray-400">{review.date}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3 pl-10">"{review.comment}"</p>
                    
                    {review.reply ? (
                       <div className="ml-10 bg-gray-50 p-3 rounded-lg border-l-2 border-red-500">
                          <p className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                             <Reply className="w-3 h-3" /> You replied:
                          </p>
                          <p className="text-sm text-gray-600">{review.reply}</p>
                       </div>
                    ) : (
                       <div className="ml-10 mt-2">
                          <div className="flex gap-2">
                             <input 
                               type="text" 
                               placeholder="Write a reply..."
                               className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-red-500 outline-none"
                               value={replyText[review.id] || ''}
                               onChange={(e) => setReplyText({...replyText, [review.id]: e.target.value})}
                             />
                             <button 
                               onClick={() => handlePostReply(review.id)}
                               disabled={!replyText[review.id]}
                               className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                             >
                                Reply
                             </button>
                          </div>
                       </div>
                    )}
                 </div>
              ))}
           </div>
        )}

        {/* --- PROFILE / SETTINGS TAB --- */}
        {activeTab === 'profile' && (
           <div className="animate-in fade-in pb-10">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-800">Business Profile</h3>
                 {isEditingProfile ? (
                    <div className="flex gap-2">
                       <button onClick={handleSaveProfile} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                          <Save className="w-3 h-3" /> Save
                       </button>
                       <button onClick={() => setIsEditingProfile(false)} className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                          Cancel
                       </button>
                    </div>
                 ) : (
                    <button onClick={handleEditProfile} className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                       <Edit3 className="w-3 h-3" /> Edit
                    </button>
                 )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
                 <div className="space-y-4">
                    <ProfileField label="Shop Name" value={profileForm.name} icon={Store} isEditing={isEditingProfile} onChange={v => setProfileForm({...profileForm, name: v})} />
                    
                    {/* Category Selector */}
                    {isEditingProfile ? (
                        <div className="flex gap-3 items-start">
                           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 mt-1 flex-shrink-0">
                             <Tag className="w-4 h-4" />
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Category</p>
                              <select 
                                 className="w-full border border-gray-200 rounded-md p-2 text-sm focus:border-red-500 outline-none font-medium text-slate-800 bg-white"
                                 value={profileForm.category}
                                 onChange={e => setProfileForm({...profileForm, category: e.target.value})}
                              >
                                 {SHOP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              {profileForm.category === 'Others' && (
                                 <input 
                                   type="text" 
                                   placeholder="Specify Category"
                                   className="w-full mt-2 border border-gray-200 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                                   value={customCategory}
                                   onChange={e => setCustomCategory(e.target.value)}
                                 />
                              )}
                           </div>
                        </div>
                    ) : (
                       <ProfileField label="Category" value={profileForm.category} icon={Tag} isEditing={false} onChange={() => {}} />
                    )}

                    <ProfileField label="Owner Name" value={profileForm.ownerName} icon={User} isEditing={isEditingProfile} onChange={v => setProfileForm({...profileForm, ownerName: v})} />
                    <ProfileField label="Contact" value={profileForm.contactNumber} icon={Phone} isEditing={isEditingProfile} onChange={v => setProfileForm({...profileForm, contactNumber: v})} />
                    <ProfileField label="Address" value={profileForm.address} icon={MapPin} isEditing={isEditingProfile} onChange={v => setProfileForm({...profileForm, address: v})} />
                    
                    <div className="grid grid-cols-2 gap-4">
                       <ProfileField label="Open Time" value={profileForm.openingTime} icon={Clock} isEditing={isEditingProfile} onChange={v => setProfileForm({...profileForm, openingTime: v})} placeholder="HH:MM" />
                       <ProfileField label="Close Time" value={profileForm.closingTime} icon={Clock} isEditing={isEditingProfile} onChange={v => setProfileForm({...profileForm, closingTime: v})} placeholder="HH:MM" />
                    </div>
                 </div>

                 <ImageUploadField label="Cover Photo" value={profileForm.imageUrl} onChange={v => setProfileForm({...profileForm, imageUrl: v})} isEditing={isEditingProfile} />
              </div>

              {/* Preferences */}
              <div className="mt-6">
                 <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Shop Preferences</h4>
                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-1">
                    <ToggleSetting 
                       label="Receive Price Alerts" 
                       isChecked={profileForm.enablePriceNotifications || false} 
                       onChange={v => setProfileForm({...profileForm, enablePriceNotifications: v})} 
                       disabled={!isEditingProfile}
                    />
                    <ToggleSetting 
                       label="Allow Bulk Uploads" 
                       isChecked={profileForm.enableBulkUpload || false} 
                       onChange={v => setProfileForm({...profileForm, enableBulkUpload: v})} 
                       disabled={!isEditingProfile}
                    />
                 </div>
              </div>
           </div>
        )}

        {/* --- OFFERS TAB (New) --- */}
        {activeTab === 'offers' && (
           <div className="animate-in fade-in">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-800">Active Offers ({vendor.offers?.length || 0})</h3>
                 <button 
                   onClick={() => setIsAddingOffer(true)}
                   className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-purple-700"
                 >
                   <Plus className="w-3 h-3" /> Create Offer
                 </button>
              </div>

              {isAddingOffer && (
                 <div className="bg-white p-4 rounded-xl shadow-lg border border-purple-100 mb-6 animate-in zoom-in-95">
                    <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">Create New Offer</h4>
                    <div className="space-y-4">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Offer Title</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" 
                            value={offerForm.title || ''}
                            onChange={e => setOfferForm({...offerForm, title: e.target.value})}
                            placeholder="e.g. Diwali Sale"
                          />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" 
                            value={offerForm.description || ''}
                            onChange={e => setOfferForm({...offerForm, description: e.target.value})}
                            placeholder="e.g. Flat 20% off on all items"
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Discount Code</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-purple-500 outline-none uppercase font-mono" 
                              value={offerForm.code || ''}
                              onChange={e => setOfferForm({...offerForm, code: e.target.value.toUpperCase()})}
                              placeholder="e.g. SAVE20"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Discount Value</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" 
                              value={offerForm.discountAmount || ''}
                              onChange={e => setOfferForm({...offerForm, discountAmount: e.target.value})}
                              placeholder="e.g. 20%"
                            />
                          </div>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Valid Until</label>
                          <input 
                            type="date" 
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" 
                            value={offerForm.validUntil || ''}
                            onChange={e => setOfferForm({...offerForm, validUntil: e.target.value})}
                          />
                       </div>
                       
                       <div className="flex gap-2 pt-2">
                          <button 
                            onClick={handleSaveOffer}
                            className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-purple-700"
                          >
                            Create Offer
                          </button>
                          <button 
                            onClick={() => { setIsAddingOffer(false); setOfferForm({}); }}
                            className="flex-1 bg-gray-100 text-slate-600 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                       </div>
                    </div>
                 </div>
              )}

              <div className="space-y-4">
                 {(vendor.offers || []).length > 0 ? (
                    vendor.offers!.map(offer => (
                       <div key={offer.id} className="relative bg-white border border-gray-100 rounded-xl p-4 shadow-sm overflow-hidden group">
                          <div className={`absolute top-0 left-0 w-1.5 h-full ${offer.color || 'bg-purple-500'}`}></div>
                          <div className="pl-3">
                             <div className="flex justify-between items-start mb-2">
                                <div>
                                   <h4 className="font-bold text-slate-900 text-lg">{offer.title}</h4>
                                   <p className="text-sm text-gray-500">{offer.description}</p>
                                </div>
                                <button 
                                  onClick={() => handleDeleteOffer(offer.id)}
                                  className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                             
                             <div className="flex items-center gap-3 mt-3">
                                <div className="bg-gray-100 px-3 py-1 rounded-md text-xs font-mono font-bold text-slate-700 border border-gray-200 border-dashed">
                                   {offer.code}
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                   {offer.discountAmount} OFF
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium ml-auto">
                                   Exp: {offer.validUntil}
                                </span>
                             </div>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                       <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Ticket className="w-8 h-8 text-purple-300" />
                       </div>
                       <h3 className="text-slate-900 font-bold mb-1">No Active Offers</h3>
                       <p className="text-gray-500 text-sm mb-4">Create coupons and discounts to attract more customers.</p>
                       <button 
                         onClick={() => setIsAddingOffer(true)}
                         className="text-purple-600 font-bold text-sm hover:underline"
                       >
                         + Create First Offer
                       </button>
                    </div>
                 )}
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

// ... Helper components ...
const ProfileField = ({ 
  label, value, icon: Icon, isEditing, onChange, placeholder 
}: { 
  label: string; value: string | undefined; icon: any; isEditing: boolean; onChange: (v: string) => void; placeholder?: string; 
}) => (
  <div className="flex gap-3 items-start">
     <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 mt-1 flex-shrink-0">
       <Icon className="w-4 h-4" />
     </div>
     <div className="flex-1 min-w-0">
       <p className="text-xs font-bold text-gray-400 uppercase mb-1 truncate">{label}</p>
       {isEditing ? (
         <input 
           type="text" 
           value={value || ''} 
           onChange={e => onChange(e.target.value)}
           placeholder={placeholder}
           className="w-full border border-gray-200 rounded-md p-2 text-sm focus:border-red-500 outline-none font-medium text-slate-800"
         />
       ) : (
         <p className="text-sm font-bold text-slate-800 break-words">{value || 'Not Set'}</p>
       )}
     </div>
  </div>
);

const ToggleSetting = ({ label, isChecked, onChange, disabled }: { label: string; isChecked: boolean; onChange: (val: boolean) => void; disabled: boolean }) => (
  <div className={`flex items-center justify-between p-2 rounded-lg ${disabled ? 'opacity-70' : ''}`}>
     <span className="text-sm font-medium text-slate-700">{label}</span>
     <button 
       onClick={() => !disabled && onChange(!isChecked)}
       disabled={disabled}
       className={`transition-colors ${isChecked ? 'text-red-600' : 'text-gray-300'}`}
     >
       {isChecked ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
     </button>
  </div>
);

const ImageUploadField = ({ 
  label, value, onChange, isEditing 
}: { 
  label: string; value: string | undefined; onChange: (val: string) => void; isEditing: boolean; 
}) => {
  if (!isEditing) return null;

  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{label}</label>
      <div className="flex items-center gap-4">
         <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative">
            {value ? (
               <img src={value} alt="Preview" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera className="w-6 h-6" />
               </div>
            )}
         </div>
         <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-slate-700 cursor-pointer hover:bg-gray-50 transition-colors">
            <Camera className="w-4 h-4" /> Change Photo
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={(e) => {
                 if (e.target.files?.[0]) {
                    const url = URL.createObjectURL(e.target.files[0]);
                    onChange(url);
                 }
              }}
            />
         </label>
      </div>
    </div>
  );
};

export default VendorDashboard;
