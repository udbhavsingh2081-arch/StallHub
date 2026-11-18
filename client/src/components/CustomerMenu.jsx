import React, { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../api';
import { Search, Phone, MapPin, Clock, Share2, Sparkles, AlertCircle } from 'lucide-react';

export default function CustomerMenu({ slug = 'pizza-corner', onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [dietFilter, setDietFilter] = useState('ALL'); // ALL | veg | non_veg | egg
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(window.location.search);
        const isQR = searchParams.get('source') === 'qr';
        const res = await apiRequest(`/public/menu/${slug}${isQR ? '?source=qr' : ''}`);
        if (isMounted) {
          setData(res);
          if (res.categories && res.categories.length > 0) {
            setActiveCategory(res.categories[0]._id);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.data?.message || err.message || 'Failed to load menu');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMenu();
    return () => { isMounted = false; };
  }, [slug]);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter(item => {
      // Search match
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      // Dietary filter
      if (dietFilter !== 'ALL' && item.foodType !== dietFilter) {
        return false;
      }
      return true;
    });
  }, [data?.items, search, dietFilter]);

  const itemsByCategory = useMemo(() => {
    if (!data?.categories) return {};
    const map = {};
    data.categories.forEach(cat => {
      map[cat._id] = [];
    });
    filteredItems.forEach(item => {
      const catId = typeof item.categoryId === 'object' ? item.categoryId?._id : item.categoryId;
      if (map[catId]) {
        map[catId].push(item);
      } else {
        if (!map['other']) map['other'] = [];
        map['other'].push(item);
      }
    });
    return map;
  }, [data?.categories, filteredItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading digital menu...</p>
      </div>
    );
  }

  if (error || !data?.stall) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Menu Unavailable</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This stall menu could not be loaded.'}</p>
        <button
          onClick={() => onNavigate('#/login')}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
        >
          Staff / Owner Login &rarr;
        </button>
      </div>
    );
  }

  const { stall, categories } = data;

  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    const el = document.getElementById(`cat-${catId}`);
    if (el) {
      const yOffset = -140;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Top Banner Cover */}
      <div className="relative h-44 sm:h-60 w-full overflow-hidden bg-slate-900">
        <img
          src={stall.banner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop'}
          alt={stall.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        
        {/* Top Floating Controls */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-black/60 text-amber-400 backdrop-blur border border-white/10">
            Digital QR Menu
          </span>
          <button
            onClick={() => onNavigate('#/login')}
            className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white/90 text-slate-800 hover:bg-white backdrop-blur shadow-sm transition"
          >
            Owner Portal
          </button>
        </div>
      </div>

      {/* Stall Profile Info Card */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-start gap-4">
            <img
              src={stall.logo || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop'}
              alt={stall.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                  {stall.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Open Now
                </span>
              </div>
              {stall.tagline && (
                <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">{stall.tagline}</p>
              )}
              {stall.cuisine && (
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">{stall.cuisine}</p>
              )}
            </div>
          </div>

          {/* Quick Contact & Details */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-4 flex-wrap">
              {stall.openingHours && (
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {stall.openingHours}
                </span>
              )}
              {stall.address && (
                <span className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {stall.address}{stall.city ? `, ${stall.city}` : ''}
                </span>
              )}
            </div>

            {stall.phone && (
              <a
                href={`tel:${stall.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs hover:bg-amber-100 transition"
              >
                <Phone className="w-3 h-3 text-amber-600" />
                Call Stall
              </a>
            )}
          </div>
        </div>

        {/* Search & Dietary Filters (Sticky Header) */}
        <div className="sticky top-0 z-30 bg-slate-50 pt-4 pb-2 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes, drinks, pizzas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
          </div>

          {/* Dietary Filters & Category Scroll Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setDietFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                dietFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setDietFilter(dietFilter === 'veg' ? 'ALL' : 'veg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                dietFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-emerald-800 border border-emerald-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Veg Only
            </button>
            <button
              onClick={() => setDietFilter(dietFilter === 'non_veg' ? 'ALL' : 'non_veg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                dietFilter === 'non_veg'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-rose-800 border border-rose-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Non-Veg
            </button>
            <button
              onClick={() => setDietFilter(dietFilter === 'egg' ? 'ALL' : 'egg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                dietFilter === 'egg'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-amber-800 border border-amber-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Egg
            </button>
          </div>

          {/* Category Tabs */}
          {categories && categories.length > 0 && !search && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200/80 pb-2">
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => scrollToCategory(cat._id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    activeCategory === cat._id
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Menu Items List */}
        <div className="mt-4 space-y-8">
          {categories.map(cat => {
            const items = itemsByCategory[cat._id] || [];
            if (items.length === 0) return null;

            return (
              <section key={cat._id} id={`cat-${cat._id}`} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {cat.name}
                  </h2>
                  <span className="text-xs text-slate-400 font-semibold">{items.length} items</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {items.map(item => {
                    const hasVariants = item.variants && item.variants.length > 0;
                    const selectedVar = selectedVariants[item._id] || (hasVariants ? item.variants[0] : null);
                    const currentPrice = selectedVar ? selectedVar.price : item.price;

                    return (
                      <div
                        key={item._id}
                        className={`bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-start gap-3.5 transition ${
                          !item.isAvailable ? 'opacity-60 grayscale-[30%]' : ''
                        }`}
                      >
                        {/* Food Image */}
                        {item.image ? (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {!item.isAvailable && (
                              <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center p-1 text-center">
                                <span className="text-[10px] font-black text-white uppercase tracking-wider">
                                  Sold Out
                                </span>
                              </div>
                            )}
                          </div>
                        ) : null}

                        {/* Food Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {/* FSSAI veg / non-veg icon */}
                            <span
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                                item.foodType === 'veg'
                                  ? 'border-emerald-600'
                                  : item.foodType === 'egg'
                                  ? 'border-amber-600'
                                  : 'border-rose-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.foodType === 'veg'
                                    ? 'bg-emerald-600'
                                    : item.foodType === 'egg'
                                    ? 'bg-amber-600'
                                    : 'bg-rose-600'
                                }`}
                              />
                            </span>

                            <h3 className="font-bold text-sm text-slate-900 truncate">
                              {item.name}
                            </h3>

                            {item.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                Bestseller
                              </span>
                            )}
                          </div>

                          {item.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {/* Variants Pills */}
                          {hasVariants && (
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {item.variants.map((v, i) => (
                                <button
                                  key={i}
                                  onClick={() => setSelectedVariants(prev => ({ ...prev, [item._id]: v }))}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                                    selectedVar?.name === v.name
                                      ? 'bg-slate-900 text-white border-slate-900'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {v.name}: ₹{v.price}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Price & Availability Tag */}
                          <div className="mt-2.5 flex items-center justify-between">
                            <span className="text-sm sm:text-base font-black text-slate-900">
                              ₹{currentPrice}
                            </span>

                            {!item.isAvailable ? (
                              <span className="text-[10px] font-bold text-rose-600 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                                Temporarily Unavailable
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
              <p className="text-sm font-bold text-slate-700">No dishes match your filter.</p>
              <button
                onClick={() => { setSearch(''); setDietFilter('ALL'); }}
                className="mt-3 text-xs font-bold text-amber-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-400 py-6 border-t border-slate-200">
          <p className="font-semibold text-slate-500">{stall.name}</p>
          <p className="mt-0.5">Powered by StallHub Digital Menu</p>
        </footer>
      </div>
    </div>
  );
}
