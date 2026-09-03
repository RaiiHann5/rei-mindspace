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
      {children}
    </button>
  )
}
