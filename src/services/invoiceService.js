import { readAll, writeAll, generateId } from '../local/db'
import { generatePublicId } from '../utils/generateId'

const COLLECTION = 'invoices'

export async function listInvoices(userId) {
  return readAll(COLLECTION)
    .filter((i) => i.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function getInvoice(invoiceId) {
  return readAll(COLLECTION).find((i) => i.id === invoiceId) || null
}

// Public lookup used by the QR / public verification page.
export async function getInvoiceByPublicId(publicId) {
  return readAll(COLLECTION).find((i) => i.publicId === publicId) || null
}

export async function createInvoice(userId, data) {
  const items = readAll(COLLECTION)
  const id = generateId('invoice_')
  const publicId = generatePublicId()
  const now = new Date().toISOString()
  items.push({ ...data, id, userId, publicId, createdAt: now, updatedAt: now })
  writeAll(COLLECTION, items)
  return { id, publicId }
}

export async function updateInvoice(invoiceId, data) {
  const items = readAll(COLLECTION)
  const idx = items.findIndex((i) => i.id === invoiceId)
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() }
    writeAll(COLLECTION, items)
  }
}

export async function updateInvoiceStatus(invoiceId, status) {
  return updateInvoice(invoiceId, { status })
}

export async function deleteInvoice(invoiceId) {
  writeAll(COLLECTION, readAll(COLLECTION).filter((i) => i.id !== invoiceId))
}

export function nextInvoiceNumber(existingInvoices) {
  const year = new Date().getFullYear()
  const count = existingInvoices.filter((inv) => (inv.invoiceNumber || '').includes(String(year))).length
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`
}
