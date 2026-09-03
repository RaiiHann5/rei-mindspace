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
      </div>
    </header>
  )
}
