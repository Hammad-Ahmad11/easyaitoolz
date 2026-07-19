const fs = require('fs');

const lines = [];
const a = (s) => lines.push(s);

a('<!DOCTYPE html>');
a('<!-- FILE: index.html | easyaitoolz.com | Tech: HTML5 + Tailwind CDN + Vanilla JS -->');
a('<html lang="en">');
a('<head>');
a('<meta charset="UTF-8" />');
a('<meta name="viewport" content="width=device-width, initial-scale=1.0" />');
a('<title>EasyAIToolz - Free AI Tools for Everyone</title>');
a('<meta name="description" content="Free AI-powered tools for developers, students, health enthusiasts, and creatives. SQL Generator, Workout Plans, Quiz Maker, Poem Generator and more." />');
a('<link rel="preconnect" href="https://fonts.googleapis.com" />');
a('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />');
a('<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />');
a('<script src="https://cdn.tailwindcss.com"><\/script>');
a('<script>tailwind.config={theme:{extend:{fontFamily:{sans:["Inter","ui-sans-serif"]}}}}<\/script>');
a('<style>');
a('/* Base: dark background + Inter font for the whole page */');
a('body{background-color:#06080f;font-family:Inter,sans-serif;color:#e2e8f0;overflow-x:hidden}');
a('/* Mesh gradient: layers of soft glowing circles in the background */');
a('.mesh-bg{background-color:#06080f;background-image:radial-gradient(ellipse 80% 60% at 20% 20%,rgba(56,100,255,.15) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 10%,rgba(139,92,246,.12) 0%,transparent 55%),radial-gradient(ellipse 50% 40% at 50% 80%,rgba(236,72,153,.08) 0%,transparent 50%)}');
a('/* Gradient text: clips a color gradient to the text shape */');
a('.gradient-text{background:linear-gradient(135deg,#60a5fa 0%,#a78bfa 50%,#f472b6 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}');
a('/* Frosted glass navbar: semi-transparent + blur of content behind it */');
a('.navbar-glass{background:rgba(6,8,15,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.06)}');
a('/* Search bar: purple glow ring on focus */');
a('.search-input:focus{outline:none;box-shadow:0 0 0 2px rgba(139,92,246,.5)}');
a('/* Cards lift 6px upward smoothly on hover */');
a('.tool-card{transition:transform .28s ease,box-shadow .28s ease}');
a('.tool-card:hover{transform:translateY(-6px)}');
a('/* Gradient border appears around card on hover using CSS mask trick */');
a('.card-border{position:relative;border-radius:1rem}');
a('.card-border::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;background:var(--gb,linear-gradient(135deg,#3b82f6,#8b5cf6));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity .28s ease}');
a('.tool-card:hover .card-border::before{opacity:1}');
a('/* Short pill-shaped line under each silo heading */');
a('.silo-bar{height:3px;width:48px;border-radius:9999px;margin-top:6px;margin-bottom:22px}');
a('/* Small uppercase pill badge on each card */');
a('.badge{font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 9px;border-radius:9999px}');
a('/* Anchor links glide smoothly to their target section */');
a('html{scroll-behavior:smooth}');
a('::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0d1117}::-webkit-scrollbar-thumb{background:#2d3748;border-radius:4px}');
a('</style>');
a('</head>');
a('<body class="mesh-bg min-h-screen">');

// ── NAVBAR ──
a('<!-- ============================================================');
a('     NAVIGATION BAR');
a('     Fixed at top (stays visible while scrolling).');
a('     Layout: [SVG Chip Logo + Brand Name] | [Nav Links] | [Search]');
a('     fixed=stays at top  z-50=rendered above all other elements');
a('     ============================================================ -->');
a('<nav class="navbar-glass fixed top-0 left-0 right-0 z-50">');
a('<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">');
a('<div class="flex items-center justify-between h-16">');

