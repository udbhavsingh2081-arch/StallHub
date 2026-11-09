export function renderQrPosterHtml({ stall, qrDataUrl, targetUrl }) {
  const primaryColor = stall.primaryColor || "#142235";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <title>Printable QR Poster - ${stall.name} | FoodStallHub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800;900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'DM Sans', sans-serif;
      overflow-x: hidden;
    }
    h1, h2, h3, .heading-font {
      font-family: 'Manrope', sans-serif;
    }
    @media print {
      body {
        background: white !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .poster-container {
        box-shadow: none !important;
        border: 2px solid #000 !important;
        margin: 0 auto !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body class="bg-slate-100 min-h-screen py-6 sm:py-10 px-3 sm:px-4 flex flex-col items-center justify-center">

  <!-- Print Actions Toolbar (Hidden on print) -->
  <div class="no-print w-full max-w-sm sm:max-w-md mb-4 sm:mb-6 flex items-center justify-between gap-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
    <a href="/portal" class="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
      &larr; Back
    </a>
    <div class="flex items-center gap-2">
      <button onclick="window.print()" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 active:scale-95">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        Print / PDF
      </button>
    </div>
  </div>

  <!-- A4 Ratio Poster Container -->
  <div class="poster-container w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-xl border-4 border-slate-900 p-6 sm:p-10 text-center relative overflow-hidden flex flex-col items-center">
    
    <!-- Decorative Corner Accents -->
    <div class="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-t-4 border-l-4 border-amber-500 m-2 sm:m-3"></div>
    <div class="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 border-t-4 border-r-4 border-amber-500 m-2 sm:m-3"></div>
    <div class="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-b-4 border-l-4 border-amber-500 m-2 sm:m-3"></div>
    <div class="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 border-b-4 border-r-4 border-amber-500 m-2 sm:m-3"></div>

    <!-- Header Logo & Stall Name -->
    <div class="mt-2 sm:mt-4 flex flex-col items-center w-full px-2">
      ${stall.logoUrl ? `
      <img src="${stall.logoUrl}" alt="${stall.name}" class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md border-2 border-white mb-2 sm:mb-3">
      ` : `
      <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-md mb-2 sm:mb-3" style="background-color: ${primaryColor};">
        ${(stall.name || "F")[0]}
      </div>
      `}
      <h1 class="text-xl sm:text-3xl font-black tracking-tight heading-font break-words max-w-full" style="color: ${primaryColor};">
        ${stall.name}
      </h1>
      ${stall.tagline ? `<p class="text-xs sm:text-sm font-medium text-slate-500 mt-1 line-clamp-1">${stall.tagline}</p>` : ""}
    </div>

    <!-- Call to Action Banner -->
    <div class="my-4 sm:my-6 py-2 px-5 sm:px-6 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-widest shadow-sm">
      Scan to Browse Digital Menu
    </div>

    <!-- Scannable QR Code -->
    <div class="bg-white p-3 sm:p-4 rounded-2xl border-2 border-slate-900 shadow-lg inline-block my-1">
      <img src="${qrDataUrl}" alt="QR Menu for ${stall.name}" class="w-48 h-48 sm:w-60 sm:h-60 mx-auto object-contain">
    </div>

    <!-- Instructions & Link -->
    <div class="mt-4 sm:mt-6 space-y-1 text-xs text-slate-600 px-2">
      <p class="font-bold text-slate-900 flex items-center justify-center gap-1.5 text-xs sm:text-sm">
        📱 Point camera & scan &bull; No app needed
      </p>
      <p class="font-mono text-[10px] sm:text-[11px] text-slate-400 truncate max-w-xs mx-auto">
        ${targetUrl}
      </p>
    </div>

    <!-- Footer Stamp -->
    <div class="mt-6 sm:mt-8 pt-3 border-t border-slate-200 w-full flex items-center justify-between text-[10px] text-slate-400 font-medium">
      <span>FoodStallHub Verified QR</span>
      <span>Instant Digital Menu</span>
    </div>
  </div>
</body>
</html>`;
}

export default renderQrPosterHtml;
