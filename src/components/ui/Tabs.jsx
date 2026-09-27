import { cn } from '@/lib/utils'

// Segmented control: a recessed track with one selected segment. The active
// segment uses a low-opacity accent fill rather than the full gradient, so a
// screen full of tab bars doesn't turn into a wall of orange.
export default function Tabs({ tabs, active, onChange, className }) {
  return (
    <div
      className={cn(
        'inline-flex gap-1 p-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] border border-[color:var(--line)]',
        className
      )}
    >
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'px-3.5 h-8 rounded-[7px] text-[13px] font-semibold transition-all flex items-center gap-1.5',
            active === t.value
              ? 'bg-surface-light dark:bg-panel2-dark text-ink-light dark:text-ink-dark shadow-soft'
              : 'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark'
          )}
        >
          {t.icon && <t.icon size={14} strokeWidth={2.2} />}
          {t.label}
        </button>
      ))}
    </div>
  )
}
