import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged, registerUser, loginUser, logoutUser, updateUserProfile,
} from '../local/auth'
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
    const unsub = onAuthStateChanged((user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsub
  }, [])

  async function register({ name, email, password }) {
    const user = await registerUser({ name, email, password })

    // Create the user's private profile/business record.
    // Each user only ever reads/writes their own data (scoped by userId
    // in every services/*.js call) - see /local/db.js for how this is
    // stored locally, and /firestore.rules for the equivalent server-side
    // isolation to apply once this is wired up to real Firebase.
    await initUserData(user.uid, {
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

    return user
  }

  async function login({ email, password }) {
    return loginUser({ email, password })
  }

  async function logout() {
    await logoutUser()
  }

  async function updateDisplayName(name) {
    await updateUserProfile(currentUser.uid, { displayName: name })
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
