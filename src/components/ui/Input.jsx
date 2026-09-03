<<<<<<< HEAD
export default function Input({ label, error, className = '', containerClassName = '', required, ...props }) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="label-field">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input className={`input-field ${className}`} {...props} />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
=======
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full h-10 rounded-xl px-3.5 text-sm bg-black/[0.03] dark:bg-white/[0.05] border border-transparent',
        'placeholder:text-muted-light dark:placeholder:text-muted-dark',
        'focus:bg-white dark:focus:bg-surface-dark focus:border-primary-500/50 outline-none transition-colors',
        className
      )}
      {...props}
    />
  )
})
export default Input
>>>>>>> b4b2ee123dad43c2655a52eab73876263db4f19f