// Logo
a('<!-- Logo: SVG chip icon + colored brand text -->');
a('<a href="/" class="flex items-center gap-2.5 group" aria-label="EasyAIToolz Home">');
a('<!--');
a('  INLINE SVG AI CHIP ICON');
a('  Shapes: outer rounded square (body) + inner square (die)');
a('          + 8 short lines (connector pins) + center dot (processor)');
a('  viewBox 0 0 32 32 = 32x32 drawing canvas. Rendered at 26x26px.');
a('-->');
a('<svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">');
a('<defs><linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#a78bfa"/></linearGradient></defs>');
a('<rect x="2" y="2" width="28" height="28" rx="6" stroke="url(#lg1)" stroke-width="1.5" fill="rgba(96,165,250,0.07)"/>');
a('<rect x="9" y="9" width="14" height="14" rx="3" stroke="url(#lg1)" stroke-width="1.2" fill="rgba(167,139,250,0.10)"/>');
a('<line x1="11" y1="2" x2="11" y2="5" stroke="#60a5fa" stroke-width="1.2" stroke-linecap="round"/>');
a('<line x1="21" y1="2" x2="21" y2="5" stroke="#60a5fa" stroke-width="1.2" stroke-linecap="round"/>');
a('<line x1="11" y1="27" x2="11" y2="30" stroke="#60a5fa" stroke-width="1.2" stroke-linecap="round"/>');
a('<line x1="21" y1="27" x2="21" y2="30" stroke="#60a5fa" stroke-width="1.2" stroke-linecap="round"/>');
a('<line x1="2" y1="11" x2="5" y2="11" stroke="#a78bfa" stroke-width="1.2" stroke-linecap="round"/>');
a('<line x1="2" y1="21" x2="5" y2="21" stroke="#a78bfa" stroke-width="1.2" stroke-linecap="round"/>');
a('<line x1="27" y1="11" x2="30" y2="11" stroke="#a78bfa" stroke-width="1.2" stroke-linecap="round"/>');
a('<line x1="27" y1="21" x2="30" y2="21" stroke="#a78bfa" stroke-width="1.2" stroke-linecap="round"/>');
a('<circle cx="16" cy="16" r="2.2" fill="url(#lg1)"/>');
a('</svg>');
a('<span class="text-lg font-bold leading-none tracking-tight">');
a('<span class="text-blue-400">Easy</span><span class="text-purple-400">AI</span><span class="text-pink-400">Toolz</span>');
a('</span></a>');

// Nav links
a('<!-- Nav links: hidden on mobile, visible on md+ screens. text-white/80 = high contrast -->');
a('<div class="hidden md:flex items-center gap-7">');
a('<a href="#developer" class="text-sm font-semibold text-white/80 hover:text-blue-400 transition-colors">Developer</a>');
a('<a href="#fitness" class="text-sm font-semibold text-white/80 hover:text-emerald-400 transition-colors">Health</a>');
a('<a href="#education" class="text-sm font-semibold text-white/80 hover:text-amber-400 transition-colors">Academic</a>');
a('<a href="#creative" class="text-sm font-semibold text-white/80 hover:text-pink-400 transition-colors">Creative</a>');
a('</div>');

// Search
a('<!-- Search bar: hidden on mobile. oninput calls filterTools() on every keystroke -->');
a('<div class="relative hidden sm:block">');
a('<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>');
a('<input id="searchInput" type="search" placeholder="Search tools..." oninput="filterTools(this.value)" class="search-input w-44 bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white/80 placeholder-slate-500 transition-all" aria-label="Search tools"/>');
a('</div>');
a('</div></div></nav>');

// ── HERO ──
a('<!-- ============================================================');
a('     HERO SECTION — Big welcome area, first thing visitors see.');
a('     pt-36 = push content below the fixed 64px navbar.');
a('     ============================================================ -->');
a('<header class="pt-36 pb-20 px-4 text-center">');
a('<div class="max-w-2xl mx-auto">');
a('<!-- Top badge -->');
a('<span class="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase">100% Free &nbsp;|&nbsp; No Signup Required</span>');
a('<!-- h1 = most important heading on the page (best for SEO) -->');
a('<h1 class="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-5">');
a('<span class="gradient-text">One Platform.</span><br/>');
a('<span class="text-white">All Your AI Tools.</span>');
a('</h1>');
a('<!-- text-white/70 = white at 70% opacity, high contrast on dark background -->');
a('<p class="text-white/70 text-lg leading-relaxed max-w-lg mx-auto mb-10">Powerful, free AI tools for developers, students, health enthusiasts, and creatives. Pick a tool and go.</p>');
a('<div class="flex flex-wrap gap-3 justify-center">');
a('<!-- &#8594; is the HTML entity for right arrow → — avoids encoding bugs -->');
a('<a href="#developer" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/25">Explore Tools &#8594;</a>');
a('<a href="/about.html" class="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-semibold px-7 py-3 rounded-xl transition-colors">Learn More</a>');
a('</div>');
a('<!-- Stats row: plain | pipe character as separator — no encoding risk -->');
a('<div class="flex flex-wrap items-center justify-center gap-8 mt-12">');
a('<div class="text-center"><p class="text-2xl font-bold text-white">9+</p><p class="text-xs text-white/40 uppercase tracking-widest mt-0.5">Free Tools</p></div>');
a('<div class="text-white/10 text-2xl hidden sm:block">|</div>');
a('<div class="text-center"><p class="text-2xl font-bold text-white">4</p><p class="text-xs text-white/40 uppercase tracking-widest mt-0.5">Categories</p></div>');
a('<div class="text-white/10 text-2xl hidden sm:block">|</div>');
a('<div class="text-center"><p class="text-2xl font-bold text-white">0</p><p class="text-xs text-white/40 uppercase tracking-widest mt-0.5">Signup Needed</p></div>');
a('</div></div></header>');

