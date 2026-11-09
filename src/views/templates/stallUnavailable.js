export function renderStallUnavailableHtml({ reason = "SUSPENDED", stallName = "This Stall" } = {}) {
  const isDraft = reason === "NOT_PUBLISHED";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isDraft ? "Menu Not Yet Published" : "Stall Unavailable"} | FoodStallHub</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans text-slate-800">
  <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
    <div class="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
      ${isDraft ? "📝" : "🔒"}
    </div>
    <h1 class="text-xl sm:text-2xl font-black text-slate-900 mb-2">
      ${isDraft ? "Menu Not Yet Published" : "Stall Temporarily Unavailable"}
    </h1>
    <p class="text-sm text-slate-600 leading-relaxed mb-6">
      ${isDraft 
        ? `<strong>${stallName}</strong> has not published their digital menu yet. The owner is putting the finishing touches on it.` 
        : `<strong>${stallName}</strong> is temporarily inactive or suspended. Please contact the stall manager or platform administrator.`}
    </p>
    <a href="/portal" class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition">
      Return to FoodStallHub Portal
    </a>
  </div>
</body>
</html>`;
}

export default renderStallUnavailableHtml;
