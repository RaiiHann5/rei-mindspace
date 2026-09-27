import { cn } from '@/lib/utils'

// radius is the hierarchy signal: 26px panels, 16px cards, 10px controls.
export default function Card({ className, children, glass = true, hover = false, padding = true, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl',
        padding && 'p-5',
        glass ? 'glass' : 'glass-solid',
        hover && 'card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
