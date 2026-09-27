import { cn } from '@/lib/utils'

export default function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-black/[0.06] dark:bg-white/[0.07]',
        className
      )}
    />
  )
}
