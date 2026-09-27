// Normalizes a phrase for loose matching: lowercase, strip accents/punctuation,
// collapse whitespace. "Hei, Jarvis!" and "hei   jarvis" both become "hei jarvis".
export function normalizePhrase(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// True if `transcript` contains any of `phrases` as a substring, after
// normalizing both sides. Empty/blank phrases are ignored.
export function containsAnyPhrase(transcript, phrases) {
  const t = normalizePhrase(transcript)
  if (!t) return false
  return (phrases || []).some((p) => {
    const np = normalizePhrase(p)
    return np && t.includes(np)
  })
}

// Splits a comma/newline-separated settings string into a clean phrase list.
export function parsePhraseList(text) {
  return (text || '')
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}
