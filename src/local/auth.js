// Local, browser-only auth. Passwords are stored in plain text in
// localStorage - this is ONLY meant for local development/demo, never
// for production. Swap this module out (and AuthContext's imports) for
// real Firebase Authentication when you're ready to go live.
import { readAll, writeAll, generateId } from './db'

const USERS_KEY = 'auth_users'
const SESSION_KEY = 'invoiceflow:session'
const listeners = new Set()

function getUsers() { return readAll(USERS_KEY) }
function setUsers(users) { writeAll(USERS_KEY, users) }
function getSessionUid() { return localStorage.getItem(SESSION_KEY) }
function setSessionUid(uid) {
  if (uid) localStorage.setItem(SESSION_KEY, uid)
  else localStorage.removeItem(SESSION_KEY)
}

function toPublicUser(u) {
  if (!u) return null
  return { uid: u.uid, email: u.email, displayName: u.displayName }
}

function notify() {
  const user = getCurrentUser()
  listeners.forEach((cb) => cb(user))
}

export function getCurrentUser() {
  const uid = getSessionUid()
  if (!uid) return null
  return toPublicUser(getUsers().find((u) => u.uid === uid))
}

// Mirrors firebase/auth's onAuthStateChanged(auth, callback) -> unsubscribe
export function onAuthStateChanged(callback) {
  callback(getCurrentUser())
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export async function registerUser({ name, email, password }) {
  const users = getUsers()
  if (users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
    const err = new Error('An account with this email already exists.')
    err.code = 'auth/email-already-in-use'
    throw err
  }
  if (!password || password.length < 6) {
    const err = new Error('Password should be at least 6 characters.')
    err.code = 'auth/weak-password'
    throw err
  }
  const uid = generateId('user_')
  const newUser = { uid, name, email, password, displayName: name, createdAt: new Date().toISOString() }
  users.push(newUser)
  setUsers(users)
  setSessionUid(uid)
  notify()
  return toPublicUser(newUser)
}

export async function loginUser({ email, password }) {
  const user = getUsers().find((u) => u.email.toLowerCase() === String(email).toLowerCase())
  if (!user || user.password !== password) {
    const err = new Error('Incorrect email or password.')
    err.code = 'auth/invalid-credential'
    throw err
  }
  setSessionUid(user.uid)
  notify()
  return toPublicUser(user)
}

export async function logoutUser() {
  setSessionUid(null)
  notify()
}

export async function updateUserProfile(uid, { displayName }) {
  const users = getUsers()
  const idx = users.findIndex((u) => u.uid === uid)
  if (idx === -1) return
  users[idx] = { ...users[idx], displayName, name: displayName }
  setUsers(users)
  notify()
}
