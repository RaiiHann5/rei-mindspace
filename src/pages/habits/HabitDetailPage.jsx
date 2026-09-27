import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Flame, Trophy, CalendarCheck2, Percent, Check, Bell, Archive, ArchiveRestore } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { Card, Badge, Button, Textarea, Skeleton } from '@/components/ui'
import HabitFormModal from './HabitFormModal'
import HabitHeatmap from '@/components/charts/HabitHeatmap'
import { habitStreak, habitBestStreak, habitCompletionRate, habitTotalCompletions } from '@/lib/stats'
import { HabitIcon } from '@/lib/habitIcons'
import { describeCadence } from '@/lib/habitSchedule'
import { cn } from '@/lib/utils'

const iconTone = {
  primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
}

export default function HabitDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, isLoading, updateItem, removeItem } = useCollection('habits')
  const [modalOpen, setModalOpen] = useState(false)

  const habit = items.find((h) => h.id === id)
  const todayKey = new Date().toISOString().slice(0, 10)

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 rounded-2xl" /></div>

  if (!habit) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-light dark:text-muted-dark mb-4">Habit not found.</p>
        <Link to="/habits" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark transition-colors">
          <ArrowLeft size={15} /> Back to habits
        </Link>
      </div>
    )
  }

  const streak = habitStreak(habit.history)
  const best = habitBestStreak(habit.history)
  const rate = habitCompletionRate(habit.history)
  const total = habitTotalCompletions(habit.history)
  const doneToday = !!habit.history?.[todayKey]

  const save = async (data) => { await updateItem(habit.id, data); toast.success('Habit updated'); setModalOpen(false) }
  const del = async () => { if (confirm(`Delete "${habit.name}"?`)) { await removeItem(habit.id); toast.success('Habit deleted'); navigate('/habits') } }
  const saveNotes = (notes) => updateItem(habit.id, { notes })
  const toggleArchive = async () => { await updateItem(habit.id, { archived: !habit.archived }); toast.success(habit.archived ? 'Habit unarchived' : 'Habit archived') }

  const toggleToday = () => {
    const history = { ...(habit.history || {}) }
    history[todayKey] = !history[todayKey]
    updateItem(habit.id, { history })
  }

  const toggleDay = (key) => {
    const history = { ...(habit.history || {}) }
    history[key] = !history[key]
    updateItem(habit.id, { history })
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/habits')} className="flex items-center gap-1.5 text-sm font-medium text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark transition-colors neo-press">
        <ArrowLeft size={15} /> Back to habits
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0', iconTone[habit.color] || iconTone.primary)}>
            <HabitIcon name={habit.icon} size={26} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-display text-2xl font-semibold tracking-tight truncate">{habit.name}</h1>
              <Badge tone={habit.color}>{describeCadence(habit)}</Badge>
              {habit.reminderTime && <Badge><Bell size={10} className="inline mr-1 -mt-0.5" />{habit.reminderTime}</Badge>}
              {habit.archived && <Badge tone="default"><Archive size={10} className="inline mr-1 -mt-0.5" />Archived</Badge>}
            </div>
            <p className="text-sm text-muted-light dark:text-muted-dark max-w-xl">{habit.description || 'No description yet — add one from Edit.'}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button variant={doneToday ? 'primary' : 'secondary'} size="sm" onClick={toggleToday}>
            <Check size={14} /> {doneToday ? 'Done today' : 'Mark today done'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}><Pencil size={14} /> Edit</Button>
          <Button variant="secondary" size="sm" onClick={toggleArchive}>
            {habit.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />} {habit.archived ? 'Unarchive' : 'Archive'}
          </Button>
          <Button variant="danger" size="sm" onClick={del}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      {/* The current streak is this screen's single gradient number; the other
          stat tiles stay flat. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Flame size={18} className="text-amber-500" />
          <p className="num ember-num text-3xl leading-none">{streak}</p>
          <p className="text-[11px] font-medium text-dusk">Current streak</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Trophy size={18} className="text-amber-500" />
          <p className="num text-3xl leading-none">{best}</p>
          <p className="text-[11px] font-medium text-dusk">Best streak</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Percent size={18} className="text-teal-500" />
          <p className="num text-3xl leading-none">{rate}%</p>
          <p className="text-[11px] font-medium text-dusk">Last 30 days</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <CalendarCheck2 size={18} className="text-primary-600 dark:text-primary-400" />
          <p className="num text-3xl leading-none">{total}</p>
          <p className="text-[11px] font-medium text-dusk">Total completions</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold tracking-tight">History</h3>
          <p className="text-[11px] text-dusk">Tap a day to toggle it</p>
        </div>
        {/* Flat, data-only heatmap: no glow, no gradient. */}
        <div className="overflow-x-auto pb-1">
          <HabitHeatmap history={habit.history} color={habit.color} weeks={20} cellSize="h-4 w-4" gap="gap-1.5" onToggle={toggleDay} />
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold tracking-tight mb-3">Notes</h3>
        <Textarea rows={6} defaultValue={habit.notes} onBlur={(e) => saveNotes(e.target.value)} placeholder="Track what's working, setbacks, cues, or anything else about this habit..." />
      </Card>

      <HabitFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={save} initial={habit} />
    </div>
  )
}