// ── MAIN ──
a('<!-- ============================================================');
a('     MAIN CONTENT - 4 Tool Silos');
a('     id="toolsContainer" lets our JS search loop through all cards.');
a('     space-y-24 = 96px vertical gap between sections.');
a('     ============================================================ -->');
a('<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 space-y-24" id="toolsContainer">');

// Helper function to create a card
function card(href, keywords, iconCode, badgeClass, badgeText, titleHover, title, desc, arrowColor, gb) {
  const lines2 = [];
  lines2.push(`<a href="${href}" class="tool-card block group" data-name="${keywords}">`);
  lines2.push(`<div class="card-border bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 h-full" style="--gb:${gb}">`);
  lines2.push(`<div class="flex items-start justify-between mb-5"><div class="w-11 h-11 rounded-xl ${badgeClass.replace('text-','bg-').replace('400','500/10')} flex items-center justify-center text-xl">${iconCode}</div><span class="badge ${badgeClass.includes('blue')?'bg-blue-500/10 text-blue-400 border border-blue-500/20':badgeClass.includes('indigo')?'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20':badgeClass.includes('emerald')?'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20':badgeClass.includes('green')?'bg-green-500/10 text-green-400 border border-green-500/20':badgeClass.includes('amber')?'bg-amber-500/10 text-amber-400 border border-amber-500/20':badgeClass.includes('yellow')?'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20':badgeClass.includes('orange')?'bg-orange-500/10 text-orange-400 border border-orange-500/20':badgeClass.includes('pink')?'bg-pink-500/10 text-pink-400 border border-pink-500/20':badgeClass.includes('fuchsia')?'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20':'bg-violet-500/10 text-violet-400 border border-violet-500/20'}">${badgeText}</span></div>`);
  lines2.push(`<h3 class="font-bold text-white text-base mb-1.5 group-hover:${titleHover} transition-colors">${title}</h3>`);
  lines2.push(`<p class="text-white/45 text-sm leading-relaxed">${desc}</p>`);
  lines2.push(`<div class="mt-5 flex items-center gap-1.5 ${arrowColor} text-sm font-semibold"><span>Open Tool</span><span class="group-hover:translate-x-1 transition-transform inline-block">&#8594;</span></div>`);
  lines2.push('</div></a>');
  return lines2;
}

// SILO 1: DEVELOPER
a('<!-- ── SILO 1: DEVELOPER SUITE  |  Blue theme  |  id links to #developer nav anchor ── -->');
a('<section id="developer">');
a('<div class="mb-8"><div class="flex items-center gap-3 mb-1"><span class="text-2xl">&#128187;</span><h2 class="text-xl font-bold text-white">Developer Suite</h2><span class="badge bg-blue-500/10 text-blue-400 border border-blue-500/20">2 Tools</span></div>');
a('<div class="silo-bar" style="background:linear-gradient(90deg,#3b82f6,#60a5fa);"></div>');
a('<p class="text-white/55 text-sm max-w-xl leading-relaxed">Supercharge your workflow with AI-powered code helpers. Generate SQL and Regex in seconds.</p></div>');
a('<!-- grid-cols-1=mobile 1col | sm:grid-cols-2=tablet 2col | lg:grid-cols-3=desktop 3col -->');
a('<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">');
card('/developer/sql-generator.html','sql query generator developer database code','&#128196;','text-blue-400','Developer','text-blue-400','SQL Query Generator','Type your data need in plain English. Get a production-ready SQL query instantly.','text-blue-500','linear-gradient(135deg,#3b82f6,#6366f1)').forEach(l => a(l));
card('/developer/regex-generator.html','regex regular expression generator developer pattern code','&#128269;','text-indigo-400','Developer','text-indigo-400','Regex Generator','Describe the text pattern you need. Get a working Regular Expression with no syntax memorization.','text-indigo-500','linear-gradient(135deg,#6366f1,#8b5cf6)').forEach(l => a(l));
a('</div></section>');

