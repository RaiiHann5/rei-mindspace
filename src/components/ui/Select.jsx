<<<<<<< HEAD
export default function Select({ label, error, options = [], className = '', containerClassName = '', required, ...props }) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="label-field">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select className={`input-field ${className}`} {...props}>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
=======
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export default function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full h-10 rounded-xl pl-3.5 pr-8 text-sm bg-black/[0.03] dark:bg-white/[0.05] border border-transparent',
          'focus:bg-white dark:focus:bg-surface-dark focus:border-primary-500/50 outline-none appearance-none transition-colors',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-50" />
>>>>>>> b4b2ee123dad43c2655a52eab73876263db4f19f
    </div>
  )
}
