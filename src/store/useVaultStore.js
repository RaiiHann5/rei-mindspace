import { create } from 'zustand'
import * as vault from '@/lib/vault'
import { uid } from '@/lib/utils'

// In-memory vault state. The CryptoKey and decrypted notes live ONLY here —
// nothing is persisted until the page re-encrypts the envelope and saves it
// through useCollection('vault').
export const useVaultStore = create((set, get) => ({
  status: 'locked',    // 'setup' | 'locked' | 'unlocked'
  envelopeId: null,    // id of the persisted envelope record
  envelope: null,      // latest envelope (salt/iterations kept for re-encrypt)
  key: null,           // CryptoKey derived from the password (memory only)
  notes: [],
  error: null,

  // Called by the page whenever the persisted envelope changes shape.
  attach(envelopeId) {
    if (get().envelopeId === envelopeId) return
    set({ envelopeId, status: 'locked', envelope: null, key: null, notes: [], error: null })
  },

  detach() {
    set({ status: 'locked', envelopeId: null, envelope: null, key: null, notes: [], error: null })
  },

  async create(password) {
    const envelope = await vault.createEnvelope(password)
    set({ envelope })
    return envelope // caller persists it
  },

  async unlock(envelope, password, envelopeId = get().envelopeId) {
    let key, notes
    try {
      ;({ key, notes } = await vault.unlockEnvelope(envelope, password))
    } catch (e) {
      set({ error: e.message })
      return false
    }
    set({ status: 'unlocked', envelopeId, envelope, key, notes, error: null })
    return true
  },

  lock() {
    set({ status: 'locked', envelope: get().envelope, key: null, notes: [], error: null })
  },

  // Mutate the in-memory notes and re-encrypt; returns the new envelope so
  // the page can persist it.
  async mutate(fn) {
    const { notes, envelope } = get()
    const next = fn(notes)
    const env2 = await vault.reencrypt(envelope, next, get().key)
    set({ notes: next, envelope: env2 })
    return env2
  },

  addNote({ title, content }) {
    const now = new Date().toISOString()
    return get().mutate((notes) => [
      { id: uid(), title, content, createdAt: now, updatedAt: now },
      ...notes,
    ])
  },

  updateNote(id, patch) {
    return get().mutate((notes) =>
      notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)),
    )
  },

  removeNote(id) {
    return get().mutate((notes) => notes.filter((n) => n.id !== id))
  },
}))