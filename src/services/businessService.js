import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

// Matches firestore.rules: match /users/{userId} { allow read, write: if isOwner(userId) }
function userDoc(userId) {
  return doc(db, 'users', userId)
}

export async function getUserData(userId) {
  const snap = await getDoc(userDoc(userId))
  if (!snap.exists()) return null
  const data = snap.data()
  return { profile: data.profile, business: data.business }
}

// Called once at registration to seed the user's profile/business record.
export async function initUserData(userId, { profile, business }) {
  const snap = await getDoc(userDoc(userId))
  if (snap.exists()) return
  await setDoc(userDoc(userId), { profile, business })
}

export async function updateBusinessInfo(userId, business) {
  const snap = await getDoc(userDoc(userId))
  if (!snap.exists()) {
    await setDoc(userDoc(userId), { profile: {}, business })
  } else {
    await updateDoc(userDoc(userId), { business })
  }
}

export async function updateProfileInfo(userId, profile) {
  const snap = await getDoc(userDoc(userId))
  if (!snap.exists()) {
    await setDoc(userDoc(userId), { profile, business: {} })
  } else {
    await updateDoc(userDoc(userId), { profile })
  }
}
