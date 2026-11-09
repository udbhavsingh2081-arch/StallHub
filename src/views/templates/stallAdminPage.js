export function renderStallAdminHtml({ stall, categories, foodItems, user, analytics, qrCode = {} }) {
  const primaryColor = stall.primaryColor || "#142235";
  const publicMenuUrl = `/menu/${stall.slug}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <title>Stall Admin | ${stall.name} | FoodStallHub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
    h1, h2, h3, h4, .heading-font { font-family: 'Manrope', sans-serif; }
    .dietary-veg { border: 1.5px solid #16a34a; }
    .dietary-veg .dot { background-color: #16a34a; border-radius: 50%; }
    .dietary-nonveg { border: 1.5px solid #dc2626; }
    .dietary-nonveg .dot { background-color: #dc2626; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); width: 8px; height: 8px; }
    .dietary-egg { border: 1.5px solid #d97706; }
    .dietary-egg .dot { background-color: #d97706; border-radius: 50%; width: 7px; height: 9px; }
  </style>
</head>
<body class="bg-slate-100 text-slate-900 min-h-screen flex flex-col selection:bg-amber-400 selection:text-black">

  <!-- Notification Banner Container -->
  <div id="toast-container" class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"></div>

  <!-- Top Navigation Bar -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      
      <!-- Stall Info & Logo -->
      <div class="flex items-center gap-3">
        <a href="/stall-admin" class="flex items-center gap-2.5">
          ${stall.logoUrl ? `
          <img src="${stall.logoUrl}" alt="${stall.name}" class="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0">
          ` : `
          <div class="w-9 h-9 rounded-xl bg-[#142235] text-amber-400 flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0">
            ${stall.name[0]}
          </div>
          `}
          <div>
            <span class="font-extrabold text-base sm:text-lg tracking-tight text-[#142235] line-clamp-1">${stall.name}</span>
            <span class="text-[10px] text-slate-500 font-medium hidden sm:block">Owner Workspace</span>
          </div>
        </a>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 sm:gap-3">
        <a 
          href="${publicMenuUrl}" 
          target="_blank"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition active:scale-95"
        >
          <span>👁️ Customer View</span>
        </a>

        <button 
          onclick="handleLogout()"
          class="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6">

    <!-- Hero Card with Publish CTA -->
    <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Current Status</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${stall.menuStatus === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}">
            ${stall.menuStatus === "PUBLISHED" ? "● Live & Published" : "○ Draft Mode"}
          </span>
        </div>
        <h1 class="text-xl sm:text-2xl font-black text-[#142235] heading-font">
          ${stall.name} Digital Menu
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Customers scanning your QR code see your published menu at: 
          <a href="${publicMenuUrl}" target="_blank" class="text-amber-600 font-bold underline font-mono text-xs">${publicMenuUrl}</a>
        </p>
      </div>

      <!-- Publish & Poster Buttons -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <a 
          href="${publicMenuUrl}/poster" 
          target="_blank"
          class="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <span>🖨️ Printable QR Poster</span>
        </a>

        <button 
          id="publish-btn"
          onclick="publishMenu()"
          class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition active:scale-95 flex items-center gap-1.5"
        >
          <span>🚀 Publish Changes Live</span>
        </button>
      </div>
    </div>

    <!-- Quick Metrics Counters -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Dishes</span>
        <div class="text-2xl font-black text-[#142235] mt-1" id="stat-total-items">${foodItems.length}</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Available</span>
        <div class="text-2xl font-black text-emerald-600 mt-1">${foodItems.filter(i => i.isAvailable).length}</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Categories</span>
        <div class="text-2xl font-black text-[#142235] mt-1">${categories.length}</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">Total Visits</span>
        <div class="text-2xl font-black text-blue-600 mt-1">${analytics?.metrics?.totalViews || 0}</div>
      </div>
    </div>

    <!-- Two-Column Tabbed Workspace Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- LEFT COLUMN: Shopkeeper Stall Details Form (PRD Section 4.2 & 5.B) -->
      <div class="lg:col-span-1 space-y-6">

        <!-- Dynamic QR Code Hub Card -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">
                📱
              </div>
              <div>
                <h2 class="text-sm font-black text-[#142235] heading-font">Dynamic QR Code</h2>
                <span class="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">● Auto-Opens Menu</span>
              </div>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              ${qrCode.scanCount || 0} scans
            </span>
          </div>

          <!-- QR Visual Preview Box -->
          <div class="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col items-center">
            <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-md inline-block">
              <img src="${qrCode.dataUrl || ""}" alt="QR Code for ${stall.name}" class="w-36 h-36 mx-auto object-contain">
            </div>
            <p class="text-[11px] font-mono text-slate-500 mt-2.5 truncate max-w-full px-2" title="${qrCode.targetUrl || ""}">
              ${qrCode.targetUrl || ""}
            </p>
            <a href="${qrCode.targetUrl || ""}" target="_blank" class="mt-1 text-[10px] font-bold text-amber-600 hover:underline">
              🔗 Test Scan Destination &rarr;
            </a>
          </div>

          <!-- Feature Explanation Badge -->
          <div class="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed space-y-1">
            <p class="font-bold flex items-center gap-1 text-[11px]">
              <span>⚡</span> Print Once, Updates Anytime!
            </p>
            <p class="text-[10px] opacity-90">
              When customers point their camera at this QR, it immediately opens your digital menu on their phone. When you update dishes, prices, or your shop logo, your existing printed QR codes automatically show the new menu!
            </p>
          </div>

          <!-- QR Color Customizer & Downloads -->
          <div class="space-y-2.5 pt-1 text-xs">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">QR Color</label>
                <div class="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 bg-slate-50">
                  <input type="color" id="qr-fg-color" value="${qrCode.foregroundColor || "#142235"}" class="w-6 h-6 rounded cursor-pointer border-0 bg-transparent">
                  <span class="text-[10px] font-mono text-slate-600 truncate">${qrCode.foregroundColor || "#142235"}</span>
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">Background</label>
                <div class="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 bg-slate-50">
                  <input type="color" id="qr-bg-color" value="${qrCode.backgroundColor || "#FFFFFF"}" class="w-6 h-6 rounded cursor-pointer border-0 bg-transparent">
                  <span class="text-[10px] font-mono text-slate-600 truncate">${qrCode.backgroundColor || "#FFFFFF"}</span>
                </div>
              </div>
            </div>

            <button onclick="saveQrColors()" class="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition">
              Apply QR Colors
            </button>

            <div class="grid grid-cols-2 gap-2 pt-1">
              <a href="/api/stall/qr/download/png" class="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm transition">
                <span>📥 PNG (Stickers)</span>
              </a>
              <a href="/api/stall/qr/download/svg" class="py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 transition">
                <span>📐 Vector SVG</span>
              </a>
            </div>

            <a href="${publicMenuUrl}/poster" target="_blank" class="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition">
              <span>🖨️ Open Print-Ready Poster &rarr;</span>
            </a>
          </div>
        </div>

        <!-- Shop Details Card -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 class="text-base font-black text-[#142235] heading-font flex items-center gap-2">
              <span>🏪</span> Stall Details
            </h2>
            <span class="text-[10px] font-bold uppercase text-slate-400">Visible to Customers</span>
          </div>

          <form id="profile-form" onsubmit="handleUpdateProfile(event)" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1" for="stall-name">Stall Name</label>
              <input 
                type="text" 
                id="stall-name" 
                name="name" 
                value="${stall.name || ""}" 
                required 
                class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1" for="stall-tagline">Tagline</label>
              <input 
                type="text" 
                id="stall-tagline" 
                name="tagline" 
                value="${stall.tagline || ""}" 
                placeholder="e.g. Artisan Wood-Fired Slices & Fresh Shakes" 
                class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1" for="stall-cuisine">Cuisine / Food Category</label>
              <input 
                type="text" 
                id="stall-cuisine" 
                name="cuisineType" 
                value="${stall.cuisineType || ""}" 
                placeholder="e.g. Italian & Street Fast Food" 
                class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 mb-1" for="stall-phone">Phone Number</label>
                <input 
                  type="text" 
                  id="stall-phone" 
                  name="phone" 
                  value="${stall.phone || ""}" 
                  placeholder="+91 98765 43210" 
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1" for="stall-city">City</label>
                <input 
                  type="text" 
                  id="stall-city" 
                  name="city" 
                  value="${stall.city || ""}" 
                  placeholder="e.g. Metropolis" 
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1" for="stall-address">Full Address</label>
              <input 
                type="text" 
                id="stall-address" 
                name="address" 
                value="${stall.address || ""}" 
                placeholder="Shop 14, Food Street" 
                class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1" for="stall-logo">Logo Image URL</label>
              <input 
                type="url" 
                id="stall-logo" 
                name="logoUrl" 
                value="${stall.logoUrl || ""}" 
                placeholder="https://images.unsplash.com/..." 
                class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1" for="stall-cover">Cover Banner URL</label>
              <input 
                type="url" 
                id="stall-cover" 
                name="coverUrl" 
                value="${stall.coverUrl || ""}" 
                placeholder="https://images.unsplash.com/..." 
                class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1" for="stall-desc">About Description</label>
              <textarea 
                id="stall-desc" 
                name="description" 
                rows="2" 
                placeholder="Welcome to our food stall!..." 
                class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >${stall.description || ""}</textarea>
            </div>

            <button 
              type="submit" 
              id="save-profile-btn"
              class="w-full py-2.5 rounded-xl bg-[#142235] hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              Save Shop Details
            </button>
          </form>
        </div>

        <!-- Quick Theme Selector Card -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <h2 class="text-base font-black text-[#142235] heading-font flex items-center gap-2">
            <span>🎨</span> Menu Theme Preset
          </h2>
          <p class="text-xs text-slate-500">Pick an instant visual style for your customer menu:</p>
          
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button onclick="applyThemePreset('STREET_FOOD')" class="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 text-left font-bold transition">
              <span class="block text-amber-600">🍔 Street Food</span>
              <span class="text-[10px] text-slate-400 font-normal">Warm & Vibrant</span>
            </button>
            <button onclick="applyThemePreset('LUXURY')" class="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 text-left font-bold transition">
              <span class="block text-slate-900">✨ Luxury Dark</span>
              <span class="text-[10px] text-slate-400 font-normal">Gold & Black</span>
            </button>
            <button onclick="applyThemePreset('MINIMAL')" class="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 text-left font-bold transition">
              <span class="block text-slate-700">🤍 Minimal Clean</span>
              <span class="text-[10px] text-slate-400 font-normal">Crisp & Modern</span>
            </button>
            <button onclick="applyThemePreset('FRESH')" class="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 text-left font-bold transition">
              <span class="block text-emerald-600">🥗 Fresh Garden</span>
              <span class="text-[10px] text-slate-400 font-normal">Emerald Green</span>
            </button>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: Add Food Item & Manage Menu Items (PRD Section 6) -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Add New Food Item Card -->
        <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-base sm:text-lg font-black text-[#142235] heading-font flex items-center gap-2">
                <span>➕</span> Add New Food Item
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">Add dish details, prices, dietary tags and variants</p>
            </div>
            
            <!-- Quick Add Category Modal Trigger -->
            <button 
              type="button" 
              onclick="toggleNewCategoryModal()"
              class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
            >
              <span>+ New Category</span>
            </button>
          </div>

          <form id="add-item-form" onsubmit="handleAddItem(event)" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block font-bold text-slate-700 mb-1" for="item-name">Dish Name *</label>
                <input 
                  type="text" 
                  id="item-name" 
                  required 
                  placeholder="e.g. Crispy Paneer Burger" 
                  class="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1" for="item-category">Category *</label>
                <select 
                  id="item-category" 
                  required 
                  class="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                >
                  ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- Price, Dietary Type & Prep Time -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label class="block font-bold text-slate-700 mb-1" for="item-price">Base Price (₹) *</label>
                <input 
                  type="number" 
                  id="item-price" 
                  required 
                  min="0" 
                  step="0.5" 
                  placeholder="120" 
                  class="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1" for="item-food-type">Dietary Type *</label>
                <select 
                  id="item-food-type" 
                  class="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-bold"
                >
                  <option value="VEG" selected>🟢 Pure Vegetarian (VEG)</option>
                  <option value="NON_VEG">🔴 Non-Vegetarian (NON-VEG)</option>
                  <option value="EGG">🟡 Contains Egg (EGG)</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1" for="item-prep">Prep Time (mins)</label>
                <input 
                  type="number" 
                  id="item-prep" 
                  min="1" 
                  placeholder="10" 
                  class="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
              </div>
            </div>

            <!-- Image URL & Tags -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block font-bold text-slate-700 mb-1" for="item-image">Photo URL (optional)</label>
                <input 
                  type="url" 
                  id="item-image" 
                  placeholder="https://images.unsplash.com/..." 
                  class="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1" for="item-tags">Tags (comma-separated)</label>
                <input 
                  type="text" 
                  id="item-tags" 
                  placeholder="Bestseller, Spicy, Chef Special" 
                  class="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1" for="item-desc">Description</label>
              <textarea 
                id="item-desc" 
                rows="2" 
                placeholder="Crispy fried patty with secret herb mayo and fresh lettuce..." 
                class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              id="add-item-btn"
              class="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm transition active:scale-[0.98]"
            >
              Add Item to Menu
            </button>
          </form>
        </div>

        <!-- Current Menu Items List by Category -->
        <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 class="text-base sm:text-lg font-black text-[#142235] heading-font flex items-center gap-2">
              <span>📋</span> Current Menu Dishes
            </h2>
            <span class="text-xs font-bold text-slate-400 font-mono">${foodItems.length} items</span>
          </div>

          <div class="space-y-6" id="items-list-container">
            ${categories.map(cat => {
              const catItems = foodItems.filter(i => i.categoryId === cat.id);
              return `
              <div class="space-y-3" id="cat-group-${cat.id}">
                <div class="flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
                  <h3 class="font-extrabold text-xs uppercase tracking-wide text-slate-700">
                    ${cat.name}
                  </h3>
                  <span class="text-[10px] font-mono font-semibold text-slate-400">${catItems.length} items</span>
                </div>

                <div class="space-y-2.5">
                  ${catItems.length === 0 ? `
                  <p class="text-xs text-slate-400 italic py-2 px-3">No dishes in this category yet.</p>
                  ` : catItems.map(item => `
                  <div class="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between gap-3 bg-white" id="item-card-${item.id}">
                    
                    <!-- Left: Details & Badges -->
                    <div class="flex items-start gap-3 min-w-0">
                      ${item.imageUrl ? `
                      <img src="${item.imageUrl}" alt="${item.name}" class="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0">
                      ` : `
                      <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                        🍽️
                      </div>
                      `}

                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          ${item.foodType === "VEG" ? `
                          <span class="w-3.5 h-3.5 dietary-veg rounded-[2px] inline-flex items-center justify-center flex-shrink-0">
                            <span class="dot w-1.5 h-1.5"></span>
                          </span>
                          ` : item.foodType === "NON_VEG" ? `
                          <span class="w-3.5 h-3.5 dietary-nonveg rounded-[2px] inline-flex items-center justify-center flex-shrink-0">
                            <span class="dot"></span>
                          </span>
                          ` : `
                          <span class="w-3.5 h-3.5 dietary-egg rounded-[2px] inline-flex items-center justify-center flex-shrink-0">
                            <span class="dot"></span>
                          </span>
                          `}

                          <h4 class="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            ${item.name}
                          </h4>

                          <span class="font-black text-xs text-amber-600">
                            ₹${item.price}
                          </span>
                        </div>

                        ${item.description ? `
                        <p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${item.description}</p>
                        ` : ""}

                        ${item.variants && item.variants.length > 0 ? `
                        <div class="flex flex-wrap gap-1 mt-1">
                          ${item.variants.map(v => `
                          <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            ${v.name}: ₹${v.price}
                          </span>
                          `).join("")}
                        </div>
                        ` : ""}
                      </div>
                    </div>

                    <!-- Right: Instant Availability & Delete -->
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <button 
                        type="button" 
                        onclick="toggleItemAvailability('${item.id}', ${!item.isAvailable})"
                        class="px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase transition ${item.isAvailable ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-red-100 text-red-800 hover:bg-red-200"}"
                        id="avail-btn-${item.id}"
                      >
                        ${item.isAvailable ? "In Stock" : "Sold Out"}
                      </button>

                      <button 
                        type="button" 
                        onclick="deleteFoodItem('${item.id}')"
                        class="w-7 h-7 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center text-sm transition"
                        title="Delete Dish"
                      >
                        🗑️
                      </button>
                    </div>

                  </div>
                  `).join("")}
                </div>
              </div>
              `;
            }).join("")}
          </div>
        </div>

      </div>

    </div>
  </main>

  <!-- Quick Add Category Modal Dialog -->
  <div id="new-cat-modal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 class="text-sm font-black text-[#142235]">Add New Category</h3>
        <button onclick="toggleNewCategoryModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">&times;</button>
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
        <input type="text" id="new-cat-name" placeholder="e.g. Desserts & Shakes" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none">
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Description (optional)</label>
        <input type="text" id="new-cat-desc" placeholder="Sweet delicacies" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none">
      </div>
      <button onclick="handleCreateCategory()" class="w-full py-2.5 rounded-xl bg-[#142235] text-white font-bold text-xs hover:bg-slate-800 transition">
        Create Category
      </button>
    </div>
  </div>

  <script>
    function showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'px-4 py-3 rounded-2xl text-xs font-bold shadow-xl transition-all transform pointer-events-auto flex items-center gap-2 ' + 
        (type === 'success' ? 'bg-slate-900 text-white border border-slate-700' : 'bg-red-600 text-white');
      toast.innerHTML = (type === 'success' ? '✓ ' : '⚠️ ') + message;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    async function handleUpdateProfile(e) {
      e.preventDefault();
      const btn = document.getElementById('save-profile-btn');
      btn.disabled = true;
      btn.innerHTML = 'Saving...';

      const payload = {
        name: document.getElementById('stall-name').value,
        tagline: document.getElementById('stall-tagline').value,
        cuisineType: document.getElementById('stall-cuisine').value,
        phone: document.getElementById('stall-phone').value,
        city: document.getElementById('stall-city').value,
        address: document.getElementById('stall-address').value,
        logoUrl: document.getElementById('stall-logo').value,
        coverUrl: document.getElementById('stall-cover').value,
        description: document.getElementById('stall-desc').value
      };

      try {
        const res = await fetch('/api/stall/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Shop details saved! Click "Publish Changes Live" to update customer view.');
        } else {
          showToast(data.message || 'Failed to update profile', 'error');
        }
      } catch (err) {
        showToast('Network error while saving details', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Save Shop Details';
      }
    }

    async function handleAddItem(e) {
      e.preventDefault();
      const btn = document.getElementById('add-item-btn');
      btn.disabled = true;
      btn.innerHTML = 'Adding dish...';

      const tagsRaw = document.getElementById('item-tags').value;
      const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

      const payload = {
        name: document.getElementById('item-name').value,
        categoryId: document.getElementById('item-category').value,
        price: parseFloat(document.getElementById('item-price').value),
        foodType: document.getElementById('item-food-type').value,
        prepTimeMinutes: document.getElementById('item-prep').value ? parseInt(document.getElementById('item-prep').value) : null,
        imageUrl: document.getElementById('item-image').value || null,
        description: document.getElementById('item-desc').value || null,
        tags
      };

      try {
        const res = await fetch('/api/stall/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Dish added to menu! Click "Publish Changes Live" when ready.');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast(data.message || 'Failed to add item', 'error');
          btn.disabled = false;
          btn.innerHTML = 'Add Item to Menu';
        }
      } catch (err) {
        showToast('Error adding item', 'error');
        btn.disabled = false;
        btn.innerHTML = 'Add Item to Menu';
      }
    }

    async function toggleItemAvailability(itemId, newStatus) {
      try {
        const res = await fetch('/api/stall/items/' + itemId + '/availability', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isAvailable: newStatus })
        });
        const data = await res.json();
        if (res.ok) {
          const btn = document.getElementById('avail-btn-' + itemId);
          if (data.item.isAvailable) {
            btn.className = 'px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase transition bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
            btn.innerHTML = 'In Stock';
            btn.onclick = () => toggleItemAvailability(itemId, false);
          } else {
            btn.className = 'px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase transition bg-red-100 text-red-800 hover:bg-red-200';
            btn.innerHTML = 'Sold Out';
            btn.onclick = () => toggleItemAvailability(itemId, true);
          }
          showToast(data.item.name + ' availability toggled to ' + (data.item.isAvailable ? 'In Stock' : 'Sold Out'));
        }
      } catch (err) {
        showToast('Error toggling availability', 'error');
      }
    }

    async function deleteFoodItem(itemId) {
      if (!confirm('Are you sure you want to remove this dish from your menu?')) return;
      try {
        const res = await fetch('/api/stall/items/' + itemId, { method: 'DELETE' });
        if (res.ok) {
          const card = document.getElementById('item-card-' + itemId);
          if (card) card.remove();
          showToast('Dish removed from menu');
        } else {
          showToast('Failed to delete dish', 'error');
        }
      } catch (err) {
        showToast('Error deleting dish', 'error');
      }
    }

    function toggleNewCategoryModal() {
      const modal = document.getElementById('new-cat-modal');
      modal.classList.toggle('hidden');
    }

    async function handleCreateCategory() {
      const name = document.getElementById('new-cat-name').value;
      const description = document.getElementById('new-cat-desc').value;
      if (!name || !name.trim()) return alert('Category name is required.');

      try {
        const res = await fetch('/api/stall/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description })
        });
        if (res.ok) {
          showToast('Category created!');
          setTimeout(() => window.location.reload(), 800);
        } else {
          const data = await res.json();
          alert(data.message || 'Failed to create category');
        }
      } catch (err) {
        alert('Network error');
      }
    }

    async function applyThemePreset(presetName) {
      try {
        const res = await fetch('/api/stall/theme/apply-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateName: presetName })
        });
        if (res.ok) {
          showToast('Theme set to ' + presetName + '! Publish to make it public.');
        } else {
          showToast('Failed to apply theme', 'error');
        }
      } catch (err) {
        showToast('Error applying theme', 'error');
      }
    }

    async function saveQrColors() {
      const fg = document.getElementById('qr-fg-color').value;
      const bg = document.getElementById('qr-bg-color').value;
      try {
        const res = await fetch('/api/stall/qr', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ foregroundColor: fg, backgroundColor: bg })
        });
        if (res.ok) {
          showToast('QR code colors updated! Refreshing...');
          setTimeout(() => window.location.reload(), 900);
        } else {
          showToast('Failed to update QR colors', 'error');
        }
      } catch (err) {
        showToast('Error saving QR colors', 'error');
      }
    }

    async function publishMenu() {
      const btn = document.getElementById('publish-btn');
      btn.disabled = true;
      btn.innerHTML = 'Publishing...';

      try {
        const res = await fetch('/api/stall/publish', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
          showToast('🎉 Menu published live! Customers can now see all your changes.');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showToast(data.message || 'Failed to publish menu', 'error');
          btn.disabled = false;
          btn.innerHTML = '🚀 Publish Changes Live';
        }
      } catch (err) {
        showToast('Error publishing menu', 'error');
        btn.disabled = false;
        btn.innerHTML = '🚀 Publish Changes Live';
      }
    }

    async function handleLogout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    }
  </script>
</body>
</html>`;
}

export default renderStallAdminHtml;
