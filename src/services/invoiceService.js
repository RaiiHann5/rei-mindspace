import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { generatePublicId } from '../utils/generateId'

const COLLECTION = 'invoices'

export async function listInvoices(userId) {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getInvoice(invoiceId) {
  const snap = await getDoc(doc(db, COLLECTION, invoiceId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// Public lookup used by the QR / public verification page.
export async function getInvoiceByPublicId(publicId) {
  const q = query(collection(db, COLLECTION), where('publicId', '==', publicId))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export async function createInvoice(userId, data) {
  const publicId = generatePublicId()
  const now = new Date().toISOString()
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data, userId, publicId, createdAt: now, updatedAt: now,
  })
  return { id: ref.id, publicId }
}

export async function updateInvoice(invoiceId, data) {
  await updateDoc(doc(db, COLLECTION, invoiceId), { ...data, updatedAt: new Date().toISOString() })
}

export async function updateInvoiceStatus(invoiceId, status) {
  return updateInvoice(invoiceId, { status })
}

export async function deleteInvoice(invoiceId) {
  await deleteDoc(doc(db, COLLECTION, invoiceId))
}

export function nextInvoiceNumber(existingInvoices) {
  const year = new Date().getFullYear()
  const count = existingInvoices.filter((inv) => (inv.invoiceNumber || '').includes(String(year))).length
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`
}
