import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import {
  Utensils,
  FolderTree,
  Store,
  QrCode,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  LogOut,
  Save,
  Copy,
  Download,
  AlertCircle
} from 'lucide-react';

export default function StallAdmin({ user, onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('menu'); // menu | categories | profile | qr
  const [stall, setStall] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals / Form states
  const [showAddDish, setShowAddDish] = useState(false);
  const [dishForm, setDishForm] = useState({
    name: '',
    categoryId: '',
    price: '',
    foodType: 'veg',
    description: '',
    image: '',
    isFeatured: false,
    variants: []
  });
  const [newVariant, setNewVariant] = useState({ name: '', price: '' });
  const [newCatName, setNewCatName] = useState('');
  const [profileForm, setProfileForm] = useState({});

  const showNotification = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [stallRes, catRes, itemsRes, qrRes] = await Promise.all([
        apiRequest('/stall/my'),
        apiRequest('/categories'),
        apiRequest('/food-items'),
        apiRequest('/stall/my/qr')
      ]);

      setStall(stallRes.stall);
      setProfileForm({
        name: stallRes.stall.name || '',
        tagline: stallRes.stall.tagline || '',
        description: stallRes.stall.description || '',
        cuisine: stallRes.stall.cuisine || '',
        phone: stallRes.stall.phone || '',
        address: stallRes.stall.address || '',
        city: stallRes.stall.city || '',
        openingHours: stallRes.stall.openingHours || '',
        logo: stallRes.stall.logo || '',
        banner: stallRes.stall.banner || '',
        instagram: stallRes.stall.socialLinks?.instagram || '',
        whatsapp: stallRes.stall.socialLinks?.whatsapp || ''
      });
      setCategories(catRes.categories || []);
      setItems(itemsRes.items || []);
      setQrData(qrRes);

      if (catRes.categories?.length > 0 && !dishForm.categoryId) {
        setDishForm(prev => ({ ...prev, categoryId: catRes.categories[0]._id }));
      }
    } catch (err) {
      showNotification(err.message || 'Failed to load stall data', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Dish handlers
  const handleToggleStock = async (itemId) => {
    try {
      const res = await apiRequest(`/food-items/${itemId}/toggle`, { method: 'PATCH' });
      setItems(prev => prev.map(i => (i._id === itemId ? { ...i, isAvailable: res.isAvailable } : i)));
      showNotification(res.message);
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await apiRequest(`/food-items/${itemId}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i._id !== itemId));
      showNotification('Dish deleted.');
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const handleAddDishSubmit = async (e) => {
    e.preventDefault();
    if (!dishForm.name || !dishForm.price || !dishForm.categoryId) {
      showNotification('Please fill name, price, and category.', true);
      return;
    }

    try {
      const res = await apiRequest('/food-items', {
        method: 'POST',
        body: JSON.stringify(dishForm)
      });
      setItems(prev => [...prev, res.item]);
      setShowAddDish(false);
      setDishForm({
        name: '',
        categoryId: categories[0]?._id || '',
        price: '',
        foodType: 'veg',
        description: '',
        image: '',
        isFeatured: false,
        variants: []
      });
      showNotification('Dish added successfully!');
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const addVariantToForm = () => {
    if (!newVariant.name || !newVariant.price) return;
    setDishForm(prev => ({
      ...prev,
      variants: [...prev.variants, { name: newVariant.name, price: Number(newVariant.price) }]
    }));
    setNewVariant({ name: '', price: '' });
  };

  // Category handlers
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCatName.trim() })
      });
      setCategories(prev => [...prev, res.category]);
      setNewCatName('');
      showNotification('Category added.');
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete category? Items in this category will also be removed.')) return;
    try {
      await apiRequest(`/categories/${catId}`, { method: 'DELETE' });
      setCategories(prev => prev.filter(c => c._id !== catId));
      setItems(prev => prev.filter(i => i.categoryId?._id !== catId && i.categoryId !== catId));
      showNotification('Category deleted.');
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // Profile save handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...profileForm,
        socialLinks: {
          instagram: profileForm.instagram,
          whatsapp: profileForm.whatsapp
        }
      };
      const res = await apiRequest('/stall/my', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setStall(res.stall);
      showNotification('Shop details saved successfully!');
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 ${
            toast.isError ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          {toast.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">
              S
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base leading-tight text-slate-900">
                {stall?.name || 'Stall Workspace'}
              </h1>
              <span className="text-[11px] text-slate-500 font-medium">Shopkeeper Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stall?.slug && (
              <a
                href={`#/menu/${stall.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">View Public</span> Menu
              </a>
            )}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-100 pt-1">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'menu'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Food Items ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'categories'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-4 h-4" />
            Shop Details
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'qr'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Dynamic QR Hub
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        
        {/* TAB 1: FOOD ITEMS */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Menu Items</h2>
                <p className="text-xs text-slate-500">Add dishes, set prices, and toggle instant stock status</p>
              </div>

              <button
                onClick={() => setShowAddDish(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Food Item
              </button>
            </div>

            {/* Dish List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map(item => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-start gap-3.5"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          item.foodType === 'veg'
                            ? 'bg-emerald-500'
                            : item.foodType === 'egg'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <h3 className="font-bold text-sm text-slate-900 truncate">{item.name}</h3>
                      <span className="text-xs font-black text-slate-900 ml-auto">₹{item.price}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.categoryId?.name || 'Dish'} &bull; {item.description || 'No description'}
                    </p>

                    {item.variants && item.variants.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {item.variants.map((v, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {v.name}: ₹{v.price}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      {/* Availability Toggle */}
                      <button
                        onClick={() => handleToggleStock(item._id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                          item.isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            In Stock
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Sold Out
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-8 text-center">
                  <Utensils className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">Your menu is currently empty</p>
                  <p className="text-xs text-slate-500 mt-0.5">Click "Add Food Item" to add your first dish.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="max-w-xl space-y-5">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Menu Categories</h2>
              <p className="text-xs text-slate-500">Group your dishes into sections like Pizzas, Starters, Drinks</p>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="New category name (e.g., Desserts)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Add Category
              </button>
            </form>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {categories.map(cat => (
                <div key={cat._id} className="p-3.5 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">{cat.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="text-slate-400 hover:text-rose-600 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SHOP PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 tracking-tight mb-1">Stall Information</h2>
            <p className="text-xs text-slate-500 mb-6">These details are shown to customers when they view your menu</p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stall Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cuisine / Speciality</label>
                  <input
                    type="text"
                    value={profileForm.cuisine}
                    onChange={(e) => setProfileForm({ ...profileForm, cuisine: e.target.value })}
                    placeholder="e.g. Italian, Street Food"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={profileForm.tagline}
                  onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                  placeholder="e.g. Authentic Wood-Fired Slices & Fresh Shakes"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={profileForm.openingHours}
                    onChange={(e) => setProfileForm({ ...profileForm, openingHours: e.target.value })}
                    placeholder="11:00 AM - 11:00 PM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Shop 14, Food Street"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    placeholder="Metropolis"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Logo Image URL</label>
                  <input
                    type="url"
                    value={profileForm.logo}
                    onChange={(e) => setProfileForm({ ...profileForm, logo: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cover Banner URL</label>
                  <input
                    type="url"
                    value={profileForm.banner}
                    onChange={(e) => setProfileForm({ ...profileForm, banner: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-sm mt-2"
              >
                <Save className="w-4 h-4" />
                Save Shop Details
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: DYNAMIC QR HUB */}
        {activeTab === 'qr' && qrData && (
          <div className="max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Dynamic QR Code</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Scan to open your live menu. When you update dishes or prices, this QR code never needs to be reprinted!
            </p>

            <div className="my-6 inline-block p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-md">
              <img src={qrData.qrDataUrl} alt="QR Code" className="w-56 h-56 mx-auto rounded-2xl" />
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Camera Scans: <strong className="text-amber-600">{qrData.scanCount || 0}</strong>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 truncate flex items-center justify-between">
                <span className="truncate">{qrData.targetUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(qrData.targetUrl);
                    showNotification('Copied URL to clipboard!');
                  }}
                  className="ml-2 text-slate-400 hover:text-slate-800"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 justify-center">
                <a
                  href={qrData.qrDataUrl}
                  download={`${stall?.slug}-qr.png`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Add Food Item */}
      {showAddDish && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900">Add New Dish</h3>
              <button
                onClick={() => setShowAddDish(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddDishSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farmhouse Veggie Pizza"
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={dishForm.categoryId}
                    onChange={(e) => setDishForm({ ...dishForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="249"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dietary Tag</label>
                <div className="flex gap-2">
                  {['veg', 'non_veg', 'egg'].map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setDishForm({ ...dishForm, foodType: type })}
                      className={`flex-1 py-1.5 rounded-xl border font-bold capitalize transition ${
                        dishForm.foodType === type
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={dishForm.image}
                  onChange={(e) => setDishForm({ ...dishForm, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Ingredients, preparation details..."
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Optional Variants */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 mb-1">Size Variants (Optional)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Size (e.g., Medium 10'')"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                  <input
                    type="number"
                    placeholder="Price ₹"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={addVariantToForm}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 font-bold hover:bg-slate-300"
                  >
                    Add
                  </button>
                </div>

                {dishForm.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {dishForm.variants.map((v, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                        {v.name}: ₹{v.price}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDish(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
