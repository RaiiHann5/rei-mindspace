import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// UI-only state. Sidebar density is persisted so the console opens the way
// you left it.
export const useUIStore = create(
  persist(
    (set) => ({
      // false = expanded rail with labels, true = 72px icon-only rail
      sidebarCollapsed: false,
      commandOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setCommandOpen: (v) => set({ commandOpen: v }),
    }),
    { name: 'meridian_ui' }
  )
)
