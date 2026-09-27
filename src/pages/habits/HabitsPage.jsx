import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Flame, Pencil, Trash2, Archive, ArchiveRestore, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Card, Badge, EmptyState, Skeleton, Checkbox } from '@/components/ui'
import HabitFormModal from './HabitFormModal'
import HabitHeatmap from '@/components/charts/HabitHeatmap'
import { habitStreak, habitCompletionRate } from '@/lib/stats'
import { HabitIcon } from '@/lib/habitIcons'
import { describeCadence } from '@/lib/habitSchedule'
import { cn } from '@/lib/utils'

const iconTone = {
  primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
}

export default function HabitsPage() {
  const navigate = useNavigate()
  const { items, isLoading, createItem, updateItem, removeItem } = useCollection('habits')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showArchived, setShowArchived] = useState(false)

  const todayKey = new Date().toISOString().slice(0, 10)

  const filtered = useMemo(
    () => items.filter((h) => (showArchived ? !!h.archived : !h.archived)),
    [items, showArchived]
  )
  const archivedCount = useMemo(() => items.filter((h) => h.archived).length, [items])

  const toggleToday = (h) => {
    const history = { ...(h.history || {}) }
    history[todayKey] = !history[todayKey]
    updateItem(h.id, { history })
  }

  const save = async (data) => {
    if (editing) { await updateItem(editing.id, data); toast.success('Habit updated') }
    else { await createItem(data); toast.success('Habit created') }
    setModalOpen(false); setEditing(null)
  }
  const del = async (h) => { if (confirm(`Delete "${h.name}"?`)) { await removeItem(h.id); toast.success('Habit deleted') } }
  const toggleArchive = async (h) => { await updateItem(h.id, { archived: !h.archived }); toast.success(h.archived ? 'Habit unarchived' : 'Habit archived') }

  return (
    <div>
      {/* Row 1 — identity and the primary action. Row 2 — the archive switch. */}
      <PageHeader
        title="Habits"
        description="Small things, every day."
        actions={<Button onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={16} /> New habit</Button>}
        tools={
          <button
            onClick={() => setShowArchived((v) => !v)}
            className={cn(
              'h-8 px-3 rounded-md text-[13px] font-semibold border inline-flex items-center gap-1.5 neo-press transition-colors',
              showArchived
                ? 'bg-primary-500/10 border-primary-500/30 text-primary-600 dark:text-primary-400'
                : 'border-[color:var(--line)] bg-black/[0.03] dark:bg-white/[0.05] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:border-[color:var(--line-strong)]'
            )}
          >
            <Archive size={12} /> {showArchived ? 'Archived' : `Archived${archivedCount ? ` (${archivedCount})` : ''}`}
          </button>
        }
      />

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={showArchived ? Archive : Flame}
          title={showArchived ? 'Nothing archived' : 'Nothing tracked'}
          description={showArchived ? 'Archived habits land here.' : 'Add one to start a streak.'}
          actionLabel={showArchived ? undefined : 'New habit'}
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((h) => {
            const streak = habitStreak(h.history)
            const rate = habitCompletionRate(h.history)
            return (
              <Card key={h.id} hover className="group cursor-pointer" onClick={() => navigate(`/habits/${h.id}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', iconTone[h.color] || iconTone.primary)}>
                      <HabitIcon name={h.icon} size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-semibold tracking-tight truncate">{h.name}</p>
                      <div className="text-[11px] text-dusk flex items-center gap-x-2 gap-y-0.5 flex-wrap">
                        <span>{describeCadence(h)}</span>
                        {h.reminderTime && <span className="inline-flex items-center gap-0.5 font-mono tabular-nums"><Bell size={10} /> {h.reminderTime}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(ev) => ev.stopPropagation()}>
                    {!showArchived && <Checkbox checked={!!h.history?.[todayKey]} onChange={() => toggleToday(h)} />}
                    <button onClick={() => { setEditing(h); setModalOpen(true) }} aria-label="Edit habit" className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 neo-press hover:bg-black/5 dark:hover:bg-white/[0.07]"><Pencil size={13} /></button>
                    <button onClick={() => toggleArchive(h)} className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 neo-press hover:bg-black/5 dark:hover:bg-white/[0.07]">
                      {h.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                    </button>
                    <button onClick={() => del(h)} className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 neo-press hover:bg-rose-500/10 hover:text-rose-500"><Trash2 size={13} /></button>
                  </div>
                </div>
                {h.description && <p className="text-xs text-muted-light dark:text-muted-dark mb-3 line-clamp-2">{h.description}</p>}
                {/* The heatmap is data, not decoration: it stays flat and unlit. */}
                <div className="overflow-x-auto pb-1 mb-3"><HabitHeatmap history={h.history} color={h.color} cellSize="h-3 w-3" /></div>
                <div className="flex items-center gap-2">
                  <Badge tone="amber"><Flame size={11} className="inline mr-1 -mt-0.5" />{streak}d streak</Badge>
                  <Badge>{rate}% last 30 days</Badge>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <HabitFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} onSubmit={save} initial={editing} />
    </div>
  )
}
