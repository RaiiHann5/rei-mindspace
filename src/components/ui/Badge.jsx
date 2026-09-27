import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Chips are 10px — deliberately not a full pill, so a tag never shares a
// silhouette with a card (16px) or a panel (26px). Tones are low-chroma so
// nothing competes with the ember accent for attention.
//
// The `solid` foregrounds are chosen per tone from measured contrast against
// the desaturated fills, because one colour cannot serve all three: white on
// amber-500 is 2.31:1 and on teal-500 is 3.64:1 (both fail), while dark ink on
// rose-500 is only 3.53:1. So amber/teal take ink, rose takes white.
const tones = {
  default: {
    soft: 'bg-black/[0.04] dark:bg-white/[0.05] text-ink-light dark:text-ink-dark',
    solid: 'bg-panel2-light dark:bg-panel2-dark text-ink-light dark:text-ink-dark',
    dot: 'bg-dusk',
    ring: 'ring-black/5 dark:ring-white/10',
  },
  primary: {
    soft: 'bg-primary-500/12 text-primary-700 dark:text-ember-300',
    solid: 'bg-accent-gradient text-accent-ink',
    dot: 'bg-primary-500',
    ring: 'ring-primary-500/25',
  },
  amber: {
    soft: 'bg-amber-500/14 text-amber-700 dark:text-amber-300',
    solid: 'bg-amber-500 text-ink-light',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/25',
  },
  teal: {
    soft: 'bg-teal-500/14 text-teal-700 dark:text-teal-300',
    solid: 'bg-teal-500 text-ink-light',
    dot: 'bg-teal-500',
    ring: 'ring-teal-500/25',
  },
  rose: {
    soft: 'bg-rose-500/14 text-rose-700 dark:text-rose-300',
    solid: 'bg-rose-500 text-white',
    dot: 'bg-rose-500',
    ring: 'ring-rose-500/25',
  },
}

export default function Badge({
  tone = 'default',
  variant = 'soft',
  dot = 'md',
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
    sm: 'h-5 px-2 text-[10.5px] gap-1',
    md: 'h-6 px-2.5 text-[11.5px] gap-1.5',
    lg: 'h-7 px-3 text-xs gap-1.5',
  }

  const iconSizes = { sm: 10, md: 12, lg: 13 }

  const handleRemove = (e) => {
    e.stopPropagation()
    setRemoving(true)
    setTimeout(() => onRemove?.(), 180)
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-semibold leading-none whitespace-nowrap',
        'border border-transparent transition-all duration-200 ease-out will-change-transform',
        variant === 'soft' && ['ring-1', palette.ring],
        sizes[size],
        variant === 'solid' ? palette.solid : palette.soft,
        pop && (mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'),
        removing && 'scale-90 opacity-0',
        className
      )}
    >
      {dot && (
        <span className="relative flex h-[6px] w-[6px] shrink-0 items-center">
          {pulse && (
            <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-70', palette.dot)} />
          )}
          <span className={cn('relative inline-flex h-[6px] w-[6px] rounded-full', palette.dot)} />
        </span>
      )}

      {Icon && <Icon size={iconSizes[size]} className="shrink-0" />}

      <span>{children}</span>

      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove"
          className="shrink-0 rounded p-0.5 opacity-60 transition-all hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X size={iconSizes[size]} />
        </button>
      )}
    </span>
  )
}
