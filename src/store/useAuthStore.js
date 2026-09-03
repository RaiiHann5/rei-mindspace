import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isFirebaseConfigured } from '@/lib/firebase'

// Auth state. In local mode (no Firebase keys configured) the app signs the
// person in as a local guest profile automatically so every feature is
// immediately usable. Once Firebase is configured, real auth takes over.
export const useAuthStore = create(
  persist(
    (set) => ({
      user: isFirebaseConfigured ? null : { uid: 'guest', displayName: 'You', email: 'you@local', photoURL: '' },
      initialized: !isFirebaseConfigured,
      isLocalMode: !isFirebaseConfigured,
      setUser: (user) => set({ user, initialized: true }),
      updateProfile: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),
      signOutLocal: () => set({ user: null }),
    }),
    { name: 'meridian_auth' }
  )
)
