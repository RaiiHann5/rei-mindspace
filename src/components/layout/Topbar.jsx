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
  'h-9 w-9 rounded-md flex items-center justify-center text-muted-light dark:text-muted-dark ' +
  'hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors'

export default function Topbar({ title }) {
  const { theme, toggle } = useThemeStore()
  const { setCommandOpen } = useUIStore()
  const { user, isLocalMode } = useAuthStore()

  const onToggle = () => { toggle(); setTimeout(applyTheme, 0) }

  return (
    <header className="sticky top-3 z-10 flex items-center gap-3 h-16 px-4 md:px-5 mx-3 mt-3 mb-2 md:mx-4 md:mt-4 rounded-2xl glass-solid">
      <MobileNav />
      <h1 className="font-display font-semibold text-base md:text-lg tracking-tight truncate">{title}</h1>

      <button
        onClick={() => setCommandOpen(true)}
        className="ml-2 hidden sm:flex items-center gap-2 h-9 px-3.5 rounded-md text-sm w-64 max-w-xs transition-colors border border-[color:var(--line)] bg-black/[0.03] dark:bg-white/[0.03] text-dusk hover:border-[color:var(--line-strong)] hover:text-muted-light dark:hover:text-muted-dark"
      >
        <Search size={15} strokeWidth={2.2} />
        <span className="flex-1 text-left">Search anything</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded-[7px] border border-[color:var(--line)] font-mono">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <button className={cn(iconBtn, 'sm:hidden')} aria-label="Search" onClick={() => setCommandOpen(true)}>
          <Search size={17} strokeWidth={2.2} />
        </button>
        <button onClick={onToggle} className={iconBtn} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={17} strokeWidth={2.2} /> : <Moon size={17} strokeWidth={2.2} />}
        </button>
        <NotificationCenter />
        <Link to="/settings" className="ml-1 rounded-full">
          <Avatar name={user?.displayName || 'You'} src={user?.photoURL} size={34} />
        </Link>
        {isLocalMode && (
          <span className="hidden lg:inline text-[11px] font-medium px-2 py-1 rounded-md border border-[color:var(--line)] text-dusk ml-1">
            Local mode
          </span>
        )}
      </div>
    </header>
  )
}