// SILO 2: FITNESS
a('<!-- ── SILO 2: HEALTH & FITNESS  |  Green theme  |  id links to #fitness nav anchor ── -->');
a('<section id="fitness">');
a('<div class="mb-8"><div class="flex items-center gap-3 mb-1"><span class="text-2xl">&#128170;</span><h2 class="text-xl font-bold text-white">Health &amp; Fitness Suite</h2><span class="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">2 Tools</span></div>');
a('<div class="silo-bar" style="background:linear-gradient(90deg,#10b981,#34d399);"></div>');
a('<p class="text-white/55 text-sm max-w-xl leading-relaxed">AI-personalized health plans built around your goals, fitness level, and dietary needs.</p></div>');
a('<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">');
card('/fitness/workout-generator.html','workout plan generator fitness exercise health gym training','&#127947;','text-emerald-400','Health','text-emerald-400','AI Workout Plan Generator','Enter your fitness level and goal. Get a personalized weekly training schedule tailored just for you.','text-emerald-500','linear-gradient(135deg,#10b981,#34d399)').forEach(l => a(l));
card('/fitness/diet-generator.html','diet plan generator nutrition meal food health eating calories','&#129367;','text-green-400','Health','text-green-400','AI Diet Plan Generator','Tell us your dietary needs and preferences. Get a balanced, custom meal plan for the week ahead.','text-green-500','linear-gradient(135deg,#22c55e,#16a34a)').forEach(l => a(l));
a('</div></section>');

// SILO 3: ACADEMIC
a('<!-- ── SILO 3: ACADEMIC SUITE  |  Amber theme  |  id links to #education nav anchor ── -->');
a('<section id="education">');
a('<div class="mb-8"><div class="flex items-center gap-3 mb-1"><span class="text-2xl">&#128218;</span><h2 class="text-xl font-bold text-white">Academic Suite</h2><span class="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">3 Tools</span></div>');
a('<div class="silo-bar" style="background:linear-gradient(90deg,#f59e0b,#fbbf24);"></div>');
a('<p class="text-white/55 text-sm max-w-xl leading-relaxed">Study smarter with AI-generated worksheets, quizzes, and revision timetables for every subject.</p></div>');
a('<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">');
card('/education/worksheet-generator.html','worksheet generator academic school student study practice','&#128221;','text-amber-400','Academic','text-amber-400','AI Worksheet Generator','Choose a subject, grade, and topic. Get a complete printable practice worksheet in seconds.','text-amber-500','linear-gradient(135deg,#f59e0b,#fbbf24)').forEach(l => a(l));
card('/education/quiz-generator.html','quiz generator academic test exam questions mcq multiple choice','&#129504;','text-yellow-400','Academic','text-yellow-400','AI Quiz Generator','Enter any topic and difficulty level. Get a full MCQ or short-answer quiz to test your knowledge.','text-yellow-500','linear-gradient(135deg,#eab308,#ca8a04)').forEach(l => a(l));
card('/education/study-plan-generator.html','study plan generator academic schedule revision timetable exam','&#128197;','text-orange-400','Academic','text-orange-400','AI Study Plan Generator','Enter your exam date and subjects. Get a day-by-day revision timetable crafted around your schedule.','text-orange-500','linear-gradient(135deg,#f97316,#fb923c)').forEach(l => a(l));
a('</div></section>');

