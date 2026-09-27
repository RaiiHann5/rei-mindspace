import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

const field =
  'border border-[color:var(--line)] bg-surface-light dark:bg-surface-dark ' +
  'focus:outline-none focus:border-ember-500/70 focus:ring-[3px] focus:ring-ember-500/15'

export default function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full h-10 rounded-md pl-3.5 pr-9 text-sm font-medium appearance-none cursor-pointer transition-all',
          field,
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        strokeWidth={2}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-dusk"
      />
    </div>
  )
}
