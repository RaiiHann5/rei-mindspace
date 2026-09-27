import { cn } from '@/lib/utils'

export default function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-8 px-3 rounded-md text-[13px] font-semibold border transition-all duration-150 whitespace-nowrap neo-press',
        active
          ? 'bg-accent-gradient text-accent-ink border-transparent'
          : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:border-[color:var(--line-strong)]'
      )}
    >
      {children}
    </button>
  )
}
