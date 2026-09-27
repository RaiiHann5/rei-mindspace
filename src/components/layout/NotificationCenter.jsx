import { useEffect, useRef, useState } from 'react'
import { Bell, CalendarClock, CheckSquare, Flame, Check, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotificationStore } from '@/store/useNotificationStore'
import { cn } from '@/lib/utils'

const TYPE_ICON = { event: CalendarClock, task: CheckSquare, habit: Flame }
const TYPE_LINK = { event: '/calendar', task: '/tasks', habit: '/habits' }

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000
  if (diff < 1) return 'just now'
  if (diff < 60) return `${Math.floor(diff)}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

export default function NotificationCenter() {
  const { items, markRead, markAllRead, clearAll } = useNotificationStore()
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const unread = items.filter((n) => !n.read).length

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="h-9 w-9 rounded-md flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors relative"
        aria-label="Notifications"
      >
        <Bell size={17} strokeWidth={2.2} />
        {unread > 0 && (
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-ember-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 max-h-[26rem] flex flex-col glass-solid rounded-2xl overflow-hidden z-30 animate-pop" style={{ boxShadow: "var(--shadow-pop)" }}>
          <div className="flex items-center justify-between px-4 h-12 shrink-0 border-b border-[color:var(--line)]">
            <p className="font-display font-semibold text-sm">Notifications</p>
            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <>
                  <button onClick={markAllRead} title="Mark all read" aria-label="Tandai semua dibaca" className="h-7 w-7 rounded-md flex items-center justify-center text-muted-light dark:text-muted-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-ink-light dark:hover:text-ink-dark transition-colors"><Check size={13} /></button>
                  <button onClick={clearAll} title="Clear all" aria-label="Kosongkan notifikasi" className="h-7 w-7 rounded-md flex items-center justify-center text-muted-light dark:text-muted-dark hover:bg-rose-500/10 hover:text-rose-500 transition-colors"><Trash2 size={13} /></button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-muted-light dark:text-muted-dark text-center py-10 px-4">You're all caught up. Reminders for events, due tasks, and habits will show up here.</p>
            ) : (
              items.map((n) => {
                const Icon = TYPE_ICON[n.type] || Bell
                return (
                  <Link
                    key={n.id}
                    to={TYPE_LINK[n.type] || '/'}
                    onClick={() => { markRead(n.id); setOpen(false) }}
                    className={cn('flex items-start gap-3 px-4 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border-b border-[color:var(--line)] last:border-b-0 transition-colors', !n.read && 'bg-primary-500/[0.07]')}
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary-500/12 text-primary-600 dark:text-ember-300 flex items-center justify-center shrink-0 mt-0.5"><Icon size={14} strokeWidth={2.1} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-light dark:text-muted-dark truncate">{n.body}</p>}
                      <p className="text-[10px] text-dusk mt-0.5 font-mono">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-ember-500 mt-1.5 shrink-0" />}
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
