import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// Renders 5 stars supporting half-point increments (rating 0–5, steps of 0.5).
// Read-only by default; pass onChange for a clickable input.
export default function StarRating({ rating = 0, onChange, size = 15, className }) {
  const interactive = typeof onChange === 'function'

  const handleClick = (e, starIndex) => {
    if (!interactive) return
    const { left, width } = e.currentTarget.getBoundingClientRect()
    const half = (e.clientX - left) / width < 0.5
    const value = starIndex + (half ? 0.5 : 1)
    onChange(value === rating ? 0 : value)
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = rating >= i + 1
        const halfFilled = !filled && rating >= i + 0.5
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={(e) => handleClick(e, i)}
            className={cn('relative shrink-0', interactive && 'cursor-pointer')}
            aria-label={`${i + 1} star`}
          >
            <Star size={size} className="text-black/15 dark:text-white/15" />
            {(filled || halfFilled) && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: halfFilled ? '50%' : '100%' }}>
                <Star size={size} className="fill-amber-500 text-amber-500" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
