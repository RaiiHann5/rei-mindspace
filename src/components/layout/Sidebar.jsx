import { NavLink } from 'react-router-dom'
import { ChevronsLeft, PanelLeft, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Avatar } from '@/components/ui'
import { NAV_SECTIONS, SETTINGS_ITEM } from './navConfig'

// Full-height console rail, edge to edge. Not a floating card: at 100vh with
// a hairline on the right it reads as the shell of a console rather than a
// panel sitting on the page.
//
// Structure is a 3-row flex column — brand / scrolling nav / pinned footer —
// so the footer can never overlap the nav the way it did when both were
// absolutely positioned in a shorter box.
export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

  const collapsed = sidebarCollapsed

  return (
    <aside
      className={cn(
        'hidden md:flex shrink-0 h-screen sticky top-0 flex-col z-30',
        'bg-surface-light dark:bg-surface-dark border-r border-[color:var(--line)]',
        'transition-[width] duration-250 ease-out overflow-hidden',
        collapsed ? 'w-[72px]' : 'w-[268px]'
      )}
    >
      {/* 1 — Brand */}
      <div className={cn('h-16 shrink-0 flex items-center border-b border-[color:var(--line)]', collapsed ? 'justify-center px-0' : 'px-5')}>
        <div className="h-8 w-8 shrink-0 rounded-lg bg-accent-gradient text-accent-ink flex items-center justify-center">
          <Sparkles size={16} strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <span className="ml-2.5 font-display text-[16px] font-semibold tracking-tight">
            Space<span className="text-ember-500">+</span>
          </span>
        )}
      </div>

      {/* 2 — Nav (the only scrolling region) */}
      <nav className={cn('flex-1 min-h-0 overflow-y-auto overflow-x-hidden', collapsed ? 'px-3 py-3' : 'px-4 py-3.5')}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className={collapsed ? 'mb-3' : 'mb-4'}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[11px] font-medium text-dusk truncate">{section.label}</p>
            )}
            {collapsed && <div className="h-px bg-[color:var(--line)] mx-2 mb-2 first:hidden" />}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) => cn(
                      'group relative flex items-center rounded-md text-sm font-medium transition-colors duration-150',
                      collapsed ? 'h-8 justify-center px-0' : 'h-9 gap-3 px-3',
                      isActive
                        ? 'ember-rail bg-primary-500/10 text-ink-light dark:text-ink-dark'
                        : 'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={17} className="shrink-0" strokeWidth={isActive ? 2.3 : 2} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-1 pt-2 border-t border-[color:var(--line)]">
          <NavLink
            to={SETTINGS_ITEM.to}
            title={collapsed ? SETTINGS_ITEM.label : undefined}
            className={({ isActive }) => cn(
              'flex items-center rounded-md text-sm font-medium transition-colors duration-150',
              collapsed ? 'h-8 justify-center px-0' : 'h-9 gap-3 px-3',
              isActive
                ? 'ember-rail bg-primary-500/10 text-ink-light dark:text-ink-dark'
                : 'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
            )}
          >
            <SETTINGS_ITEM.icon size={17} className="shrink-0" strokeWidth={2} />
            {!collapsed && <span className="truncate">{SETTINGS_ITEM.label}</span>}
          </NavLink>
        </div>
      </nav>

      {/* 3 — Pinned footer. `shrink-0` + the nav above being `min-h-0 flex-1`
          is what guarantees this sits below the scroll area instead of on
          top of it. */}
      <div className={cn('shrink-0 border-t border-[color:var(--line)]', collapsed ? 'p-3' : 'p-4')}>
        <NavLink
          to={SETTINGS_ITEM.to}
          title={user?.displayName || 'Profile'}
          className={cn(
            'flex items-center rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-[color:var(--line)]',
            'hover:border-[color:var(--line-strong)] transition-colors',
            collapsed ? 'justify-center p-2' : 'gap-2.5 p-2.5'
          )}
        >
          <Avatar name={user?.displayName || 'You'} src={user?.photoURL} size={collapsed ? 30 : 34} className="shrink-0" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold truncate leading-tight">{user?.displayName || 'Guest'}</p>
              <p className="text-[11px] text-dusk truncate">{user?.email || 'Local mode'}</p>
            </div>
          )}
        </NavLink>

        <button
          onClick={toggleSidebar}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'mt-2 flex items-center h-8 rounded-md text-xs font-medium transition-colors',
            'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark',
            'hover:bg-black/[0.04] dark:hover:bg-white/[0.05]',
            collapsed ? 'w-full justify-center' : 'w-full gap-3 px-3'
          )}
        >
          {collapsed
            ? <PanelLeft size={15} strokeWidth={2} />
            : <><ChevronsLeft size={15} strokeWidth={2} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}
