// Thin wrapper around the Gemini API's REST generateContent endpoint.
// The API key lives only in the user's browser (localStorage via
// useAssistantStore) — it is entered at runtime in Settings, never baked
// into the build, so it's safe even when this app is deployed publicly
// (e.g. GitHub Pages).
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

export class GeminiError extends Error {}

function toParts(message) {
  const parts = []
  if (message.text) parts.push({ text: message.text })
  ;(message.attachments || []).forEach((a) => {
    if (a.data) parts.push({ inlineData: { mimeType: a.mimeType, data: a.data } })
  })
  return parts.length ? parts : [{ text: '' }]
}

export async function askGemini({ apiKey, model, systemInstruction, history }) {
  if (!apiKey) throw new GeminiError('Belum ada Gemini API key. Tambahkan di Settings → AI Assistant.')

  const res = await fetch(`${BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
      contents: history.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: toParts(m) })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 1536 },
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg = body?.error?.message || `Request gagal (${res.status})`
    throw new GeminiError(msg)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
  if (!text) {
    const blockReason = data?.promptFeedback?.blockReason
    throw new GeminiError(blockReason ? `Diblokir oleh Gemini: ${blockReason}` : 'Tidak ada respons dari Gemini.')
  }
  return text
}
