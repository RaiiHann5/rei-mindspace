// Minimal localStorage-backed "database" used while running TeraSync
// fully locally (no Firebase project needed). Swap the /services/*.js
// files for real Firestore calls later - the function signatures were
// kept identical to the Firebase version on purpose, so pages/components
// don't need to change when you migrate.
const PREFIX = 'invoiceflow:'

export function readAll(collection) {
  try {
    const raw = localStorage.getItem(PREFIX + collection)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function writeAll(collection, items) {
  localStorage.setItem(PREFIX + collection, JSON.stringify(items))
}

export function generateId(prefix = '') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`
}
