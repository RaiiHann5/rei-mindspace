<<<<<<< HEAD
import { Menu, LogOut, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import LanguageToggle from '../ui/LanguageToggle'

export default function Topbar({ onMenuClick, title }) {
  const { currentUser, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const initial = (currentUser?.displayName || currentUser?.email || '?').charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-slate-500" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <LanguageToggle value={language} onChange={setLanguage} />
        <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500">
          <Bell className="w-4.5 h-4.5" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-semibold">
            {initial}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-slate-900">{currentUser?.displayName || t('topbar.user')}</p>
            <p className="text-xs text-slate-500">{currentUser?.email}</p>
          </div>
          <button onClick={handleLogout} title={t('topbar.logout')} className="ml-2 text-slate-400 hover:text-red-500">
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
=======
import { Search, Sun, Moon } from 'lucide-react'
import { useThemeStore, applyTheme } from '@/store/useThemeStore'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Avatar } from '@/components/ui'
import MobileNav from './MobileNav'
import NotificationCenter from './NotificationCenter'
import { Link } from 'react-router-dom'

export default function Topbar({ title }) {
  const { theme, toggle } = useThemeStore()
  const { setCommandOpen } = useUIStore()
  const { user, isLocalMode } = useAuthStore()

  const onToggle = () => { toggle(); setTimeout(applyTheme, 0) }

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 h-16 px-4 md:px-6 glass border-b border-border-light dark:border-border-dark">
      <MobileNav />
      <h1 className="font-display font-semibold text-base md:text-lg truncate">{title}</h1>

      <button
        onClick={() => setCommandOpen(true)}
        className="ml-2 hidden sm:flex items-center gap-2 h-9 px-3.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-sm text-muted-light dark:text-muted-dark w-64 max-w-xs hover:bg-black/[0.06] dark:hover:bg-white/[0.09] transition-colors"
      >
        <Search size={15} />
        <span className="flex-1 text-left">Search anything...</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <button className="sm:hidden h-9 w-9 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" aria-label="Search" onClick={() => setCommandOpen(true)}>
          <Search size={17} />
        </button>
        <button onClick={onToggle} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <NotificationCenter />
        <Link to="/settings" className="ml-1">
          <Avatar name={user?.displayName || 'You'} src={user?.photoURL} size={34} />
        </Link>
        {isLocalMode && (
          <span className="hidden lg:inline text-[11px] px-2 py-1 rounded-full bg-amber-400/15 text-amber-500 font-medium ml-1">Local mode</span>
        )}
>>>>>>> b4b2ee123dad43c2655a52eab73876263db4f19f
      </div>
    </header>
  )
}
