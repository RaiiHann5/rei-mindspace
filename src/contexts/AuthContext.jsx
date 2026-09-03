import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { getUserData, initUserData } from '../services/businessService'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsub
  }, [])

  async function register({ name, email, password }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })

    // Create the user's private profile/business record.
    // Each user only ever reads/writes their own data, scoped by uid,
    // matching firestore.rules ( /users/{userId} isOwner(userId) ).
    await initUserData(cred.user.uid, {
      profile: { name, email, createdAt: new Date().toISOString() },
      business: {
        businessName: '',
        logoUrl: '',
        ownerName: name,
        email,
        phone: '',
        address: '',
        defaultCurrency: 'USD',
        paymentInfo: '',
      },
    })

    return cred.user
  }

  async function login({ email, password }) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  }

  async function logout() {
    await signOut(auth)
  }

  async function updateDisplayName(name) {
    await updateProfile(auth.currentUser, { displayName: name })
    setCurrentUser((prev) => (prev ? { ...prev, displayName: name } : prev))
  }

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    getUserDoc: getUserData,
    updateDisplayName,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
