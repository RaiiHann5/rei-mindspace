import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Badges, per the reference: a full pill with a 2px border in the tone's own
// colour, a low-opacity tint of that colour behind it, the label in the tone,
// and — the detail that makes these read as designed rather than generated —
// a leading icon sitting in its own slightly deeper rounded tile.
//
// Earlier iteration dropped the border entirely in favour of a flat tint. The
// reference is right that the border is what makes a badge look deliberate, so
// it is back, at 2px, always in the tone.
const tones = {
  default: {
    text: 'text-ink-light dark:text-ink-dark',
    border: 'border-[color:var(--line-strong)]',
    fill: 'bg-black/[0.04] dark:bg-white/[0.05]',
    iconTile: 'bg-black/[0.08] dark:bg-white/[0.10]',
    dot: 'bg-dusk',
    icon: 'text-muted-light dark:text-muted-dark',
  },
  primary: {
    text: 'text-primary-700 dark:text-ember-300',
    border: 'border-primary-500/70',
    fill: 'bg-primary-500/[0.10]',
    iconTile: 'bg-primary-500/20',
    dot: 'bg-primary-500',
    icon: 'text-primary-600 dark:text-ember-300',
  },
  amber: {
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/70',
    fill: 'bg-amber-500/[0.12]',
    iconTile: 'bg-amber-500/20',
    dot: 'bg-amber-500',
    icon: 'text-amber-600 dark:text-amber-300',
  },
  teal: {
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-500/70',
    fill: 'bg-teal-500/[0.12]',
    iconTile: 'bg-teal-500/20',
    dot: 'bg-teal-500',
    icon: 'text-teal-600 dark:text-teal-300',
  },
  rose: {
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/70',
    fill: 'bg-rose-500/[0.12]',
    iconTile: 'bg-rose-500/20',
    dot: 'bg-rose-500',
    icon: 'text-rose-600 dark:text-rose-300',
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
    sm: { box: 'h-6 pl-1 pr-2.5 text-[11.5px] gap-1.5', tile: 'h-4 w-4', icon: 10 },
    md: { box: 'h-7 pl-1 pr-3 text-[12.5px] gap-2', tile: 'h-[18px] w-[18px]', icon: 11 },
    lg: { box: 'h-8 pl-1.5 pr-3.5 text-[13.5px] gap-2', tile: 'h-5 w-5', icon: 13 },
  }
  const s = sizes[size] || sizes.md

  const handleRemove = (e) => {
    e.stopPropagation()
    setRemoving(true)
    setTimeout(() => onRemove?.(), 160)
  }

  return (
    <span
      className={cn(
        'group inline-flex items-center rounded-full border-2 font-semibold leading-none whitespace-nowrap',
        'transition-all duration-200 ease-out will-change-transform',
        s.box,
        palette.border,
        palette.fill,
        palette.text,
        pop && (mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'),
        removing && 'scale-90 opacity-0',
        className
      )}
    >
      {/* Icon tile — the reference's signature detail. Skipped when there is no
          icon, so a plain label pill does not carry an empty notch. */}
      {Icon && (
        <span className={cn('grid place-items-center rounded-[6px] shrink-0', s.tile, palette.iconTile, palette.icon)}>
          <Icon size={s.icon} strokeWidth={2.4} />
        </span>
      )}

      {!Icon && dot && (
        <span className="relative flex h-[6px] w-[6px] shrink-0 items-center">
          {pulse && (
            <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-70', palette.dot)} />
          )}
          <span className={cn('relative inline-flex h-[6px] w-[6px] rounded-full', palette.dot)} />
        </span>
      )}

      <span>{children}</span>

      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove"
          className="-mr-1 shrink-0 rounded-full p-0.5 opacity-50 transition-opacity hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X size={s.icon + 1} strokeWidth={2.8} />
        </button>
      )}
    </span>
  )
}
