import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// Primary is the one sanctioned place the ember gradient appears. Everything
// else is a flat panel or a hairline outline so the gradient keeps its weight.
const variants = {
  primary: 'ember-cta font-semibold hover:brightness-[1.06] active:brightness-100',
  secondary: 'glass-solid font-semibold hover:bg-black/[0.04] dark:hover:bg-white/[0.05]',
  ghost: 'border border-transparent font-semibold text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05]',
  danger: 'bg-rose-500 text-white border border-rose-600 font-semibold hover:bg-rose-600',
  outline: 'border border-[color:var(--line-strong)] bg-transparent font-semibold hover:border-ember-500/60 hover:text-ember-500',
}

const sizes = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
  icon: 'h-9 w-9 p-0 justify-center',
}

export default function Button({
  variant = 'primary', size = 'md', className, children, loading, disabled, ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-all duration-150 neo-press select-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
      {children}
    </button>
  )
}
