import { useMemo } from 'react'
import { cn } from '@/lib/utils'

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function MiniCalendar({ eventDates = [], onSelectDay }) {
  const today = new Date()

  const cells = useMemo(() => {
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDow = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const eventDaySet = new Set(
      eventDates
        .filter((d) => d.getFullYear() === year && d.getMonth() === month)
        .map((d) => d.getDate())
    )
    const arr = []
    for (let i = 0; i < firstDow; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push({ day: d, hasEvent: eventDaySet.has(d) })
    return arr
  }, [eventDates, today])

  return (
    <div>
      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {DOW.map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-dusk">{d}</span>
        ))}
        {cells.map((c, i) =>
          c === null ? (
            <span key={i} />
          ) : (
            <button
              type="button"
              key={i}
              onClick={() => onSelectDay?.(c.day)}
              className={cn(
                'relative mx-auto h-7 w-7 rounded-full text-xs font-mono tabular-nums flex items-center justify-center transition-colors',
                c.day === today.getDate()
                  ? 'bg-accent-gradient text-accent-ink font-semibold'
                  : 'hover:bg-black/[0.05] dark:hover:bg-white/[0.07]'
              )}
            >
              {c.day}
              {c.hasEvent && c.day !== today.getDate() && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-ember-500/70" />
              )}
            </button>
          )
        )}
      </div>
    </div>
  )
}
