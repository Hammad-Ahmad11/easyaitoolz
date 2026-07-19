/**
 * write_logo_maker.js
 * Builds /creative/logo-maker.html by combining:
 *   1. HTML_TOP    — full page structure down to the opening <script> tag
 *   2. logo_logic.js — pure JavaScript (zero escaping issues)
 *   3. HTML_BOTTOM — closing tags
 */

const fs   = require('fs');
const path = require('path');

const jsLogic = fs.readFileSync(path.join(__dirname, 'logo_logic.js'), 'utf8');

// ── HTML TOP ───────────────────────────────────────────────────────────────
const HTML_TOP = `<!DOCTYPE html>
<!--
  FILE     : /creative/logo-maker.html
  WEBSITE  : easyaitoolz.com
  PURPOSE  : AI Logo Maker & Brand Identity Builder — Creative Suite
  TECH     : HTML5 + Tailwind CSS CDN + Vanilla JavaScript

  HOW THIS TOOL WORKS:
  =====================
  1. User enters their brand name + selects industry, vibe, and color preference
  2. JavaScript builds an expert brand design system prompt
  3. POST to /api/generate — Cloudflare backend calls Gemini (API key hidden)
  4. AI returns:
       "Icon Concept: [...] | Colors: [#hex1,#hex2,#hex3] | Typography: [...] | Layout: [...]"
  5. parseBrandResponse() extracts all 4 parts using regex + string splitting
  6. renderBrandIdentity() builds:
       - A live CSS preview box showing the brand name styled with AI's colors
       - 3 clickable color swatch cards
       - Typography recommendation block
       - Icon concept description
       - Layout guide
-->
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Logo Maker &amp; Brand Identity Builder &mdash; EasyAIToolz</title>
  <meta name="description" content="Generate a complete brand identity with AI: logo concept, color palette, typography, and layout guide. Free, no signup required." />

  <!-- Google Fonts: Inter for UI + a selection of logo-worthy display fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;700;900&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans:    ['Inter', 'ui-sans-serif'],
            display: ['Space Grotesk', 'Inter', 'ui-sans-serif'],
            luxury:  ['Playfair Display', 'Georgia', 'serif'],
          }
        }
      }
    }
  <\/script>

  <style>
    /* ── BASE ──────────────────────────────────────────────────────────────*/
    body {
      background-color: #06080f;
      font-family: 'Inter', sans-serif;
      color: #e2e8f0;
      overflow-x: hidden;
    }

    /* ── MESH GRADIENT BACKGROUND ──────────────────────────────────────────
       Violet-blue-purple aurora — feels like a premium design studio. */
    .mesh-bg {
      background-color: #06080f;
      background-image:
        radial-gradient(ellipse 70% 55% at 10% 15%, rgba(124,58,237,.13) 0%, transparent 58%),
        radial-gradient(ellipse 60% 45% at 90% 10%, rgba(79,70,229,.10) 0%, transparent 55%),
        radial-gradient(ellipse 50% 40% at 55% 88%, rgba(217,70,239,.07) 0%, transparent 52%);
    }

    /* ── FROSTED GLASS NAVBAR ─────────────────────────────────────────────*/
    .navbar-glass {
      background: rgba(6, 8, 15, 0.82);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,.06);
    }

    /* ── GRADIENT HEADING TEXT ─────────────────────────────────────────────
       Violet-to-blue gradient matches a premium design brand feeling. */
    .gradient-text {
      background: linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #60a5fa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ── INPUT FOCUS ───────────────────────────────────────────────────────*/
    .input-field:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.38);
      border-color: rgba(139, 92, 246, 0.50);
    }

    /* ── CUSTOM DROPDOWN ARROW ─────────────────────────────────────────────*/
    .custom-select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 40px;
    }

    /* ── GENERATE BUTTON ───────────────────────────────────────────────────
       Deep violet-to-indigo gradient — feels premium and creative. */
    .btn-generate {
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%);
      background-size: 200% 200%;
      transition: background-position 0.4s ease, opacity 0.2s ease, transform 0.2s ease;
      box-shadow: 0 4px 24px rgba(124, 58, 237, 0.30);
    }
    .btn-generate:hover:not(:disabled) { background-position: right center; transform: translateY(-1px); }
    .btn-generate:disabled             { opacity: 0.45; cursor: not-allowed; }

    /* ── SPINNER ───────────────────────────────────────────────────────────*/
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner {
      width: 17px; height: 17px;
      border: 2px solid rgba(255,255,255,.20);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
      vertical-align: middle;
    }

    /* ── LIVE LOGO PREVIEW CARD ────────────────────────────────────────────
       This is the main output element — a styled brand mockup card.

       DESIGN:
         - Dark background (overridden by JS with the AI's color suggestion)
         - Flex row: [icon badge] [brand name area]
         - Padding + rounded corners for a clean "brand card" feel
         - min-height to give it enough space to feel like a real logo area
    */
    .logo-preview-card {
      background: #0d0d1a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 1rem;
      padding: 1.75rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
      min-height: 110px;
      transition: all 0.4s ease;
    }

    /* ── ICON BADGE ─────────────────────────────────────────────────────────
       A colored circle showing the brand's initials.
       JS replaces the background with the AI's gradient color scheme. */
    .logo-icon-badge {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.40);
    }
    .loading-badge { background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04)) !important; }

    /* ── BRAND NAME IN LOGO PREVIEW ─────────────────────────────────────────
       The brand name rendered in logo style.
       JS sets color + letter-spacing based on the selected vibe. */
    .logo-name-area  { flex: 1; min-width: 0; }
    .logo-brand-name {
      font-size: clamp(1.3rem, 3vw, 2rem);
      font-family: 'Space Grotesk', 'Montserrat', 'Inter', sans-serif;
      font-weight: 700;
      line-height: 1.1;
      color: #c4b5fd;
      letter-spacing: 0.08em;
      word-break: break-word;
    }
    .logo-tagline {
      font-size: 0.65rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      margin-top: 0.4rem;
      color: rgba(167,139,250,0.45);
    }

    /* ── ALTERNATE LOGO PREVIEW (gradient text version) ───────────────────*/
    .logo-alt-name {
      font-size: clamp(1.5rem, 3vw, 2.2rem);
      font-family: 'Montserrat', 'Space Grotesk', sans-serif;
      font-weight: 900;
    }

    /* ── LOADING CARD STYLE ────────────────────────────────────────────────*/
    .loading-card { border-color: rgba(255,255,255,0.04) !important; }

    /* ── COLOR SWATCH CARD ─────────────────────────────────────────────────
       Each color palette card is a colored rectangle with the hex code on it.
       min-width: enough to show the hex code.
       border-radius: rounded for a premium palette look.
       transition: smooth hover scale + shadow effect. */
    .color-swatch-card {
      flex: 1;
      min-width: 90px;
      height: 80px;
      border-radius: 0.875rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding: 0.625rem;
      border: 1px solid rgba(255,255,255,0.10);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .color-swatch-card:hover  { transform: scale(1.04); box-shadow: 0 6px 20px rgba(0,0,0,0.4); }
    .color-swatch-hex   { font-size: 0.65rem; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 0.04em; }
    .color-swatch-label { font-size: 0.58rem; letter-spacing: 0.08em; text-transform: uppercase; }

    /* ── IDENTITY SECTION LABEL ────────────────────────────────────────────
       Small uppercase label above each identity section (Color, Typography, etc.) */
    .section-label {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(167,139,250,0.60);
      margin-bottom: 0.75rem;
    }

    /* ── IDENTITY TEXT BLOCK ───────────────────────────────────────────────
       The card that holds text identity sections (Typography, Icon Concept, etc.) */
    .identity-block {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 0.75rem;
      padding: 1rem 1.125rem;
    }

    /* ── EXAMPLE CHIP HOVER ────────────────────────────────────────────────*/
    .example-chip { transition: all 0.2s ease; }
    .example-chip:hover {
      background: rgba(139,92,246,0.12);
      border-color: rgba(139,92,246,0.30);
      color: #a78bfa;
    }

    /* ── SCROLLBAR ─────────────────────────────────────────────────────── */
    ::-webkit-scrollbar       { width: 6px; }
    ::-webkit-scrollbar-track { background: #0d1117; }
    ::-webkit-scrollbar-thumb { background: #2a1a50; border-radius: 4px; }

    html { scroll-behavior: smooth; }
  </style>
</head>


<body class="mesh-bg min-h-screen">


<!-- ==============================================================================
     NAVIGATION BAR
     ============================================================================== -->
<nav class="navbar-glass fixed top-0 left-0 right-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">

      <div class="flex items-center gap-4">

        <a href="/" class="flex items-center gap-1.5 text-white/45 hover:text-white/85 transition-colors text-sm font-medium group" aria-label="Back to homepage">
          <span class="group-hover:-translate-x-0.5 transition-transform inline-block">&#8592;</span>
          <span class="hidden sm:inline">Back</span>
        </a>

        <div class="w-px h-5 bg-white/10" aria-hidden="true"></div>

        <!-- Violet-tinted SVG chip logo -->
        <a href="/" class="flex items-center gap-2" aria-label="EasyAIToolz Home">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="navLgL" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#8b5cf6"/>
                <stop offset="100%" stop-color="#6366f1"/>
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="28" height="28" rx="6" stroke="url(#navLgL)" stroke-width="1.5" fill="rgba(139,92,246,0.07)"/>
            <rect x="9" y="9" width="14" height="14" rx="3" stroke="url(#navLgL)" stroke-width="1.2" fill="rgba(99,102,241,0.10)"/>
            <line x1="11" y1="2"  x2="11" y2="5"  stroke="#8b5cf6" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="21" y1="2"  x2="21" y2="5"  stroke="#8b5cf6" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="11" y1="27" x2="11" y2="30" stroke="#8b5cf6" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="21" y1="27" x2="21" y2="30" stroke="#8b5cf6" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="2"  y1="11" x2="5"  y2="11" stroke="#6366f1" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="2"  y1="21" x2="5"  y2="21" stroke="#6366f1" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="27" y1="11" x2="30" y2="11" stroke="#6366f1" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="27" y1="21" x2="30" y2="21" stroke="#6366f1" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="16" cy="16" r="2.2" fill="url(#navLgL)"/>
          </svg>
          <span class="text-[1rem] font-bold leading-none">
            <span class="text-blue-400">Easy</span><span class="text-purple-400">AI</span><span class="text-pink-400">Toolz</span>
          </span>
        </a>
      </div>

      <span class="hidden sm:flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-3 py-1 rounded-full">
        &#10024; Logo Maker
      </span>

    </div>
  </div>
</nav>


<!-- ==============================================================================
     PAGE HEADER
     ============================================================================== -->
<header class="pt-28 pb-8 px-4 text-center">
  <div class="max-w-2xl mx-auto">

    <div class="flex items-center justify-center gap-2 text-xs text-white/28 mb-4">
      <a href="/" class="hover:text-white/55 transition-colors">Home</a>
      <span>&#8250;</span>
      <span class="text-white/40">Creative Suite</span>
      <span>&#8250;</span>
      <span class="text-violet-400">Logo Maker</span>
    </div>

    <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
      <span class="gradient-text">AI Logo</span>
      <span class="text-white"> &amp; Brand Identity</span>
    </h1>

    <p class="text-white/50 text-base leading-relaxed max-w-lg mx-auto">
      Enter your brand name and preferences &mdash; get a complete identity package:
      logo concept, color palette, typography, and layout guide. Free, instant.
    </p>

  </div>
</header>


<!-- ==============================================================================
     MAIN WORKSPACE — Two-column interactive layout

     LAYOUT:
       MOBILE  (< 1024px)  → 1 column, stacked vertically
       DESKTOP (>= 1024px) → [380px fixed left] | [flexible right]

     The right column needs more space here than other tools because it shows
     a rich multi-section brand identity: preview + colors + typography + concept.
     ============================================================================== -->
<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
  <div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">


    <!-- ============================================================
         LEFT COLUMN: INPUT PANEL
         4 inputs: brand name text + 3 dropdowns + button
         ============================================================ -->
    <div class="flex flex-col gap-5">

      <div class="bg-slate-900/60 border border-white/[.08] rounded-2xl p-6">

        <h2 class="text-sm font-bold text-white mb-6 flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center" aria-hidden="true">&#10024;</span>
          Brand Details
        </h2>


        <!-- ── INPUT 1: BRAND NAME ────────────────────────────────────────
             The most important field. This name will be:
               - Rendered in the live CSS logo preview with the AI's colors
               - Used to generate brand initials for the icon badge
               - Passed to the AI as the "Brand Name" parameter
             Examples: "RHA Store", "TechApex", "CloudBrew", "Zara", "FitFlow"
        -->
        <div class="mb-5">
          <label for="brandNameInput" class="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
            1. Brand Name
          </label>
          <input
            type="text"
            id="brandNameInput"
            placeholder="e.g., RHA Store, TechApex, CloudBrew..."
            class="input-field w-full bg-slate-800/80 border border-white/[.10] rounded-xl px-4 py-3 text-white/85 text-sm placeholder-white/20 transition-colors font-medium"
          />

          <!-- Quick example chips -->
          <div class="flex flex-wrap gap-1.5 mt-2.5">
            <button onclick="document.getElementById('brandNameInput').value=this.innerText" class="example-chip text-xs bg-white/5 border border-white/8 text-white/38 px-2.5 py-1 rounded-lg">RHA Store</button>
            <button onclick="document.getElementById('brandNameInput').value=this.innerText" class="example-chip text-xs bg-white/5 border border-white/8 text-white/38 px-2.5 py-1 rounded-lg">TechApex</button>
            <button onclick="document.getElementById('brandNameInput').value=this.innerText" class="example-chip text-xs bg-white/5 border border-white/8 text-white/38 px-2.5 py-1 rounded-lg">CloudBrew</button>
            <button onclick="document.getElementById('brandNameInput').value=this.innerText" class="example-chip text-xs bg-white/5 border border-white/8 text-white/38 px-2.5 py-1 rounded-lg">FitFlow</button>
            <button onclick="document.getElementById('brandNameInput').value=this.innerText" class="example-chip text-xs bg-white/5 border border-white/8 text-white/38 px-2.5 py-1 rounded-lg">NovaMart</button>
          </div>
          <p class="text-xs text-white/20 mt-2">
            <kbd class="bg-white/5 border border-white/10 rounded px-1 py-0.5 font-mono text-xs">Ctrl</kbd>+
            <kbd class="bg-white/5 border border-white/10 rounded px-1 py-0.5 font-mono text-xs">Enter</kbd> to generate
          </p>
        </div>


        <!-- ── INPUT 2: NICHE / INDUSTRY ─────────────────────────────────
             The AI uses this to understand what visual language the brand
             needs to speak. Fitness brands use different symbols than cafes.
             E.g., Tech → circuit elements, circuits, arrows
                   Food → organic shapes, wheat, coffee beans
                   Fitness → dynamic lines, human figure, lightning
        -->
        <div class="mb-5">
          <label for="industrySelect" class="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
            2. Niche / Industry
          </label>
          <select id="industrySelect" class="input-field custom-select w-full bg-slate-800/80 border border-white/[.10] rounded-xl px-4 py-3 text-white/85 text-sm transition-colors appearance-none cursor-pointer">
            <option value="E-commerce &amp; Fashion / Lifestyle">&#128722; E-commerce &amp; Fashion</option>
            <option value="Tech &amp; Software / SaaS">&#128187; Tech &amp; Software / SaaS</option>
            <option value="Food, Cafe &amp; Hospitality">&#9749; Food, Cafe &amp; Hospitality</option>
            <option value="Fitness, Health &amp; Wellness">&#127947; Fitness, Health &amp; Wellness</option>
            <option value="Education &amp; EdTech">&#127979; Education &amp; EdTech</option>
            <option value="Finance &amp; Fintech">&#128200; Finance &amp; Fintech</option>
            <option value="Creative Agency &amp; Media">&#127912; Creative Agency &amp; Media</option>
            <option value="Beauty &amp; Cosmetics">&#128144; Beauty &amp; Cosmetics</option>
          </select>
        </div>


        <!-- ── INPUT 3: DESIGN VIBE ───────────────────────────────────────
             Controls the visual personality of the logo concept.
             This affects: font weight, letter-spacing, shape complexity,
             and overall aesthetic direction.

             Vibe → CSS letter-spacing + font-weight (set in logo_logic.js):
               Minimalist      → thin weight, wide letter-spacing, clean
               Luxury/Premium  → thin weight, very wide spacing, small-caps
               Bold/Modern     → heavy weight, tight spacing, strong
               Retro/Vintage   → medium weight, slight spacing, textured
        -->
        <div class="mb-5">
          <label for="vibeSelect" class="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
            3. Design Vibe
          </label>
          <select id="vibeSelect" class="input-field custom-select w-full bg-slate-800/80 border border-white/[.10] rounded-xl px-4 py-3 text-white/85 text-sm transition-colors appearance-none cursor-pointer">
            <option value="Minimalist &amp; Clean">&#9651; Minimalist &amp; Clean</option>
            <option value="Luxury / Premium">&#11835; Luxury / Premium</option>
            <option value="Bold / Modern">&#9646; Bold / Modern</option>
            <option value="Retro / Vintage">&#128262; Retro / Vintage</option>
            <option value="Playful / Friendly">&#10024; Playful / Friendly</option>
            <option value="Corporate / Professional">&#128188; Corporate / Professional</option>
          </select>
        </div>


        <!-- ── INPUT 4: CORE COLOR VIBE ──────────────────────────────────
             The AI uses this to guide its hex color choices.
             The actual hex values come from the AI — this is just a preference.

             Warm/Energetic   → oranges, reds, warm yellows, earth tones
             Cool/Professional → blues, teals, steel grays, deep navies
             Neutral/Elegant  → blacks, whites, golds, champagne, charcoal
        -->
        <div class="mb-7">
          <label for="paletteSelect" class="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
            4. Color Palette Preference
          </label>
          <select id="paletteSelect" class="input-field custom-select w-full bg-slate-800/80 border border-white/[.10] rounded-xl px-4 py-3 text-white/85 text-sm transition-colors appearance-none cursor-pointer">
            <option value="Warm &amp; Energetic (reds, oranges, warm tones)">&#128293; Warm &amp; Energetic</option>
            <option value="Cool &amp; Professional (blues, teals, deep tones)">&#129405; Cool &amp; Professional</option>
            <option value="Neutral &amp; Elegant (blacks, golds, champagne)">&#11088; Neutral &amp; Elegant</option>
            <option value="Vibrant &amp; Bold (bright, high-contrast colors)">&#127752; Vibrant &amp; Bold</option>
            <option value="Earthy &amp; Organic (greens, browns, terracotta)">&#127807; Earthy &amp; Organic</option>
          </select>
        </div>


        <!-- ── GENERATE BUTTON ────────────────────────────────────────────
             onclick="generateBrand()" calls the main JS function.
             JS disables this button during the API call to prevent double-clicks.
        -->
        <button
          id="generateBtn"
          onclick="generateBrand()"
          class="btn-generate w-full text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2.5 tracking-wide"
        >
          <span id="btnIcon" aria-hidden="true">&#10024;</span>
          <span id="btnText">Generate Brand Concept</span>
        </button>

      </div><!-- end input card -->


      <!-- What you'll get guide box -->
      <div class="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4">
        <p class="text-xs font-bold text-violet-400/75 mb-3 uppercase tracking-widest">What You Get</p>
        <ul class="text-xs text-white/35 space-y-2 leading-relaxed">
          <li class="flex items-start gap-2"><span class="text-violet-500 mt-0.5">&#9670;</span><span><b class="text-white/45">Live Logo Preview</b> — Your brand name styled with AI colors</span></li>
          <li class="flex items-start gap-2"><span class="text-violet-500 mt-0.5">&#9670;</span><span><b class="text-white/45">Color Palette</b> — 3 brand hex codes as clickable swatches</span></li>
          <li class="flex items-start gap-2"><span class="text-violet-500 mt-0.5">&#9670;</span><span><b class="text-white/45">Typography Guide</b> — Primary + secondary font pairing</span></li>
          <li class="flex items-start gap-2"><span class="text-violet-500 mt-0.5">&#9670;</span><span><b class="text-white/45">Icon Concept</b> — Symbol description to give your designer</span></li>
          <li class="flex items-start gap-2"><span class="text-violet-500 mt-0.5">&#9670;</span><span><b class="text-white/45">Layout Guide</b> — How to arrange icon + text</span></li>
        </ul>
      </div>

    </div><!-- end left column -->


    <!-- ============================================================
         RIGHT COLUMN: BRAND IDENTITY OUTPUT PANEL
         lg:sticky lg:top-24 = stays in the viewport on desktop.

         CONTENT (all rendered by JavaScript):
           ┌────────────────────────────┐
           │ [Panel title + copy btn]   │
           │ [emptyState OR brandOutput]│
           │   ├── Logo Preview Card    │
           │   ├── Color Swatches       │
           │   ├── Typography Block     │
           │   ├── Icon Concept Block   │
           │   └── Layout Guide Block   │
           └────────────────────────────┘
         ============================================================ -->
    <div class="flex flex-col gap-4 lg:sticky lg:top-24">

      <!-- Output container card -->
      <div class="bg-slate-900/60 border border-white/[.08] rounded-2xl overflow-hidden">

        <!-- Panel title bar -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-white/[.06]" style="background:rgba(255,255,255,0.025)">
          <div class="flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full bg-violet-500 animate-pulse" aria-hidden="true"></span>
            <h2 class="text-sm font-semibold text-white/80">Brand Identity Mockup</h2>
          </div>

          <!-- COPY IDENTITY DATA BUTTON
               Hidden until a brand concept is generated.
               onclick="copyBrandData()" copies ALL identity data as clean text. -->
          <button
            id="copyBtn"
            onclick="copyBrandData()"
            class="hidden items-center gap-1.5 text-xs text-white/38 hover:text-violet-400 px-3 py-1.5 rounded-lg border border-white/[.08] hover:border-violet-500/30 transition-all"
          >
            <span>&#128203;</span>
            <span>Copy Identity Data</span>
          </button>
        </div>


        <!-- ── SCROLLABLE CONTENT AREA ─────────────────────────────────── -->
        <div class="overflow-y-auto p-5" style="max-height: 78vh; min-height: 480px;">


          <!-- ── EMPTY STATE ─────────────────────────────────────────────────
               Shown before any brand is generated.
               JavaScript hides this and shows brandOutput after the AI responds.
          -->
          <div id="emptyState" class="flex flex-col items-center justify-center gap-6 py-14 text-center">

            <!-- Large icon -->
            <div class="relative">
              <div class="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-4xl">
                &#10024;
              </div>
              <span class="absolute -top-2 -right-2 text-base" aria-hidden="true">&#9671;</span>
            </div>

            <div>
              <p class="text-white/50 font-semibold mb-1.5">Your brand identity will appear here</p>
              <p class="text-white/25 text-sm max-w-xs leading-relaxed">
                Enter your brand details on the left and click
                <span class="text-violet-400/70 font-medium">Generate Brand Concept</span>
              </p>
            </div>

            <!-- Skeleton preview of what the output looks like -->
            <div class="w-full max-w-sm space-y-3 opacity-20 pointer-events-none select-none">

              <!-- Logo preview skeleton -->
              <div class="logo-preview-card">
                <div class="logo-icon-badge loading-badge"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-5 bg-white/10 rounded-lg w-3/4"></div>
                  <div class="h-2 bg-white/6 rounded-full w-1/3"></div>
                </div>
              </div>

              <!-- Color swatch skeleton -->
              <div class="flex gap-2">
                <div class="color-swatch-card" style="background:rgba(139,92,246,0.25);"></div>
                <div class="color-swatch-card" style="background:rgba(99,102,241,0.20);"></div>
                <div class="color-swatch-card" style="background:rgba(124,58,237,0.15);"></div>
              </div>

              <!-- Text blocks skeleton -->
              <div class="identity-block space-y-2">
                <div class="h-2.5 bg-white/8 rounded-full w-full"></div>
                <div class="h-2.5 bg-white/6 rounded-full w-4/5"></div>
              </div>

            </div><!-- end skeleton preview -->

          </div><!-- end emptyState -->


          <!-- ── BRAND OUTPUT ─────────────────────────────────────────────────
               Hidden initially. JavaScript removes "hidden" and fills this div
               with renderBrandIdentity() output.

               SECTIONS RENDERED BY JS:
                 1. Live Logo Preview (CSS-styled brand name card)
                 2. Color Palette (3 clickable hex swatch cards)
                 3. Typography (font pairing recommendation)
                 4. Icon Concept (symbol description)
                 5. Layout Guide (how to arrange elements)
          -->
          <div id="brandOutput" class="hidden">
            <!-- All content filled by JavaScript renderBrandIdentity() -->
          </div>

        </div><!-- end scrollable area -->

      </div><!-- end output card -->

    </div><!-- end right column -->

  </div><!-- end two-column grid -->
</main>


<!-- ==============================================================================
     FOOTER
     ============================================================================== -->
<footer class="border-t border-white/[.05] py-6">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
      <span class="text-sm font-bold">
        <span class="text-blue-400">Easy</span><span class="text-purple-400">AI</span><span class="text-pink-400">Toolz</span>
        <span class="text-white/18 font-normal text-xs ml-2">&mdash; Creative Suite</span>
      </span>
      <div class="flex items-center gap-3 text-xs text-white/22">
        <a href="/creative/meme-generator.html" class="hover:text-white/55 transition-colors">&#8592; Meme Generator</a>
        <span>|</span>
        <a href="/" class="hover:text-white/55 transition-colors">All Tools &#8594;</a>
      </div>
    </div>
  </div>
</footer>


<!-- ==============================================================================
     JAVASCRIPT — logo_logic.js embedded here at build time.
     Placed at the bottom of <body> so all HTML elements exist when JS runs.
     ============================================================================== -->
<script>
`;

// ── HTML BOTTOM ─────────────────────────────────────────────────────────────
const HTML_BOTTOM = `
<\/script>
<\/body>
<\/html>`;

// ── ASSEMBLE AND WRITE ───────────────────────────────────────────────────────
const finalHTML = HTML_TOP + jsLogic + HTML_BOTTOM;

const dir = path.join(__dirname, 'creative');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log('Created directory:', dir);
}

const outPath = path.join(dir, 'logo-maker.html');
fs.writeFileSync(outPath, finalHTML, { encoding: 'utf8' });
console.log('SUCCESS! Written', Buffer.byteLength(finalHTML, 'utf8'), 'bytes to', outPath);
