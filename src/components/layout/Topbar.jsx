import { Search, Sun, Moon } from 'lucide-react'
import { useThemeStore, applyTheme } from '@/store/useThemeStore'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Avatar } from '@/components/ui'
import MobileNav from './MobileNav'
import NotificationCenter from './NotificationCenter'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const iconBtn =
  'h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-muted-light dark:text-muted-dark ' +
  'hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors'

// Utility row only. The page title and its controls belong to the page itself
// (see PageHeader), which is what the reference shells do — a single row of
// global affordances, then the page owns the space under it.
export default function Topbar() {
  const { theme, toggle } = useThemeStore()
  const { setCommandOpen } = useUIStore()
  const { user } = useAuthStore()

  const onToggle = () => { toggle(); setTimeout(applyTheme, 0) }

  return (
    <header className="shrink-0 h-16 flex items-center gap-2 sm:gap-3 px-4 md:px-6 lg:px-8">
      <MobileNav />

      {/* Search collapses to an icon button on a phone — the full field plus the
          theme/notification/avatar cluster does not fit at 390px. */}
      <button
        onClick={() => setCommandOpen(true)}
        className="hidden sm:flex items-center gap-2.5 h-9 px-3.5 rounded-lg text-sm w-full max-w-[420px] transition-colors border border-[color:var(--line)] bg-black/[0.02] dark:bg-white/[0.02] text-dusk hover:border-[color:var(--line-strong)] hover:text-muted-light dark:hover:text-muted-dark"
      >
        <Search size={15} strokeWidth={2.2} />
        <span className="flex-1 text-left">Search</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded-[7px] border border-[color:var(--line)] font-mono">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5">
        <button className={cn(iconBtn, 'sm:hidden')} aria-label="Search" onClick={() => setCommandOpen(true)}>
          <Search size={17} strokeWidth={2.2} />
        </button>
        <button onClick={onToggle} className={iconBtn} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={17} strokeWidth={2.2} /> : <Moon size={17} strokeWidth={2.2} />}
        </button>
        <NotificationCenter />
        <Link to="/settings" className="ml-0.5 sm:ml-1 rounded-full shrink-0" title={user?.displayName || 'Profile'}>
          <Avatar name={user?.displayName || 'You'} src={user?.photoURL} size={32} />
        </Link>
      </div>
    </header>
  )
}
