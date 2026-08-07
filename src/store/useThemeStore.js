import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // 'light' | 'dark' | 'system'
      accent: 'primary', // primary | teal | amber | rose
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      toggle: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
    }),
    { name: 'meridian_theme' }
  )
)

const ACCENT_COLORS = {
  primary: { 500: '#5A4FFF', 600: '#4A3FEF' },
  teal: { 500: '#1EC4B0', 600: '#17A092' },
  amber: { 500: '#F7A331', 600: '#E88F1A' },
  rose: { 500: '#F4506A', 600: '#E23459' },
}

export function applyTheme() {
  const { theme, accent } = useThemeStore.getState()
  const root = document.documentElement
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const resolved = theme === 'system' ? system : theme
  root.classList.toggle('dark', resolved === 'dark')

  const palette = ACCENT_COLORS[accent] || ACCENT_COLORS.primary
  root.style.setProperty('--color-primary-500', palette[500])
  root.style.setProperty('--color-primary-600', palette[600])
}
