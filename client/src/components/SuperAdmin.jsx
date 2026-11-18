import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import {
  ShieldCheck,
  Store,
  CheckCircle2,
  XCircle,
  Plus,
  ExternalLink,
  LogOut,
  AlertCircle,
  Search,
  Users,
  Eye,
  UtensilsCrossed
} from 'lucide-react';

export default function SuperAdmin({ user, onLogout, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // New stall modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    phone: '',
    cuisine: '',
    description: '',
    address: '',
    city: ''
  });

  // Availability checker widget
  const [checkEmail, setCheckEmail] = useState('');
  const [checkSlug, setCheckSlug] = useState('');
  const [availabilityResult, setAvailabilityResult] = useState(null);

  const showNotification = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/super-admin/overview');
      setData(res);
    } catch (err) {
      showNotification(err.message || 'Failed to load platform data', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleToggleStatus = async (stallId) => {
    try {
      const res = await apiRequest(`/super-admin/stalls/${stallId}/status`, { method: 'PATCH' });
      setData(prev => ({
        ...prev,
        stalls: prev.stalls.map(s => (s._id === stallId ? { ...s, status: res.stall.status } : s))
      }));
      showNotification(res.message);
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const handleCreateStall = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/super-admin/stalls', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      showNotification('New stall and shopkeeper registered successfully!');
      setShowModal(false);
      setForm({
        name: '',
        slug: '',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        phone: '',
        cuisine: '',
        description: '',
        address: '',
        city: ''
      });
      loadOverview();
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const runAvailabilityCheck = async () => {
    if (!checkEmail && !checkSlug) return;
    try {
      const q = new URLSearchParams();
      if (checkEmail) q.append('email', checkEmail);
      if (checkSlug) q.append('slug', checkSlug);
      const res = await apiRequest(`/super-admin/check-availability?${q.toString()}`);
      setAvailabilityResult(res);
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

  const { metrics, stalls } = data || { metrics: {}, stalls: [] };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      
      {/* Toast */}
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
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base leading-tight text-slate-900">
                Platform Console
              </h1>
              <span className="text-[11px] text-slate-500 font-medium">Super Admin: {user?.name || user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register Stall</span>
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
              <Store className="w-4 h-4 text-blue-600" />
              <span>Total Stalls</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{metrics.totalStalls || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Active Stalls</span>
            </div>
            <p className="text-2xl font-black text-emerald-600">{metrics.activeStalls || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              <span>Total Dishes</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{metrics.totalDishes || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
              <Eye className="w-4 h-4 text-purple-600" />
              <span>Menu Visits</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{metrics.totalVisits || 0}</p>
          </div>
        </div>

        {/* Real-time Availability Checker */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-900 mb-1">Check Shopkeeper ID & Slug Availability</h2>
          <p className="text-xs text-slate-500 mb-3">Verify whether an email or stall slug URL is already claimed before adding</p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Shopkeeper Email (e.g., owner@food.com)"
              value={checkEmail}
              onChange={(e) => setCheckEmail(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Stall Slug (e.g., taco-corner)"
              value={checkSlug}
              onChange={(e) => setCheckSlug(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={runAvailabilityCheck}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              Check
            </button>
          </div>

          {availabilityResult && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-semibold">
              {availabilityResult.email && (
                <div className={`flex items-center gap-1.5 ${availabilityResult.email.available ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {availabilityResult.email.available ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>Email: {availabilityResult.email.message}</span>
                </div>
              )}
              {availabilityResult.slug && (
                <div className={`flex items-center gap-1.5 ${availabilityResult.slug.available ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {availabilityResult.slug.available ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>Slug: {availabilityResult.slug.message}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* All Stalls List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 tracking-tight">Registered Food Stalls</h2>
            <span className="text-xs text-slate-500 font-semibold">{stalls.length} Stalls</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {stalls.map(s => (
              <div key={s._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <img
                    src={s.logo || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&h=120&fit=crop'}
                    alt={s.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">{s.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          s.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      /menu/{s.slug} &bull; Owner: {s.owner?.email || 'None'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Scans: <strong>{s.scanCount || 0}</strong></span>
                      <span>Visits: <strong>{s.visitorCount || 0}</strong></span>
                      {s.phone && <span>Phone: {s.phone}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={`#/menu/${s.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                    title="View Menu"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleToggleStatus(s._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                      s.status === 'active'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {s.status === 'active' ? 'Suspend Stall' : 'Approve & Activate'}
                  </button>
                </div>
              </div>
            ))}

            {stalls.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                No stalls registered yet. Click "Register Stall" to create one.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Register Stall Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900">Register New Food Stall</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateStall} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stall Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Burger Shack"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slug URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. burger-shack"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shopkeeper Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="owner@shack.com"
                    value={form.ownerEmail}
                    onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="SecretPassword123!"
                  value={form.ownerPassword}
                  onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cuisine</label>
                  <input
                    type="text"
                    placeholder="e.g. Burgers & Shakes"
                    value={form.cuisine}
                    onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address & City</label>
                <input
                  type="text"
                  placeholder="Shop 5, Downtown Food Walk, Mumbai"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Create & Activate Stall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
