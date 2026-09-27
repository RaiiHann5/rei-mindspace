import { Star, Trash2, Lightbulb, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'

// Low-chroma tints, cycling by index. None of them is the ember gradient —
// a brainstorm board is the last place that should glow.
const TONES = [
  { bg: 'bg-teal-400/10', icon: 'text-teal-500' },
  { bg: 'bg-rose-400/10', icon: 'text-rose-500' },
  { bg: 'bg-amber-400/10', icon: 'text-amber-500' },
]

const statusLabel = { new: 'Baru', exploring: 'Dieksplor', validated: 'Tervalidasi', archived: 'Diarsipkan' }

export default function CardBrainstorm({ item, index = 0, onOpen, onDelete, onToggleFavorite }) {
  const tone = TONES[index % TONES.length]

  return (
    <div
      className={cn(
        'group rounded-2xl p-4 min-h-[190px] flex flex-col justify-between cursor-pointer card-hover glass',
        tone.bg
      )}
      onClick={() => onOpen?.(item)}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'h-9 w-9 rounded-lg grid place-items-center bg-black/[0.05] dark:bg-white/[0.05]',
            tone.icon
          )}
        >
          <Lightbulb size={16} strokeWidth={2} />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(item) }}
            className="h-7 w-7 rounded-md grid place-items-center text-muted-light dark:text-muted-dark hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-ink-light dark:hover:text-ink-dark transition-colors"
            aria-label="Toggle favorite"
          >
            <Star size={14} className={item.favorite ? 'fill-amber-400 text-amber-400' : ''} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete?.(item) }}
            className="h-7 w-7 rounded-md grid place-items-center text-muted-light dark:text-muted-dark hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-rose-500 transition-colors"
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <p className="font-display font-semibold text-sm line-clamp-2">{item.title}</p>
        {item.notes && (
          <p className="text-xs text-muted-light dark:text-muted-dark mt-1 line-clamp-2">{item.notes}</p>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-[7px] bg-black/[0.06] dark:bg-white/[0.07] shrink-0">
            {statusLabel[item.status] || item.status}
          </span>
          {item.category && (
            <span className="text-[11px] text-muted-light dark:text-muted-dark truncate">{item.category}</span>
          )}
        </div>
        {item.steps?.length > 0 && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-dusk shrink-0 tabular-nums">
            <ListChecks size={12} strokeWidth={2} />
            {item.steps.filter((s) => s.done).length}/{item.steps.length}
          </span>
        )}
      </div>
    </div>
  )
}
