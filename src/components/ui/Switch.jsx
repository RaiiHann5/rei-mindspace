import { cn } from '@/lib/utils'

export default function Switch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200',
        'border-[color:var(--line-strong)] bg-black/[0.05] dark:bg-white/[0.07]',
        checked && 'border-transparent bg-accent-gradient',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'absolute top-[3px] left-[3px] h-[16px] w-[16px] rounded-full transition-all duration-200',
          'bg-surface-light dark:bg-ink-light shadow-soft',
          checked && 'translate-x-5 bg-accent-ink'
        )}
      />
    </button>
  )
}
