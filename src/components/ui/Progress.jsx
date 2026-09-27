import { cn } from '@/lib/utils'

// Track is a recessed hairline, not a bordered pill. The primary fill is a
// FLAT accent colour rather than the gradient: progress bars appear inside
// card grids (projects, goals, learning), so a gradient here would put three
// or four glows on one screen. The gradient is reserved for CTAs, the active
// nav, and one hero number.
const fills = {
  primary: 'bg-primary-500',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
}

export default function Progress({ value = 0, tone = 'primary', className }) {
  return (
    <div
      className={cn(
        'h-2 w-full rounded-full overflow-hidden bg-black/[0.06] dark:bg-white/[0.07]',
        className
      )}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', fills[tone] || fills.primary)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
