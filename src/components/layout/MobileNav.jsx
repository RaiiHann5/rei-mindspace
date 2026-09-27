import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_SECTIONS, SETTINGS_ITEM } from './navConfig'

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  const item = ({ isActive }) =>
    cn(
      'flex items-center gap-3 px-3.5 h-10 rounded-md text-sm font-medium transition-colors',
      isActive
        ? 'ember-rail bg-primary-500/10 text-ink-light dark:text-ink-dark'
        : 'text-muted-light dark:text-muted-dark'
    )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden h-9 w-9 rounded-md flex items-center justify-center text-muted-light dark:text-muted-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={19} strokeWidth={2.2} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink-light/55 dark:bg-ink-dark/72 backdrop-blur-[3px] animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-0 top-0 h-full w-72 glass-solid animate-pop flex flex-col"
            style={{ boxShadow: 'var(--shadow-pop)' }}
          >
            <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-[color:var(--line)]">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-accent-gradient text-accent-ink flex items-center justify-center">
                  <Sparkles size={16} strokeWidth={2.2} />
                </div>
                <span className="font-display font-semibold tracking-tight">
                  Space<span className="text-ember-500">+</span>
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="h-8 w-8 rounded-md flex items-center justify-center text-muted-light dark:text-muted-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors"
              >
                <X size={17} strokeWidth={2.2} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  <p className="px-3 mb-1.5 text-[11px] font-medium text-dusk">{section.label}</p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)} className={item}>
                        <item.icon size={17} strokeWidth={2} />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
              <NavLink to={SETTINGS_ITEM.to} onClick={() => setOpen(false)} className={item}>
                <SETTINGS_ITEM.icon size={17} strokeWidth={2} />
                <span>Settings</span>
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
