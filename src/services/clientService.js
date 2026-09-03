// Local-storage backed implementation. Same function signatures as the
// Firestore version, so swapping back to Firebase later only means
// editing this file (and its friends in this folder) - not the pages
// or components that call it.
import { readAll, writeAll, generateId } from '../local/db'

const COLLECTION = 'clients'

export async function listClients(userId) {
  return readAll(COLLECTION)
    .filter((c) => c.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function createClient(userId, data) {
  const items = readAll(COLLECTION)
  const id = generateId('client_')
  items.push({
    id,
    userId,
    name: data.name || '',
    company: data.company || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    createdAt: new Date().toISOString(),
  })
  writeAll(COLLECTION, items)
  return id
}

export async function updateClient(clientId, data) {
  const items = readAll(COLLECTION)
  const idx = items.findIndex((c) => c.id === clientId)
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...data }
    writeAll(COLLECTION, items)
  }
}

export async function deleteClient(clientId) {
  writeAll(COLLECTION, readAll(COLLECTION).filter((c) => c.id !== clientId))
}
