<<<<<<< HEAD
import clsx from 'clsx'

export default function Card({ children, className, title, subtitle, action }) {
  return (
    <div className={clsx('card p-5', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
=======
import { cn } from '@/lib/utils'

export default function Card({ className, children, glass = true, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl p-5',
        glass ? 'glass' : 'glass-solid',
        hover && 'transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
>>>>>>> b4b2ee123dad43c2655a52eab73876263db4f19f
      {children}
    </div>
  )
}
