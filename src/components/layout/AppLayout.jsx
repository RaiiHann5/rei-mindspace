import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import CommandPalette from '@/components/command/CommandPalette'
import FloatingAssistant from '@/components/assistant/FloatingAssistant'
import QuickCapture from '@/components/capture/QuickCapture'
import { NAV_SECTIONS, SETTINGS_ITEM } from './navConfig'
import { startNotificationScheduler, stopNotificationScheduler } from '@/lib/notificationScheduler'

function currentTitle(pathname) {
  const all = NAV_SECTIONS.flatMap((s) => s.items).concat(SETTINGS_ITEM)
  const match = all.find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to) && i.to !== '/'))
  return match?.label || 'Dashboard'
}

// Two-column console shell: a full-height sidebar and a scrolling content
// column. The column is `h-screen overflow-hidden` with only <main> scrolling,
// which is what lets pages opt into filling the viewport height instead of
// leaving a dead band below short content.
export default function AppLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    startNotificationScheduler()
    return () => stopNotificationScheduler()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-canvas-light dark:bg-canvas-dark">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col h-screen">
        <Topbar title={currentTitle(pathname)} />
        <main
          key={pathname}
          className="flex-1 min-h-0 overflow-y-auto px-4 pb-10 md:px-6 md:px-7 md:pb-12 animate-fade-in"
        >
          <div className="w-full mx-auto max-w-[1560px]">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette />
      {pathname !== '/assistant' && <FloatingAssistant />}
      <QuickCapture />
    </div>
  )
}
