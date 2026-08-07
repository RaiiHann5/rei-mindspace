import { isFirebaseConfigured, storage } from './firebase'

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Returns a usable image URL for the given file: uploads to Firebase Storage
// when connected, otherwise falls back to an inline base64 data URL stored
// alongside the record (fine for personal, local-only use).
export async function storeImage(file, pathPrefix = 'covers') {
  if (isFirebaseConfigured && storage) {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
    const sref = ref(storage, `${pathPrefix}/${Date.now()}_${file.name}`)
    await uploadBytes(sref, file)
    return getDownloadURL(sref)
  }
  return fileToDataUrl(file)
}
