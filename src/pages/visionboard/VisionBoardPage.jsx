import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Sparkles, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Card, Badge, EmptyState, Skeleton, CircularProgress } from '@/components/ui'
import VisionBoardFormModal from './VisionBoardFormModal'
import { categoryInfo, timeframeLabel, TIMEFRAME_OPTIONS, visionSummary } from '@/lib/visionBoard'
import { cn } from '@/lib/utils'

const iconTone = {
  primary: 'bg-primary-500/15 text-primary-600 dark:text-primary-400',
  teal: 'bg-teal-500/15 text-teal-700 dark:text-teal-300',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  rose: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  default: 'bg-black/[0.06] dark:bg-white/[0.08] text-ink-light dark:text-ink-dark',
}

export default function VisionBoardPage() {
  const navigate = useNavigate()
  const { items, isLoading, createItem, updateItem, removeItem } = useCollection('visionItems')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [timeframeFilter, setTimeframeFilter] = useState(null)

  const summary = useMemo(() => visionSummary(items), [items])
  const filtered = useMemo(
    () => (timeframeFilter ? items.filter((v) => v.timeframe === timeframeFilter) : items),
    [items, timeframeFilter]
  )

  const save = async (data) => {
    if (editing) { await updateItem(editing.id, data); toast.success('Vision updated') }
    else { await createItem(data); toast.success('Added to vision board') }
    setModalOpen(false); setEditing(null)
  }
  const del = async (v) => { if (confirm(`Delete "${v.title}"?`)) { await removeItem(v.id); toast.success('Removed from board') } }
  const toggleAchieved = (v) => updateItem(v.id, { achieved: !v.achieved, achievedDate: !v.achieved ? new Date().toISOString() : null })

  return (
    <div>
      {/* Row 1 — identity and the primary action. Row 2 — the timeframe
          filter, same two-bar split as the calendar. */}
      <PageHeader
        title="Vision board"
        description="Intention, by timeframe."
        actions={<Button onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={16} /> Add item</Button>}
        tools={
          <>
            <button
              onClick={() => setTimeframeFilter(null)}
              className={cn('h-8 px-3 rounded-md text-[13px] font-semibold border shrink-0 transition-colors neo-press',
                !timeframeFilter
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30'
                  : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark')}
            >
              All
            </button>
            {TIMEFRAME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTimeframeFilter(timeframeFilter === t.value ? null : t.value)}
                className={cn('h-8 px-3 rounded-md text-[13px] font-semibold border shrink-0 transition-colors neo-press',
                  timeframeFilter === t.value
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30'
                    : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark')}
              >
                {t.label}
              </button>
            ))}
          </>
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <CircularProgress value={summary.pct} size={52} strokeWidth={6} tone="primary" />
          <div>
            <p className="num text-lg leading-none">
              <span className="ember-num">{summary.achieved}</span>
              <span className="text-muted-light dark:text-muted-dark"> of {summary.total} done</span>
            </p>
            <p className="text-[11px] text-dusk mt-1">{summary.pending} in progress</p>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Nothing here yet"
          actionLabel="Add item"
          onAction={() => { setEditing(null); setModalOpen(true) }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => {
            const info = categoryInfo(v.category)
            return (
              <Card key={v.id} hover className={cn('group flex flex-col', v.achieved && 'opacity-75')} onClick={() => navigate(`/vision-board/${v.id}`)}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', iconTone[info.color] || iconTone.default)}>
                    <info.icon size={19} />
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggleAchieved(v)} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors neo-press" aria-label="Toggle achieved">
                      {v.achieved ? <CheckCircle2 size={16} className="text-teal-500" /> : <Circle size={16} />}
                    </button>
                    <button onClick={() => { setEditing(v); setModalOpen(true) }} aria-label="Edit item" className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark opacity-0 group-hover:opacity-100 hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors neo-press"><Pencil size={13} /></button>
                    <button onClick={() => del(v)} aria-label="Delete item" className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-colors neo-press"><Trash2 size={13} /></button>
                  </div>
                </div>
                <p className={cn('font-display font-semibold tracking-tight mb-1', v.achieved && 'line-through text-muted-light dark:text-muted-dark')}>{v.title}</p>
                {v.description && <p className="text-xs text-muted-light dark:text-muted-dark line-clamp-2 mb-3 flex-1">{v.description}</p>}
                <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                  <Badge tone={info.color === 'default' ? 'default' : info.color}>{info.label}</Badge>
                  <Badge>{timeframeLabel(v.timeframe)}</Badge>
                  {v.achieved && <Badge tone="teal">Achieved</Badge>}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <VisionBoardFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} onSubmit={save} initial={editing} />
    </div>
  )
}
