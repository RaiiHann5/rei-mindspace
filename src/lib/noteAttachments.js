import { isSupabaseConfigured, supabase } from './supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { saveBlob, getBlob, deleteBlob } from './localFileStore'

// A note can carry two kinds of attachment:
//
//   links       { id, url, title }              — plain references
//   attachments { id, name, size, type, src }   — an uploaded file
//
// `src` is either an absolute https URL (Supabase Storage) or the marker
// `localfile:<key>`, which means "the bytes are in IndexedDB under that key".
// Nothing large ever goes into the note record itself — that matters in local
// mode, where the record lives in localStorage and the whole collection is
// re-serialized on every save.
const LOCAL_PREFIX = 'localfile:'

// Documents are not images, so there is nothing to downscale. Cap the size
// instead: IndexedDB is roomy but not infinite, and a stray 200MB video would
// wedge the browser.
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024

const ACCEPTED = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/epub+zip',
  'application/zip',
]

export const ACCEPTED_DOCS = ACCEPTED.join(',')
export const ACCEPTED_ALL = `${ACCEPTED.join(',')},image/*`

export function isAcceptedFile(file) {
  return (
    ACCEPTED.includes(file.type) ||
    file.type.startsWith('image/') ||
    /\.(pdf|txt|md|csv|json|docx?|xlsx?|pptx?|epub|zip)$/i.test(file.name)
  )
}

export function humanSize(bytes = 0) {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let n = bytes
  let i = 0
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i += 1 }
  return `${n >= 10 || i === 0 ? Math.round(n) : n.toFixed(1)} ${units[i]}`
}

// Uploads to Supabase Storage when connected, otherwise keeps the bytes in
// IndexedDB and returns the localfile marker.
export async function storeDocument(file) {
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new Error(`File too large — max ${humanSize(MAX_DOCUMENT_BYTES)}`)
  }
  if (isSupabaseConfigured && supabase) {
    const uid = useAuthStore.getState().user?.uid || 'guest'
    const safe = file.name.replace(/[^\w.\-]+/g, '_')
    const path = `${uid}/notes/${Date.now()}_${safe}`
    const { error } = await supabase.storage.from('uploads').upload(path, file)
    if (error) throw error
    return supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl
  }
  const key = `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  await saveBlob(key, file)
  return `${LOCAL_PREFIX}${key}`
}

// Resolves an attachment `src` into something an <a href> or <img> can use.
// Local blobs become a short-lived object URL; callers should revoke it.
const objectUrlCache = new Map()

export async function resolveAttachment(src) {
  if (!src) return null
  if (!src.startsWith(LOCAL_PREFIX)) return src

  const key = src.slice(LOCAL_PREFIX.length)
  if (objectUrlCache.has(key)) return objectUrlCache.get(key)

  const blob = await getBlob(key)
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  objectUrlCache.set(key, url)
  return url
}

export async function removeAttachmentFile(src) {
  if (!src || !src.startsWith(LOCAL_PREFIX)) return
  const key = src.slice(LOCAL_PREFIX.length)
  const cached = objectUrlCache.get(key)
  if (cached) { URL.revokeObjectURL(cached); objectUrlCache.delete(key) }
  await deleteBlob(key)
}

// --- shape helpers ---------------------------------------------------------
// Records created before this feature have none of these fields, and a
// hand-edited backup might have them as null, so every read goes through these.

export const linksOf = (note) => (Array.isArray(note?.links) ? note.links : [])
export const attachmentsOf = (note) => (Array.isArray(note?.attachments) ? note.attachments : [])

export const attachmentCount = (note) => linksOf(note).length + attachmentsOf(note).length

export function makeLink(url, title = '') {
  const clean = String(url || '').trim()
  if (!clean) return null
  let href = clean
  if (!/^https?:\/\//i.test(href)) href = `https://${href}`
  let host = ''
  try { host = new URL(href).hostname.replace(/^www\./, '') } catch { host = href }
  return { id: `l-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, url: href, title: title.trim() || host }
}

export function makeAttachment(file, src) {
  return {
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    src,
  }
}
