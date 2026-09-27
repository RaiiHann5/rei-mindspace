import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Checkbox({ checked, onChange, className }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'h-[18px] w-[18px] shrink-0 rounded-[7px] border flex items-center justify-center transition-all duration-150 neo-press',
        'border-[color:var(--line-strong)] bg-surface-light dark:bg-surface-dark',
        'hover:border-ember-500/60',
        checked && 'border-transparent bg-accent-gradient',
        className
      )}
    >
      {checked && <Check size={12} strokeWidth={3.5} className="text-accent-ink" />}
    </button>
  )
}
