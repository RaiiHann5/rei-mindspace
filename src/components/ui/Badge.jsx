import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Badges, rebuilt from the reference shells.
//
// The old version was a 10px chip wrapped in a `ring-1`, which read as an
// outlined pill and fought the flat panels it sat on. The reference treatment
// is a soft filled chip: a low-opacity tint of the tone behind text in the
// tone itself, no border and no ring, so a row of six badges reads as one
// quiet band of colour instead of six separate objects.
//
// `solid` is now the gradient variant and is reserved for the single most
// important state on a row (a live status), because the ember gradient is the
// app's one glow and a row of six of them would undo that.
const tones = {
  default: {
    soft: 'bg-black/[0.06] dark:bg-white/[0.07] text-muted-light dark:text-muted-dark',
    solid: 'bg-accent-gradient text-accent-ink',
    dot: 'bg-dusk',
  },
  primary: {
    soft: 'bg-primary-500/[0.14] text-primary-700 dark:text-ember-300',
    solid: 'bg-accent-gradient text-accent-ink',
    dot: 'bg-ember-500',
  },
  amber: {
    soft: 'bg-amber-500/[0.16] text-amber-700 dark:text-amber-300',
    solid: 'bg-amber-500 text-ink-light',
    dot: 'bg-amber-500',
  },
  teal: {
    soft: 'bg-teal-500/[0.16] text-teal-700 dark:text-teal-300',
    solid: 'bg-teal-500 text-ink-light',
    dot: 'bg-teal-500',
  },
  rose: {
    soft: 'bg-rose-500/[0.16] text-rose-700 dark:text-rose-300',
    solid: 'bg-rose-500 text-white',
    dot: 'bg-rose-500',
  },
}

export default function Badge({
  tone = 'default',
  variant = 'soft',
  dot = false,
  pulse = false,
  pop = true,
  size = 'md',
  icon: Icon,
  onRemove,
  className,
  children,
}) {
  const palette = tones[tone] || tones.default
  const [mounted, setMounted] = useState(!pop)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    if (!pop) return
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [pop])

  const sizes = {
    sm: 'h-[18px] px-1.5 text-[10.5px] gap-1',
    md: 'h-[22px] px-2 text-[11.5px] gap-1.5',
    lg: 'h-6 px-2.5 text-xs gap-1.5',
  }

  const iconSizes = { sm: 10, md: 11, lg: 12 }

  const handleRemove = (e) => {
    e.stopPropagation()
    setRemoving(true)
    setTimeout(() => onRemove?.(), 160)
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[7px] font-semibold leading-none whitespace-nowrap',
        'transition-all duration-200 ease-out will-change-transform',
        sizes[size],
        variant === 'solid' ? palette.solid : palette.soft,
        pop && (mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'),
        removing && 'scale-90 opacity-0',
        className
      )}
    >
      {dot && (
        <span className="relative flex h-[5px] w-[5px] shrink-0 items-center">
          {pulse && (
            <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-70', palette.dot)} />
          )}
          <span className={cn('relative inline-flex h-[5px] w-[5px] rounded-full', palette.dot)} />
        </span>
      )}

      {Icon && <Icon size={iconSizes[size]} className="shrink-0" strokeWidth={2.4} />}

      <span>{children}</span>

      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove"
          className="shrink-0 -mr-0.5 rounded p-0.5 opacity-50 transition-opacity hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X size={iconSizes[size]} strokeWidth={2.6} />
        </button>
      )}
    </span>
  )
}
