import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COLLECTION = 'contracts'

export async function listContracts(userId) {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getContract(contractId) {
  const snap = await getDoc(doc(db, COLLECTION, contractId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createContract(userId, data) {
  const now = new Date().toISOString()
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data, userId, status: data.status || 'draft', createdAt: now, updatedAt: now,
  })
  return ref.id
}

export async function updateContract(contractId, data) {
  await updateDoc(doc(db, COLLECTION, contractId), { ...data, updatedAt: new Date().toISOString() })
}

export async function deleteContract(contractId) {
  await deleteDoc(doc(db, COLLECTION, contractId))
}
