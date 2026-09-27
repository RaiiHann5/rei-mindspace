import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const field =
  'border border-[color:var(--line)] bg-surface-light dark:bg-surface-dark ' +
  'focus:outline-none focus:border-ember-500/70 focus:ring-[3px] focus:ring-ember-500/15'

const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-md px-3.5 py-2.5 text-sm font-medium transition-all resize-none',
        field,
        'placeholder:text-dusk placeholder:font-normal',
        className
      )}
      {...props}
    />
  )
})
export default Textarea
