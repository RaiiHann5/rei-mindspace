import { dataService } from './dataService'

// Every domain collection the app persists through useCollection(). Backup
// covers exactly these — one JSON file, whether data lives in localStorage or
// Supabase (localData/supabaseData handle the actual read/write).
export const BACKUP_COLLECTIONS = [
  'tasks', 'projects', 'events', 'notes', 'journal', 'brainstorm', 'habits',
  'goals', 'skills', 'visionItems', 'workouts', 'transactions', 'budgets',
  'pomodoros', 'library', 'movies', 'bookmarks', 'files', 'snippets', 'vault',
]

// Pulls every collection into a single exportable document.
export async function exportBackup() {
  const collections = {}
  const skipped = []
  for (const name of BACKUP_COLLECTIONS) {
    try {
      collections[name] = await dataService.getAll(name)
    } catch {
      skipped.push(name)
    }
  }
  return {
    app: 'meridian-os',
    version: 1,
    exportedAt: new Date().toISOString(),
    collections,
    skipped,
  }
}

// Restores every collection present in the doc. Restore is "replace" —
// the backup becomes the source of truth for those collections (ids are
// preserved, so links like pomodoro.taskId stay intact).
export async function importBackup(payload) {
  if (!payload || typeof payload !== 'object' || !payload.collections || typeof payload.collections !== 'object') {
    throw new Error('Invalid backup file')
  }
  const names = Object.keys(payload.collections)
  if (!names.length) throw new Error('Backup contains no data')
  const total = names.reduce((s, n) => s + (Array.isArray(payload.collections[n]) ? payload.collections[n].length : 0), 0)
  for (const name of names) {
    const items = Array.isArray(payload.collections[name]) ? payload.collections[name] : []
    await dataService.setAll(name, items)
  }
  return { collections: names.length, items: total }
}

// Accepts both the current app-level export AND the older local-only backup
// shaped like { 'meridian_os_v1:notes': '<json string>', ... }.
export function normalizeBackup(payload) {
  if (payload && payload.collections) return payload
  const collections = {}
  for (const [key, value] of Object.entries(payload || {})) {
    const m = key.match(/^meridian_os_v1:([a-z][a-zA-Z]*)$/)
    if (m) {
      try { collections[m[1]] = JSON.parse(value) } catch { /* skip malformed row */ }
    }
  }
  if (!Object.keys(collections).length) throw new Error('Invalid backup file')
  return { app: 'meridian-os', version: 1, exportedAt: null, collections }
}