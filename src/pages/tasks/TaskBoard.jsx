import { useState } from 'react'
import { cn } from '@/lib/utils'
import TaskCard, { STATUS_LABEL } from './TaskCard'

const COLUMNS = ['todo', 'in_progress', 'done']
const COLUMN_ACCENT = {
  todo: 'bg-black/20 dark:bg-white/25',
  in_progress: 'bg-amber-500',
  done: 'bg-teal-500',
}

export default function TaskBoard({ tasks, onToggleDone, onEdit, onArchive, onDelete, onStatusChange }) {
  const [dragId, setDragId] = useState(null)
  const [overColumn, setOverColumn] = useState(null)

  const grouped = COLUMNS.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s)
    return acc
  }, {})

  const handleDrop = (status) => {
    if (dragId) onStatusChange(dragId, status)
    setDragId(null)
    setOverColumn(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((status) => (
        <div
          key={status}
          onDragOver={(e) => { e.preventDefault(); setOverColumn(status) }}
          onDragLeave={() => setOverColumn((c) => (c === status ? null : c))}
          onDrop={(e) => { e.preventDefault(); handleDrop(status) }}
          className={cn(
            'rounded-3xl p-3 min-h-[240px] bg-surface-light dark:bg-surface-dark border border-[color:var(--line)] transition-colors',
            overColumn === status && 'kanban-drop-active'
          )}
        >
          <div className="flex items-center gap-2 px-1.5 py-1.5 mb-2">
            <span className={cn('h-2 w-2 rounded-full', COLUMN_ACCENT[status])} />
            <p className="text-sm font-semibold">{STATUS_LABEL[status]}</p>
            <span className="ml-auto text-[11px] font-mono tabular-nums text-dusk px-1.5 py-0.5 rounded-[7px]">
              {grouped[status].length}
            </span>
          </div>
          <div className="space-y-2">
            {grouped[status].map((t, i) => (
              <div
                key={t.id}
                draggable
                onDragStart={() => setDragId(t.id)}
                onDragEnd={() => { setDragId(null); setOverColumn(null) }}
                className={cn('animate-stagger-in', dragId === t.id && 'kanban-dragging')}
                style={{ '--stagger-index': i }}
              >
                <TaskCard
                  task={t}
                  variant="board"
                  onToggleDone={onToggleDone}
                  onEdit={onEdit}
                  onArchive={onArchive}
                  onDelete={onDelete}
                />
              </div>
            ))}
            {grouped[status].length === 0 && (
              <div className="text-center text-xs text-dusk py-8 border border-dashed border-[color:var(--line-strong)] rounded-lg">
                Drop a task here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
