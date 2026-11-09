export function renderLoginPageHtml({ error = null } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <title>Sign In | FoodStallHub</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800;900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'DM Sans', sans-serif; }
    h1, h2, h3, .heading-font { font-family: 'Manrope', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col justify-between selection:bg-amber-400 selection:text-black">

  <!-- Header -->
  <header class="py-4 px-6 border-b border-slate-200 bg-white">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <a href="/portal" class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-[#142235] text-amber-400 flex items-center justify-center font-black text-base shadow-sm">
          F
        </div>
        <span class="font-extrabold text-lg tracking-tight text-[#142235]">FoodStallHub</span>
      </a>
      <a href="/portal" class="text-xs font-semibold text-slate-500 hover:text-slate-800">
        &larr; Portal Gateway
      </a>
    </div>
  </header>

  <!-- Login Card Container -->
  <main class="flex-1 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
      
      <div class="text-center mb-6">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-2xl mx-auto mb-3">
          🍳
        </div>
        <h1 class="text-xl sm:text-2xl font-black text-[#142235] tracking-tight heading-font">
          Stall Owner Login
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Manage your stall details, food menu, and QR codes
        </p>
      </div>

      <div id="login-alert" class="hidden mb-4 p-3 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200"></div>

      <form id="login-form" onsubmit="handleLogin(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1" for="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            placeholder="owner@pizzacorner.com" 
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          >
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1" for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            required 
            placeholder="••••••••••••" 
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          >
        </div>

        <button 
          type="submit" 
          id="submit-btn"
          class="w-full py-3 rounded-xl bg-[#142235] hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>Sign In to Stall Workspace</span>
        </button>
      </form>

      <!-- Quick Demo Account Fill -->
      <div class="mt-6 pt-5 border-t border-slate-100 space-y-2">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1">
          Quick Demo Autofill
        </p>
        <button 
          type="button" 
          onclick="fillCredentials('udbhavsingh2081@gmail.com', 'Udbhavsingh2005%')"
          class="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition text-left flex items-center justify-between"
        >
          <span>🛡️ Super Admin (udbhavsingh2081@gmail.com)</span>
          <span class="text-[10px] font-mono text-slate-300">Autofill &rarr;</span>
        </button>
        <button 
          type="button" 
          onclick="fillCredentials('owner@pizzacorner.com', 'StallOwnerPass123!')"
          class="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition text-left flex items-center justify-between"
        >
          <span>🍕 Pizza Corner Shopkeeper</span>
          <span class="text-[10px] font-mono text-slate-400">Autofill &rarr;</span>
        </button>
      </div>
    </div>
  </main>

  <footer class="py-4 text-center text-xs text-slate-400">
    FoodStallHub &bull; Independent Digital Menus
  </footer>

  <script>
    function fillCredentials(email, pass) {
      document.getElementById('email').value = email;
      document.getElementById('password').value = pass;
    }

    async function handleLogin(e) {
      e.preventDefault();
      const alertBox = document.getElementById('login-alert');
      const submitBtn = document.getElementById('submit-btn');
      alertBox.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Signing In...';

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
          if (data.user?.role === 'SUPER_ADMIN') {
            window.location.href = '/super-admin';
          } else {
            window.location.href = '/stall-admin';
          }
        } else {
          alertBox.textContent = data.message || 'Login failed. Please check your credentials.';
          alertBox.classList.remove('hidden');
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Sign In to Stall Workspace';
        }
      } catch (err) {
        alertBox.textContent = 'Connection error. Please try again.';
        alertBox.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In to Stall Workspace';
      }
    }
  </script>
</body>
</html>`;
}

export default renderLoginPageHtml;
