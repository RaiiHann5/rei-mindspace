// Firestore-backed implementation. Same function signatures as the local
// version, so no page or component needed to change when swapping this in.
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COLLECTION = 'clients'

export async function listClients(userId) {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createClient(userId, data) {
  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    name: data.name || '',
    company: data.company || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    createdAt: new Date().toISOString(),
  })
  return ref.id
}

export async function updateClient(clientId, data) {
  await updateDoc(doc(db, COLLECTION, clientId), data)
}

export async function deleteClient(clientId) {
  await deleteDoc(doc(db, COLLECTION, clientId))
}
