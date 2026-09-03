import { readAll, writeAll } from '../local/db'

const COLLECTION = 'userdata'

function getAll() { return readAll(COLLECTION) }
function setAll(items) { writeAll(COLLECTION, items) }

export async function getUserData(userId) {
  const rec = getAll().find((u) => u.userId === userId)
  return rec ? { profile: rec.profile, business: rec.business } : null
}

// Called once at registration to seed the user's profile/business record.
export async function initUserData(userId, { profile, business }) {
  const items = getAll()
  if (items.some((u) => u.userId === userId)) return
  items.push({ userId, profile, business })
  setAll(items)
}

export async function updateBusinessInfo(userId, business) {
  const items = getAll()
  const idx = items.findIndex((u) => u.userId === userId)
  if (idx === -1) items.push({ userId, profile: {}, business })
  else items[idx] = { ...items[idx], business }
  setAll(items)
}

export async function updateProfileInfo(userId, profile) {
  const items = getAll()
  const idx = items.findIndex((u) => u.userId === userId)
  if (idx === -1) items.push({ userId, profile, business: {} })
  else items[idx] = { ...items[idx], profile }
  setAll(items)
}
