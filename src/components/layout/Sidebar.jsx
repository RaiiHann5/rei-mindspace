import { NavLink } from 'react-router-dom'
import { ChevronsLeft, PanelLeft, ChevronsUpDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Avatar } from '@/components/ui'
import { NAV_SECTIONS, SETTINGS_ITEM } from './navConfig'

// Rail width dropped from 268 to 208: the reference shells run narrow, and the
// extra 60px was mostly empty gutter. Active item is now a filled pill rather
// than a 3px ember rail — the ember is kept for the icon and the avatar, so the
// accent still reads without painting a stripe down the whole column.
export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()
  const collapsed = sidebarCollapsed

  return (
    <aside
      className={cn(
        'hidden md:flex shrink-0 h-full flex-col z-30',
        'bg-panel2-light dark:bg-panel2-dark',
        'border-r border-[color:var(--line)]',
        'transition-[width] duration-250 ease-out overflow-hidden',
        collapsed ? 'w-[68px]' : 'w-[208px]'
      )}
    >
      {/* Workspace switcher, as in the reference — the product identity sits
          here rather than in a big wordmark row. */}
      <div className={cn('shrink-0 border-b border-[color:var(--line)]', collapsed ? 'p-3' : 'p-3')}>
        <button
          className={cn(
            'w-full flex items-center rounded-xl transition-colors',
            collapsed ? 'justify-center p-1.5' : 'gap-2.5 p-1.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
          )}
        >
          <span className="h-8 w-8 shrink-0 rounded-[10px] bg-accent-gradient text-accent-ink grid place-items-center">
            <Sparkles size={15} strokeWidth={2.2} />
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 text-left">
                {/* Instrument Serif — the one place the app uses the editorial
                    face. The wordmark is the only element that earns it. */}
                <span className="block font-serif text-[19px] leading-none tracking-[-0.01em]">
                  Space<span className="text-ember-500">+</span>
                </span>
                <span className="block text-[10.5px] text-dusk leading-tight truncate mt-0.5">Personal console</span>
              </span>
              <ChevronsUpDown size={14} className="shrink-0 text-dusk" strokeWidth={2} />
            </>
          )}
        </button>
      </div>

      {/* Nav — the only scrolling region */}
      <nav className={cn('flex-1 min-h-0 overflow-y-auto overflow-x-hidden', collapsed ? 'px-2.5 py-3' : 'px-3 py-3.5')}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className={collapsed ? 'mb-3' : 'mb-4'}>
            {!collapsed && <p className="px-2.5 mb-1.5 text-[10.5px] font-medium text-dusk">{section.label}</p>}
            {collapsed && <div className="h-px bg-[color:var(--line)] mx-2 mb-2 first:hidden" />}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) => cn(
                      'group flex items-center rounded-lg text-[13px] font-medium transition-colors duration-150',
                      collapsed ? 'h-9 justify-center' : 'h-9 gap-2.5 px-2.5',
                      isActive
                        ? 'bg-accent-gradient text-[var(--accent-ink)] font-semibold shadow-soft'
                        : 'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={16} className="shrink-0" strokeWidth={isActive ? 2.3 : 2} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-1 pt-3 border-t border-[color:var(--line)]">
          <NavLink
            to={SETTINGS_ITEM.to}
            title={collapsed ? SETTINGS_ITEM.label : undefined}
            className={({ isActive }) => cn(
              'flex items-center rounded-lg text-[13px] font-medium transition-colors duration-150',
              collapsed ? 'h-9 justify-center' : 'h-9 gap-2.5 px-2.5',
              isActive
                ? 'bg-accent-gradient text-[var(--accent-ink)] font-semibold shadow-soft'
                : 'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
            )}
          >
            <SETTINGS_ITEM.icon size={16} className="shrink-0" strokeWidth={2} />
            {!collapsed && <span className="truncate">{SETTINGS_ITEM.label}</span>}
          </NavLink>
        </div>
      </nav>

      {/* Pinned footer */}
      <div className={cn('shrink-0 border-t border-[color:var(--line)]', collapsed ? 'p-2.5' : 'p-3')}>
        <NavLink
          to={SETTINGS_ITEM.to}
          title={user?.displayName || 'Profile'}
          className={cn(
            'flex items-center rounded-xl transition-colors',
            collapsed ? 'justify-center p-1.5' : 'gap-2.5 p-1.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
          )}
        >
          <Avatar name={user?.displayName || 'You'} src={user?.photoURL} size={30} className="shrink-0" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold truncate leading-tight">{user?.displayName || 'Guest'}</p>
              <p className="text-[10.5px] text-dusk truncate">{isLocalLabel(user) || 'Local mode'}</p>
            </div>
          )}
        </NavLink>

        <button
          onClick={toggleSidebar}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'mt-1.5 flex items-center h-8 rounded-lg text-[11.5px] font-medium transition-colors',
            'text-dusk hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05]',
            collapsed ? 'w-full justify-center' : 'w-full gap-2.5 px-2.5'
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

function isLocalLabel(user) {
  if (!user?.email) return ''
  return user.email === 'you@local' ? 'Local mode' : user.email
}
