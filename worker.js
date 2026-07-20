/**
 * worker.js
 * =========
 * Cloudflare Worker for easyaitoolz.com
 *
 * Does TWO things:
 *   1. POST /api/generate  →  calls Groq API and returns AI response
 *   2. Everything else     →  serves static HTML/CSS/JS files from the repo
 *
 * ENVIRONMENT VARIABLE (set in Cloudflare Dashboard):
 *   GROQ_API_KEY = gsk_your_key_here
 */

const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';


export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const method = request.method;

    // ── CORS preflight ────────────────────────────────────────────────────────
    if (method === 'OPTIONS') {
      return jsonResponse({}, 200);
    }

    // ── API route: POST /api/generate ─────────────────────────────────────────
    if (method === 'POST' && url.pathname === '/api/generate') {
      return handleGenerate(request, env);
    }

    // ── Static files: serve HTML, CSS, JS from the repo ──────────────────────
    return env.ASSETS.fetch(request);
  }
};


// ── FUNCTION: handleGenerate ──────────────────────────────────────────────────
// Reads the prompt from the browser, calls Groq, returns the AI text.
async function handleGenerate(request, env) {

  // Parse JSON body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.' }, 400);
  }

  // Accept both formats:
  //   { prompt: "..." }                        — original
  //   { systemPrompt: "...", userPrompt: "..." } — injected by tools
  const userPrompt   = (body.prompt || body.userPrompt || '').trim();
  const systemPrompt = (body.systemPrompt || '').trim();

  if (!userPrompt) {
    return jsonResponse({ error: 'No prompt provided.' }, 400);
  }

  // Read API key from Cloudflare environment variables
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    return jsonResponse({
      error: 'GROQ_API_KEY is not set. ' +
             'Go to Cloudflare Dashboard → Workers → easyaitoolz → Settings → Variables → Add GROQ_API_KEY.'
    }, 500);
  }

  // Call Groq API
  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method : 'POST',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model      : GROQ_MODEL,
        messages   : systemPrompt
          ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
          : [{ role: 'user', content: userPrompt }],
        temperature: 0.7,
        max_tokens : 2048
      })
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return jsonResponse({
        error  : 'Groq API error.',
        details: data?.error?.message || groqRes.statusText
      }, 502);
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      return jsonResponse({ error: 'Empty response from Groq.' }, 502);
    }

    return jsonResponse({ result: text, model: GROQ_MODEL }, 200);

  } catch (err) {
    return jsonResponse({
      error  : 'Failed to reach Groq API.',
      details: err.message
    }, 502);
  }
}


// ── HELPER: jsonResponse ──────────────────────────────────────────────────────
// Wraps every response with JSON Content-Type + CORS headers.
function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type'                : 'application/json',
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
