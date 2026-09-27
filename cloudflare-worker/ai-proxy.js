// Cloudflare Worker: proxies chat-completion requests to AI providers whose
// APIs don't send CORS headers for browser requests (Mistral, NVIDIA NIM,
// Hugging Face) — needed because GitHub Pages is fully static and can't run
// its own backend, so this has to live somewhere that can.
//
// HOW TO DEPLOY (free, ~2 minutes, no credit card):
//   1. Go to https://dash.cloudflare.com -> sign up/log in (free).
//   2. Workers & Pages -> Create -> "Create Worker" -> give it a name (e.g.
//      "meridian-ai-proxy") -> Deploy (it deploys a hello-world by default).
//   3. Click "Edit code", delete everything, paste this whole file in,
//      click "Deploy" again.
//   4. Copy the worker's URL shown at the top (looks like
//      https://meridian-ai-proxy.<your-subdomain>.workers.dev).
//   5. In this project's .env (create it from .env.example if you don't
//      have one), add:
//        VITE_AI_PROXY_URL=https://meridian-ai-proxy.<your-subdomain>.workers.dev
//   6. Rebuild and redeploy the site (npm run deploy). Mistral, NVIDIA, and
//      Hugging Face will now work from GitHub Pages.
//
// (Alternative: if you ever move this app to Vercel instead, you don't need
// this file at all — api/proxy/[...path].js in this repo does the same job
// automatically and VITE_AI_PROXY_URL can be left unset.)

const ALLOWED_BASE_URLS = {
  mistral: 'https://api.mistral.ai/v1',
  nvidia: 'https://integrate.api.nvidia.com/v1',
  huggingface: 'https://router.huggingface.co/v1',
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  })
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() })
    }

    const url = new URL(request.url)
    // e.g. https://your-worker.workers.dev/mistral/chat/completions
    //   -> ['mistral', 'chat', 'completions']
    const segments = url.pathname.split('/').filter(Boolean)
    const [provider, ...rest] = segments
    const baseURL = ALLOWED_BASE_URLS[provider]

    if (!baseURL) {
      return jsonError(`Provider proxy "${provider || ''}" tidak dikenal/tidak diizinkan.`, 400)
    }
    if (request.method !== 'POST') {
      return jsonError('Method not allowed — proxy ini cuma meneruskan POST.', 405)
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return jsonError('Header Authorization (API key) tidak dikirim ke proxy.', 401)
    }

    let upstream
    try {
      upstream = await fetch(`${baseURL}/${rest.join('/')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: request.body,
      })
    } catch (err) {
      return jsonError(`Proxy gagal menghubungi ${provider}: ${err.message}`, 502)
    }

    // Pass the upstream response (status, body, and SSE stream) straight
    // through, just adding CORS headers so the browser accepts it.
    const headers = new Headers(upstream.headers)
    headers.delete('content-encoding')
    headers.delete('content-length')
    for (const [key, value] of Object.entries(corsHeaders())) headers.set(key, value)

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    })
  },
}