// SILO 4: CREATIVE
a('<!-- ── SILO 4: CREATIVE SUITE  |  Pink/Violet theme  |  id links to #creative nav anchor ── -->');
a('<section id="creative">');
a('<div class="mb-8"><div class="flex items-center gap-3 mb-1"><span class="text-2xl">&#127912;</span><h2 class="text-xl font-bold text-white">Creative Suite</h2><span class="badge bg-pink-500/10 text-pink-400 border border-pink-500/20">3 Tools</span></div>');
a('<div class="silo-bar" style="background:linear-gradient(90deg,#ec4899,#a855f7);"></div>');
a('<p class="text-white/55 text-sm max-w-xl leading-relaxed">Unleash your imagination. AI-generated poems, memes, and brand logos - all free, all instant.</p></div>');
a('<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">');
card('/creative/poem-generator.html','poem generator creative writing poetry rhyme literature','&#9997;','text-pink-400','Creative','text-pink-400','AI Poem Generator','Give a theme, mood, or a name. Receive a beautiful, original poem crafted by AI instantly.','text-pink-500','linear-gradient(135deg,#ec4899,#f472b6)').forEach(l => a(l));
card('/creative/meme-generator.html','meme generator creative funny humor caption viral social','&#128514;','text-fuchsia-400','Creative','text-fuchsia-400','Meme Generator','Describe a situation or pick a template. AI writes the perfect meme caption automatically.','text-fuchsia-500','linear-gradient(135deg,#d946ef,#a855f7)').forEach(l => a(l));
card('/creative/logo-maker.html','logo maker generator creative design brand identity business','&#127912;','text-violet-400','Creative','text-violet-400','AI Logo Maker','Describe your brand, industry, and style. Get unique logo concepts and SVG ideas in moments.','text-violet-500','linear-gradient(135deg,#8b5cf6,#7c3aed)').forEach(l => a(l));
a('</div></section>');

// Bottom Banner
a('<!-- Bottom CTA banner -->');
a('<div class="relative rounded-3xl overflow-hidden border border-white/5 text-center p-12">');
a('<div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none"></div>');
a('<div class="relative z-10"><p class="text-3xl font-extrabold text-white mb-3">More tools arriving soon! &#128640;</p>');
a('<p class="text-white/50 mb-7 max-w-sm mx-auto text-sm leading-relaxed">We ship new AI tools every week - all completely free and ready to use instantly.</p>');
a('<a href="#developer" class="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-slate-100 transition-colors shadow-lg">Start Exploring &#8593;</a>');
a('</div></div>');
a('</main>');

// FOOTER
a('<!-- FOOTER -->');
a('<footer class="border-t border-white/5 py-10">');
a('<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">');
a('<div class="flex flex-col md:flex-row items-center justify-between gap-5">');
a('<div class="flex flex-col items-center md:items-start gap-1">');
a('<span class="text-base font-bold"><span class="text-blue-400">Easy</span><span class="text-purple-400">AI</span><span class="text-pink-400">Toolz</span></span>');
a('<p class="text-white/30 text-xs">Free AI tools, for everyone, forever.</p></div>');
a('<!-- Plain | pipe characters as separators - zero encoding risk -->');
a('<div class="flex items-center gap-3 text-xs text-white/30">');
a('<a href="/about.html" class="hover:text-white/70 transition-colors">About</a><span>|</span>');
a('<a href="/privacy.html" class="hover:text-white/70 transition-colors">Privacy</a><span>|</span>');
a('<a href="/contact.html" class="hover:text-white/70 transition-colors">Contact</a>');
a('</div></div>');
a('<!-- Copyright year auto-filled by JS below -->');
a('<p class="text-center text-white/20 text-xs mt-8">&copy; <span id="yr"></span> easyaitoolz.com &nbsp;|&nbsp; All rights reserved.</p>');
a('</div></footer>');

// SCRIPT
a('<!-- ============================================================');
a('     JAVASCRIPT - Two beginner-friendly functions.');
a('     Placed at the bottom so all HTML above loads first.');
a('     ============================================================ -->');
a('<script>');
a('// FUNCTION 1: Auto copyright year');
a('// new Date().getFullYear() = current year number e.g. 2025');
a('// Inserts it into <span id="yr"> in the footer automatically.');
a('document.getElementById("yr").textContent = new Date().getFullYear();');
a('');
a('// FUNCTION 2: Live search filter');
a('// Every card has data-name="keyword1 keyword2 ..." attribute.');
a('// When user types, we check if each card\'s keywords include the search term.');
a('// Matching cards stay visible; non-matching cards get class="hidden".');
a('function filterTools(q) {');
a('  var t = q.toLowerCase().trim();');
a('  var cards = document.querySelectorAll("[data-name]");');
a('  for (var i = 0; i < cards.length; i++) {');
a('    var kw = cards[i].getAttribute("data-name").toLowerCase();');
a('    if (t === "" || kw.includes(t)) { cards[i].classList.remove("hidden"); }');
a('    else { cards[i].classList.add("hidden"); }');
a('  }');
a('}');
a('<\/script>');
a('</body></html>');

const html = lines.join('\n');
fs.writeFileSync('d:/easyaitoolz/index.html', html, { encoding: 'utf8' });
console.log('SUCCESS! Written', Buffer.byteLength(html, 'utf8'), 'bytes to index.html');
