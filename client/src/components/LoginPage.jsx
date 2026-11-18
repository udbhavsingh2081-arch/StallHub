import React, { useState } from 'react';
import { apiRequest, setAuthToken, setCurrentUser } from '../api';
import { ShieldCheck, Utensils, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      setAuthToken(res.token);
      setCurrentUser(res.user);
      onLoginSuccess(res.user);

      if (res.user.role === 'super_admin') {
        onNavigate('#/super-admin');
      } else {
        onNavigate('#/stall-admin');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (em, pass) => {
    setEmail(em);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4">
      <header className="max-w-4xl mx-auto w-full py-4 flex items-center justify-between">
        <a href="#/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm">
            S
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">StallHub</span>
        </a>
        <a href="#/menu/pizza-corner" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
          View Demo Menu &rarr;
        </a>
      </header>

      <main className="max-w-md w-full mx-auto my-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Utensils className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h1>
            <p className="text-xs text-slate-500 mt-1">Manage food stalls, menus, and dynamic QR codes</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'Signing In...' : 'Sign In to Workspace'}
            </button>
          </form>

          {/* Quick Demo Autofill */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1">
              Quick One-Click Sign In
            </p>
            <button
              type="button"
              onClick={() => autofill('udbhavsingh2081@gmail.com', 'Udbhavsingh2005%')}
              className="w-full py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Super Admin (Platform Owner)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Autofill &rarr;</span>
            </button>

            <button
              type="button"
              onClick={() => autofill('owner@pizzacorner.com', 'StallOwnerPass123!')}
              className="w-full py-2.5 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-600" />
                Stall Owner (Pizza Corner)
              </span>
              <span className="text-[10px] font-mono text-amber-600">Autofill &rarr;</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-4">
        StallHub MERN Stack &bull; Clean & Simple
      </footer>
    </div>
  );
}
