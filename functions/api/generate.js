// =============================================================================
// FILE     : /functions/api/generate.js
// PLATFORM : Cloudflare Pages Functions (runs at the edge, serverless)
// PURPOSE  : Secure AI proxy — receives prompts from the browser,
//            calls Groq API server-side, returns the AI response.
//
// DATA FLOW:
//   Browser → POST /api/generate → [THIS FILE on Cloudflare] → Groq → Browser
//
// SETUP (one-time, in Cloudflare Dashboard):
//   Pages → Your Project → Settings → Environment Variables → Add variable:
//     Variable name : GROQ_API_KEY
//     Value         : gsk_xxxxxxxxxxxxxxxxxxxxxxxx
//
// FREE GROQ KEY: https://console.groq.com/keys
//   Free tier: 6,000 requests/day | 30 requests/min — no credit card needed.
//
// WHY GROQ:
//   Groq runs on custom LPU chips. Responses arrive in ~0.5s vs 3-5s on GPU
//   providers. The llama-3.3-70b model is state-of-the-art and completely free.
// =============================================================================


// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const GROQ_MODEL   = "llama-3.3-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";


// ── MAIN HANDLER : POST /api/generate ────────────────────────────────────────
// Cloudflare calls this function for every POST request to /api/generate.
// `context.request`  = the incoming browser request
// `context.env`      = Cloudflare environment variables (where GROQ_API_KEY lives)
export async function onRequestPost(context) {

  // ── STEP 1: Parse the incoming JSON body ───────────────────────────────────
  // Frontend sends:  { "prompt": "Act as a SQL expert and generate..." }
  let requestBody;
  try {
    requestBody = await context.request.json();
  } catch (e) {
    return respond({ error: "Invalid JSON body." }, 400);
  }

  const userPrompt = (requestBody.prompt || "").trim();
  if (!userPrompt) {
    return respond({ error: "No prompt provided." }, 400);
  }


  // ── STEP 2: Read the Groq API key from Cloudflare environment ──────────────
  // This value is set in Cloudflare Dashboard → Pages → Settings → Env Variables.
  // It NEVER appears in the browser — it lives only on Cloudflare's servers.
  const apiKey = context.env.GROQ_API_KEY;
  if (!apiKey) {
    return respond({
      error: "Server config error: GROQ_API_KEY is not set. " +
             "Go to Cloudflare Pages → Settings → Environment Variables and add GROQ_API_KEY."
    }, 500);
  }


  // ── STEP 3: Call Groq API ──────────────────────────────────────────────────
  // Groq uses the OpenAI-compatible chat completions format.
  // Auth: Bearer token in Authorization header (not a URL param like Gemini).
  try {
    const groqResponse = await fetch(GROQ_API_URL, {
      method : "POST",
      headers: {
        "Content-Type" : "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model      : GROQ_MODEL,
        messages   : [{ role: "user", content: userPrompt }],
        temperature: 0.7,   // 0 = precise/deterministic, 1 = creative. 0.7 is balanced.
        max_tokens : 2048   // Max response length (~1500 words)
      })
    });

    // ── STEP 4: Handle Groq-level errors ────────────────────────────────────
    if (!groqResponse.ok) {
      let errBody = null;
      try { errBody = await groqResponse.json(); } catch (_) {}
      return respond({
        error  : "Groq API returned an error.",
        status : groqResponse.status,
        details: errBody?.error?.message || groqResponse.statusText || "Unknown Groq error."
      }, 502);
    }

    // ── STEP 5: Extract the generated text ──────────────────────────────────
    // Groq (OpenAI-compatible) response structure:
    // { choices: [ { message: { content: "AI response here..." } } ] }
    const groqData      = await groqResponse.json();
    const generatedText = groqData?.choices?.[0]?.message?.content;

    if (!generatedText || typeof generatedText !== "string") {
      return respond({ error: "Groq returned an unexpected response structure." }, 502);
    }

    // ── STEP 6: Return success ───────────────────────────────────────────────
    // Frontend reads:  data.result
    return respond({ result: generatedText, model: GROQ_MODEL }, 200);

  } catch (err) {
    // Network failure, Groq is unreachable, etc.
    return respond({
      error  : "Failed to reach Groq API.",
      details: err instanceof Error ? err.message : String(err)
    }, 502);
  }
}


// ── CORS PREFLIGHT HANDLER ────────────────────────────────────────────────────
// Browsers send a preflight OPTIONS request before every cross-origin POST.
// We must respond 200 + CORS headers or the browser will block the actual request.
export async function onRequestOptions() {
  return respond({}, 200);
}


// ── HELPER: respond() ─────────────────────────────────────────────────────────
// Wraps every response with Content-Type: application/json and CORS headers.
// CORS "*" is safe because the API key is server-side only — never in the browser.
function respond(data, statusCode = 200) {
  return new Response(JSON.stringify(data), {
    status : statusCode,
    headers: {
      "Content-Type"                : "application/json",
      "Access-Control-Allow-Origin" : "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}