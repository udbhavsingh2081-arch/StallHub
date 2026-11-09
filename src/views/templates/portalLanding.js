export function renderPortalLandingHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <title>FoodStallHub - Digital Menu Management Platform</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800;900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
    h1, h2, h3, .heading-font { font-family: 'Manrope', sans-serif; }
  </style>
</head>
<body class="bg-[#F8FAFC] text-[#0F172A] min-h-screen flex flex-col justify-between selection:bg-amber-400 selection:text-black">

  <!-- Header Navigation -->
  <header class="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-[#142235] text-amber-400 flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0">
          F
        </div>
        <div class="flex items-center gap-2">
          <span class="font-black text-lg tracking-tight">FoodStallHub</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">MVC</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <a href="/api/health" target="_blank" class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="hidden sm:inline">API</span> Health
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14 flex-1 flex flex-col justify-center">
    <div class="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] sm:text-xs font-bold uppercase tracking-wide mb-3">
        ✨ Multi-Tenant Digital Menu Management
      </div>
      <h1 class="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#142235] leading-tight sm:leading-tight">
        One central platform.<br>
        <span class="text-amber-500">Independent menus</span> for every food stall.
      </h1>
      <p class="mt-3 sm:mt-4 text-xs sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
        Eliminate printed menu reprinting costs. Update prices and availability in real time, customize themes, and share permanent QR codes.
      </p>
    </div>

    <!-- Interactive Role Panels -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
      
      <!-- Panel 1: Customer View -->
      <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
        <div>
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-2xl mb-3.5">
            📱
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-600">Customer Facing</span>
          <h2 class="text-lg sm:text-xl font-black text-[#142235] mt-0.5 mb-1.5">Live Public Menu</h2>
          <p class="text-xs text-slate-500 leading-relaxed mb-4">
            Mobile-first customer menu with dietary veg/non-veg tags, real-time search, and instant variant prices.
          </p>
        </div>
        <div class="space-y-2 pt-3.5 border-t border-slate-100">
          <a href="/menu/pizza-corner" class="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition">
            Open Pizza Corner Menu &rarr;
          </a>
          <a href="/menu/pizza-corner/poster" target="_blank" class="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition">
            Printable QR Poster
          </a>
        </div>
      </div>

      <!-- Panel 2: Stall Owner Admin -->
      <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
        <div>
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl mb-3.5">
            🍳
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Tenant Workspace</span>
          <h2 class="text-lg sm:text-xl font-black text-[#142235] mt-0.5 mb-1.5">Stall Admin Portal</h2>
          <p class="text-xs text-slate-500 leading-relaxed mb-4">
            Manage food categories, customize themes (Luxury, Minimal, Street Food, Fresh), and publish drafts.
          </p>
        </div>
        <div class="space-y-2 pt-3.5 border-t border-slate-100 text-xs">
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-0.5 text-slate-600">
            <p><span class="text-slate-400">Email:</span> owner@pizzacorner.com</p>
            <p><span class="text-slate-400">Pass:</span> StallOwnerPass123!</p>
          </div>
          <a href="/menu/pizza-corner/preview" class="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition">
            Preview Draft Changes
          </a>
        </div>
      </div>

      <!-- Panel 3: Super Admin Console -->
      <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
        <div>
          <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl mb-3.5">
            🛡️
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">Platform Control</span>
          <h2 class="text-lg sm:text-xl font-black text-[#142235] mt-0.5 mb-1.5">Super Admin Console</h2>
          <p class="text-xs text-slate-500 leading-relaxed mb-4">
            Register new food stalls, assign owners, suspend/reactivate tenants, and track platform-wide analytics.
          </p>
        </div>
        <div class="space-y-2 pt-3.5 border-t border-slate-100 text-xs">
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-0.5 text-slate-600">
            <p><span class="text-slate-400">Email:</span> udbhavsingh2081@gmail.com</p>
            <p><span class="text-slate-400">Pass:</span> Udbhavsingh2005%</p>
          </div>
          <a href="/super-admin" class="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm">
            Open Super Admin Dashboard &rarr;
          </a>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-200 py-5 text-center text-xs text-slate-500 bg-white px-4">
    <p>FoodStallHub Multi-Tenant &bull; Express 5 &bull; Prisma 7 &bull; PostgreSQL &bull; MVC</p>
  </footer>
</body>
</html>`;
}

export default renderPortalLandingHtml;
