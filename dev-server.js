/**
 * dev-server.js
 * =============
 * Local development server for easyaitoolz.com
 *
 * Does TWO things:
 *   1. Serves all static files (HTML, CSS, JS) from this folder
 *   2. Handles POST /api/generate by calling Groq API directly
 *      (Replicates exactly what the Cloudflare Function does in production)
 *
 * HOW TO START:
 *   node dev-server.js
 *
 * GROQ API KEY — set in .env.local file:
 *   GROQ_API_KEY=gsk_your_key_here
 *
 * GET FREE KEY: https://console.groq.com/keys
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT     = 3000;
const ROOT_DIR = __dirname;

const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ── Load .env.local ────────────────────────────────────────────────────────
function loadEnvFile() {
  const envPath = path.join(ROOT_DIR, '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex > -1) {
          const key = trimmed.slice(0, eqIndex).trim();
          const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
    console.log('  [env] Loaded keys from .env.local');
  }
}
loadEnvFile();

// ── MIME types ─────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css' : 'text/css',
  '.js'  : 'application/javascript',
  '.svg' : 'image/svg+xml',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.ico' : 'image/x-icon',
  '.json': 'application/json',
  '.txt' : 'text/plain',
  '.xml' : 'application/xml',
};

// ── Helper: send JSON ──────────────────────────────────────────────────────
function sendJSON(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type'                : 'application/json',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

// ── Groq API handler ───────────────────────────────────────────────────────
async function handleGenerateAPI(req, res) {
  const rawBody = await new Promise((resolve, reject) => {
    let body = '';
    req.on('data',  chunk => { body += chunk.toString(); });
    req.on('end',   ()    => resolve(body));
    req.on('error', reject);
  });

  let requestBody;
  try { requestBody = JSON.parse(rawBody); }
  catch { return sendJSON(res, 400, { error: 'Invalid JSON body.' }); }

  // Accept both formats:
  //   Original format : { prompt: "..." }
  //   Injected format : { systemPrompt: "...", userPrompt: "..." }
  const userPrompt   = (requestBody.prompt || requestBody.userPrompt || '').trim();
  const systemPrompt = (requestBody.systemPrompt || '').trim();
  if (!userPrompt) return sendJSON(res, 400, { error: 'No prompt provided.' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return sendJSON(res, 500, {
      error: 'GROQ_API_KEY is not set. Add it to .env.local file.'
    });
  }

  try {
    const payload = JSON.stringify({
      model      : GROQ_MODEL,
      messages   : systemPrompt
        ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
        : [{ role: 'user', content: userPrompt }],
      temperature: 0.7,
      max_tokens : 2048
    });

    let groqData;

    if (typeof fetch !== 'undefined') {
      // Node.js v18+ built-in fetch
      const groqRes = await fetch(GROQ_API_URL, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body   : payload
      });
      groqData = await groqRes.json();
    } else {
      // Older Node.js — use https module
      groqData = await new Promise((resolve, reject) => {
        const https   = require('https');
        const parsed  = new URL(GROQ_API_URL);
        const options = {
          hostname: parsed.hostname,
          path    : parsed.pathname,
          method  : 'POST',
          headers : {
            'Content-Type'  : 'application/json',
            'Authorization' : 'Bearer ' + apiKey,
            'Content-Length': Buffer.byteLength(payload)
          }
        };
        const request = https.request(options, (resp) => {
          let data = '';
          resp.on('data', c  => { data += c; });
          resp.on('end',  () => {
            try { resolve(JSON.parse(data)); }
            catch { reject(new Error('Bad JSON from Groq')); }
          });
        });
        request.on('error', reject);
        request.write(payload);
        request.end();
      });
    }

    if (groqData.error) {
      return sendJSON(res, 502, { error: 'Groq API error: ' + groqData.error.message });
    }

    const generatedText = groqData?.choices?.[0]?.message?.content;
    if (!generatedText) {
      return sendJSON(res, 500, { error: 'Unexpected response from Groq.' });
    }

    return sendJSON(res, 200, { result: generatedText, model: GROQ_MODEL });

  } catch (err) {
    return sendJSON(res, 502, { error: 'Failed to reach Groq API: ' + err.message });
  }
}

// ── Main HTTP server ───────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const pathname = req.url.split('?')[0];

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // AI proxy
  if (req.method === 'POST' && pathname === '/api/generate') {
    return handleGenerateAPI(req, res);
  }

  // Static files
  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h2>404 Not Found</h2><a href="/">Back to Home</a>');
      return;
    }
    const ext      = path.extname(filePath);
    const mimeType = MIME[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
});

// ── Start ──────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  const keySet = !!process.env.GROQ_API_KEY;
  console.log('\n  ╔══════════════════════════════════════════════════╗');
  console.log('  ║   EasyAIToolz  —  Local Dev Server              ║');
  console.log('  ╠══════════════════════════════════════════════════╣');
  console.log(`  ║   http://localhost:${PORT}                         ║`);
  console.log('  ╠══════════════════════════════════════════════════╣');
  console.log(`  ║   Groq Key: ${keySet ? '✓ SET — ready to generate!   ' : '✗ NOT SET — add to .env.local'}  ║`);
  console.log('  ╚══════════════════════════════════════════════════╝\n');
});
