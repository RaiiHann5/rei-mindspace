import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

// Fields sit on the panel surface with a 1px hairline. Focus is a soft ember
// halo, never the old "translate and grow a hard shadow" neobrutalist move.
const field =
  'border border-[color:var(--line)] bg-surface-light dark:bg-surface-dark ' +
  'focus:outline-none focus:border-ember-500/70 focus:ring-[3px] focus:ring-ember-500/15'

const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full h-10 rounded-md px-3.5 text-sm font-medium transition-all',
        field,
        'placeholder:text-dusk placeholder:font-normal',
        className
      )}
      {...props}
    />
  )
})
export default Input
