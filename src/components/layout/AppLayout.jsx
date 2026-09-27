import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import CommandPalette from '@/components/command/CommandPalette'
import FloatingAssistant from '@/components/assistant/FloatingAssistant'
import QuickCapture from '@/components/capture/QuickCapture'
import { startNotificationScheduler, stopNotificationScheduler } from '@/lib/notificationScheduler'

// The console is a floating card inset from the viewport rather than an
// edge-to-edge split — on a dark canvas the card reads as a lit panel sitting
// on a desk, and the single ember glow lives behind it in the top-right corner
// so the card edge has something to sit against.
export default function AppLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    startNotificationScheduler()
    return () => stopNotificationScheduler()
  }, [])

  return (
    // The outer padding is what makes the console a floating card — it is the
    // strip of canvas (and the ember glow behind it) that the card sits on.
    // At mobile the padding goes to zero and the card goes full-bleed.
    <div className="h-screen flex overflow-hidden max-md:p-0 md:p-2.5 lg:p-4">
      <div className="relative flex-1 min-w-0 min-h-0 flex overflow-hidden border border-[color:var(--line)] bg-surface-light dark:bg-surface-dark shadow-pop rounded-2xl md:rounded-3xl">
        <Sidebar />

        <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          <Topbar />
          <main
            key={pathname}
            className="flex-1 min-h-0 overflow-y-auto px-4 pb-12 md:px-6 lg:px-8"
          >
            {/* Pages are grids and flex rows; without an explicit min-w-0 the
                widest child sets the width and the whole column overflows
                sideways on a phone. */}
            <div className="w-full min-w-0 mx-auto max-w-[1440px] pt-1">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <CommandPalette />
      {pathname !== '/assistant' && <FloatingAssistant />}
      <QuickCapture />
    </div>
  )
}
