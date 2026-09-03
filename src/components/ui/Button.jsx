<<<<<<< HEAD
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

export default function Button({
  children, variant = 'primary', className, loading = false, disabled, icon: Icon, ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  }
  return (
    <button
      className={clsx(variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
=======
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm shadow-primary-500/30',
  secondary: 'glass-solid hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-inherit',
  ghost: 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-inherit',
  danger: 'bg-rose-500 text-white hover:opacity-90',
  outline: 'border border-border-light dark:border-border-dark hover:bg-black/[0.03] dark:hover:bg-white/[0.05]',
}

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-9 w-9 p-0 justify-center',
}

export default function Button({
  variant = 'primary', size = 'md', className, children, loading, disabled, ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center rounded-xl font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
>>>>>>> b4b2ee123dad43c2655a52eab73876263db4f19f
      {children}
    </button>
  )
}
