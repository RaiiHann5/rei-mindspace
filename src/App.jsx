import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/routes'
import { applyTheme, useThemeStore } from '@/store/useThemeStore'
import { isFirebaseConfigured, auth } from '@/lib/firebase'
import { useAuthStore } from '@/store/useAuthStore'

export default function App() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    applyTheme()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => theme === 'system' && applyTheme()
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [theme])

  useEffect(() => {
    if (!isFirebaseConfigured) return
    let unsub = () => {}
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsub = onAuthStateChanged(auth, (user) => {
        useAuthStore.getState().setUser(
          user ? { uid: user.uid, displayName: user.displayName || user.email, email: user.email, photoURL: user.photoURL } : null
        )
      })
    })
    return () => unsub()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" toastOptions={{
        className: 'text-sm',
        style: { borderRadius: '14px' },
      }} />
    </QueryClientProvider>
  )
}
