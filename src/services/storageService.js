// Real Firebase Storage uploads. Files are scoped under logos/{userId}/...
// matching the Storage security rules that restrict writes to their owner.
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase/config'

export async function uploadBusinessLogo(userId, file) {
  return uploadFile(`logos/${userId}/logo-${Date.now()}-${file.name}`, file)
}

export async function uploadQrisImage(userId, file) {
  return uploadFile(`logos/${userId}/qris-${Date.now()}-${file.name}`, file)
}

async function uploadFile(path, file) {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
