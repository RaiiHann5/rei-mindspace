import { cn } from '@/lib/utils'

// Stroke colours resolve from CSS variables so the ring follows the active
// accent and the desaturated status palette instead of hardcoded neons.
const strokes = {
  primary: 'var(--color-primary-500)',
  teal: 'var(--color-teal-500)',
  amber: 'var(--color-amber-500)',
  rose: 'var(--color-rose-500)',
  ink: 'currentColor',
}

export default function CircularProgress({
  value = 0, size = 56, strokeWidth = 7, tone = 'primary', className, children,
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference

  return (
    <div
      className={cn('relative inline-flex items-center justify-center shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth}
          className="stroke-black/10 dark:stroke-white/10"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth}
          stroke={strokes[tone] || strokes.primary}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 500ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children ?? <span className="font-display text-xs font-semibold tabular-nums">{Math.round(value)}%</span>}
      </div>
    </div>
  )
}
