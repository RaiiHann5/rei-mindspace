import { readAll, writeAll, generateId } from '../local/db'

const COLLECTION = 'contracts'

export async function listContracts(userId) {
  return readAll(COLLECTION)
    .filter((c) => c.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function getContract(contractId) {
  return readAll(COLLECTION).find((c) => c.id === contractId) || null
}

export async function createContract(userId, data) {
  const items = readAll(COLLECTION)
  const id = generateId('contract_')
  const now = new Date().toISOString()
  items.push({ ...data, id, userId, status: data.status || 'draft', createdAt: now, updatedAt: now })
  writeAll(COLLECTION, items)
  return id
}

export async function updateContract(contractId, data) {
  const items = readAll(COLLECTION)
  const idx = items.findIndex((c) => c.id === contractId)
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() }
    writeAll(COLLECTION, items)
  }
}

export async function deleteContract(contractId) {
  writeAll(COLLECTION, readAll(COLLECTION).filter((c) => c.id !== contractId))
}
