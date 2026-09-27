import { useMemo, useState } from 'react'
import { Plus, Search, Archive, CheckSquare, List, LayoutGrid, ArrowUpDown, AlertTriangle, CircleDot, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Input, Card, EmptyState, Skeleton, Select } from '@/components/ui'
import FilterChip from '@/components/ui/FilterChip'
import TaskFormModal from './TaskFormModal'
import TaskCard from './TaskCard'
import TaskBoard from './TaskBoard'
import { PRIORITY_ORDER, daysUntil, nextOccurrence, REPEAT_LABELS, cn } from '@/lib/utils'

const SORTERS = {
  priority: (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  due: (a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate) - new Date(b.dueDate)
  },
  newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  alpha: (a, b) => a.title.localeCompare(b.title),
}

function StatPill({ icon: Icon, label, value, tone }) {
  const toneMap = {
    default: 'text-muted-light dark:text-muted-dark bg-black/[0.04] dark:bg-white/[0.06]',
    primary: 'text-primary-600 dark:text-primary-400 bg-primary-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    teal: 'text-teal-500 bg-teal-500/10',
    rose: 'text-rose-500 bg-rose-500/10',
  }
  return (
    <Card glass={false} padding={false} className="flex items-center gap-3 px-4 py-3.5">
      <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', toneMap[tone])}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="num text-xl leading-none">{value}</p>
        <p className="text-[11px] text-dusk mt-1 truncate">{label}</p>
      </div>
    </Card>
  )
}

export default function TasksPage() {
  const { items, isLoading, createItem, updateItem, removeItem } = useCollection('tasks')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [showArchived, setShowArchived] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [sort, setSort] = useState('priority')
  const [view, setView] = useState('list')
  const [quickTitle, setQuickTitle] = useState('')

  const active = useMemo(() => items.filter((t) => !t.archived), [items])
  const stats = useMemo(() => ({
    total: active.length,
    todo: active.filter((t) => t.status === 'todo').length,
    inProgress: active.filter((t) => t.status === 'in_progress').length,
    done: active.filter((t) => t.status === 'done').length,
    overdue: active.filter((t) => t.status !== 'done' && t.dueDate && daysUntil(t.dueDate) < 0).length,
  }), [active])

  const filtered = useMemo(() => {
    return items
      .filter((t) => (showArchived ? t.archived : !t.archived))
      .filter((t) => status === 'all' || t.status === status)
      .filter((t) => !query.trim() || t.title.toLowerCase().includes(query.toLowerCase()) || (t.tags || []).some((tag) => tag.includes(query.toLowerCase())))
      .sort(SORTERS[sort])
  }, [items, status, query, showArchived, sort])

  // Marking a recurring task done schedules its next occurrence automatically.
  const toggleDone = async (t) => {
    const finishing = t.status !== 'done'
    await updateItem(t.id, { status: finishing ? 'done' : 'todo' })
    if (finishing && t.repeat) {
      await createItem({
        ...t,
        id: undefined,
        title: t.title,
        status: 'todo',
        archived: false,
        dueDate: nextOccurrence(t.dueDate || new Date().toISOString(), t.repeat),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      toast.success(`Next ${REPEAT_LABELS[t.repeat]?.toLowerCase() || 'recurring'} occurrence scheduled`)
    }
  }
  const changeStatus = (id, newStatus) => updateItem(id, { status: newStatus })

  const save = async (data) => {
    if (editing) {
      await updateItem(editing.id, data)
      toast.success('Task updated')
    } else {
      await createItem(data)
      toast.success('Task created')
    }
    setModalOpen(false); setEditing(null)
  }

  const archive = async (t) => { await updateItem(t.id, { archived: !t.archived }); toast.success(t.archived ? 'Restored' : 'Archived') }
  const del = async (t) => { if (confirm('Delete this task?')) { await removeItem(t.id); toast.success('Task deleted') } }

  const quickAdd = async (e) => {
    e.preventDefault()
    if (!quickTitle.trim()) return
    await createItem({
      title: quickTitle.trim(), notes: '', status: 'todo', priority: 'medium',
      dueDate: null, tags: [], checklist: [], archived: false,
    })
    setQuickTitle('')
    toast.success('Task added')
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Everything on your plate, prioritized."
        actions={<Button onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={16} /> New task</Button>}
      />

      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          <StatPill icon={CheckSquare} label="Active tasks" value={stats.total} tone="default" />
          <StatPill icon={CircleDot} label="To do" value={stats.todo} tone="primary" />
          <StatPill icon={ArrowUpDown} label="In progress" value={stats.inProgress} tone="amber" />
          <StatPill icon={CheckCircle2} label="Done" value={stats.done} tone="teal" />
          <StatPill icon={AlertTriangle} label="Overdue" value={stats.overdue} tone="rose" />
        </div>
      )}

      <form onSubmit={quickAdd} className="mb-4">
        <div className="relative">
          <Plus size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dusk pointer-events-none" />
          <Input
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Quick add a task and press Enter..."
            className="pl-9 h-11"
          />
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dusk pointer-events-none" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks..." className="pl-9" />
        </div>
        <FilterChip active={status === 'all'} onClick={() => setStatus('all')}>All</FilterChip>
        <FilterChip active={status === 'todo'} onClick={() => setStatus('todo')}>To do</FilterChip>
        <FilterChip active={status === 'in_progress'} onClick={() => setStatus('in_progress')}>In progress</FilterChip>
        <FilterChip active={status === 'done'} onClick={() => setStatus('done')}>Done</FilterChip>
        <FilterChip active={showArchived} onClick={() => setShowArchived(!showArchived)}>
          <Archive size={13} className="inline mr-1 -mt-0.5" /> Archived
        </FilterChip>

        <div className="ml-auto flex items-center gap-2">
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto min-w-[9.5rem] h-9">
            <option value="priority">Sort: Priority</option>
            <option value="due">Sort: Due date</option>
            <option value="newest">Sort: Newest</option>
            <option value="alpha">Sort: A–Z</option>
          </Select>
          <div className="inline-flex p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-[color:var(--line)] shrink-0">
            <button
              onClick={() => setView('list')}
              aria-label="List view"
              className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-all neo-press', view === 'list' ? 'bg-surface-light dark:bg-panel2-dark text-ink-light dark:text-ink-dark shadow-soft' : 'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark')}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setView('board')}
              aria-label="Board view"
              className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-all neo-press', view === 'board' ? 'bg-surface-light dark:bg-panel2-dark text-ink-light dark:text-ink-dark shadow-soft' : 'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark')}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks here" description="Try a different filter, or create a new task to get started." actionLabel="New task" onAction={() => setModalOpen(true)} />
      ) : view === 'board' ? (
        <TaskBoard
          tasks={filtered}
          onToggleDone={toggleDone}
          onEdit={(t) => { setEditing(t); setModalOpen(true) }}
          onArchive={archive}
          onDelete={del}
          onStatusChange={changeStatus}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((t, i) => (
            <div key={t.id} className="animate-stagger-in" style={{ '--stagger-index': i }}>
              <TaskCard
                task={t}
                variant="list"
                onToggleDone={toggleDone}
                onEdit={(task) => { setEditing(task); setModalOpen(true) }}
                onArchive={archive}
                onDelete={del}
              />
            </div>
          ))}
        </div>
      )}

      <TaskFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} onSubmit={save} initial={editing} />
    </div>
  )
}
