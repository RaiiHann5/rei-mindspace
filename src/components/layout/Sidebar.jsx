import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Avatar } from '@/components/ui'
import { NAV_SECTIONS, SETTINGS_ITEM } from './navConfig'

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 h-[calc(100vh-1.5rem)] sticky top-3 z-20 my-3 ml-3 rounded-3xl glass-solid transition-[width] duration-200 overflow-hidden',
        sidebarCollapsed ? 'w-[76px]' : 'w-[248px]'
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-16 shrink-0 border-b border-[color:var(--line)]">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-accent-gradient text-accent-ink">
          <Sparkles size={16} strokeWidth={2.2} />
        </div>
        {!sidebarCollapsed && (
          <span className="font-display font-semibold tracking-tight text-[15px]">
            Space<span className="text-ember-500">+</span>
          </span>
        )}
      </div>

      {/* Account row */}
      {!sidebarCollapsed && (
        <div className="mx-3 mt-3 mb-1 px-2.5 py-2.5 rounded-2xl flex items-center gap-2.5 bg-panel2-light dark:bg-panel2-dark">
          <Avatar name={user?.displayName || 'You'} src={user?.photoURL} size={34} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate leading-tight">{user?.displayName || 'Guest'}</p>
            <p className="text-[11px] text-muted-light dark:text-muted-dark truncate">{user?.email || 'Welcome back'}</p>
          </div>
          <ChevronDown size={15} className="shrink-0 text-dusk" strokeWidth={2} />
        </div>
      )}

      {/* Nav — the active item is the second sanctioned use of the ember
          gradient: a 3px rail plus a low-contrast fill. */}
      <nav className={cn('flex-1 overflow-y-auto px-3 py-2 space-y-4', sidebarCollapsed && 'mt-3')}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!sidebarCollapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-medium text-dusk">{section.label}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 h-9 rounded-md pl-3.5 pr-2.5 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'ember-rail bg-primary-500/10 text-ink-light dark:text-ink-dark'
                      : 'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={17} className="shrink-0" strokeWidth={isActive ? 2.3 : 2} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <div className={!sidebarCollapsed ? 'pt-2 border-t border-[color:var(--line)]' : ''}>
          <div className="space-y-0.5 pt-2">
            <NavLink
              to={SETTINGS_ITEM.to}
              title="Settings"
              className={({ isActive }) => cn(
                'flex items-center gap-3 h-9 rounded-md pl-3.5 pr-2.5 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'ember-rail bg-primary-500/10 text-ink-light dark:text-ink-dark'
                  : 'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
              )}
            >
              <SETTINGS_ITEM.icon size={17} className="shrink-0" strokeWidth={2} />
              {!sidebarCollapsed && <span className="truncate">Settings</span>}
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Profile card */}
      <div className="p-3 pt-1 shrink-0 space-y-1.5">
        <NavLink
          to={SETTINGS_ITEM.to}
          title="View profile"
          className="group flex items-center gap-2.5 rounded-2xl bg-panel2-light dark:bg-panel2-dark border border-[color:var(--line)] p-2.5 hover:border-[color:var(--line-strong)] transition-colors"
        >
          <Avatar
            name={user?.displayName || 'You'}
            src={user?.photoURL}
            size={sidebarCollapsed ? 32 : 36}
            className="shrink-0"
          />
          {!sidebarCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate leading-tight">{user?.displayName || 'Guest'}</p>
                <p className="text-[11px] text-muted-light dark:text-muted-dark truncate">{user?.email || 'View profile'}</p>
              </div>
              <ChevronRight size={15} strokeWidth={2} className="shrink-0 text-dusk group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </NavLink>

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center gap-3 px-2.5 h-8 rounded-md text-xs font-medium text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
        >
          <ChevronsLeft size={15} strokeWidth={2} className={cn('transition-transform duration-200', sidebarCollapsed && 'rotate-180')} />
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
