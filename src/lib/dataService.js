import { isFirebaseConfigured } from './firebase'
import { localData } from './localData'

// Unified data access. Swaps to Firestore automatically once real Firebase
// keys are configured — every page in the app talks to this module only.
let impl = localData
export async function getImpl() {
  if (isFirebaseConfigured && impl === localData) {
    const mod = await import('./firestoreData')
    impl = mod.firestoreData
  }
  return impl
}

export const dataService = {
  async getAll(collection) {
    const i = await getImpl()
    return i.getAll(collection)
  },
  async create(collection, item) {
    const i = await getImpl()
    return i.create(collection, item)
  },
  async update(collection, id, patch) {
    const i = await getImpl()
    return i.update(collection, id, patch)
  },
  async remove(collection, id) {
    const i = await getImpl()
    return i.remove(collection, id)
  },
}
