export function renderPublicMenuHtml({ snapshot, isPreview = false }) {
  const stall = snapshot.stall || {};
  const theme = snapshot.theme || {};
  const categories = snapshot.categories || [];

  const primaryColor = theme.primaryColor || stall.primaryColor || "#142235";
  const secondaryColor = theme.secondaryColor || "#E8A64A";
  const backgroundColor = theme.backgroundColor || "#F8FAFC";
  const fontHeading = theme.fontHeading || "Manrope";
  const fontBody = theme.fontBody || "DM Sans";
  const isDark = theme.templateId === "LUXURY";

  const textColor = isDark ? "#F1F5F9" : "#0F172A";
  const subtextColor = isDark ? "#94A3B8" : "#64748B";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const stickyBg = isDark ? "rgba(15, 23, 42, 0.94)" : "rgba(255, 255, 255, 0.94)";

  const socialLinks = theme.socialLinks || {};

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <title>${stall.name || "Digital Menu"} | FoodStallHub</title>
  <meta name="description" content="${stall.tagline || stall.description || "Digital Menu"}">
  <meta name="theme-color" content="${primaryColor}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&family=Outfit:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --primary: ${primaryColor};
      --secondary: ${secondaryColor};
      --bg: ${backgroundColor};
      --text: ${textColor};
      --subtext: ${subtextColor};
      --card-bg: ${cardBg};
      --border: ${borderColor};
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: '${fontBody}', sans-serif;
      -webkit-tap-highlight-color: transparent;
      overflow-x: hidden;
    }
    h1, h2, h3, h4, .heading-font {
      font-family: '${fontHeading}', sans-serif;
    }
    /* Official Standard Dietary Badges */
    .dietary-veg {
      border: 1.5px solid #16a34a;
    }
    .dietary-veg .dot {
      background-color: #16a34a;
      border-radius: 50%;
    }
    .dietary-nonveg {
      border: 1.5px solid #dc2626;
    }
    .dietary-nonveg .dot {
      background-color: #dc2626;
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      width: 8px;
      height: 8px;
    }
    .dietary-egg {
      border: 1.5px solid #d97706;
    }
    .dietary-egg .dot {
      background-color: #d97706;
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      width: 7px;
      height: 9px;
    }
    .glass-nav {
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      background-color: ${stickyBg};
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .category-section {
      scroll-margin-top: 130px;
    }
  </style>
</head>
<body class="min-h-screen pb-24 antialiased selection:bg-amber-400 selection:text-black">

  ${isPreview ? `
  <div class="bg-amber-500 text-slate-950 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider sticky top-0 z-50 shadow-md flex items-center justify-center gap-2">
    <span>⚡ Live Draft Preview</span>
    <span class="opacity-70">&bull; Changes are not public until published</span>
  </div>
  ` : ""}

  <!-- Hero / Cover Banner -->
  ${theme.showCoverBanner && stall.coverUrl ? `
  <div class="relative w-full h-36 sm:h-48 md:h-60 overflow-hidden bg-slate-900">
    <img src="${stall.coverUrl}" alt="${stall.name}" class="w-full h-full object-cover">
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
  </div>
  ` : ""}

  <!-- Stall Identity Header -->
  <header class="max-w-2xl mx-auto px-4 ${theme.showCoverBanner && stall.coverUrl ? "-mt-10 sm:-mt-14" : "pt-4"} relative z-10">
    <div class="p-4 sm:p-5 rounded-2xl shadow-lg border border-[var(--border)] bg-[var(--card-bg)] flex items-start gap-3.5 sm:gap-4 transition-all">
      <!-- Logo -->
      ${stall.logoUrl ? `
      <img src="${stall.logoUrl}" alt="${stall.name}" class="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0">
      ` : `
      <div class="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black text-white flex-shrink-0 shadow-md" style="background-color: ${primaryColor};">
        ${(stall.name || "F")[0]}
      </div>
      `}

      <!-- Details -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <h1 class="text-lg sm:text-2xl font-black tracking-tight leading-tight heading-font break-words" style="color: ${isDark ? "#FFFFFF" : primaryColor};">
            ${stall.name}
          </h1>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 flex-shrink-0">
            Open
          </span>
        </div>

        ${stall.tagline ? `
        <p class="text-xs sm:text-sm font-medium mt-0.5 line-clamp-1 opacity-90" style="color: var(--subtext);">
          ${stall.tagline}
        </p>
        ` : ""}

        ${stall.cuisineType ? `
        <p class="text-[11px] sm:text-xs font-bold text-amber-600 mt-1 uppercase tracking-wide">
          ${stall.cuisineType}
        </p>
        ` : ""}

        ${stall.address ? `
        <p class="text-[11px] sm:text-xs mt-1.5 flex items-center gap-1 line-clamp-1" style="color: var(--subtext);">
          <svg class="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          ${stall.address}${stall.city ? `, ${stall.city}` : ""}
        </p>
        ` : ""}
      </div>
    </div>

    <!-- Contact & Action Buttons (Mobile-first Touch Targets) -->
    <div class="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar py-1">
      ${stall.phone ? `
      <a href="tel:${stall.phone}" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--card-bg)] shadow-sm active:scale-95 transition-transform flex-shrink-0">
        <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
        Call Us
      </a>
      ` : ""}

      ${socialLinks.whatsapp ? `
      <a href="https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}" target="_blank" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm active:scale-95 transition-transform flex-shrink-0">
        <span>WhatsApp</span>
      </a>
      ` : ""}

      ${socialLinks.instagram ? `
      <a href="https://instagram.com/${socialLinks.instagram.replace('@', '')}" target="_blank" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-sm active:scale-95 transition-transform flex-shrink-0">
        <span>Instagram</span>
      </a>
      ` : ""}

      <a href="#about-stall" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--card-bg)] opacity-80 active:scale-95 transition-transform flex-shrink-0">
        About
      </a>
    </div>
  </header>

  <!-- Sticky Search & Filter Header -->
  <div class="sticky top-0 z-30 glass-nav border-b border-[var(--border)] mt-3 shadow-sm">
    <div class="max-w-2xl mx-auto px-4 py-2.5 space-y-2">
      
      <!-- Search Input & Quick Diet Filter Row -->
      <div class="flex items-center gap-2">
        <!-- Search Field -->
        <div class="relative flex-1">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            id="menu-search-input" 
            placeholder="Search in menu..." 
            oninput="handleSearch(this.value)"
            class="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
          >
          <button 
            type="button" 
            id="clear-search-btn" 
            onclick="clearSearch()" 
            class="hidden absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] items-center justify-center hover:bg-slate-300">
            &times;
          </button>
        </div>

        <!-- Veg / Non-Veg Toggle Pills -->
        <div class="flex items-center bg-[var(--card-bg)] p-0.5 rounded-xl border border-[var(--border)] flex-shrink-0">
          <button type="button" onclick="filterType('ALL')" id="filter-all" class="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all bg-slate-900 text-white shadow-sm">
            All
          </button>
          <button type="button" onclick="filterType('VEG')" id="filter-veg" class="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all text-emerald-700 hover:bg-emerald-50">
            Veg
          </button>
          <button type="button" onclick="filterType('NON_VEG')" id="filter-nonveg" class="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all text-red-700 hover:bg-red-50">
            Non-Veg
          </button>
        </div>
      </div>

      <!-- Horizontal Categories Scrolling Bar -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <a href="#all" onclick="filterCategory('ALL')" id="pill-cat-all" class="category-pill active flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all shadow-sm" style="background-color: ${primaryColor}; color: #FFFFFF;">
          All (${categories.reduce((acc, c) => acc + (c.items?.length || 0), 0)})
        </a>
        ${categories.map(cat => `
        <a href="#cat-${cat.id}" onclick="filterCategory('${cat.id}')" id="pill-cat-${cat.id}" class="category-pill flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold opacity-75 hover:opacity-100 transition-all border border-[var(--border)] bg-[var(--card-bg)]">
          ${cat.name} (${cat.items?.length || 0})
        </a>
        `).join("")}
      </div>
    </div>
  </div>

  <!-- Menu Main Content -->
  <main class="max-w-2xl mx-auto px-4 mt-5 space-y-7" id="menu-container">
    
    <!-- Empty Search State -->
    <div id="no-search-results" class="hidden text-center py-12 px-4 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]">
      <div class="text-3xl mb-2">🔍</div>
      <h3 class="text-base font-bold">No dishes found</h3>
      <p class="text-xs opacity-70 mt-1">Try searching for something else or reset your filter.</p>
      <button onclick="clearSearch()" class="mt-4 px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white">
        Reset Search
      </button>
    </div>

    ${categories.length === 0 ? `
    <div class="text-center py-12 px-4 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]">
      <div class="text-3xl mb-2">🍽️</div>
      <h3 class="text-base font-bold">Menu is currently being updated</h3>
      <p class="text-xs opacity-70 mt-1">Check back shortly to browse fresh items.</p>
    </div>
    ` : ""}

    ${categories.map(cat => `
    <section id="cat-${cat.id}" class="category-section">
      <!-- Section Header -->
      <div class="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border)]">
        <div>
          <h2 class="text-base sm:text-lg font-black tracking-tight heading-font" style="color: ${isDark ? "#FFFFFF" : primaryColor};">
            ${cat.name}
          </h2>
          ${cat.description ? `<p class="text-xs opacity-70 mt-0.5" style="color: var(--subtext);">${cat.description}</p>` : ""}
        </div>
        <span class="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
          ${cat.items?.length || 0}
        </span>
      </div>

      <!-- Food Items List (Mobile-Optimized Single & Grid Layout) -->
      <div class="${theme.layoutType === "GRID" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}">
        ${(cat.items || []).map(item => `
        <article 
          class="food-item-card p-3 sm:p-4 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] shadow-sm hover:shadow-md transition-all flex items-start gap-3 relative" 
          data-food-type="${item.foodType}"
          data-item-name="${(item.name || "").toLowerCase()}"
          data-item-desc="${(item.description || "").toLowerCase()}"
          data-category-id="${cat.id}"
        >
          <!-- Left Column: Details -->
          <div class="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <!-- Badges Row -->
              <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <!-- Dietary Symbol -->
                ${item.foodType === "VEG" ? `
                <span class="w-3.5 h-3.5 dietary-veg rounded-[2px] inline-flex items-center justify-center flex-shrink-0" title="Pure Veg">
                  <span class="dot w-1.5 h-1.5"></span>
                </span>
                ` : item.foodType === "NON_VEG" ? `
                <span class="w-3.5 h-3.5 dietary-nonveg rounded-[2px] inline-flex items-center justify-center flex-shrink-0" title="Non-Veg">
                  <span class="dot"></span>
                </span>
                ` : `
                <span class="w-3.5 h-3.5 dietary-egg rounded-[2px] inline-flex items-center justify-center flex-shrink-0" title="Contains Egg">
                  <span class="dot"></span>
                </span>
                `}

                ${item.isFeatured ? `
                <span class="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 flex-shrink-0">
                  ★ Bestseller
                </span>
                ` : ""}

                ${item.prepTimeMinutes ? `
                <span class="text-[10px] font-medium opacity-60 flex items-center gap-0.5 flex-shrink-0">
                  ⏱️ ${item.prepTimeMinutes}m
                </span>
                ` : ""}
              </div>

              <!-- Item Name -->
              <h3 class="text-sm sm:text-base font-bold leading-snug heading-font text-[var(--text)] line-clamp-2">
                ${item.name}
              </h3>

              <!-- Item Description -->
              ${item.description ? `
              <p class="text-xs mt-1 line-clamp-2 leading-relaxed opacity-75" style="color: var(--subtext);">
                ${item.description}
              </p>
              ` : ""}
            </div>

            <!-- Price & Variants Row -->
            <div class="mt-2.5 pt-2 border-t border-[var(--border)]/70">
              <div class="flex items-baseline gap-1.5">
                <span class="text-sm sm:text-base font-black tracking-tight" style="color: ${secondaryColor};">
                  ₹${item.price}
                </span>
                ${item.originalPrice && item.originalPrice > item.price ? `
                <span class="text-xs line-through opacity-40 font-medium">₹${item.originalPrice}</span>
                ` : ""}
              </div>

              <!-- Variants Pills -->
              ${item.variants && item.variants.length > 0 ? `
              <div class="mt-1.5 flex flex-wrap gap-1">
                ${item.variants.map(v => `
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[var(--border)]">
                  ${v.name}: ₹${v.price}
                </span>
                `).join("")}
              </div>
              ` : ""}
            </div>
          </div>

          <!-- Right Column: Thumbnail Image -->
          ${item.imageUrl ? `
          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-[var(--border)] shadow-sm relative group">
            <img src="${item.imageUrl}" alt="${item.name}" loading="lazy" class="w-full h-full object-cover">
          </div>
          ` : ""}
        </article>
        `).join("")}
      </div>
    </section>
    `).join("")}

    <!-- About Stall Section -->
    <section id="about-stall" class="p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] shadow-sm mt-10">
      <h2 class="text-base font-black uppercase tracking-wider mb-2 heading-font" style="color: ${primaryColor};">
        About ${stall.name}
      </h2>
      <p class="text-xs sm:text-sm leading-relaxed opacity-80" style="color: var(--subtext);">
        ${stall.description || "Welcome to our digital menu! We take pride in serving high-quality, freshly prepared food crafted with authentic recipes."}
      </p>

      <div class="mt-4 pt-3.5 border-t border-[var(--border)] text-xs space-y-1.5 opacity-80" style="color: var(--subtext);">
        ${stall.address ? `<p><strong>Address:</strong> ${stall.address}${stall.city ? `, ${stall.city}` : ""}</p>` : ""}
        ${stall.phone ? `<p><strong>Contact:</strong> ${stall.phone}</p>` : ""}
        ${stall.email ? `<p><strong>Email:</strong> ${stall.email}</p>` : ""}
      </div>
    </section>
  </main>

  <!-- Mobile Floating Quick-Jump Menu Button -->
  <div class="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
    <button 
      type="button" 
      onclick="toggleCategoryDrawer()"
      class="px-5 py-2.5 rounded-full shadow-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 text-white active:scale-95 transition-all"
      style="background-color: ${primaryColor};"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      <span>Menu Categories</span>
    </button>
  </div>

  <!-- Mobile Category Drawer Modal (Slide up from bottom) -->
  <div id="category-drawer" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity">
    <div class="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] p-5 shadow-2xl space-y-3 max-h-[80vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-2 border-b border-[var(--border)]">
        <h3 class="text-sm font-black uppercase tracking-wider text-[var(--text)]">Jump to Category</h3>
        <button type="button" onclick="toggleCategoryDrawer()" class="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center font-bold text-sm">
          &times;
        </button>
      </div>
      <div class="space-y-1.5">
        ${categories.map(cat => `
        <a 
          href="#cat-${cat.id}" 
          onclick="toggleCategoryDrawer()" 
          class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold text-[var(--text)]"
        >
          <span>${cat.name}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
            ${cat.items?.length || 0} items
          </span>
        </a>
        `).join("")}
      </div>
    </div>
  </div>

  <!-- Footer Branding -->
  <footer class="max-w-2xl mx-auto px-4 mt-12 text-center text-xs opacity-60">
    <p>Powered by <a href="/portal" class="font-bold hover:underline" style="color: ${primaryColor};">FoodStallHub</a> &bull; Digital QR Menu System</p>
    <p class="text-[10px] mt-0.5">Instant menu updates without reprinting QR codes</p>
  </footer>

  <script>
    let activeType = 'ALL';
    let searchQuery = '';

    function filterType(type) {
      activeType = type;
      
      const btnAll = document.getElementById('filter-all');
      const btnVeg = document.getElementById('filter-veg');
      const btnNonveg = document.getElementById('filter-nonveg');

      btnAll.className = type === 'ALL' ? 'px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all bg-slate-900 text-white shadow-sm' : 'px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all text-slate-600 hover:bg-slate-100';
      btnVeg.className = type === 'VEG' ? 'px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all bg-emerald-600 text-white shadow-sm' : 'px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all text-emerald-700 hover:bg-emerald-50';
      btnNonveg.className = type === 'NON_VEG' ? 'px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all bg-red-600 text-white shadow-sm' : 'px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all text-red-700 hover:bg-red-50';

      applyFilters();
    }

    function handleSearch(val) {
      searchQuery = (val || '').toLowerCase().trim();
      const clearBtn = document.getElementById('clear-search-btn');
      if (clearBtn) {
        clearBtn.style.display = searchQuery ? 'flex' : 'none';
      }
      applyFilters();
    }

    function clearSearch() {
      const input = document.getElementById('menu-search-input');
      if (input) input.value = '';
      searchQuery = '';
      const clearBtn = document.getElementById('clear-search-btn');
      if (clearBtn) clearBtn.style.display = 'none';
      applyFilters();
    }

    function applyFilters() {
      const cards = document.querySelectorAll('.food-item-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const itemType = card.getAttribute('data-food-type');
        const itemName = card.getAttribute('data-item-name') || '';
        const itemDesc = card.getAttribute('data-item-desc') || '';

        const matchesType = activeType === 'ALL' || itemType === activeType;
        const matchesSearch = !searchQuery || itemName.includes(searchQuery) || itemDesc.includes(searchQuery);

        if (matchesType && matchesSearch) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Hide category headers if all items in section are hidden
      document.querySelectorAll('.category-section').forEach(sec => {
        const visibleInSec = sec.querySelectorAll('.food-item-card[style*="display: flex"]').length;
        sec.style.display = visibleInSec > 0 ? 'block' : 'none';
      });

      const noRes = document.getElementById('no-search-results');
      if (noRes) {
        noRes.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    function toggleCategoryDrawer() {
      const drawer = document.getElementById('category-drawer');
      if (drawer) {
        drawer.classList.toggle('hidden');
      }
    }

    // Category intersection observer for active tab highlight
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          document.querySelectorAll('.category-pill').forEach(pill => {
            if (pill.getAttribute('href') === '#' + id) {
              pill.style.backgroundColor = '${primaryColor}';
              pill.style.color = '#FFFFFF';
            } else {
              pill.style.backgroundColor = '';
              pill.style.color = '';
            }
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    document.querySelectorAll('.category-section').forEach(section => observer.observe(section));
  </script>
</body>
</html>`;
}

export default renderPublicMenuHtml;
