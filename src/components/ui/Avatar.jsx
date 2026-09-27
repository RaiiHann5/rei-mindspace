import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export default function Avatar({ name = '', src, size = 36, className }) {
  const [failed, setFailed] = useState(false)
  // Reset the "broken image" flag whenever a new src comes in (e.g. user
  // just picked a different photo), otherwise it stays stuck on the
  // fallback forever after the first bad URL.
  useEffect(() => setFailed(false), [src])

  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  const showImage = !!src && !failed

  return showImage ? (
    <img
      src={src}
      alt={name}
      style={{ width: size, height: size }}
      className={cn(
        'rounded-full object-cover border border-[color:var(--line)]',
        className
      )}
      onError={() => setFailed(true)}
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'rounded-full flex items-center justify-center text-sm font-semibold',
        'bg-accent-gradient text-accent-ink',
        className
      )}
    >
      {initials || '?'}
    </div>
  )
}
