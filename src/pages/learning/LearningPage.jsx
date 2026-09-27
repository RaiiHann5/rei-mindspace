import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, GraduationCap, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Card, Badge, Progress, EmptyState, Skeleton } from '@/components/ui'
import LearningFormModal from './LearningFormModal'
import { categoryInfo, statusInfo, learningSummary } from '@/lib/learning'
import { daysUntil, cn } from '@/lib/utils'

const iconTone = {
  primary: 'bg-primary-500/15 text-primary-600 dark:text-primary-400',
  teal: 'bg-teal-500/15 text-teal-700 dark:text-teal-300',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  rose: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  default: 'bg-black/[0.06] dark:bg-white/[0.08] text-ink-light dark:text-ink-dark',
}

const FILTERS = [
  { value: null, label: 'All' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export default function LearningPage() {
  const navigate = useNavigate()
  const { items, isLoading, createItem, updateItem, removeItem } = useCollection('skills')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [statusFilter, setStatusFilter] = useState(null)

  const summary = useMemo(() => learningSummary(items), [items])
  const filtered = useMemo(
    () => (statusFilter ? items.filter((s) => s.status === statusFilter) : items),
    [items, statusFilter]
  )

  const save = async (data) => {
    if (editing) { await updateItem(editing.id, data); toast.success('Skill updated') }
    else { await createItem(data); toast.success('Skill added') }
    setModalOpen(false); setEditing(null)
  }
  const del = async (s) => { if (confirm(`Delete "${s.title}"?`)) { await removeItem(s.id); toast.success('Skill deleted') } }

  return (
    <div>
      <PageHeader
        title="Skills & Learning"
        description="Track what you're learning and how far you've come."
        actions={<Button onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={16} /> Track Skill</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card className="flex flex-col items-center text-center gap-1.5">
          <GraduationCap size={18} className="text-primary-600 dark:text-primary-400" />
          <p className="num text-xl">{summary.total}</p>
          <p className="text-[11px] font-medium text-dusk">Total Skills</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <p className="num text-xl">{summary.inProgress}</p>
          <p className="text-[11px] font-medium text-dusk">In Progress</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <p className="num text-xl text-teal-600 dark:text-teal-300">{summary.completed}</p>
          <p className="text-[11px] font-medium text-dusk">Completed</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <p className="num text-xl">{summary.avgProgress}%</p>
          <p className="text-[11px] font-medium text-dusk">Avg Progress</p>
        </Card>
      </div>

      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatusFilter(f.value)}
            className={cn('h-8 px-3 rounded-md text-[13px] font-semibold border shrink-0 transition-colors neo-press',
              statusFilter === f.value
                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30'
                : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={statusFilter ? 'No skills in this status' : 'No skills tracked yet'}
          description="Add a skill or course you're working on to track your progress."
          actionLabel="Track Skill"
          onAction={() => { setEditing(null); setModalOpen(true) }}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((s) => {
            const info = categoryInfo(s.category)
            const status = statusInfo(s.status)
            const dleft = daysUntil(s.targetDate)
            return (
              <Card key={s.id} hover className="group" onClick={() => navigate(`/learning/${s.id}`)}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', iconTone[info.color] || iconTone.default)}>
                      <info.icon size={19} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-display font-semibold tracking-tight truncate">{s.title}</p>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                      {/* Meta values stack — no middle-dot joining. */}
                      <p className="text-xs leading-snug text-muted-light dark:text-muted-dark">
                        {info.label}
                        {s.platform && <span className="block text-dusk">{s.platform}</span>}
                        {dleft !== null && <span className="block font-mono tabular-nums text-dusk">{dleft >= 0 ? `${dleft}d left` : 'overdue'}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setEditing(s); setModalOpen(true) }} aria-label="Edit skill" className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark opacity-0 group-hover:opacity-100 hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors neo-press"><Pencil size={13} /></button>
                    <button onClick={() => del(s)} aria-label="Delete skill" className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-colors neo-press"><Trash2 size={13} /></button>
                  </div>
                </div>
                <Progress value={s.progress} tone={s.status === 'completed' ? 'teal' : 'primary'} className="mb-1.5" />
                <div className="flex items-center justify-between text-xs text-dusk">
                  <span className="font-mono tabular-nums">{s.progress}% complete</span>
                  {(s.milestones || []).length > 0 && <span className="font-mono tabular-nums">{s.milestones.filter((m) => m.done).length}/{s.milestones.length} milestones</span>}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <LearningFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} onSubmit={save} initial={editing} />
    </div>
  )
}
