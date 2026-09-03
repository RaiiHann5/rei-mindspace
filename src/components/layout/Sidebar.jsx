import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, FileSignature, Settings, User, X,
} from 'lucide-react'
import clsx from 'clsx'
import { useLanguage } from '../../contexts/LanguageContext'
import Logo from '../ui/Logo'

export default function Sidebar({ open, onClose }) {
  const { t } = useLanguage()

  const NAV_ITEMS = [
    { to: '/app', label: t('sidebar.overview'), icon: LayoutDashboard, end: true },
    { to: '/app/invoices', label: t('sidebar.invoices'), icon: FileText },
    { to: '/app/clients', label: t('sidebar.clients'), icon: Users },
    { to: '/app/contracts', label: t('sidebar.contracts'), icon: FileSignature },
    { to: '/app/settings', label: t('sidebar.settings'), icon: Settings },
    { to: '/app/profile', label: t('sidebar.profile'), icon: User },
  ]

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={clsx(
        'fixed lg:sticky top-0 h-screen w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
          <Logo className="h-6 w-auto" />
          <button className="lg:hidden text-slate-400" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white">
            <p className="text-xs font-semibold">{t('sidebar.proTitle')}</p>
            <p className="text-[11px] text-brand-100 mt-1">{t('sidebar.proDesc')}</p>
          </div>
        </div>
      </aside>
    </>
  )
}
