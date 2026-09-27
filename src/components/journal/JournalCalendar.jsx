import { useState } from 'react'
import { id as idLocale } from 'date-fns/locale'
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, isAfter, startOfDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOW = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export default function JournalCalendar({ value, onChange, entryDateKeys = new Set() }) {
  const today = startOfDay(new Date())
  const [viewMonth, setViewMonth] = useState(startOfMonth(value || today))

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 }),
  })

  return (
    <div className="absolute left-0 top-full mt-2 z-30 w-64 rounded-2xl glass-solid p-3 animate-pop" style={{ boxShadow: 'var(--shadow-pop)' }}>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.06] dark:hover:bg-white/[0.08] neo-press"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-display font-semibold tracking-tight capitalize">{format(viewMonth, 'MMMM yyyy', { locale: idLocale })}</span>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.06] dark:hover:bg-white/[0.08] neo-press"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
        {DOW.map((d) => (
          <span key={d} className="text-[9px] font-medium text-dusk">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewMonth)
          const future = isAfter(startOfDay(day), today)
          const selected = isSameDay(day, value)
          const isToday = isSameDay(day, today)
          const hasEntry = entryDateKeys.has(format(day, 'yyyy-MM-dd'))

          return (
            <button
              type="button"
              key={day.toISOString()}
              disabled={future || !inMonth}
              onClick={() => onChange(startOfDay(day))}
              className={cn(
                'relative mx-auto h-7 w-7 rounded-full text-[11px] flex items-center justify-center transition-colors neo-press',
                !inMonth && 'invisible',
                future && 'opacity-30 cursor-not-allowed',
                selected
                  ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400 font-semibold ring-1 ring-inset ring-primary-500/30'
                  : isToday
                    ? 'text-ink-light dark:text-ink-dark font-semibold ring-1 ring-inset ring-[color:var(--line-strong)]'
                    : 'text-muted-light dark:text-muted-dark font-medium hover:bg-black/[0.06] dark:hover:bg-white/[0.08]',
              )}
            >
              {format(day, 'd')}
              {hasEntry && !selected && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
