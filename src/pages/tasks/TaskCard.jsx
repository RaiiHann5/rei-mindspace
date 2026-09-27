import { Archive, Trash2, Pencil, Clock, ListChecks, Repeat } from 'lucide-react'
import { Card, Badge, Checkbox, Progress } from '@/components/ui'
import { formatDate, daysUntil, REPEAT_LABELS, cn } from '@/lib/utils'

const priorityTone = { urgent: 'rose', high: 'amber', medium: 'primary', low: 'default' }
const priorityDot = { urgent: 'bg-rose-500', high: 'bg-amber-500', medium: 'bg-primary-500', low: 'bg-black/25 dark:bg-white/25' }
export const STATUS_LABEL = { todo: 'To do', in_progress: 'In progress', done: 'Done' }

export function DueBadge({ dueDate, done }) {
  if (!dueDate) return null
  const d = daysUntil(dueDate)
  let tone = 'default'
  let label = formatDate(dueDate)
  if (!done) {
    // Urgency rides on the badge tone, not on a second value joined with a
    // middot — one chip, one thing to read.
    if (d < 0) tone = 'rose'
    else if (d === 0) { tone = 'amber'; label = 'Due today' }
    else if (d === 1) { tone = 'amber'; label = 'Due tomorrow' }
  }
  return (
    <Badge tone={tone} className="gap-1">
      <Clock size={11} />
      {label}
    </Badge>
  )
}

export default function TaskCard({
  task: t, onToggleDone, onEdit, onArchive, onDelete, variant = 'list', draggable = false, dragHandleProps,
}) {
  const checklistTotal = t.checklist?.length || 0
  const checklistDone = t.checklist?.filter((c) => c.done).length || 0

  if (variant === 'board') {
    return (
      <div
        className={cn(
          'group relative rounded-2xl p-3.5 glass cursor-grab active:cursor-grabbing transition-all duration-150 card-hover',
        )}
        draggable={draggable}
        {...dragHandleProps}
        onClick={() => onEdit(t)}
      >
        <span className={cn('absolute left-0 top-3 bottom-3 w-1 rounded-full', priorityDot[t.priority])} />
        <div className="flex items-start gap-2 pl-2">
          <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={t.status === 'done'} onChange={() => onToggleDone(t)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn('text-sm font-medium leading-snug', t.status === 'done' && 'line-through opacity-50')}>{t.title}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
              {t.repeat && <Badge tone="amber" className="gap-1"><Repeat size={11} /> {REPEAT_LABELS[t.repeat] || t.repeat}</Badge>}
              {t.tags?.slice(0, 2).map((tag) => <Badge key={tag} tone="primary">{tag}</Badge>)}
            </div>
            {checklistTotal > 0 && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[11px] text-muted-light dark:text-muted-dark mb-1">
                  <span className="flex items-center gap-1"><ListChecks size={11} />{checklistDone}/{checklistTotal}</span>
                </div>
                <Progress value={(checklistDone / checklistTotal) * 100} tone="teal" className="h-1" />
              </div>
            )}
            {t.dueDate && <div className="mt-2"><DueBadge dueDate={t.dueDate} done={t.status === 'done'} /></div>}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(t) }}
          className="absolute top-2 right-2 h-6 w-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
          aria-label="Delete task"
        >
          <Trash2 size={12} />
        </button>
      </div>
    )
  }

  return (
    <Card
      glass={false}
      className="relative flex items-start gap-3 group cursor-pointer overflow-hidden pl-6"
      hover
      onClick={() => onEdit(t)}
    >
      <span className={cn('absolute left-0 top-0 bottom-0 w-1.5', priorityDot[t.priority])} />
      <div className="pt-0.5" onClick={(ev) => ev.stopPropagation()}>
        <Checkbox checked={t.status === 'done'} onChange={() => onToggleDone(t)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn('text-sm font-medium', t.status === 'done' && 'line-through opacity-50')}>{t.title}</p>
          <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
          <Badge>{STATUS_LABEL[t.status]}</Badge>
          {t.tags?.map((tag) => <Badge key={tag} tone="primary">{tag}</Badge>)}
        </div>
        {t.notes && <p className="text-xs text-muted-light dark:text-muted-dark mt-1 line-clamp-2">{t.notes}</p>}
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <DueBadge dueDate={t.dueDate} done={t.status === 'done'} />
          {t.repeat && (
            <Badge tone="amber" className="gap-1" title="Repeats">
              <Repeat size={11} /> {REPEAT_LABELS[t.repeat] || t.repeat}
            </Badge>
          )}
          {checklistTotal > 0 && (
            <div className="flex items-center gap-1.5">
              <ListChecks size={12} className="text-muted-light dark:text-muted-dark" />
              <span className="text-xs text-muted-light dark:text-muted-dark">{checklistDone}/{checklistTotal}</span>
              <Progress value={(checklistDone / checklistTotal) * 100} tone="teal" className="h-1 w-16" />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-light dark:text-muted-dark" onClick={(ev) => ev.stopPropagation()}>
        <button onClick={() => onEdit(t)} className="h-8 w-8 rounded-md flex items-center justify-center hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors" aria-label="Edit task"><Pencil size={14} strokeWidth={2} /></button>
        <button onClick={() => onArchive(t)} className="h-8 w-8 rounded-md flex items-center justify-center hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors" aria-label="Archive task"><Archive size={14} strokeWidth={2} /></button>
        <button onClick={() => onDelete(t)} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-colors" aria-label="Delete task"><Trash2 size={14} strokeWidth={2} /></button>
      </div>
    </Card>
  )
}
