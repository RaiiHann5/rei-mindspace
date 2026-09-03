import { NavLink } from 'react-router-dom'
<<<<<<< HEAD
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
=======
import { ChevronsLeft, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'
import { NAV_SECTIONS, SETTINGS_ITEM } from './navConfig'

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 h-screen sticky top-0 z-20 glass border-r border-border-light dark:border-border-dark transition-all duration-200',
        sidebarCollapsed ? 'w-[76px]' : 'w-64'
      )}
    >
      <div className="flex items-center gap-2 px-4 h-16 shrink-0">
        <div className="h-8 w-8 rounded-xl bg-primary-500 flex items-center justify-center text-white shrink-0">
          <Sparkles size={16} />
        </div>
        {!sidebarCollapsed && <span className="font-display font-semibold tracking-tight">Meridian</span>}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!sidebarCollapsed && (
              <p className="px-2.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-light dark:text-muted-dark">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-2.5 h-9 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-300'
                      : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-inherit/80'
                  )}
                >
                  <item.icon size={17} className="shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-border-light dark:border-border-dark space-y-0.5">
        <NavLink
          to={SETTINGS_ITEM.to}
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-2.5 h-9 rounded-xl text-sm font-medium transition-colors',
            isActive ? 'bg-primary-500/10 text-primary-600 dark:text-primary-300' : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
          )}
        >
          <SETTINGS_ITEM.icon size={17} />
          {!sidebarCollapsed && <span>Settings</span>}
        </NavLink>
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center gap-3 px-2.5 h-9 rounded-xl text-sm font-medium hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-muted-light dark:text-muted-dark"
        >
          <ChevronsLeft size={17} className={cn('transition-transform', sidebarCollapsed && 'rotate-180')} />
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
>>>>>>> b4b2ee123dad43c2655a52eab73876263db4f19f
  )
}
