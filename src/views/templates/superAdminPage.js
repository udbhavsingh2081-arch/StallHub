export function renderSuperAdminHtml({ stalls, owners, metrics, recentActivity, user }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <title>Platform Owner Console | Super Admin | FoodStallHub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
    h1, h2, h3, h4, .heading-font { font-family: 'Manrope', sans-serif; }
  </style>
</head>
<body class="bg-slate-100 text-slate-900 min-h-screen flex flex-col selection:bg-amber-400 selection:text-black">

  <!-- Toast Container -->
  <div id="toast-container" class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"></div>

  <!-- Top Header Navigation -->
  <header class="bg-[#142235] text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
          🛡️
        </div>
        <div>
          <span class="font-extrabold text-base sm:text-lg tracking-tight">FoodStallHub</span>
          <span class="ml-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Platform Owner Console
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-xs text-slate-300 hidden sm:inline">Signed in as <strong>${user.name}</strong></span>
        <button 
          onclick="handleLogout()"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6">

    <!-- Top Banner -->
    <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-[#142235] heading-font">
          Platform Administrator Dashboard
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Review shopkeepers, accept or suspend stalls, verify shopkeeper ID availability, and manage platform tenants.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button 
          onclick="toggleNewStallModal()"
          class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95 flex items-center gap-1.5"
        >
          <span>➕ Register New Stall & Owner</span>
        </button>
      </div>
    </div>

    <!-- Platform Key Metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Stalls</span>
        <div class="text-2xl font-black text-[#142235] mt-1">${metrics.totalStalls || 0}</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active</span>
        <div class="text-2xl font-black text-emerald-600 mt-1">${metrics.activeStalls || 0}</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-red-600">Suspended</span>
        <div class="text-2xl font-black text-red-600 mt-1">${metrics.suspendedStalls || 0}</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-amber-600">Shopkeepers</span>
        <div class="text-2xl font-black text-amber-600 mt-1">${owners.length || 0}</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-purple-600">Live Menus</span>
        <div class="text-2xl font-black text-purple-600 mt-1">${metrics.publishedMenus || 0}</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">Total Views</span>
        <div class="text-2xl font-black text-blue-600 mt-1">${metrics.totalViews || 0}</div>
      </div>
    </div>

    <!-- Shopkeeper ID & Slug Availability Station -->
    <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm">
            🔍
          </div>
          <div>
            <h2 class="text-base font-black text-[#142235] heading-font">Shopkeeper ID & Stall URL Availability Checker</h2>
            <p class="text-xs text-slate-500">Check if an email address or stall URL slug is available to add in the website</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div class="sm:col-span-5">
          <label class="block text-xs font-bold text-slate-700 mb-1" for="check-email">Shopkeeper Email / ID</label>
          <input 
            type="email" 
            id="check-email" 
            placeholder="e.g. chef.john@example.com" 
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
        </div>

        <div class="sm:col-span-5">
          <label class="block text-xs font-bold text-slate-700 mb-1" for="check-slug">Stall URL Slug</label>
          <input 
            type="text" 
            id="check-slug" 
            placeholder="e.g. taco-fiesta" 
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
        </div>

        <div class="sm:col-span-2">
          <button 
            type="button" 
            onclick="checkIdAvailability()" 
            class="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition active:scale-95"
          >
            Check Status
          </button>
        </div>
      </div>

      <!-- Result Box -->
      <div id="availability-result" class="hidden p-4 rounded-2xl border text-xs"></div>
    </div>

    <!-- Shopkeeper Acceptance & Approvals Table -->
    <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
            👥
          </div>
          <div>
            <h2 class="text-base font-black text-[#142235] heading-font">Shopkeeper Approvals & Management</h2>
            <p class="text-xs text-slate-500">Accept shopkeeper ID to add into website or suspend unauthorized accounts</p>
          </div>
        </div>
        <span class="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
          ${owners.length} registered shopkeepers
        </span>
      </div>

      <!-- Responsive Table Container -->
      <div class="overflow-x-auto no-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
              <th class="py-3 px-3">Shopkeeper Name & Email</th>
              <th class="py-3 px-3">Assigned Food Stall</th>
              <th class="py-3 px-3">Registration Date</th>
              <th class="py-3 px-3">Account Status</th>
              <th class="py-3 px-3 text-right">Owner Decision</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            ${owners.length === 0 ? `
            <tr>
              <td colspan="5" class="py-6 text-center text-slate-400 italic">No shopkeepers registered yet.</td>
            </tr>
            ` : owners.map(o => `
            <tr class="hover:bg-slate-50 transition" id="owner-row-${o.id}">
              <td class="py-3.5 px-3">
                <div class="font-bold text-slate-900">${o.name}</div>
                <div class="text-[11px] font-mono text-slate-500">${o.email}</div>
                ${o.phone ? `<div class="text-[10px] text-slate-400">📞 ${o.phone}</div>` : ""}
              </td>

              <td class="py-3.5 px-3">
                ${o.stall ? `
                <div class="font-bold text-slate-900">${o.stall.name}</div>
                <a href="/menu/${o.stall.slug}" target="_blank" class="text-[11px] font-mono text-amber-600 hover:underline">
                  /menu/${o.stall.slug} &rarr;
                </a>
                ` : `
                <span class="text-slate-400 italic">Unassigned</span>
                `}
              </td>

              <td class="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                ${new Date(o.createdAt).toLocaleDateString()}
              </td>

              <td class="py-3.5 px-3">
                <span id="owner-status-badge-${o.id}" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${o.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}">
                  <span class="w-1.5 h-1.5 rounded-full ${o.isActive ? "bg-emerald-600" : "bg-red-600"}"></span>
                  ${o.isActive ? "Approved & Active" : "Suspended / Inactive"}
                </span>
              </td>

              <td class="py-3.5 px-3 text-right">
                <div class="inline-flex items-center gap-1.5" id="owner-action-group-${o.id}">
                  ${o.isActive ? `
                  <button 
                    onclick="rejectShopkeeper('${o.id}')"
                    class="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition active:scale-95 flex items-center gap-1"
                  >
                    <span>✕ Suspend</span>
                  </button>
                  ` : `
                  <button 
                    onclick="approveShopkeeper('${o.id}')"
                    class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 flex items-center gap-1"
                  >
                    <span>✓ Accept & Activate</span>
                  </button>
                  `}
                </div>
              </td>
            </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Stalls Directory & Controls -->
    <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">
            🏪
          </div>
          <div>
            <h2 class="text-base font-black text-[#142235] heading-font">Registered Food Stalls</h2>
            <p class="text-xs text-slate-500">Live directory of all stalls, menus, and suspension switches</p>
          </div>
        </div>
        <span class="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
          ${stalls.length} stalls
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${stalls.map(s => `
        <div class="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition bg-slate-50 flex flex-col justify-between gap-3" id="stall-card-${s.id}">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <h3 class="font-black text-sm text-slate-900">${s.name}</h3>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}" id="stall-badge-${s.id}">
                  ${s.status}
                </span>
              </div>
              <span class="text-[10px] font-mono text-slate-400">Slug: ${s.slug}</span>
            </div>

            <p class="text-xs text-slate-500 line-clamp-1">${s.tagline || s.description || "No description"}</p>
            
            <div class="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
              <span>🍽️ ${s.counts?.foodItems || 0} dishes</span>
              <span>📁 ${s.counts?.categories || 0} categories</span>
              <span>👁️ ${s.counts?.analyticsEvents || 0} views</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-200/80 gap-2">
            <a href="/menu/${s.slug}" target="_blank" class="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
              <span>Customer Menu &rarr;</span>
            </a>

            <div class="flex items-center gap-1.5">
              ${s.status === "ACTIVE" ? `
              <button 
                onclick="toggleStallStatus('${s.id}', 'SUSPENDED')"
                class="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-bold transition"
              >
                Suspend
              </button>
              ` : `
              <button 
                onclick="toggleStallStatus('${s.id}', 'ACTIVE')"
                class="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold transition"
              >
                Reactivate
              </button>
              `}
            </div>
          </div>
        </div>
        `).join("")}
      </div>
    </div>

    <!-- Recent Audit Logs -->
    <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
      <h2 class="text-base font-black text-[#142235] heading-font flex items-center gap-2">
        <span>📜</span> Recent Platform Activity Trail
      </h2>
      <div class="space-y-2">
        ${recentActivity.map(act => `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
              ${act.action}
            </span>
            <span class="text-slate-700 font-medium">${act.entityType}</span>
            ${act.actor ? `<span class="text-slate-400">by ${act.actor.name}</span>` : ""}
          </div>
          <span class="text-[10px] text-slate-400 font-mono">
            ${new Date(act.createdAt).toLocaleTimeString()}
          </span>
        </div>
        `).join("")}
      </div>
    </div>

  </main>

  <!-- Register Stall & Shopkeeper Modal -->
  <div id="new-stall-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 class="text-base font-black text-[#142235]">Register New Stall & Owner</h3>
          <p class="text-xs text-slate-500">Create the stall and invite the shopkeeper in one step</p>
        </div>
        <button onclick="toggleNewStallModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">&times;</button>
      </div>

      <form onsubmit="handleCreateStallAndOwner(event)" class="space-y-3 text-xs">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Stall Name *</label>
            <input type="text" id="modal-stall-name" required placeholder="e.g. Taco Fiesta" class="w-full px-3 py-2 rounded-xl border border-slate-300">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">URL Slug *</label>
            <input type="text" id="modal-stall-slug" required placeholder="taco-fiesta" class="w-full px-3 py-2 rounded-xl border border-slate-300">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-bold text-slate-700 mb-1">City</label>
            <input type="text" id="modal-stall-city" placeholder="e.g. Metropolis" class="w-full px-3 py-2 rounded-xl border border-slate-300">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Phone</label>
            <input type="text" id="modal-stall-phone" placeholder="+91 98765 00000" class="w-full px-3 py-2 rounded-xl border border-slate-300">
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100">
          <span class="block text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-2">Shopkeeper Account Details</span>
          <div class="space-y-2">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Owner Full Name *</label>
              <input type="text" id="modal-owner-name" required placeholder="e.g. Carlos Gomez" class="w-full px-3 py-2 rounded-xl border border-slate-300">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Owner Email *</label>
              <input type="email" id="modal-owner-email" required placeholder="carlos@tacofiesta.com" class="w-full px-3 py-2 rounded-xl border border-slate-300">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Temporary Password *</label>
              <input type="password" id="modal-owner-pass" required placeholder="Min 8 characters" class="w-full px-3 py-2 rounded-xl border border-slate-300">
            </div>
          </div>
        </div>

        <button type="submit" id="modal-submit-btn" class="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition shadow-sm mt-3">
          Create Stall & Activate Owner
        </button>
      </form>
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

    async function checkIdAvailability() {
      const email = document.getElementById('check-email').value.trim();
      const slug = document.getElementById('check-slug').value.trim();
      const resBox = document.getElementById('availability-result');

      if (!email && !slug) {
        alert('Please enter a shopkeeper email or stall slug to check.');
        return;
      }

      resBox.className = 'p-4 rounded-2xl border text-xs bg-slate-50 border-slate-200 block';
      resBox.innerHTML = 'Checking database records...';

      try {
        const query = new URLSearchParams();
        if (email) query.set('email', email);
        if (slug) query.set('slug', slug);

        const res = await fetch('/api/admin/check-availability?' + query.toString());
        const data = await res.json();

        let html = '<div class="space-y-2">';

        if (email) {
          if (data.emailAvailable) {
            html += '<div class="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-bold">' +
              '<span>✓</span> Email <strong>' + email + '</strong> is AVAILABLE. You can accept and add this shopkeeper ID!' +
              '</div>';
          } else {
            html += '<div class="flex items-center gap-2 text-red-800 bg-red-50 p-2.5 rounded-xl border border-red-200 font-bold">' +
              '<span>✕</span> Email <strong>' + email + '</strong> is ALREADY IN USE by ' + data.existingUser.name + ' (' + (data.existingUser.stallName || 'No stall') + ').' +
              '</div>';
          }
        }

        if (slug) {
          if (data.slugAvailable) {
            html += '<div class="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-bold">' +
              '<span>✓</span> URL Slug <strong>' + data.slug + '</strong> is AVAILABLE! (/menu/' + data.slug + ')' +
              '</div>';
          } else {
            html += '<div class="flex items-center gap-2 text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-bold">' +
              '<span>⚠️</span> URL Slug <strong>' + data.slug + '</strong> is ALREADY TAKEN by stall "' + data.existingStall.name + '" (Status: ' + data.existingStall.status + ').' +
              '</div>';
          }
        }

        html += '</div>';
        resBox.innerHTML = html;
      } catch (err) {
        resBox.innerHTML = '<span class="text-red-600 font-bold">Error checking availability.</span>';
      }
    }

    async function approveShopkeeper(id) {
      try {
        const res = await fetch('/api/admin/approve-shopkeeper/' + id, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message);
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast(data.message || 'Failed to approve', 'error');
        }
      } catch (err) {
        showToast('Network error', 'error');
      }
    }

    async function rejectShopkeeper(id) {
      if (!confirm('Are you sure you want to suspend this shopkeeper? Their stall will also become unavailable to customers.')) return;
      try {
        const res = await fetch('/api/admin/reject-shopkeeper/' + id, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message);
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast(data.message || 'Failed to suspend', 'error');
        }
      } catch (err) {
        showToast('Network error', 'error');
      }
    }

    async function toggleStallStatus(id, newStatus) {
      try {
        const res = await fetch('/api/admin/stalls/' + id + '/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Stall status changed to ' + newStatus);
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast(data.message || 'Failed to change status', 'error');
        }
      } catch (err) {
        showToast('Network error', 'error');
      }
    }

    function toggleNewStallModal() {
      document.getElementById('new-stall-modal').classList.toggle('hidden');
    }

    async function handleCreateStallAndOwner(e) {
      e.preventDefault();
      const btn = document.getElementById('modal-submit-btn');
      btn.disabled = true;
      btn.innerHTML = 'Registering...';

      const payload = {
        name: document.getElementById('modal-stall-name').value,
        slug: document.getElementById('modal-stall-slug').value,
        city: document.getElementById('modal-stall-city').value,
        phone: document.getElementById('modal-stall-phone').value,
        ownerName: document.getElementById('modal-owner-name').value,
        ownerEmail: document.getElementById('modal-owner-email').value,
        ownerPassword: document.getElementById('modal-owner-pass').value
      };

      try {
        const res = await fetch('/api/admin/stalls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Stall & Shopkeeper registered successfully!');
          setTimeout(() => window.location.reload(), 1200);
        } else {
          showToast(data.message || 'Failed to register stall', 'error');
          btn.disabled = false;
          btn.innerHTML = 'Create Stall & Activate Owner';
        }
      } catch (err) {
        showToast('Network error', 'error');
        btn.disabled = false;
        btn.innerHTML = 'Create Stall & Activate Owner';
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

export default renderSuperAdminHtml;
