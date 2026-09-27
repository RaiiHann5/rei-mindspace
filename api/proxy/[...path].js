// Edge Function (runs on Vercel's edge network, not Node) so we can stream
// the upstream SSE response straight through to the browser instead of
// buffering the whole reply first.
export const config = { runtime: 'edge' }

// Only these three are proxied. Groq/OpenRouter/Cerebras/Together AI/Gemini
// all send Access-Control-Allow-Origin themselves, so the app calls them
// directly and never touches this file — keeping the allowlist here small
// on purpose so this endpoint can't be used as an open proxy to arbitrary
// hosts (which would be an SSRF risk).
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

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }
  if (req.method !== 'POST') {
    return jsonError('Method not allowed — this proxy only forwards POST requests.', 405)
  }

  const url = new URL(req.url)
  // e.g. /api/proxy/mistral/chat/completions -> ['mistral', 'chat', 'completions']
  const segments = url.pathname.replace(/^\/api\/proxy\//, '').split('/').filter(Boolean)
  const [provider, ...rest] = segments
  const baseURL = ALLOWED_BASE_URLS[provider]

  if (!baseURL) {
    return jsonError(`Provider proxy "${provider || ''}" tidak dikenal/tidak diizinkan.`, 400)
  }

  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return jsonError('Header Authorization (API key) tidak dikirim ke proxy.', 401)
  }

  const targetUrl = `${baseURL}/${rest.join('/')}`

  let upstream
  try {
    upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: req.body,
      duplex: 'half', // required by the Fetch spec when streaming a request body through
    })
  } catch (err) {
    return jsonError(`Proxy gagal menghubungi ${provider}: ${err.message}`, 502)
  }

  // Pass the upstream response (status, body, and SSE stream) straight
  // through, just adding CORS headers so the browser accepts it.
  const headers = new Headers(upstream.headers)
  headers.delete('content-encoding') // the edge runtime already decodes this; forwarding it causes double-decoding
  headers.delete('content-length') // no longer accurate once content-encoding is stripped
  for (const [key, value] of Object.entries(corsHeaders())) headers.set(key, value)

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  })
}
