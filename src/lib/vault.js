// Client-side encryption for the Private Vault. The whole vault lives in ONE
// record whose `data` field is an AES-GCM ciphertext of all notes, so nothing
// readable ever reaches the database (localStorage or Supabase) — the password
// is never stored anywhere; it only exists in memory as a derived CryptoKey.
//
// Losing the password means the data is unrecoverable by design.

const enc = new TextEncoder()
const dec = new TextDecoder()
const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

const ITERATIONS = 150000

export async function deriveKey(password, saltB64) {
  const salt = fromB64(saltB64)
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable — the key can never leave this browser
    ['encrypt', 'decrypt'],
  )
}

async function seal(plaintext, saltB64, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))
  return { iv: toB64(iv), data: toB64(ct) }
}

async function open(envelope, key) {
  const iv = fromB64(envelope.iv)
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, fromB64(envelope.data))
  return dec.decode(pt)
}

// Fresh vault: random salt, empty notes encrypted.
export async function createEnvelope(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltB64 = toB64(salt)
  const key = await deriveKey(password, saltB64)
  const { iv, data } = await seal(JSON.stringify([]), saltB64, key)
  return { v: 1, iterations: ITERATIONS, salt: saltB64, iv, data }
}

// Returns { key, notes } or throws with a friendly message on wrong password.
export async function unlockEnvelope(envelope, password) {
  const key = await deriveKey(password, envelope.salt)
  let notes
  try {
    notes = JSON.parse(await open(envelope, key))
  } catch {
    throw new Error('Password salah — tidak bisa membuka vault.')
  }
  return { key, notes }
}

// Re-encrypt changed notes reusing the same key+salt (new IV each time).
export async function reencrypt(envelope, notes, key) {
  const { iv, data } = await seal(JSON.stringify(notes), envelope.salt, key)
  return { ...envelope, iv, data }
}