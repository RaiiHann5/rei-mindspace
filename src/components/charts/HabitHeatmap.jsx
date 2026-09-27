import { cn } from '@/lib/utils'

const colorMap = {
  primary: 'bg-primary-500',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
}

export default function HabitHeatmap({ history = {}, color = 'primary', weeks = 12, onToggle, cellSize = 'h-2.5 w-2.5', gap = 'gap-1' }) {
  const days = []
  const today = new Date()
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return (
    <div className={cn('grid grid-flow-col grid-rows-7 w-max', gap)} style={{ gridAutoColumns: 'min-content' }}>
      {days.map((d) => {
        const key = d.toISOString().slice(0, 10)
        const done = history[key]
        const future = d > today
        const Tag = onToggle && !future ? 'button' : 'div'
        return (
          <Tag
            key={key}
            type={Tag === 'button' ? 'button' : undefined}
            onClick={Tag === 'button' ? () => onToggle(key) : undefined}
            title={`${d.toDateString()}${done ? ' — done' : ''}`}
            className={cn(
              'rounded-[4px]',
              cellSize,
              done ? colorMap[color] : 'bg-black/5 dark:bg-white/5',
              Tag === 'button' && 'neo-press hover:scale-[1.15] cursor-pointer',
              future && 'opacity-30'
            )}
          />
        )
      })}
    </div>
  )
}
